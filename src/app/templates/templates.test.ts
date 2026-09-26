import { describe, it, expect } from 'vitest';
import { TEMPLATES, TEMPLATE_LIST } from './index';
import { FONT_PAIRINGS } from './fonts';
import { FORMAT_MAP } from '../state/poster-state';

const FORMAT_IDS = Object.keys(FORMAT_MAP) as (keyof typeof FORMAT_MAP)[];
const ZONE_ROLES = ['kicker', 'headline', 'subtitle', 'body', 'footer'] as const;

describe('template registry', () => {
  it('contains exactly the four documented variants', () => {
    expect(Object.keys(TEMPLATES).sort()).toEqual(
      ['announcement', 'hero', 'image-led', 'quote'].sort()
    );
  });

  it('TEMPLATE_LIST mirrors TEMPLATES values', () => {
    expect(TEMPLATE_LIST).toEqual(Object.values(TEMPLATES));
  });

  it('every template has a unique id matching its registry key', () => {
    for (const [key, template] of Object.entries(TEMPLATES)) {
      expect(template.id).toBe(key);
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
    }
  });
});

describe('template completeness', () => {
  it('defines safe areas and layouts for every export format', () => {
    for (const template of TEMPLATE_LIST) {
      for (const format of FORMAT_IDS) {
        const safeArea = template.safeArea[format];
        expect(safeArea, `${template.id}/${format} safeArea`).toBeDefined();
        for (const side of ['top', 'right', 'bottom', 'left'] as const) {
          expect(safeArea[side]).toBeGreaterThanOrEqual(0);
        }
        expect(template.layout[format], `${template.id}/${format} layout`).toBeDefined();
        expect(template.layout[format].gap).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('defines all five zones with valid typography for every format', () => {
    for (const template of TEMPLATE_LIST) {
      for (const role of ZONE_ROLES) {
        const zone = template.zones[role];
        expect(zone, `${template.id}/${role}`).toBeDefined();
        expect(zone.role).toBe(role);
        expect(zone.typography.fontSize).toBeDefined();
        for (const format of FORMAT_IDS) {
          const size = zone.typography.fontSize[format];
          expect(size, `${template.id}/${role}/${format} fontSize`).toBeGreaterThan(0);
        }
        expect(zone.typography.fontWeight).toBeGreaterThanOrEqual(100);
        expect(zone.typography.fontWeight).toBeLessThanOrEqual(900);
        expect(zone.typography.lineHeight).toBeGreaterThan(0);
        expect(zone.opacity).toBeGreaterThanOrEqual(0);
        expect(zone.opacity).toBeLessThanOrEqual(1);
        expect(zone.maxLines).toBeGreaterThanOrEqual(0);
        expect(['headline', 'body']).toContain(zone.typography.fontFamily);
      }
    }
  });

  it('uses only known font families', () => {
    for (const template of TEMPLATE_LIST) {
      for (const role of ZONE_ROLES) {
        expect(['headline', 'body']).toContain(template.zones[role].typography.fontFamily);
      }
    }
  });

  it('kicker zones use uppercase, letterspaced small type', () => {
    for (const template of TEMPLATE_LIST) {
      const kicker = template.zones.kicker;
      expect(kicker.typography.textTransform).toBe('uppercase');
      expect(kicker.typography.letterSpacing).toBeGreaterThanOrEqual(2);
      for (const format of FORMAT_IDS) {
        expect(kicker.typography.fontSize[format]).toBeLessThan(
          template.zones.headline.typography.fontSize[format] / 2
        );
      }
    }
  });

  it('every font pairing id resolves', () => {
    for (const pairing of Object.values(FONT_PAIRINGS)) {
      expect(pairing.headline.length).toBeGreaterThan(0);
      expect(pairing.body.length).toBeGreaterThan(0);
    }
  });

  it('has valid accent line config when enabled', () => {
    for (const template of TEMPLATE_LIST) {
      const accent = template.accentLine;
      if (accent?.enabled) {
        expect(accent.thickness).toBeGreaterThan(0);
        expect(accent.widthPercent).toBeGreaterThan(0);
        expect(accent.widthPercent).toBeLessThanOrEqual(100);
        expect(accent.opacity).toBeGreaterThanOrEqual(0);
        expect(accent.opacity).toBeLessThanOrEqual(1);
        expect(['above-headline', 'below-headline', 'above-footer']).toContain(
          accent.position
        );
      }
    }
  });
});
