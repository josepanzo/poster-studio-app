import React, { useCallback, useRef, useState } from 'react';
import { BACKGROUND_PRESETS, type BackgroundPreset } from '../backgrounds/presets';
import type { BackgroundState } from '../state/poster-state';
import { readAndDownscaleImage } from '../state/uploads';
import { Upload, X, ImageIcon } from 'lucide-react';

interface BackgroundPickerProps {
  background: BackgroundState;
  onChange: (bg: BackgroundState) => void;
}

type TabId = 'presets' | 'upload';

export function BackgroundPicker({ background, onChange }: BackgroundPickerProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>(
    background.type === 'upload' ? 'upload' : 'presets'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePresetSelect = useCallback(
    (preset: BackgroundPreset) => {
      onChange({
        ...background,
        type: 'preset',
        presetId: preset.id,
      });
    },
    [background, onChange]
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      setUploadError(null);

      // Security Enhancement: Prevent local DoS by limiting file size
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File is too large. Maximum size is 10MB.');
        return;
      }

      // Security Enhancement: Explicit MIME type check prevents malicious SVG/XML uploads
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Unsupported file type. Please choose a JPG, PNG, or WebP.');
        return;
      }

      readAndDownscaleImage(file)
        .then((dataUrl) => {
          onChange({
            ...background,
            type: 'upload',
            uploadedImage: dataUrl,
            focalPoint: { x: 0.5, y: 0.5 },
          });
          setActiveTab('upload');
        })
        .catch(() => {
          setUploadError('That image could not be loaded. Please try a different file.');
        });
    },
    [background, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const clearUpload = useCallback(() => {
    onChange({
      ...background,
      type: 'preset',
      uploadedImage: null,
    });
    setActiveTab('presets');
  }, [background, onChange]);

  const solids = BACKGROUND_PRESETS.filter((p) => p.category === 'solid');
  const gradients = BACKGROUND_PRESETS.filter((p) => p.category === 'gradient');
  const textures = BACKGROUND_PRESETS.filter((p) => p.category === 'texture');

  return (
    <div className="space-y-3">
      <label className="block text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>Background</label>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#1e1e30] p-1" role="tablist" aria-label="Background source">
        {(['presets', 'upload'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className="flex-1 rounded-md px-3 py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141f]"
            style={{
              fontWeight: 500,
              background: activeTab === tab ? '#2a2a44' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#9090c0',
            }}
          >
            {tab === 'presets' ? 'Presets' : 'Image'}
          </button>
        ))}
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          {/* Solids */}
          <div>
            <span className="block mb-2 text-[11px] text-[#9090c0]" style={{ fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Solids
            </span>
            <div className="flex gap-2 flex-wrap">
              {solids.map((preset) => (
                <PresetSwatch
                  key={preset.id}
                  preset={preset}
                  isActive={background.type === 'preset' && background.presetId === preset.id}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div>
            <span className="block mb-2 text-[11px] text-[#9090c0]" style={{ fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Gradients
            </span>
            <div className="flex gap-2 flex-wrap">
              {gradients.map((preset) => (
                <PresetSwatch
                  key={preset.id}
                  preset={preset}
                  isActive={background.type === 'preset' && background.presetId === preset.id}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          </div>

          {/* Textures */}
          <div>
            <span className="block mb-2 text-[11px] text-[#9090c0]" style={{ fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Textures (grain)
            </span>
            <div className="flex gap-2 flex-wrap">
              {textures.map((preset) => (
                <PresetSwatch
                  key={preset.id}
                  preset={preset}
                  isActive={background.type === 'preset' && background.presetId === preset.id}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          {uploadError && (
            <p role="alert" className="text-[12px]" style={{ color: '#f87171' }}>
              {uploadError}
            </p>
          )}
          {!background.uploadedImage ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload background image: drop an image here or press Enter to browse"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141f]"
              style={{
                borderColor: dragActive ? '#6366f1' : '#2a2a44',
                background: dragActive ? '#1a1a30' : 'transparent',
              }}
            >
              <Upload size={24} className="text-[#9090c0]" />
              <span className="text-[13px] text-[#9090c0]">
                Drop image or <span className="text-[#8b8bff]" style={{ textDecoration: 'underline' }}>browse</span>
              </span>
              <span className="text-[11px] text-[#9090c0]">JPG, PNG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Image thumbnail + clear */}
              <div className="flex items-center gap-3 rounded-lg bg-[#1e1e30] p-2">
                <div
                  className="w-12 h-12 rounded-md bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${background.uploadedImage})` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#9090c0]" />
                    <span className="text-[12px] text-[#a0a0b8] truncate">Uploaded image</span>
                  </div>
                  <span className="text-[11px] text-[#9090c0]">Click preview to set focal point</span>
                </div>
                <button
                  onClick={clearUpload}
                  aria-label="Remove uploaded image"
                  className="p-1 rounded hover:bg-[#2a2a44] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
                >
                  <X size={16} className="text-[#9090c0]" />
                </button>
              </div>

              {/* Scrim style */}
              <div>
                <span className="block mb-1.5 text-[12px] text-[#9090c0]" style={{ fontWeight: 500 }}>
                  Scrim style
                </span>
                <div className="flex gap-1 rounded-lg bg-[#1e1e30] p-1">
                  {([
                    { id: 'bottom' as const, label: 'Bottom' },
                    { id: 'radial' as const, label: 'Vignette' },
                    { id: 'full' as const, label: 'Full' },
                  ]).map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() =>
                        onChange({
                          ...background,
                          scrim: { ...background.scrim, style: id },
                        })
                      }
                      aria-pressed={background.scrim.style === id}
                      className="flex-1 rounded-md py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
                      style={{
                        fontWeight: 500,
                        background: background.scrim.style === id ? '#2a2a44' : 'transparent',
                        color: background.scrim.style === id ? '#ffffff' : '#9090c0',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-[#9090c0]" style={{ fontWeight: 400 }}>
                  Bottom keeps the photo clear and darkens where text sits — the reference-poster treatment.
                </p>
              </div>

              {/* Scrim strength */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="bg-scrim-strength" className="text-[12px] text-[#9090c0]" style={{ fontWeight: 500 }}>
                    Scrim strength
                  </label>
                  <span className="text-[11px] text-[#9090c0] tabular-nums">
                    {Math.round(background.scrim.strength * 100)}%
                  </span>
                </div>
                <input
                  id="bg-scrim-strength"
                  type="range"
                  min={0}
                  max={0.9}
                  step={0.01}
                  value={background.scrim.strength}
                  onChange={(e) =>
                    onChange({
                      ...background,
                      scrim: { ...background.scrim, strength: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-[#6366f1]"
                  style={{ height: '4px' }}
                />
              </div>

              {/* Saturation (Saturação Controlada) — grouped under image treatment */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[12px] text-[#9090c0]" style={{ fontWeight: 500 }} htmlFor="bg-saturation">
                    Image saturation
                  </label>
                  <span className="text-[11px] text-[#9090c0] tabular-nums">
                    {Math.round((background.saturation ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  id="bg-saturation"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round((background.saturation ?? 1) * 100)}
                  onChange={(e) =>
                    onChange({
                      ...background,
                      saturation: parseFloat(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-[#6366f1]"
                  style={{ height: '4px' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#9090c0]">Sober</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...background,
                        saturation: 0.7,
                        overlayOpacity: 0.45,
                      })
                    }
                    className="text-[10px] transition-colors"
                    style={{ color: '#6366f1' }}
                  >
                    Apply sober (70%)
                  </button>
                  <span className="text-[10px] text-[#9090c0]">Colorful</span>
                </div>
              </div>

              {/* Focal point reset */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] text-[#9090c0]" style={{ fontWeight: 500 }}>Focal point</span>
                  <span className="text-[11px] text-[#9090c0] tabular-nums">
                    {Math.round(background.focalPoint.x * 100)}%, {Math.round(background.focalPoint.y * 100)}%
                  </span>
                </div>
                <button
                  onClick={() =>
                    onChange({
                      ...background,
                      focalPoint: { x: 0.5, y: 0.5 },
                    })
                  }
                  className="text-[11px] transition-colors"
                  style={{ color: '#6366f1' }}
                >
                  Reset focal point
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Preset Swatch ─────────────────────────────────────────────────────

function PresetSwatch({
  preset,
  isActive,
  onSelect,
}: {
  preset: BackgroundPreset;
  isActive: boolean;
  onSelect: (p: BackgroundPreset) => void;
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      title={preset.name}
      aria-label={`Select background: ${preset.name}`}
      className="rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-[#14141f]"
      style={{
        width: '36px',
        height: '36px',
        background: preset.background,
        border: isActive ? '2px solid #6366f1' : '2px solid transparent',
        boxShadow: isActive ? '0 0 0 1px #6366f180' : 'none',
      }}
    />
  );
}
