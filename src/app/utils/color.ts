// ─── Colour Utilities ──────────────────────────────────────────────────
// Minimal WCAG-style relative-luminance maths, used by the renderer to
// guarantee the accent colour stays readable against any background.

/** Parse #rgb / #rrggbb (and 6-digit hex with alpha) into r,g,b (0-255). */
export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{3,8})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length < 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance of an #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Return the accent colour unless it would be hard to read against
 * `bgHex`, in which case fall back to white or black — whichever
 * contrasts better. This is the guardrail that keeps user-chosen
 * accents (e.g. a pale gold on a light gradient) legible in the export.
 */
export function readableAccent(accentHex: string, bgHex: string): string {
  if (contrastRatio(accentHex, bgHex) >= 3) return accentHex;
  const white = contrastRatio('#ffffff', bgHex);
  const black = contrastRatio('#000000', bgHex);
  return white >= black ? '#ffffff' : '#000000';
}
