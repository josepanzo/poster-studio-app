// ─── Background Preset Definitions ─────────────────────────────────────

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'solid' | 'gradient' | 'texture';
  /** CSS value for the background property */
  background: string;
  /** Preview swatch color for the picker */
  swatch: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // ─── Solids (5) ───────────────────────────────────────────────────────
  {
    id: 'solid-charcoal',
    name: 'Charcoal',
    category: 'solid',
    background: '#1a1a2e',
    swatch: '#1a1a2e',
  },
  {
    id: 'solid-midnight',
    name: 'Midnight',
    category: 'solid',
    background: '#0f0f23',
    swatch: '#0f0f23',
  },
  {
    id: 'solid-navy',
    name: 'Deep Navy',
    category: 'solid',
    background: '#0a1628',
    swatch: '#0a1628',
  },
  {
    id: 'solid-forest',
    name: 'Forest',
    category: 'solid',
    background: '#1a2e1a',
    swatch: '#1a2e1a',
  },
  {
    id: 'solid-wine',
    name: 'Wine',
    category: 'solid',
    background: '#2e1a2a',
    swatch: '#2e1a2a',
  },

  // ─── Gradients (11) ──────────────────────────────────────────────────
  // Palettes are kept sober, low-saturation and earth/wood/mineral-toned
  // per the "Saturação Controlada" guideline (no vibrant/instagrammable hues).
  {
    id: 'gradient-sunset',
    name: 'Sunset',
    category: 'gradient',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    swatch: '#302b63',
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora',
    category: 'gradient',
    background: 'linear-gradient(135deg, #0c1445 0%, #1a3a5c 30%, #0d5c63 60%, #1a8a6e 100%)',
    swatch: '#0d5c63',
  },
  {
    id: 'gradient-timber',
    name: 'Timber',
    category: 'gradient',
    background: 'linear-gradient(135deg, #1c120c 0%, #332014 40%, #4a3020 70%, #3a2716 100%)',
    swatch: '#4a3020',
  },
  {
    id: 'gradient-ember',
    name: 'Terracotta',
    category: 'gradient',
    background: 'linear-gradient(135deg, #1a0e0a 0%, #3d1f14 45%, #5c2e1b 75%, #4a301f 100%)',
    swatch: '#5c2e1f',
  },
  {
    id: 'gradient-ocean',
    name: 'Deep Bay',
    category: 'gradient',
    background: 'linear-gradient(180deg, #0a1518 0%, #152c36 40%, #1e404b 75%, #17313a 100%)',
    swatch: '#1e404b',
  },
  {
    id: 'gradient-lavender',
    name: 'Slate',
    category: 'gradient',
    background: 'linear-gradient(135deg, #14121a 0%, #261f33 35%, #3a3048 65%, #322a3d 100%)',
    swatch: '#3a3048',
  },
  {
    id: 'gradient-noir',
    name: 'Noir',
    category: 'gradient',
    background: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)',
    swatch: '#1a1a2e',
  },
  {
    id: 'gradient-bloom',
    name: 'Radial Bloom',
    category: 'gradient',
    background: 'radial-gradient(ellipse at 30% 80%, #3d1a5e 0%, #1a0a30 50%, #0a0a1a 100%)',
    swatch: '#3d1a5e',
  },
  {
    id: 'gradient-solar',
    name: 'Solar Flare',
    category: 'gradient',
    background: 'radial-gradient(ellipse at 70% 20%, #ff6b3520 0%, #1a0f00 30%), linear-gradient(180deg, #1a0f00 0%, #0a0500 100%)',
    swatch: '#2a1500',
  },
  {
    id: 'gradient-frost',
    name: 'Mineral',
    category: 'gradient',
    background: 'linear-gradient(135deg, #0a141d 0%, #15263a 35%, #22384f 65%, #1b2e40 100%)',
    swatch: '#22384f',
  },
  {
    id: 'gradient-emerald',
    name: 'Moss',
    category: 'gradient',
    background: 'linear-gradient(160deg, #0d150d 0%, #17291a 40%, #22422b 75%, #1c3527 100%)',
    swatch: '#22422b',
  },

  // ─── Textures (3) ────────────────────────────────────────────────────
  {
    id: 'texture-dark-noise',
    name: 'Dark Grain',
    category: 'texture',
    background: '#141420',
    swatch: '#141420',
  },
  {
    id: 'texture-warm-noise',
    name: 'Warm Grain',
    category: 'texture',
    background: 'linear-gradient(160deg, #1a1008 0%, #2a1a10 100%)',
    swatch: '#2a1a10',
  },
  {
    id: 'texture-cool-noise',
    name: 'Cool Grain',
    category: 'texture',
    background: 'linear-gradient(160deg, #0a0f1a 0%, #101830 100%)',
    swatch: '#101830',
  },
];

export function getPreset(id: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find((p) => p.id === id);
}
