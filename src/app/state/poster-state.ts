import { isValidPairingId } from '../templates/fonts';

export type VariantId = 'hero' | 'announcement' | 'quote' | 'image-led';
export type Alignment = 'left' | 'center' | 'right';
export type FormatId = 'square' | 'story' | 'landscape';

export interface FormatDimensions {
  width: number;
  height: number;
  label: string;
}

export const FORMAT_MAP: Record<FormatId, FormatDimensions> = {
  square: { width: 1080, height: 1080, label: 'Square 1080×1080' },
  story: { width: 1080, height: 1920, label: 'Story 1080×1920' },
  landscape: { width: 1920, height: 1080, label: 'Landscape 1920×1080' },
};

/** Directional scrim styles for photo backgrounds. */
export type ScrimStyle = 'bottom' | 'full' | 'radial';

export interface BackgroundState {
  type: 'preset' | 'upload';
  presetId: string;
  uploadedImage: string | null;
  focalPoint: { x: number; y: number };
  /**
   * @deprecated Legacy flat overlay opacity. Kept only so states saved
   * before the scrim system migrate; superseded by `scrim`.
   */
  overlayOpacity: number;
  /** Directional scrim over uploaded images (default: bottom-weighted). */
  scrim: {
    style: ScrimStyle;
    /** 0–1 strength of the darkest end of the scrim. */
    strength: number;
  };
  /**
   * Saturation applied to uploaded images (CSS `saturate()`).
   * 1 = full color, 0 = fully desaturated (grayscale).
   * Default 1 keeps existing uploads unchanged; lower values honor the
   * manual's "saturação reduzida" rule for reflective/sober imagery.
   */
  saturation: number;
}

export interface PosterState {
  /** Small uppercase eyebrow above the headline (optional). */
  kickerEnabled: boolean;
  kicker: string;
  title: string;
  subtitleEnabled: boolean;
  subtitle: string;
  bodyEnabled: boolean;
  body: string;
  footerEnabled: boolean;
  footer: string;
  variant: VariantId;
  alignment: Alignment;
  formats: FormatId[];
  /** Curated display+text font pairing (see templates/fonts.ts). */
  fontPairing: string;
  /** Accent hex colour for kicker, schedule times and decorative rules. */
  accentColor: string;
  /** Render body lines like "10h30 Cebracao" as bold-accent schedule rows. */
  scheduleRowsEnabled: boolean;
  background: BackgroundState;
  grainEnabled: boolean;
  /** Spacing multiplier between text sections (0.5 – 2.0, default 1.0) */
  sectionSpacing: number;
}

export const DEFAULT_STATE: PosterState = {
  kickerEnabled: false,
  kicker: 'Sunday · 10h30',
  title: 'Your Headline Here',
  subtitleEnabled: false,
  subtitle: 'A punchy subtitle goes here',
  bodyEnabled: false,
  body: 'Add supporting text to give context to your headline.',
  footerEnabled: false,
  footer: '@yourbrand  |  yourbrand.com',
  variant: 'hero',
  alignment: 'left',
  formats: ['square'],
  fontPairing: 'playfair',
  accentColor: '#D9B98A',
  scheduleRowsEnabled: true,
  background: {
    type: 'preset',
    presetId: 'texture-warm-noise',
    uploadedImage: null,
    focalPoint: { x: 0.5, y: 0.5 },
    overlayOpacity: 0.4,
    scrim: { style: 'bottom', strength: 0.65 },
    saturation: 1,
  },
  grainEnabled: false,
  sectionSpacing: 1.0,
};

// ─── Persistence ───────────────────────────────────────────────────────

export const STORAGE_KEY = 'poster-studio-state';

const VALID_VARIANTS: VariantId[] = ['hero', 'announcement', 'quote', 'image-led'];
const VALID_FORMATS: FormatId[] = ['square', 'story', 'landscape'];
const VALID_ALIGNMENTS: Alignment[] = ['left', 'center', 'right'];

