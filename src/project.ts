/**
 * When this build started.
 *
 * The index prints how many days old the project is today; a journal entry
 * prints how far into the build that entry landed. Same origin, two readings —
 * so it is declared once here rather than in whichever page needed it first.
 * A second copy is a counter that goes stale on one page and not the other.
 */
export const FIRST_COMMIT = Date.UTC(2026, 7, 4); // 4 August 2026

/** Day 1 is the first day, not the zeroth. Defaults to today. */
export const dayOf = (date: string | number = Date.now()) =>
  Math.floor((new Date(date).getTime() - FIRST_COMMIT) / 86_400_000) + 1;
