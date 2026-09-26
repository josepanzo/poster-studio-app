import { useState, useEffect, useRef } from 'react';
import type { FormatId } from '../state/poster-state';

/**
 * Measures a container element and computes the largest scale at which a
 * poster of the given format fits inside it (never exceeding 1x).
 * Shared by PreviewPanel and PreviewExportOverlay.
 */
export function usePreviewScale(
  containerRef: React.RefObject<HTMLElement | null>,
  format: FormatId,
  padding: number,
  formatDimensions: { width: number; height: number }
) {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 800 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  const availW = containerSize.width - padding * 2;
  const availH = containerSize.height - padding * 2;
  const scaleX = availW / formatDimensions.width;
  const scaleY = availH / formatDimensions.height;
  const scale = Math.min(scaleX, scaleY, 1);

  return { containerSize, scale };
}

const PREVIEW_FORMAT_KEY = 'poster-studio-preview-format';

/** Keeps a preview-format selection valid as the set of selected formats changes. */
export function useValidPreviewFormat(
  formats: FormatId[],
  fallback: FormatId = 'square'
) {
  const [previewFormat, setPreviewFormat] = useState<FormatId>(() => {
    try {
      const stored = localStorage.getItem(PREVIEW_FORMAT_KEY);
      if (stored && formats.includes(stored as FormatId)) return stored as FormatId;
    } catch {
      // ignore
    }
    return formats[0] || fallback;
  });

  useEffect(() => {
    setPreviewFormat((current) =>
      formats.includes(current) ? current : formats[0] || fallback
    );
  }, [formats, fallback]);

  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_FORMAT_KEY, previewFormat);
    } catch {
      // ignore
    }
  }, [previewFormat]);

  return [previewFormat, setPreviewFormat] as const;
}

/** Restore focus to the element that was active before the overlay mounted. */
export function useFocusRestore() {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    return () => {
      triggerRef.current?.focus?.();
    };
  }, []);
}

/** Focus trap helper: constrains Tab cycling to elements inside `containerRef`. */
export function trapTabKey(container: HTMLElement | null, e: KeyboardEvent) {
  if (!container) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}
