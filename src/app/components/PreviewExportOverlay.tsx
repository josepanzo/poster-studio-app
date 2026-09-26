import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PosterState } from '../state/poster-state';
import { FORMAT_MAP } from '../state/poster-state';
import { PosterRenderer } from './PosterRenderer';
import { X, Square, Smartphone, Monitor, Maximize2 } from 'lucide-react';
import {
  usePreviewScale,
  useValidPreviewFormat,
  useFocusRestore,
  trapTabKey,
} from '../hooks/usePreviewScale';

interface PreviewExportOverlayProps {
  state: PosterState;
  onClose: () => void;
}

export function PreviewExportOverlay({ state, onClose }: PreviewExportOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [previewFormat, setPreviewFormat] = useValidPreviewFormat(state.formats);
  const [entered, setEntered] = useState(false);

  const fmt = FORMAT_MAP[previewFormat];
  const { scale } = usePreviewScale(containerRef, previewFormat, 64, fmt);

  useFocusRestore();

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapTabKey(dialogRef.current, e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on background click (not poster)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Preview export"
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: entered ? 'rgba(4, 4, 10, 0.96)' : 'rgba(4, 4, 10, 0)',
        transition: 'background 300ms ease',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'all 300ms ease 100ms',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[14px] text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            Preview Export
          </span>
          <div className="h-4 w-px" style={{ background: '#2a2a44' }} />
          <span className="text-[12px]" style={{ color: '#808098', fontWeight: 500 }}>
            {fmt.width} × {fmt.height}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Format switcher */}
          {state.formats.length > 1 && (
            <div className="flex gap-1 rounded-lg p-1" style={{ background: '#1a1a2e' }}>
              {state.formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setPreviewFormat(f)}
                  aria-pressed={previewFormat === f}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
                  style={{
                    fontWeight: 500,
                    background: previewFormat === f ? '#2a2a44' : 'transparent',
                    color: previewFormat === f ? '#ffffff' : '#505070',
                  }}
                >
                  {f === 'square' ? <Square size={12} /> : f === 'landscape' ? <Monitor size={12} /> : <Smartphone size={12} />}
                  {f === 'square' ? 'Square' : f === 'landscape' ? 'Landscape' : 'Story'}
                </button>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            style={{ background: '#1a1a2e', color: '#808098' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2a2a44';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a2e';
              e.currentTarget.style.color = '#808098';
            }}
          >
            <span className="text-[12px]" style={{ fontWeight: 500 }}>
              Esc
            </span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Poster area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={handleBackdropClick}
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'scale(1)' : 'scale(0.96)',
          transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1) 50ms',
        }}
      >
        <div
          style={{
            width: `${fmt.width * scale}px`,
            height: `${fmt.height * scale}px`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          {/* Render at display-native size with scaleFactor instead of transform:scale() */}
          <PosterRenderer
            state={state}
            format={previewFormat}
            width={fmt.width * scale}
            height={fmt.height * scale}
            scaleFactor={scale}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-center px-6 pb-5 pt-2"
        style={{
          opacity: entered ? 1 : 0,
          transition: 'opacity 300ms ease 200ms',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Maximize2 size={11} style={{ color: '#808098' }} />
          <span className="text-[11px] tabular-nums" style={{ color: '#808098' }}>
            {Math.round(scale * 100)}% of actual size
          </span>
        </div>
      </div>
    </div>
  );
}