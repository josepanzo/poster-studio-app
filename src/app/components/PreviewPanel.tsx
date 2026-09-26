import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { PosterState, FormatId } from '../state/poster-state';
import { FORMAT_MAP } from '../state/poster-state';
import { PosterRenderer } from './PosterRenderer';
import { Maximize2, Eye, AlertTriangle } from 'lucide-react';
import { usePreviewScale, useValidPreviewFormat } from '../hooks/usePreviewScale';

interface PreviewPanelProps {
  state: PosterState;
  onFocalPointChange?: (x: number, y: number) => void;
  /** Expose a way for parent to get export refs */
  exportRefsCallback?: (refs: Map<FormatId, HTMLDivElement | null>) => void;
  onEnterPreview?: () => void;
}

export function PreviewPanel({ state, onFocalPointChange, exportRefsCallback, onEnterPreview }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRefs = useRef<Map<FormatId, HTMLDivElement | null>>(new Map());

  // Currently previewing format
  const [previewFormat, setPreviewFormat] = useValidPreviewFormat(state.formats);

  const fmt = FORMAT_MAP[previewFormat];
  const { scale } = usePreviewScale(containerRef, previewFormat, 48, fmt);

  // Expose export refs to parent whenever the active format set changes.
  useEffect(() => {
    exportRefsCallback?.(exportRefs.current);
  }, [exportRefsCallback, state.formats]);

  const setExportRef = useCallback((format: FormatId) => (el: HTMLDivElement | null) => {
    exportRefs.current.set(format, el);
  }, []);

  // Compute a normalized focal point from a pointer event on the preview box.
  const computeFocal = (clientX: number, clientY: number, rect: DOMRect) => ({
    x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
  });

  // Handle focal point click and drag on preview
  const handlePreviewPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (state.background.type !== 'upload' || !state.background.uploadedImage) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const apply = (clientX: number, clientY: number) => {
        const { x, y } = computeFocal(clientX, clientY, rect);
        onFocalPointChange?.(x, y);
      };
      apply(e.clientX, e.clientY);

      const onMove = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [state.background.type, state.background.uploadedImage, onFocalPointChange]
  );

  const showFocalPoint = state.background.type === 'upload' && state.background.uploadedImage;

  // Detect text zones whose content is clipped by their maxLines cap, so the
  // editor can warn the user before they export a broken poster. Measured on
  // the off-screen full-size export renderers (not the scaled-down preview).
  // A zone is only "clipped" when its height is pinned at the maxLines cap
  // (maxHeight) AND its content is taller — a plain scrollHeight > clientHeight
  // check would false-positive on normal glyph overflow of tight line-heights.
  const [overflowZones, setOverflowZones] = useState<string[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const containers = exportRefs.current;
      const overflowing = new Set<string>();
      containers.forEach((el) => {
        if (!el) return;
        el.querySelectorAll<HTMLElement>('[data-zone]').forEach((zone) => {
          const maxHeight = parseFloat(getComputedStyle(zone).maxHeight);
          const pinnedAtCap =
            Number.isFinite(maxHeight) && maxHeight > 0 && zone.clientHeight >= maxHeight - 2;
          if (pinnedAtCap && zone.scrollHeight > zone.clientHeight + 2) {
            overflowing.add(zone.dataset.zone || 'text');
          }
        });
      });
      const list = [...overflowing];
      setOverflowZones((prev) =>
        prev.length === list.length && prev.every((z, i) => z === list[i])
          ? prev
          : list
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0c0c14' }}>
      {/* Format tabs (when multiple formats) */}
      {state.formats.length > 1 ? (
        <div className="flex items-center gap-2 px-6 pt-4">
          {state.formats.map((f) => (
            <button
              key={f}
              onClick={() => setPreviewFormat(f)}
              aria-pressed={previewFormat === f}
              className="px-4 py-1.5 rounded-lg text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              style={{
                fontWeight: 500,
                background: previewFormat === f ? '#1e1e30' : 'transparent',
                color: previewFormat === f ? '#ffffff' : '#9090c0',
                border: previewFormat === f ? '1px solid #2a2a44' : '1px solid transparent',
              }}
            >
              {f === 'square' ? 'Square' : f === 'landscape' ? 'Landscape' : 'Story'}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-[11px] text-[#9090c0] tabular-nums">
            {fmt.width} x {fmt.height}
          </span>
          <button
            onClick={onEnterPreview}
            aria-label="Open distraction-free export preview"
            className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-colors hover:bg-[#2a2a44] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            style={{ background: '#1a1a2e', color: '#9090c0', fontWeight: 500 }}
            title="Preview export (distraction-free)"
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 px-6 pt-4">
          <span className="text-[11px] text-[#9090c0] tabular-nums">
            {fmt.width} x {fmt.height}
          </span>
          <button
            onClick={onEnterPreview}
            aria-label="Open distraction-free export preview"
            className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-colors hover:bg-[#2a2a44] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            style={{ background: '#1a1a2e', color: '#9090c0', fontWeight: 500 }}
            title="Preview export (distraction-free)"
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      )}

      {/* Preview area */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden relative">
        {overflowZones.length > 0 && (
          <div
            role="status"
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ background: '#2a1f0a', border: '1px solid #b45309', color: '#fbbf24' }}
          >
            <AlertTriangle size={13} />
            <span className="text-[12px]" style={{ fontWeight: 500 }}>
              {overflowZones.includes('headline')
                ? 'Headline is too long and may be clipped in the export.'
                : 'Some text is too long and may be clipped in the export.'}
            </span>
          </div>
        )}
        <div
          style={{
            width: `${fmt.width * scale}px`,
            height: `${fmt.height * scale}px`,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            position: 'relative',
            cursor: showFocalPoint ? 'crosshair' : 'default',
          }}
          onPointerDown={showFocalPoint ? handlePreviewPointerDown : undefined}
        >
          {/* Render at display-native size with scaleFactor instead of transform:scale().
              This ensures Figma's "Copy design" captures matching container + text sizes. */}
          <PosterRenderer
            state={state}
            format={previewFormat}
            width={fmt.width * scale}
            height={fmt.height * scale}
            scaleFactor={scale}
          />

          {/* Focal point indicator */}
          {showFocalPoint && (
            <div
              role="slider"
              aria-label="Focal point"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(state.background.focalPoint.x * 100)}
              aria-valuetext={`X ${Math.round(state.background.focalPoint.x * 100)}%, Y ${Math.round(state.background.focalPoint.y * 100)}%`}
              tabIndex={0}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 0.1 : 0.02;
                let { x, y } = state.background.focalPoint;
                if (e.key === 'ArrowLeft') x = Math.max(0, x - step);
                else if (e.key === 'ArrowRight') x = Math.min(1, x + step);
                else if (e.key === 'ArrowUp') y = Math.max(0, y - step);
                else if (e.key === 'ArrowDown') y = Math.min(1, y + step);
                else return;
                e.preventDefault();
                onFocalPointChange?.(x, y);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-full"
              style={{
                position: 'absolute',
                left: `${state.background.focalPoint.x * 100}%`,
                top: `${state.background.focalPoint.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.8)',
                borderRadius: '50%',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)',
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '4px',
                  height: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                }}
              />
            </div>
          )}
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          <Maximize2 size={12} className="text-[#9090c0]" />
          <span className="text-[11px] text-[#9090c0] tabular-nums">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Off-screen full-size renderers for export.
          Positioned within the flow (not at a huge negative offset) so layout
          engines (WebKit/Safari included) compute correct glyph metrics.
          Hidden from view and interaction via opacity/pointer-events. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -100,
        }}
        aria-hidden
      >
        {state.formats.map((f) => {
          const d = FORMAT_MAP[f];
          return (
            <PosterRenderer
              key={f}
              ref={setExportRef(f)}
              state={state}
              format={f}
              width={d.width}
              height={d.height}
            />
          );
        })}
      </div>
    </div>
  );
}