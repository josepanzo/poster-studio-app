import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  slugify,
  DEFAULT_STATE,
  STORAGE_KEY,
} from './poster-state';

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when storage is empty', () => {
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it('returns defaults when stored JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it('returns defaults when stored value is not an object', () => {
    localStorage.setItem(STORAGE_KEY, '"just a string"');
    const state = loadState();
    expect(state.title).toBe(DEFAULT_STATE.title);
    expect(state.formats).toEqual(DEFAULT_STATE.formats);
  });

  it('restores a valid saved state', () => {
    const saved = { ...DEFAULT_STATE, title: 'Custom Title', variant: 'quote' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const state = loadState();
    expect(state.title).toBe('Custom Title');
    expect(state.variant).toBe('quote');
  });

  it('rejects invalid variant and falls back to default', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, variant: 'not-a-variant' })
    );
    expect(loadState().variant).toBe(DEFAULT_STATE.variant);
  });

  it('rejects invalid alignment and falls back to default', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, alignment: 42 })
    );
    expect(loadState().alignment).toBe(DEFAULT_STATE.alignment);
  });

  it('filters invalid format ids and keeps valid ones', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, formats: ['square', 'bogus', 7] })
    );
    expect(loadState().formats).toEqual(['square']);
  });

  it('falls back to default formats when none are valid', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, formats: [] })
    );
    expect(loadState().formats).toEqual(DEFAULT_STATE.formats);
  });

  it('falls back to defaults when formats is not an array', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, formats: 'square' })
    );
    expect(loadState().formats).toEqual(DEFAULT_STATE.formats);
  });

  it('coerces non-string title fields back to defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, title: 123, body: null })
    );
    const state = loadState();
    expect(state.title).toBe(DEFAULT_STATE.title);
    expect(state.body).toBe(DEFAULT_STATE.body);
  });

  it('clamps sectionSpacing into the guardrail 0.6–1.6 range', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, sectionSpacing: 99 })
    );
    expect(loadState().sectionSpacing).toBe(1.6);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, sectionSpacing: -5 })
    );
    expect(loadState().sectionSpacing).toBe(0.6);
  });

  it('migrates legacy overlayOpacity into a bottom scrim', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_STATE,
        background: {
          ...DEFAULT_STATE.background,
          overlayOpacity: 0.4,
          scrim: undefined,
        },
      })
    );
    const bg = loadState().background;
    expect(bg.scrim.style).toBe('bottom');
    expect(bg.scrim.strength).toBeGreaterThan(0.4);
    expect(bg.scrim.strength).toBeLessThanOrEqual(0.9);
  });

  it('rejects invalid font pairing and falls back to the default', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, fontPairing: 'comic-sans-9000' })
    );
    expect(loadState().fontPairing).toBe(DEFAULT_STATE.fontPairing);
  });

  it('rejects malformed accent colours and falls back to the default', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_STATE, accentColor: 'javascript(true)' })
    );
    expect(loadState().accentColor).toBe(DEFAULT_STATE.accentColor);
  });

  it('backfills kicker and schedule fields for states saved before they existed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ title: 'Old state' })
    );
    const state = loadState();
    expect(state.kickerEnabled).toBe(DEFAULT_STATE.kickerEnabled);
    expect(state.scheduleRowsEnabled).toBe(DEFAULT_STATE.scheduleRowsEnabled);
    expect(state.accentColor).toBe(DEFAULT_STATE.accentColor);
    expect(state.fontPairing).toBe(DEFAULT_STATE.fontPairing);
  });

  it('backfills saturation for states saved before the field existed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_STATE,
        background: { ...DEFAULT_STATE.background, saturation: undefined },
      })
    );
    expect(loadState().background.saturation).toBe(
      DEFAULT_STATE.background.saturation
    );
  });

  it('falls back to the default preset when an upload has no image data', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_STATE,
        background: {
          ...DEFAULT_STATE.background,
          type: 'upload',
          uploadedImage: null,
        },
      })
    );
    const bg = loadState().background;
    expect(bg.type).toBe('preset');
    expect(bg.presetId).toBe(DEFAULT_STATE.background.presetId);
  });
});

describe('saveState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists state and reports success', () => {
    const ok = saveState({ ...DEFAULT_STATE, title: 'Persisted' });
    expect(ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).title).toBe('Persisted');
  });

  it('never persists the uploaded image data URL', () => {
    const state = {
      ...DEFAULT_STATE,
      background: {
        ...DEFAULT_STATE.background,
        type: 'upload' as const,
        uploadedImage: 'data:image/png;base64,AAAA',
      },
    };
    saveState(state);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.background.uploadedImage).toBeNull();
  });
});

describe('slugify', () => {
  it('slugs ordinary titles', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify('Café — “Quotes” & Symbols!')).toBe('caf-quotes-symbols');
  });

  it('collapses repeated separators', () => {
    expect(slugify('a   b///c')).toBe('a-b-c');
  });

  it('falls back to "poster" for empty results', () => {
    expect(slugify('')).toBe('poster');
    expect(slugify('***')).toBe('poster');
  });

  it('caps length at 40 characters', () => {
    expect(slugify('x'.repeat(100)).length).toBeLessThanOrEqual(40);
  });
});
