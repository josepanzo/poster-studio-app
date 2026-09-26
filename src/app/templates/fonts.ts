// ─── Curated Font Pairings ─────────────────────────────────────────────
// A pairing bundles a display face (headlines, subtitles) with a text
// face (body, footer). Every pairing is chosen so the two faces contrast
// in structure while sharing a similar weight envelope, per the visual
// references (serif display + clean sans is the flagship combination).

export type FontPairingId =
  | 'playfair'
  | 'fraunces'
  | 'space-grotesk'
  | 'dm-serif'
  | 'bebas'
  | 'inter';

export interface FontPairing {
  id: FontPairingId;
  name: string;
  /** CSS stack for display roles (headline / subtitle). */
  headline: string;
  /** CSS stack for text roles (body / footer / kicker). */
  body: string;
  /**
   * Some display faces (e.g. Bebas Neue) only ship one weight; cap the
   * template's headline font-weight so the browser doesn't synthesize
   * a fake bold that looks blurry in the export.
   */
  maxHeadlineWeight?: number;
}

export const FONT_PAIRINGS: Record<FontPairingId, FontPairing> = {
  playfair: {
    id: 'playfair',
    name: 'Playfair · Inter',
    headline: "'Playfair Display', Georgia, serif",
    body: "'Inter', sans-serif",
  },
  fraunces: {
    id: 'fraunces',
    name: 'Fraunces · Inter',
    headline: "'Fraunces', Georgia, serif",
    body: "'Inter', sans-serif",
  },
  'space-grotesk': {
    id: 'space-grotesk',
    name: 'Space Grotesk · Inter',
    headline: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
  },
  'dm-serif': {
    id: 'dm-serif',
    name: 'DM Serif · Inter',
    headline: "'DM Serif Display', Georgia, serif",
    body: "'Inter', sans-serif",
  },
  bebas: {
    id: 'bebas',
    name: 'Bebas · Inter',
    headline: "'Bebas Neue', 'Arial Narrow', sans-serif",
    body: "'Inter', sans-serif",
    maxHeadlineWeight: 400,
  },
  inter: {
    id: 'inter',
    name: 'Inter only',
    headline: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
};

export const FONT_PAIRING_LIST: FontPairing[] = Object.values(FONT_PAIRINGS);

const VALID_PAIRING_IDS = Object.keys(FONT_PAIRINGS) as FontPairingId[];

export function isValidPairingId(id: unknown): id is FontPairingId {
  return typeof id === 'string' && VALID_PAIRING_IDS.includes(id as FontPairingId);
}

/** Resolve a pairing id (invalid or missing ids fall back to the default). */
export function getPairing(id: string | undefined): FontPairing {
  return isValidPairingId(id) ? FONT_PAIRINGS[id] : FONT_PAIRINGS['space-grotesk'];
}
