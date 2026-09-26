import { toPng } from 'html-to-image';
import type { FormatId } from '../state/poster-state';
import { FORMAT_MAP, slugify } from '../state/poster-state';

export interface ExportOptions {
  title: string;
  variant: string;
  formats: FormatId[];
  refs: Map<FormatId, HTMLDivElement | null>;
}

export interface ExportResult {
  succeeded: FormatId[];
  /** Formats whose capture threw. */
  failed: FormatId[];
  /** Formats with no render element mounted (should not happen; surfaced loudly). */
  missing: FormatId[];
}

/**
 * Wait until the off-screen full-size renderers are laid out and painted.
 * Replaces the previous fixed 200ms timeout: two animation frames guarantee
 * React has committed and the browser has painted the latest state.
 */
function waitForRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Export each selected format as a PNG download. Failures are isolated per
 * format so one broken capture never blocks the others; results are returned
 * for reporting to the user.
 */
export async function exportPosters({
  title,
  variant,
  formats,
  refs,
}: ExportOptions): Promise<ExportResult> {
  // Wait for custom web fonts to finish rasterizing so the capture
  // reflects Space Grotesk / Inter rather than fallback typefaces.
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  await waitForRender();

  const slug = slugify(title);
  const result: ExportResult = { succeeded: [], failed: [], missing: [] };

  for (const format of formats) {
    const el = refs.get(format);
    if (!el) {
      console.warn(`No render element for format ${format}`);
      result.missing.push(format);
      continue;
    }

    const dims = FORMAT_MAP[format];

    try {
      const dataUrl = await toPng(el, {
        width: dims.width,
        height: dims.height,
        pixelRatio: 1,
        cacheBust: true,
        skipAutoScale: true,
        style: {
          transform: 'none',
          opacity: '1',
        },
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `${slug}-${variant}-${format}.png`;
      link.href = dataUrl;
      link.click();

      result.succeeded.push(format);

      // Small delay between downloads so browsers treat them as separate
      // user-initiated downloads rather than blocking a burst.
      if (formats.length > 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`Failed to export ${format}:`, err);
      result.failed.push(format);
    }
  }

  return result;
}
