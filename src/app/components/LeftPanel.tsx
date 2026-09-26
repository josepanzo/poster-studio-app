import React from 'react';
import type { PosterState, VariantId, Alignment, FormatId } from '../state/poster-state';
import { TEMPLATE_LIST, FONT_PAIRING_LIST } from '../templates/index';
import { STYLE_PRESETS } from '../styles/presets';
import { BackgroundPicker } from './BackgroundPicker';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Smartphone,
  Monitor,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Check,
  PanelLeftClose,
  Wand2,
  Palette,
} from 'lucide-react';

/** Curated accent swatches shown in the accent picker. */
const ACCENT_SWATCHES = [
  '#D9B98A', // warm gold (reference look)
  '#E3C08D',
  '#C98A6B', // terracotta
  '#E8D5B5', // cream
  '#9CC3D5', // mist blue
  '#A8C5A0', // sage
  '#C9A0C5', // muted lilac
  '#FFFFFF', // white
];

interface LeftPanelProps {
  state: PosterState;
  onChange: (state: PosterState) => void;
  onExport: () => void;
  isExporting: boolean;
  isSaved: boolean;
  onCollapse?: () => void;
}

/** Export-format toggle options shown in the LeftPanel. */
const FORMAT_OPTIONS: { id: FormatId; label: string; Icon: React.ElementType }[] = [
  { id: 'square', label: 'Square', Icon: Square },
  { id: 'story', label: 'Story', Icon: Smartphone },
  { id: 'landscape', label: 'Landscape', Icon: Monitor },
];

