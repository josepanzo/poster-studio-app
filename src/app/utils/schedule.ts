// ─── Schedule Row Parser ───────────────────────────────────────────────
// Turns plain-text body lines into structured rows (bold accent "time"
// + detail) the way the visual references lay out a programme:
//
//   10h30  Celebração · Centro Domus
//   Tarde  Almoço + atividades
//
// A line qualifies when it starts with a short token — a time like
// "10h30"/"9:00"/"12h00" or a single word ≤ 10 chars — optionally
// followed by a separator (· — - – :) and then detail text.

export interface ScheduleRow {
  time: string;
  detail: string;
}

const TIME_RE = /^\d{1,2}[h:]\d{2}$/i;
const SEPARATOR_RE = /^\s*[·—–-]\s+/;

/**
 * Parse one line. Returns a ScheduleRow when the line matches the
 * "time + detail" shape, or null when the line should render as
 * ordinary text.
 */
export function parseScheduleLine(line: string): ScheduleRow | null {
  // Prevent ReDoS by capping the line length (a schedule row shouldn't be long)
  if (line.length > 200) return null;

  const trimmed = line.trim();
  if (!trimmed) return null;

  // First token
  const match = /^(\S+)([\s·—–-]+)(.+)$/.exec(trimmed);
  if (!match) return null;
  const [, token, , rest] = match;

  if (TIME_RE.test(token)) {
    return { time: token, detail: rest.trim() };
  }

  // Single short word without digits ("Tarde", "Manhã"). Prose sentences
  // usually end with sentence punctuation; programme entries don't —
  // so exclude lines ending in . ! ? from the word-row heuristic.
  const isShortWord =
    token.length <= 10 && !/\d/.test(token) && !/[.!?…]$/.test(trimmed);
  if (isShortWord && rest.trim()) {
    return { time: token, detail: rest.trim() };
  }

  return null;
}

/** Parse a multi-line body into rows/nulls (null = plain text line). */
export function parseSchedule(body: string): (ScheduleRow | string)[] {
  return body.split('\n').map((line) => parseScheduleLine(line) ?? line);
}

/** True when at least one line parses as a schedule row. */
export function hasScheduleRows(body: string): boolean {
  return body
    .split('\n')
    .some((l) => l.trim() && parseScheduleLine(l) !== null);
}
