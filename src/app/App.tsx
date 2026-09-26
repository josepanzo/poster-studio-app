import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { PanelLeftOpen } from 'lucide-react';
import { exportPosters } from './utils/export';
import type { PosterState, FormatId } from './state/poster-state';
import { loadState, saveState, FORMAT_MAP } from './state/poster-state';
import { loadUploadedImage, saveUploadedImage } from './state/uploads';
import { Toaster, toast } from 'sonner';
import { PreviewExportOverlay } from './components/PreviewExportOverlay';

/** Detect whether the user is on an Apple platform. */
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? '');
}

/** Keyboard modifier label that matches the user's OS (⌘ on Mac, Ctrl elsewhere). */
function shortcutModifier(): string {
  if (typeof navigator === 'undefined') return 'Ctrl';
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ?? navigator.platform;
  return /Mac|iPod|iPhone|iPad/.test(platform ?? '') ? '⌘' : 'Ctrl';
}

// Panel sizing bounds for the resizable editor panel.
const PANEL_MIN_WIDTH = 300;
const PANEL_MAX_WIDTH = 560;

export default function App() {
  const [state, setState] = useState<PosterState>(loadState);
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const exportRefsRef = useRef<Map<FormatId, HTMLDivElement | null>>(new Map());

  // Resizable / collapsible editor panel
  const [panelWidth, setPanelWidth] = useState(380);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startWidth = panelWidth;

    const onMove = (clientX: number) => {
      setPanelWidth(
        Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, startWidth + (clientX - startX)))
      );
    };
    const onMouseMove = (ev: MouseEvent) => onMove(ev.clientX);
    const onTouchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientX);
    const onEnd = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);
  }, [panelWidth]);

  // Persist state on change (debounced)
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => {
      const ok = saveState(state);
      // Only flip the indicator after a successful write. If localStorage
      // rejects the payload (e.g. quota exceeded), surface the failure with a
      // retry action instead of leaving the user on "Saving..." forever.
      if (ok) {
        setIsSaved(true);
      } else {
        toast.error('Could not save your changes.', {
          description: 'Your browser storage is full or unavailable. Export your work, then free up space.',
          action: {
            label: 'Retry',
            onClick: () => {
              if (saveState(state)) setIsSaved(true);
            },
          },
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  // Restore a previously uploaded image from IndexedDB (uploads are not kept
  // in localStorage, so this reunites the user with their background image).
  useEffect(() => {
    let cancelled = false;
    loadUploadedImage().then((dataUrl) => {
      if (cancelled || !dataUrl) return;
      setState((prev) => {
        if (prev.background.uploadedImage) return prev; // already have one
        return {
          ...prev,
          background: {
            ...prev.background,
            type: 'upload',
            uploadedImage: dataUrl,
          },
        };
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror upload changes into IndexedDB so they survive reloads.
  const handleStateChange = useCallback((next: PosterState) => {
    const prevUpload = state.background.uploadedImage;
    const nextUpload = next.background.uploadedImage;
    if (prevUpload !== nextUpload) {
      void saveUploadedImage(nextUpload);
    }
    setState(next);
  }, [state.background.uploadedImage]);

  const handleFocalPointChange = useCallback(
    (x: number, y: number) => {
      setState((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          focalPoint: { x, y },
        },
      }));
    },
    []
  );

  const handleExportRefsCallback = useCallback(
    (refs: Map<FormatId, HTMLDivElement | null>) => {
      exportRefsRef.current = refs;
    },
    []
  );

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const result = await exportPosters({
        title: state.title,
        variant: state.variant,
        formats: state.formats,
        refs: exportRefsRef.current,
      });

      const labelFor = (f: FormatId) => FORMAT_MAP[f].label;

      if (result.succeeded.length > 0) {
        toast.success(
          `Exported ${result.succeeded.length} poster${result.succeeded.length > 1 ? 's' : ''}!`,
          { description: result.succeeded.map(labelFor).join(', ') }
        );
      }
      if (result.failed.length > 0) {
        toast.error(
          `Failed to export ${result.failed.length} format${result.failed.length > 1 ? 's' : ''}.`,
          { description: result.failed.map(labelFor).join(', ') }
        );
      }
      if (result.missing.length > 0) {
        toast.error('Some formats were not ready to export.', {
          description: `${result.missing.map(labelFor).join(', ')} — please try again.`,
        });
      }
      if (
        result.succeeded.length === 0 &&
        result.failed.length === 0 &&
        result.missing.length === 0
      ) {
        toast.error('Export failed. Please try again.');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, state]);

  // Keyboard shortcut: Ctrl/Cmd+E for export
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleExport]);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0c0c14' }}>
      {/* Left Panel */}
      <div
        className="shrink-0 h-full overflow-hidden border-r"
        style={{
          width: isPanelCollapsed ? '48px' : `${panelWidth}px`,
          borderColor: '#1a1a2e',
          transition: isResizing ? 'none' : 'width 200ms ease',
        }}
      >
        {isPanelCollapsed ? (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            aria-label="Expand editor panel"
            title="Expand editor panel"
            className="h-full w-full flex items-start justify-center pt-4 transition-colors hover:bg-[#1a1a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-inset"
          >
            <PanelLeftOpen size={18} style={{ color: '#9090c0' }} />
          </button>
        ) : (
          <>
            <LeftPanel
              state={state}
              onChange={handleStateChange}
              onExport={handleExport}
              isExporting={isExporting}
              isSaved={isSaved}
              onCollapse={() => setIsPanelCollapsed(true)}
            />
            {/* Drag handle for resizing the panel */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize editor panel"
              tabIndex={0}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setPanelWidth((w) => Math.max(PANEL_MIN_WIDTH, w - 20));
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  setPanelWidth((w) => Math.min(PANEL_MAX_WIDTH, w + 20));
                }
              }}
              className="absolute top-0 h-full w-1.5 cursor-col-resize hover:bg-[#6366f1]/40 focus-visible:bg-[#6366f1]/60 focus-visible:outline-none"
              style={{ left: `${panelWidth - 3}px`, zIndex: 20 }}
            />
          </>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 h-full overflow-hidden relative">
        <PreviewPanel
          state={state}
          onFocalPointChange={handleFocalPointChange}
          exportRefsCallback={handleExportRefsCallback}
          onEnterPreview={() => setPreviewMode(true)}
        />
      </div>

      {/* Preview Export Overlay */}
      {previewMode && (
        <PreviewExportOverlay
          state={state}
          onClose={() => setPreviewMode(false)}
        />
      )}

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1e1e30',
            border: '1px solid #2a2a44',
            color: '#ffffff',
          },
        }}
      />
      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-3 left-3 text-[10px] text-[#9090c0] select-none pointer-events-none">
        <kbd style={{ background: '#1a1a2e', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
          {shortcutModifier()}
        </kbd>+<kbd style={{ background: '#1a1a2e', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>E</kbd> Export
      </div>
    </div>
  );
}