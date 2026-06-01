import { decode, detectEncoding, cellKey } from './positions.js';

// Split a comma-separated VALUES list, respecting single-quoted strings
// (with '' escapes) and nested parentheses (e.g. SEQ.NEXTVAL, subqueries).
function splitTopLevel(s) {
  const out = [];
  let cur = '';
  let inq = false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") {
      if (inq && s[i + 1] === "'") { cur += "''"; i++; continue; }
      inq = !inq; cur += ch; continue;
    }
    if (!inq) {
      if (ch === '(') { depth++; cur += ch; continue; }
      if (ch === ')') { depth--; cur += ch; continue; }
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    }
    cur += ch;
  }
  if (cur.trim() !== '') out.push(cur.trim());
  return out;
}

function unquote(tok) {
  if (tok == null) return null;
  const t = tok.trim();
  if (/^null$/i.test(t)) return null;
  if (t.startsWith("'") && t.endsWith("'")) {
    return t.slice(1, -1).replace(/''/g, "'");
  }
  return t; // unquoted expression (SYSDATE, NEXTVAL, subquery) — kept raw
}

// Parse `Insert into TABLE (cols) values (vals);` → { table, map }
function parseInsert(stmt) {
  const m = stmt.match(/insert\s+into\s+([\w$.]+)\s*\(([^)]*)\)\s*values\s*\(([\s\S]*)\)\s*$/i);
  if (!m) return null;
  const table = m[1];
  const cols = m[2].split(',').map((c) => c.trim().toUpperCase());
  const vals = splitTopLevel(m[3]);
  const map = {};
  cols.forEach((c, i) => { map[c] = unquote(vals[i]); });
  return { table, map };
}

function tokens(posStr) {
  return posStr ? posStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
}

// Split a script into statements on ';', ignoring ';' inside quoted strings
// (CSS values contain semicolons), respecting '' escapes.
function splitStatements(text) {
  const out = [];
  let cur = '';
  let inq = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'") {
      if (inq && text[i + 1] === "'") { cur += "''"; i++; continue; }
      inq = !inq; cur += ch; continue;
    }
    if (ch === ';' && !inq) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

export function parseSql(text) {
  const cleaned = text
    .replace(/\r/g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n');
  const statements = splitStatements(cleaned).filter((s) => /insert\s+into/i.test(s));

  let header = null;
  const detailRows = [];

  for (const s of statements) {
    const p = parseInsert(s);
    if (!p) continue;
    const t = p.table.toUpperCase();
    if (t.includes('ORDER_TILE_HDR')) header = p.map;
    else if (t.includes('ORDER_TILE_DTL')) detailRows.push(p.map);
  }

  if (!header && detailRows.length === 0) {
    throw new Error('No ORDER_TILE_HDR / ORDER_TILE_DTL inserts found.');
  }

  // Gather all position tokens to detect the encoding scheme used.
  const allTokens = detailRows.flatMap((d) =>
    tokens(d.POSITION_IDS || `${d.NAME_POS_ID || ''},${d.VALUE_POS_ID || ''}`)
  );
  const encoding = detectEncoding(allTokens);

  let cols = header ? +header.COLUMN_COUNT : 0;
  let rows = header ? +header.ROW_COUNT : 0;

  const decodeTok = (tok) => decode(encoding, tok, cols || 12);

  const regions = detailRows.map((d, idx) => {
    const cells = {};
    tokens(d.VALUE_POS_ID).forEach((tk) => { const [r, c] = decodeTok(tk); if (r) cells[cellKey(r, c)] = 'value'; });
    tokens(d.NAME_POS_ID).forEach((tk) => { const [r, c] = decodeTok(tk); if (r) cells[cellKey(r, c)] = 'name'; });
    // Fall back to POSITION_IDS if no role split was given.
    if (Object.keys(cells).length === 0) {
      tokens(d.POSITION_IDS).forEach((tk) => { const [r, c] = decodeTok(tk); if (r) cells[cellKey(r, c)] = 'value'; });
    }
    return {
      id: idx + 1,
      name: d.ATTR_NAME || '',
      value: d.ATTR_VALUE || '',
      valueType: d.ATTR_VALUE_TYPE || '',
      math: d.ATTR_MATH || '',
      source: d.SOURCE || 'ITEM_FILE',
      nameCss: d.NAME_CSS || '',
      valueCss: d.VALUE_CSS || '',
      cells,
    };
  });

  // Infer grid size if no header.
  if (!rows || !cols) {
    let mr = 0; let mc = 0;
    regions.forEach((rg) => Object.keys(rg.cells).forEach((k) => {
      const [r, c] = k.split('-').map(Number); mr = Math.max(mr, r); mc = Math.max(mc, c);
    }));
    rows = rows || mr; cols = cols || mc;
  }

  return {
    rows,
    cols,
    encoding,
    activeId: null,
    nextId: regions.length + 1,
    header: {
      formatName: header?.FORMAT_NAME || 'IMPORTED_FORMAT',
      chain: header?.CHAIN_ID || '',
      appVer: header?.APP_VER_START || '',
      tileHeight: header?.TILE_HEIGHT || '180',
      deviceConfig: header?.DEVICE_CONFIG_NAME || 'orderTileConfigsTile1',
      schema: 'ISR_DAT',
      hdrTable: 'ISR_APP_CFG_ORDER_TILE_HDR',
      dtlTable: 'ISR_APP_CFG_ORDER_TILE_DTL',
      hdrSeq: 'ISR_APP_CFG_ORDER_TILE_HDR_SEQ',
      dtlSeq: 'ISR_APP_CFG_ORDER_TILE_DTL_SEQ',
      createdBy: header?.CREATED_BY || 'ISR_DAT',
    },
    regions,
  };
}
