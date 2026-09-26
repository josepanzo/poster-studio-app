import { describe, it, expect } from 'vitest';
import { parseScheduleLine, parseSchedule, hasScheduleRows } from './schedule';

describe('parseScheduleLine', () => {
  it('parses hh:mm style times', () => {
    expect(parseScheduleLine('10h30 Celebração · Centro Domus')).toEqual({
      time: '10h30',
      detail: 'Celebração · Centro Domus',
    });
  });

  it('parses colon times', () => {
    expect(parseScheduleLine('9:00 Gathering')).toEqual({
      time: '9:00',
      detail: 'Gathering',
    });
  });

  it('parses single-word schedule markers like "Tarde"', () => {
    expect(parseScheduleLine('Tarde Almoço + atividades')).toEqual({
      time: 'Tarde',
      detail: 'Almoço + atividades',
    });
  });

  it('accepts separator dashes and middots', () => {
    expect(parseScheduleLine('12h00 — Saída para a Palavra')).toEqual({
      time: '12h00',
      detail: 'Saída para a Palavra',
    });
    expect(parseScheduleLine('12h00 · Saída')).toEqual({
      time: '12h00',
      detail: 'Saída',
    });
  });

  it('does not treat long first words as schedule rows', () => {
    expect(parseScheduleLine('Celebration of the new community centre')).toBeNull();
  });

  it('does not treat words with digits as word-rows (but times still match)', () => {
    expect(parseScheduleLine('2x Sunday service')).toBeNull();
    expect(parseScheduleLine('10h30 service')).not.toBeNull();
  });

  it('returns null for plain sentences', () => {
    expect(parseScheduleLine('Vamos juntos celebrar este testemunho.')).toBeNull();
  });

  it('returns null for empty lines', () => {
    expect(parseScheduleLine('')).toBeNull();
    expect(parseScheduleLine('   ')).toBeNull();
  });
});

describe('parseSchedule', () => {
  it('splits a full programme into rows and plain lines', () => {
    const result = parseSchedule(
      '10h30 Celebração\nReflexão da Palavra.\nTarde Almoço + atividades'
    );
    expect(result).toEqual([
      { time: '10h30', detail: 'Celebração' },
      'Reflexão da Palavra.',
      { time: 'Tarde', detail: 'Almoço + atividades' },
    ]);
  });
});

describe('hasScheduleRows', () => {
  it('detects rows', () => {
    expect(hasScheduleRows('10h30 Serviço')).toBe(true);
  });

  it('returns false for prose', () => {
    expect(hasScheduleRows('Apenas um parágrafo normal.')).toBe(false);
  });
});