/** Coerce unknown parsed values into safe PosterState fields. */
function normalizeParsed(parsed: Record<string, unknown>): Partial<PosterState> {
  const safe: Partial<PosterState> = {};

  if (VALID_VARIANTS.includes(parsed.variant as VariantId)) {
    safe.variant = parsed.variant as VariantId;
  }
  if (VALID_ALIGNMENTS.includes(parsed.alignment as Alignment)) {
    safe.alignment = parsed.alignment as Alignment;
  }
  if (Array.isArray(parsed.formats)) {
    const formats = (parsed.formats as unknown[]).filter(
      (f): f is FormatId => VALID_FORMATS.includes(f as FormatId)
    );
    if (formats.length > 0) safe.formats = [...new Set(formats)];
  }

  for (const key of ['title', 'subtitle', 'body', 'footer'] as const) {
    if (typeof parsed[key] === 'string') safe[key] = parsed[key];
  }
  for (const key of ['subtitleEnabled', 'bodyEnabled', 'footerEnabled', 'grainEnabled', 'kickerEnabled', 'scheduleRowsEnabled'] as const) {
    if (typeof parsed[key] === 'boolean') safe[key] = parsed[key];
  }
  if (typeof parsed.kicker === 'string') safe.kicker = parsed.kicker;
  if (typeof parsed.fontPairing === 'string' && isValidPairingId(parsed.fontPairing)) {
    safe.fontPairing = parsed.fontPairing;
  }
  if (typeof parsed.accentColor === 'string' && /^#[0-9a-f]{3,8}$/i.test(parsed.accentColor)) {
    safe.accentColor = parsed.accentColor;
  }
  if (typeof parsed.sectionSpacing === 'number' && Number.isFinite(parsed.sectionSpacing)) {
    // Guardrail: wild spacing produces unbalanced posters. Clamp to 0.6–1.6.
    safe.sectionSpacing = Math.min(1.6, Math.max(0.6, parsed.sectionSpacing));
  }
  if (
    typeof parsed.background === 'object' &&
    parsed.background !== null &&
    typeof (parsed.background as BackgroundState).overlayOpacity === 'number'
  ) {
    const legacyOverlay = Math.min(0.7, Math.max(0, (parsed.background as BackgroundState).overlayOpacity));
    safe.background = {
      ...DEFAULT_STATE.background,
      ...(parsed.background as Partial<BackgroundState>),
    } as BackgroundState;
    // Migration: states saved before the scrim system only carry the legacy
    // flat overlayOpacity. Derive a scrim strength from it (flat overlay at
    // 0.4 ≈ bottom scrim at 0.65 of perceived darkness).
    if (!safe.background.scrim) {
      safe.background.scrim = {
        style: 'bottom',
        strength: Math.min(0.9, Math.round((legacyOverlay * 1.6 + 0.05) * 100) / 100),
      };
    }
  }

  return safe;
}

export function loadState(): PosterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const safe = normalizeParsed(parsed);
      // Deep merge background to avoid missing nested properties
      const background: BackgroundState = {
        ...DEFAULT_STATE.background,
        ...(safe.background || {}),
        focalPoint: {
          ...DEFAULT_STATE.background.focalPoint,
          ...(safe.background?.focalPoint || {}),
        },
        scrim: {
          ...DEFAULT_STATE.background.scrim,
          ...(safe.background?.scrim || {}),
        },
        // Backfill saturation for states saved before this field existed.
        saturation:
          typeof safe.background?.saturation === 'number'
            ? safe.background.saturation
            : DEFAULT_STATE.background.saturation,
      };
      // Uploaded images are intentionally not persisted to localStorage. If a
      // saved state references an upload without its image data, fall back to the
      // default preset instead of rendering a blank canvas.
      if (background.type === 'upload' && !background.uploadedImage) {
        background.type = 'preset';
        background.presetId = DEFAULT_STATE.background.presetId;
        background.uploadedImage = null;
      }
      return {
        ...DEFAULT_STATE,
        ...safe,
        background,
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_STATE };
}

export function saveState(state: PosterState): boolean {
  try {
    // Don't persist uploaded images to localStorage (too large)
    const toSave = {
      ...state,
      background: {
        ...state.background,
        uploadedImage: null,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch {
    // ignore
  }
  return false;
}

// ─── Slug Helper ───────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'poster';
}