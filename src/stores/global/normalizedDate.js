// src/utils/normalizedDate.js

/**
 * Safely turn many date-like inputs into a YYYY-MM-DD string for <input type="date">.
 * Returns '' when invalid/empty.
 *
 * Accepts:
 *   - 'YYYY-MM-DD' (passes through)
 *   - ISO strings ('2025-09-29T13:45:00Z', '2025-09-29T13:45:00+07:00')
 *   - Locale-ish strings ('Sep 29, 2025', '29/09/2025', etc.)*
 *   - Date objects
 *   - Unix ms timestamps (number or numeric string)
 *
 * *Locale parsing reliability depends on the browser; prefer ISO where possible.
 */
export function normalizeDateToYMD(input) {
  if (input == null || input === '') return '';

  // already 'YYYY-MM-DD'
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  // numeric: treat as milliseconds
  if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input))) {
    const d = new Date(Number(input));
    return isValidDate(d) ? toYMD(d) : '';
  }

  // Date instance
  if (input instanceof Date) {
    return isValidDate(input) ? toYMD(input) : '';
  }

  // string: try new Date(string)
  if (typeof input === 'string') {
    const d = new Date(input);
    return isValidDate(d) ? toYMD(d) : '';
  }

  return '';
}

/** Convert Date -> 'YYYY-MM-DD' (no timezone shift). */
export function toYMD(d) {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}`;
}

/** Quick validity check for Date objects. */
export function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/** Pad number to 2 digits. */
export function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * From a 'YYYY-MM-DD' string -> Date at local midnight.
 * Returns null if invalid.
 */
export function fromYMD(ymd) {
  if (typeof ymd !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return isValidDate(dt) ? dt : null;
}

/**
 * Normalize unknown input to Date (or null).
 * Useful if you need a Date object downstream.
 */
export function coerceDate(input) {
  if (input == null || input === '') return null;
  if (input instanceof Date) return isValidDate(input) ? input : null;
  if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input))) {
    const d = new Date(Number(input));
    return isValidDate(d) ? d : null;
  }
  const d = new Date(input);
  return isValidDate(d) ? d : null;
}

/**
 * Normalize to ISO string without time (YYYY-MM-DD) or with time (full ISO).
 * If onlyDate=true, returns same as normalizeDateToYMD.
 */
export function normalizeISO(input, { onlyDate = false } = {}) {
  const d = coerceDate(input);
  if (!d) return '';
  return onlyDate ? toYMD(d) : d.toISOString();
}

export default {
  normalizeDateToYMD,
  toYMD,
  fromYMD,
  coerceDate,
  isValidDate,
  normalizeISO,
  pad2,
};