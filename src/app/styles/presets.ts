// ─── One-Click Style Presets ───────────────────────────────────────────
// Each preset bundles font pairing, accent colour, scrim treatment and
// section spacing so a user gets a polished, coherent result in one
// click. Presets never touch the user's text content.

import type { ScrimStyle } from '../state/poster-state';
import type { FontPairingId } from '../templates/fonts';

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  fontPairing: FontPairingId;
  accentColor: string;
  scrim: { style: ScrimStyle; strength: number };
  sectionSpacing: number;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Serif display + warm gold accents. The editorial reference look.',
    fontPairing: 'playfair',
    accentColor: '#D9B98A',
    scrim: { style: 'bottom', strength: 0.75 },
    sectionSpacing: 1,
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Serif',
    description: 'Fraunces display with a muted terracotta accent.',
    fontPairing: 'fraunces',
    accentColor: '#C98A6B',
    scrim: { style: 'bottom', strength: 0.7 },
    sectionSpacing: 1.05,
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'All-Inter typography, thin white rules, tight spacing.',
    fontPairing: 'inter',
    accentColor: '#ffffff',
    scrim: { style: 'bottom', strength: 0.7 },
    sectionSpacing: 0.9,
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans',
    description: 'Space Grotesk headlines with a confident gold rule.',
    fontPairing: 'space-grotesk',
    accentColor: '#E3C08D',
    scrim: { style: 'bottom', strength: 0.7 },
    sectionSpacing: 1,
  },
  {
    id: 'statement',
    name: 'Statement',
    description: 'Tall Bebas capitals, centred rules, generous spacing.',
    fontPairing: 'bebas',
    accentColor: '#D9B98A',
    scrim: { style: 'bottom', strength: 0.75 },
    sectionSpacing: 1.15,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'DM Serif display with a soft radial vignette.',
    fontPairing: 'dm-serif',
    accentColor: '#E8D5B5',
    scrim: { style: 'radial', strength: 0.6 },
    sectionSpacing: 1,
  },
];

export function getPreset(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}
