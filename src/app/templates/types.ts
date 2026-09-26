// ─── Template Type Definitions ─────────────────────────────────────────
// Templates are config objects that define how a poster variant is laid out.
// Later, an editor can modify these configs visually.

import type { FormatId } from '../state/poster-state';

export interface ZoneTypography {
  fontFamily: 'headline' | 'body';
  /** Font sizes keyed by format */
  fontSize: Record<FormatId, number>;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'uppercase' | 'lowercase' | 'none';
}

export interface ZoneConfig {
  id: string;
  role: 'kicker' | 'headline' | 'subtitle' | 'body' | 'footer';
  typography: ZoneTypography;
  /** Max lines before truncation (0 = unlimited) */
  maxLines: number;
  /** Top margin in px at 1080 width */
  marginTop: number;
  /** Bottom margin in px at 1080 width */
  marginBottom: number;
  /** Opacity 0-1 */
  opacity: number;
}

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateLayout {
  /** Flex justify-content for main axis */
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  /** Gap between zones in px */
  gap: number;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  /** Safe area padding in pixels (at 1080 base width) */
  safeArea: Record<FormatId, SafeArea>;
  /** Layout configuration */
  layout: Record<FormatId, TemplateLayout>;
  /** Zone definitions */
  zones: {
    kicker: ZoneConfig;
    headline: ZoneConfig;
    subtitle: ZoneConfig;
    body: ZoneConfig;
    footer: ZoneConfig;
  };
  /** Whether a decorative line/accent appears */
  accentLine?: {
    enabled: boolean;
    position: 'above-headline' | 'below-headline' | 'above-footer';
    thickness: number;
    widthPercent: number;
    /** Base colour; the accent colour overrides this at render time. */
    color: string;
    opacity: number;
  };
}
