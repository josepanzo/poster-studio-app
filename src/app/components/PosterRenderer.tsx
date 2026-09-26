import React from 'react';
import type { PosterState, FormatId, ScrimStyle } from '../state/poster-state';
import { TEMPLATES, getPairing } from '../templates/index';
import type { ZoneConfig } from '../templates/types';
import { getPreset } from '../backgrounds/presets';
import { readableAccent, parseHex, toHex } from '../utils/color';
import { parseSchedule } from '../utils/schedule';

interface PosterRendererProps {
  state: PosterState;
  format: FormatId;
  width: number;
  height: number;
  /** 
   * Scale factor applied to all pixel values (font sizes, paddings, margins, etc.). 
   * - `1` = full resolution (1080px base, used for export). 
   * - `< 1` = proportionally smaller (used for live preview). 
   * 
   * This avoids `transform: scale()` which breaks Figma's "Copy design" feature:
   * Figma captures container sizes at visual (post-transform) dimensions but text
   * properties (font-size, line-height) at DOM-declared values, causing mismatch.
   * By pre-scaling all values, what Figma sees in the DOM matches what it captures.
   */ 
  scaleFactor?: number;
}

// Noise/Grain SVG Pattern
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(#n)' opacity='0.08'/></svg>`;
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;

/** CSS background for each scrim style at a given strength (0–1). */
function scrimBackground(style: ScrimStyle, strength: number): string {
  const s = Math.min(1, Math.max(0, strength));
  const dark = `rgba(0, 0, 0, ${s})`;
  const mid = `rgba(0, 0, 0, ${s * 0.55})`;
  const clear = 'rgba(0, 0, 0, 0)';
  switch (style) {
    case 'radial':
      return `radial-gradient(ellipse at 50% 45%, ${clear} 0%, ${mid} 55%, ${dark} 100%)`;
    case 'full':
      return `linear-gradient(180deg, ${mid} 0%, ${dark} 100%)`;
    case 'bottom':
    default:
      // Directional scrim: fully clear over the upper 40% so the image
      // reads true, darkening toward the text block at the bottom —
      // the treatment used by the reference posters.
      return `linear-gradient(180deg, ${clear} 0%, ${clear} 40%, ${mid} 68%, ${dark} 100%)`;
  }
}

/** Mix a hex colour toward white by `amount` (0–1) for secondary text. */
function mixTowardWhite(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount
  );
}

