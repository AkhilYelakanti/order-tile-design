// Position encoding strategies. The encoding is the contract between this
// config data and the Android renderer's parse logic — keep them in sync.

export const ENCODINGS = [
  { id: 'rdashc', label: '{row}-{col}', hint: "split('-') → [row,col]" },
  { id: 'r100c', label: 'row*100 + col', hint: 'row = n/100, col = n%100' },
  { id: 'r10c', label: 'row*10 + col (≤9)', hint: 'legacy 9×9 scheme' },
  { id: 'seq', label: 'sequential 1..N', hint: 'row-major running index' },
  { id: 'pad', label: 'zero-pad RRCC', hint: '"0101" .. "1112"' },
];

export function encode(enc, r, c, cols) {
  switch (enc) {
    case 'rdashc': return `${r}-${c}`;
    case 'r10c': return String(r * 10 + c);
    case 'seq': return String((r - 1) * cols + c);
    case 'pad': return String(r).padStart(2, '0') + String(c).padStart(2, '0');
    default: return String(r * 100 + c); // r100c
  }
}

export function decode(enc, token, cols) {
  const t = String(token).trim();
  switch (enc) {
    case 'rdashc': {
      const [r, c] = t.split('-').map(Number);
      return [r, c];
    }
    case 'r10c': { const n = +t; return [Math.floor(n / 10), n % 10]; }
    case 'seq': { const n = +t; return [Math.floor((n - 1) / cols) + 1, ((n - 1) % cols) + 1]; }
    case 'pad': return [parseInt(t.slice(0, 2), 10), parseInt(t.slice(2), 10)];
    default: { const n = +t; return [Math.floor(n / 100), n % 100]; } // r100c
  }
}

// Internal cell identity (independent of output encoding).
export const cellKey = (r, c) => `${r}-${c}`;
export const parseKey = (k) => k.split('-').map(Number);

// Column-major ordering (all rows of a column, then next column) — matches
// the IMAGE / QTY_ENTRY block ordering in the reference scripts.
export function orderColMajor(keys) {
  return [...keys]
    .map(parseKey)
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

export function encodeKeys(enc, keys, cols) {
  return orderColMajor(keys).map(([r, c]) => encode(enc, r, c, cols)).join(',');
}

// Best-effort detection when importing an unknown script.
export function detectEncoding(tokens) {
  const flat = tokens.filter(Boolean).map(String);
  if (flat.some((t) => t.includes('-'))) return 'rdashc';
  const nums = flat.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length && nums.every((n) => n >= 11 && n <= 99 && n % 10 !== 0)) return 'r10c';
  if (nums.some((n) => n >= 100)) return 'r100c';
  return 'r100c';
}
