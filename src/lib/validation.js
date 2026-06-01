import { parseKey } from './positions.js';

export function validate(data) {
  const { rows, cols, regions } = data;
  const total = rows * cols;
  const owner = {}; // cellKey -> [regionIndex,...]
  regions.forEach((rg, i) => {
    Object.keys(rg.cells).forEach((k) => {
      (owner[k] = owner[k] || []).push(i);
    });
  });

  const covered = Object.keys(owner).length;
  const overlaps = Object.entries(owner)
    .filter(([, list]) => list.length > 1)
    .map(([k]) => k);

  const gaps = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (!owner[`${r}-${c}`]) gaps.push(`${r}-${c}`);
    }
  }

  const issues = [];
  regions.forEach((rg) => {
    const tag = rg.value || rg.name || 'region';
    if (!rg.value && !rg.name) issues.push({ level: 'warn', msg: `Region with no label or value key` });
    if (rg.valueType === 'CALCULATED' && !rg.math) {
      issues.push({ level: 'error', msg: `${tag}: CALCULATED but ATTR_MATH is empty` });
    }
    if (rg.name && !rg.value && Object.values(rg.cells).every((v) => v === 'name')) {
      issues.push({ level: 'warn', msg: `${tag}: label-only region (no value cells)` });
    }
  });

  return {
    total,
    covered,
    gaps,
    overlaps,
    issues,
    ok: gaps.length === 0 && overlaps.length === 0 && !issues.some((i) => i.level === 'error'),
  };
}

export function bounds(cells) {
  let r1 = Infinity, c1 = Infinity, r2 = -Infinity, c2 = -Infinity;
  Object.keys(cells).forEach((k) => {
    const [r, c] = parseKey(k);
    r1 = Math.min(r1, r); c1 = Math.min(c1, c);
    r2 = Math.max(r2, r); c2 = Math.max(c2, c);
  });
  return { r1, c1, r2, c2 };
}