export const PosterRenderer = React.forwardRef<HTMLDivElement, PosterRendererProps>(
  ({ state, format, width, height, scaleFactor = 1 }, ref) => {
    const template = TEMPLATES[state.variant];
    if (!template) return null;

    // Helper: scale a pixel value by the scale factor
    const s = (px: number) => px * scaleFactor;

    const safeArea = template.safeArea[format];
    const layout = template.layout[format];
    const preset = state.background.type === 'preset' ? getPreset(state.background.presetId) : null;
    const isTexture = preset?.category === 'texture';
    const showGrain = state.grainEnabled || isTexture;

    // Section spacing multiplier (default 1.0)
    const spacingMult = state.sectionSpacing ?? 1.0;
    const scaledGap = layout.gap * spacingMult;

    // Build background CSS
    let bgStyle: React.CSSProperties = {};
    if (state.background.type === 'preset' && preset) {
      bgStyle.background = preset.background;
    } else if (state.background.type === 'upload' && state.background.uploadedImage) {
      bgStyle.background = 'transparent';
    }

    // Effective accent colour with the readability guardrail applied.
    // Against preset backgrounds we test against the preset's swatch
    // (a representative solid); against uploads the scrim guarantees a
    // dark base at the text side, so test against near-black.
    const bgSample =
      state.background.type === 'preset' && preset
        ? preset.swatch
        : '#101010';
    const accent = readableAccent(state.accentColor || '#D9B98A', bgSample);
    const accentSoft = mixTowardWhite(accent, 0.25);

    // Pairing fonts, with per-role resolution
    const pairing = getPairing(state.fontPairing);
    const fontFor = (role: 'headline' | 'body') =>
      role === 'headline' ? pairing.headline : pairing.body;

    // Alignment → textAlign
    const textAlign = state.alignment;

    // Accent line alignment
    const accentJustify = 
      state.alignment === 'left' 
        ? 'flex-start' 
        : state.alignment === 'right' 
          ? 'flex-end' 
          : 'center';

    const renderZone = (zone: ZoneConfig, content: string, enabled: boolean) => {
      if (!enabled || !content?.trim()) return null;

      const typo = zone.typography;
      const fontSize = s(typo.fontSize[format]);
      const fontFamily = fontFor(typo.fontFamily);
      const lineHeightPx = Math.round(fontSize * typo.lineHeight);
      const letterSpacing = s(typo.letterSpacing);
      const marginTop = s(zone.marginTop);
      const marginBottom = s(zone.marginBottom);

      // Cap headline weight at what the pairing actually ships so the
      // browser never synthesizes fake bold (blurry in PNG export).
      const fontWeight =
        zone.typography.fontFamily === 'headline'
          ? Math.min(typo.fontWeight, pairing.maxHeadlineWeight ?? 900)
          : typo.fontWeight;

      const style: React.CSSProperties = {
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        lineHeight: `${lineHeightPx}px`,
        letterSpacing: `${letterSpacing}px`,
        textTransform: typo.textTransform === 'none' ? undefined : typo.textTransform,
        color: '#ffffff',
        opacity: zone.opacity,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        textAlign,
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        // Use max-height to naturally constrain text instead of -webkit-line-clamp.
        // This avoids overflow:hidden on text elements which causes Figma to crop
        // text boxes when using "Copy design".
        // maxHeight = lineHeight * maxLines (margin is separate via CSS marginTop/marginBottom)
        ...(zone.maxLines > 0
          ? { maxHeight: `${lineHeightPx * zone.maxLines}px` }
          : {}),
      };

      // For the quote template headline, add decorative quotes
      if (state.variant === 'quote' && zone.role === 'headline') {
        style.fontStyle = 'italic';
      }

      // ── Kicker: accent-coloured eyebrow ──
      if (zone.role === 'kicker') {
        style.color = accent;
      }

      return (
        <div key={zone.id} style={style} data-zone={zone.role}>
          {state.variant === 'quote' && zone.role === 'headline'
            ? `\u201C${content}\u201D`
            : content}
        </div>
      );
    };

    // Body zone with optional schedule-row rendering: each line that
    // parses as "time + detail" becomes a flex row with a bold accent
    // time and a white detail; other lines render as plain text.
    const renderBody = (zone: ZoneConfig, content: string, enabled: boolean) => {
      if (!enabled || !content?.trim()) return null;

      const typo = zone.typography;
      const fontSize = s(typo.fontSize[format]);
      const fontFamily = fontFor(typo.fontFamily);
      const lineHeightPx = Math.round(fontSize * typo.lineHeight);
      const marginTop = s(zone.marginTop);
      const marginBottom = s(zone.marginBottom);

      const baseStyle: React.CSSProperties = {
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: typo.fontWeight,
        lineHeight: `${lineHeightPx}px`,
        letterSpacing: `${s(typo.letterSpacing)}px`,
        textTransform: typo.textTransform === 'none' ? undefined : typo.textTransform,
        color: '#ffffff',
        opacity: zone.opacity,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        textAlign,
        overflowWrap: 'break-word',
      };

      if (!state.scheduleRowsEnabled) {
        return (
          <div
            key={zone.id}
            style={{ ...baseStyle, whiteSpace: 'pre-wrap', ...(zone.maxLines > 0 ? { maxHeight: `${lineHeightPx * zone.maxLines}px` } : {}) }}
            data-zone={zone.role}
          >
            {content}
          </div>
        );
      }

      const rows = parseSchedule(content);
      const gap = s(10 * spacingMult);

      // The line-count cap must include the inter-row gaps, otherwise the
      // overflow detector reads every schedule list as clipped.
      const maxRows = Math.max(1, zone.maxLines);
      const capHeight =
        zone.maxLines > 0
          ? lineHeightPx * maxRows + gap * (rows.length - 1)
          : undefined;

      return (
        <div
          key={zone.id}
          data-zone={zone.role}
          style={{
            ...baseStyle,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`,
            ...(capHeight ? { maxHeight: `${capHeight}px` } : {}),
          }}
        >
          {rows.map((row, i) =>
            typeof row === 'string' ? (
              <div key={i} style={{ whiteSpace: 'pre-wrap' }}>{row}</div>
            ) : (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent:
                    textAlign === 'center'
                      ? 'center'
                      : textAlign === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                  gap: `${s(14)}px`,
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    color: accent,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {row.time}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.92)' }}>{row.detail}</span>
              </div>
            )
          )}
        </div>
      );
    };

    const renderAccentLine = () => {
      const accentCfg = template.accentLine;
      if (!accentCfg?.enabled) return null;

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: accentJustify,
            marginBottom: accentCfg.position === 'above-headline' ? `${s(20 * spacingMult)}px` : '0',
            marginTop: accentCfg.position === 'above-footer' ? `${s(20 * spacingMult)}px` : '0',
          }}
        >
          <div
            style={{
              width: `${accentCfg.widthPercent}%`,
              height: `${s(accentCfg.thickness)}px`,
              backgroundColor: accent,
              opacity: accentCfg.opacity,
              borderRadius: `${s(2)}px`,
            }}
          />
        </div>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          overflow: 'hidden',
          ...bgStyle,
        }}
      >
        {/* Uploaded Image Background */}
        {state.background.type === 'upload' && state.background.uploadedImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${state.background.uploadedImage})`,
              backgroundSize: 'cover',
              backgroundPosition: `${state.background.focalPoint.x * 100}% ${state.background.focalPoint.y * 100}%`,
              // "Saturação Controlada": reduce saturation of uploaded imagery
              // (esp. prayer-meeting photos) per the graphic norms manual.
              filter:
                typeof state.background.saturation === 'number'
                  ? `saturate(${state.background.saturation})`
                  : undefined,
            }}
          />
        )}

        {/* Directional scrim over uploaded images */}
        {state.background.type === 'upload' && state.background.uploadedImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: scrimBackground(
                state.background.scrim.style,
                state.background.scrim.strength
              ),
            }}
          />
        )}

        {/* Grain/noise overlay */}
        {showGrain && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: GRAIN_URL,
              backgroundRepeat: 'repeat',
              opacity: 0.5,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            top: `${s(safeArea.top)}px`,
            right: `${s(safeArea.right)}px`,
            bottom: `${s(safeArea.bottom)}px`,
            left: `${s(safeArea.left)}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: layout.justifyContent,
            alignItems: 'stretch',
            gap: `${s(scaledGap)}px`,
          }}
        >
          {/* Accent line above headline */}
          {template.accentLine?.position === 'above-headline' && renderAccentLine()}

          {/* Kicker */}
          {renderZone(template.zones.kicker, state.kicker, state.kickerEnabled)}

          {/* Headline */}
          {renderZone(template.zones.headline, state.title, true)}

          {/* Accent line below headline */}
          {template.accentLine?.position === 'below-headline' && renderAccentLine()}

          {/* Subtitle */}
          {renderZone(template.zones.subtitle, state.subtitle, state.subtitleEnabled)}

          {/* Body (with schedule-row support) */}
          {renderBody(template.zones.body, state.body, state.bodyEnabled)}

          {/* Accent line above footer */}
          {template.accentLine?.position === 'above-footer' && renderAccentLine()}

          {/* Footer */}
          {renderZone(template.zones.footer, state.footer, state.footerEnabled)}
        </div>
      </div>
    );
  }
);

PosterRenderer.displayName = 'PosterRenderer';
