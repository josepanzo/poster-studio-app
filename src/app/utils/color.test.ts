import { describe, it, expect } from 'vitest';
import {
  parseHex,
  toHex,
  relativeLuminance,
  contrastRatio,
  readableAccent,
} from './color';

describe('parseHex / toHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#D9B98A')).toEqual({ r: 217, g: 185, b: 138 });
  });

  it('parses 3-digit hex', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects garbage', () => {
    expect(parseHex('not-a-color')).toBeNull();
    expect(parseHex('')).toBeNull();
  });

  it('round-trips', () => {
    expect(toHex(217, 185, 138)).toBe('#d9b98a');
  });
});

describe('contrastRatio', () => {
  it('black vs white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('identical colours are 1:1', () => {
    expect(contrastRatio('#888888', '#888888')).toBeCloseTo(1, 5);
  });
});

describe('readableAccent guardrail', () => {
  it('keeps a readable accent untouched', () => {
    expect(readableAccent('#D9B98A', '#101010')).toBe('#D9B98A');
  });

  it('falls back to white for a pale accent on a light background', () => {
    const result = readableAccent('#E8D5B5', '#f5f0e6');
    expect(['#ffffff', '#000000']).toContain(result);
    // A light bg must fall back to black-ish (white would be invisible)
    expect(result).toBe('#000000');
  });

  it('falls back to white for a dark accent on a dark background', () => {
    expect(readableAccent('#3a2a10', '#101010')).toBe('#ffffff');
  });
});

describe('relativeLuminance', () => {
  it('white is 1, black is 0', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 3);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 3);
  });
});
