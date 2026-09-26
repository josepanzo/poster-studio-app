import { describe, it, expect } from 'vitest';
import { STYLE_PRESETS } from './presets';
import { FONT_PAIRINGS } from '../templates/fonts';
import { DEFAULT_STATE } from '../state/poster-state';

describe('style presets', () => {
  it('have unique ids and non-empty names', () => {
    const ids = STYLE_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of STYLE_PRESETS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });

  it('reference valid font pairings', () => {
    for (const p of STYLE_PRESETS) {
      expect(FONT_PAIRINGS[p.fontPairing]).toBeDefined();
    }
  });

  it('use valid hex accent colours', () => {
    for (const p of STYLE_PRESETS) {
      expect(p.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('keep scrim strength within the slider range and spacing within the clamp', () => {
    for (const p of STYLE_PRESETS) {
      expect(p.scrim.strength).toBeGreaterThanOrEqual(0);
      expect(p.scrim.strength).toBeLessThanOrEqual(0.9);
      expect(['bottom', 'radial', 'full']).toContain(p.scrim.style);
      expect(p.sectionSpacing).toBeGreaterThanOrEqual(0.6);
      expect(p.sectionSpacing).toBeLessThanOrEqual(1.6);
    }
  });

  it('the default accent is readable against the default background', () => {
    // Sanity: the shipped default state should pass the guardrail without
    // falling back (i.e. the accent is preserved as-is).
    expect(DEFAULT_STATE.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