export function LeftPanel({ state, onChange, onExport, isExporting, isSaved, onCollapse }: LeftPanelProps) {
  const update = <K extends keyof PosterState>(key: K, value: PosterState[K]) => {
    onChange({ ...state, [key]: value });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#14141f' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, lineHeight: 1.2 }}>
            Poster Studio
          </h1>
          <span className="text-[11px] text-[#9090c0]" style={{ fontWeight: 400 }}>Template-driven poster generator</span>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Collapse editor panel"
            title="Collapse editor panel"
            className="p-1 rounded transition-colors hover:bg-[#1a1a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
          >
            <PanelLeftClose size={16} style={{ color: '#9090c0' }} />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5 poster-studio-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a44 transparent' }}>
        {/* ─── Title ─────────────────────────────────────────── */}
        <div>
          <label className="block mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="poster-title">
            Title <span className="text-[#6366f1]">*</span>
          </label>
          <textarea
            id="poster-title"
            value={state.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Enter your headline..."
            rows={3}
            className="w-full rounded-lg border-none px-3 py-2.5 text-[14px] text-white placeholder-[#404058] resize-none focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
          />
        </div>

        {/* ─── Kicker (toggle) ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="kicker-toggle">Kicker / eyebrow</label>
            <ToggleSwitch
              id="kicker-toggle"
              label="Kicker toggle"
              checked={state.kickerEnabled}
              onChange={(v) => update('kickerEnabled', v)}
            />
          </div>
          {state.kickerEnabled && (
            <input
              id="poster-kicker"
              value={state.kicker}
              onChange={(e) => update('kicker', e.target.value)}
              placeholder="3 de Maio · Jardim do Túmulo"
              className="w-full rounded-lg border-none px-3 py-2.5 text-[14px] text-white placeholder-[#404058] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
            />
          )}
        </div>

        {/* ─── Subtitle (toggle) ────────────────────────────���─ */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="subtitle-toggle">Subtitle</label>
            <ToggleSwitch
              id="subtitle-toggle"
              label="Subtitle toggle"
              checked={state.subtitleEnabled}
              onChange={(v) => update('subtitleEnabled', v)}
            />
          </div>
          {state.subtitleEnabled && (
            <input
              id="poster-subtitle"
              value={state.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder="A punchy subtitle..."
              className="w-full rounded-lg border-none px-3 py-2.5 text-[14px] text-white placeholder-[#404058] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
            />
          )}
        </div>

        {/* ─── Body (toggle) ─────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="body-toggle">Body text</label>
            <ToggleSwitch
              id="body-toggle"
              label="Body text toggle"
              checked={state.bodyEnabled}
              onChange={(v) => update('bodyEnabled', v)}
            />
          </div>
          {state.bodyEnabled && (
            <textarea
              id="poster-body"
              value={state.body}
              onChange={(e) => update('body', e.target.value)}
              placeholder={"Supporting text…\n\nTip: lines like “10h30 Cebracao” render as schedule rows."}
              rows={3}
              className="w-full rounded-lg border-none px-3 py-2.5 text-[14px] text-white placeholder-[#404058] resize-none focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
            />
          )}
        </div>

        {/* ─── Schedule rows (only when body enabled) ─────────── */}
        {state.bodyEnabled && (
          <div className="flex items-center justify-between">
            <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="schedule-rows-toggle">
              Format schedule lines
            </label>
            <ToggleSwitch
              id="schedule-rows-toggle"
              label="Format schedule lines toggle"
              checked={state.scheduleRowsEnabled}
              onChange={(v) => update('scheduleRowsEnabled', v)}
            />
          </div>
        )}

        {/* ─── Footer (toggle) ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="footer-toggle">Footer / meta</label>
            <ToggleSwitch
              id="footer-toggle"
              label="Footer / meta toggle"
              checked={state.footerEnabled}
              onChange={(v) => update('footerEnabled', v)}
            />
          </div>
          {state.footerEnabled && (
            <input
              id="poster-footer"
              value={state.footer}
              onChange={(e) => update('footer', e.target.value)}
              placeholder="@handle  |  website.com"
              className="w-full rounded-lg border-none px-3 py-2.5 text-[14px] text-white placeholder-[#404058] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
            />
          )}
        </div>

        {/* ─── Divider ──────────────────────────────────────── */}
        <div className="h-px" style={{ background: '#1e1e30' }} />

        {/* ─── Style Presets ───────────────────────────────── */}
        <div>
          <label className="flex items-center gap-1.5 mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>
            <Wand2 size={13} className="text-[#9090c0]" />
            Style preset
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {STYLE_PRESETS.map((preset) => {
              const active =
                state.fontPairing === preset.fontPairing &&
                state.accentColor?.toLowerCase() === preset.accentColor.toLowerCase() &&
                state.sectionSpacing === preset.sectionSpacing;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    onChange({
                      ...state,
                      fontPairing: preset.fontPairing,
                      accentColor: preset.accentColor,
                      background: {
                        ...state.background,
                        scrim: { ...preset.scrim },
                      },
                      sectionSpacing: preset.sectionSpacing,
                    })
                  }
                  title={preset.description}
                  aria-pressed={active}
                  className="flex flex-col items-start rounded-lg px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
                  style={{
                    background: active ? '#1e1e40' : '#1e1e30',
                    border: active ? '1px solid #6366f1' : '1px solid transparent',
                    color: '#ffffff',
                    textAlign: 'left',
                  }}
                >
                  <span className="text-[11px]" style={{ fontWeight: 600 }}>{preset.name}</span>
                  <span className="flex items-center gap-1 mt-1">
                    <span
                      aria-hidden
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: preset.accentColor,
                        display: 'inline-block',
                      }}
                    />
                    <span className="text-[9px] text-[#9090c0]" style={{ fontWeight: 400 }}>
                      {preset.name === 'Modern Minimal' ? 'sans' : 'serif+sans'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Font Pairing ────────────────────────────────── */}
        <div>
          <label className="block mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="font-pairing">Font pairing</label>
          <div className="relative">
            <select
              id="font-pairing"
              value={state.fontPairing}
              onChange={(e) => update('fontPairing', e.target.value)}
              className="w-full appearance-none rounded-lg border-none px-3 py-2.5 text-[14px] text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              {FONT_PAIRING_LIST.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9090c0] pointer-events-none" />
          </div>
        </div>

        {/* ─── Accent Colour ───────────────────────────────── */}
        <div>
          <label className="flex items-center gap-1.5 mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>
            <Palette size={13} className="text-[#9090c0]" />
            Accent colour
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {ACCENT_SWATCHES.map((hex) => {
              const active = state.accentColor?.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  onClick={() => update('accentColor', hex)}
                  title={hex}
                  aria-label={`Accent colour ${hex}`}
                  aria-pressed={active}
                  className="rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141f]"
                  style={{
                    width: '22px',
                    height: '22px',
                    background: hex,
                    border: active ? '2px solid #6366f1' : '1px solid #2a2a44',
                    boxShadow: active ? '0 0 0 1px #6366f180' : 'none',
                  }}
                />
              );
            })}
            <label
              className="relative rounded-full cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-[#6366f1]"
              style={{
                width: '22px',
                height: '22px',
                background: 'conic-gradient(#f66, #ff6, #6f6, #6ff, #66f, #f6f, #f66)',
                border: '1px solid #2a2a44',
              }}
              title="Custom accent colour"
            >
              <input
                type="color"
                value={state.accentColor || '#D9B98A'}
                onChange={(e) => update('accentColor', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Custom accent colour"
              />
            </label>
          </div>
          <p className="mt-1 text-[10px] text-[#9090c0]" style={{ fontWeight: 400 }}>
            Falls back to white automatically if contrast is too low.
          </p>
        </div>

        {/* ─── Divider ──────────────────────────────────────── */}
        <div className="h-px" style={{ background: '#1e1e30' }} />

        {/* ─── Layout Variant ──────────────────────────────── */}
        <div>
          <label className="block mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>Layout variant</label>
          <div className="relative">
            <select
              value={state.variant}
              onChange={(e) => update('variant', e.target.value as VariantId)}
              className="w-full appearance-none rounded-lg border-none px-3 py-2.5 text-[14px] text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              style={{ background: '#1e1e30', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9090c0] pointer-events-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-[#9090c0]" style={{ fontWeight: 400 }}>
            {TEMPLATE_LIST.find((t) => t.id === state.variant)?.description}
          </p>
        </div>

        {/* ─── Alignment ───────────────────────────────────── */}
        <div>
          <label className="block mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>Alignment</label>
          <div className="flex gap-1 rounded-lg bg-[#1e1e30] p-1">
            {([
              { id: 'left' as Alignment, icon: AlignLeft },
              { id: 'center' as Alignment, icon: AlignCenter },
              { id: 'right' as Alignment, icon: AlignRight },
            ]).map(({ id, icon: Icon }) => (
               <button
                 key={id}
                 aria-pressed={state.alignment === id}
                 aria-label={`Align ${id}`}
                 onClick={() => update('alignment', id)}
                 className="flex-1 flex items-center justify-center rounded-md py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#6366f1]"
                 style={{
                   background: state.alignment === id ? '#2a2a44' : 'transparent',
                   color: state.alignment === id ? '#ffffff' : '#9090c0',
                 }}
               >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Section Spacing ─────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[13px] text-[#a0a0b8] flex items-center gap-1.5" style={{ fontWeight: 500 }}>
              <ArrowUpDown size={13} className="text-[#9090c0]" />
              Section spacing
            </label>
            <span className="text-[11px] text-[#9090c0] tabular-nums" style={{ fontWeight: 500 }}>
              {state.sectionSpacing === 1 ? 'Default' : `${Math.round(state.sectionSpacing * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.05}
            value={state.sectionSpacing}
            onChange={(e) => update('sectionSpacing', parseFloat(e.target.value))}
            className="w-full accent-[#6366f1]"
            style={{ height: '4px' }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#9090c0]">Tight</span>
            <button
              onClick={() => update('sectionSpacing', 1.0)}
              className="text-[10px] transition-colors"
              style={{ color: state.sectionSpacing === 1 ? '#9090c0' : '#6366f1' }}
            >
              Reset
            </button>
            <span className="text-[10px] text-[#9090c0]">Loose</span>
          </div>
        </div>

        {/* ─── Format Selection ────────────────────────────── */}
        <div>
          <label className="block mb-1.5 text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }}>Export format</label>
          <div className="flex gap-1.5">
            {FORMAT_OPTIONS.map(({ id, label, Icon }) => {
              const isSelected = state.formats.includes(id);
              return (
                <button
                  key={id}
                  role="switch"
                  aria-checked={isSelected}
                  onClick={() => {
                    const newFormats = isSelected
                      ? state.formats.filter((f) => f !== id)
                      : [...state.formats, id];
                    if (newFormats.length > 0) update('formats', newFormats);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141f]"
                  style={{
                    background: isSelected ? '#1e1e40' : '#1e1e30',
                    border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                    color: isSelected ? '#ffffff' : '#9090c0',
                  }}
                >
                  <Icon size={14} />
                  <span className="text-[12px]" style={{ fontWeight: 500 }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Divider ──────────────────────────────────────── */}
        <div className="h-px" style={{ background: '#1e1e30' }} />

        {/* ─── Background ──────────────────────────────────── */}
        <BackgroundPicker
          background={state.background}
          onChange={(bg) => update('background', bg)}
        />

        {/* ─── Grain Toggle ────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-[#a0a0b8]" style={{ fontWeight: 500 }} htmlFor="grain-toggle">Subtle grain overlay</label>
          <ToggleSwitch
            id="grain-toggle"
            label="Subtle grain overlay toggle"
            checked={state.grainEnabled}
            onChange={(v) => update('grainEnabled', v)}
          />
        </div>
      </div>

      {/* Auto-save indicator + Export Button */}
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#9090c0]" style={{ fontWeight: 500 }} role="status" aria-live="polite">
            {isSaved ? (
              <span className="flex items-center gap-1" style={{ color: '#6366f1' }}>
                <Check size={10} />
                Saved
              </span>
            ) : (
              'Saving...'
            )}
          </span>
          <span className="text-[10px] text-[#9090c0]" style={{ fontWeight: 500 }}>
            {state.formats.length} format{state.formats.length > 1 ? 's' : ''} selected
          </span>
        </div>
        {state.title?.trim() && state.formats.length > 0 ? null : (
          <p className="mb-2 text-[11px]" style={{ color: '#9090c0' }}>
            {!state.title?.trim()
              ? 'Enter a title to enable export.'
              : 'Select at least one export format.'}
          </p>
        )}
        <button
          onClick={onExport}
          disabled={isExporting || !state.title?.trim() || state.formats.length === 0}
          aria-label={`Export ${state.formats.length} PNG${state.formats.length > 1 ? 's' : ''}`}
          className="w-full rounded-xl py-3 text-[14px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            background: isExporting
              ? '#3a3a5a'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            letterSpacing: '0.5px',
          }}
        >
          {isExporting
            ? 'Exporting...'
            : `Export ${state.formats.length} PNG${state.formats.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  id,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  label?: string;
}) {
  return (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      className="relative rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141f]"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      style={{
        width: '36px',
        height: '20px',
        background: checked ? '#6366f1' : '#2a2a44',
      }}
    >
      <div
        className="absolute top-[2px] rounded-full transition-all"
        style={{
          width: '16px',
          height: '16px',
          background: '#ffffff',
          left: checked ? '18px' : '2px',
        }}
      />
    </button>
  );
}