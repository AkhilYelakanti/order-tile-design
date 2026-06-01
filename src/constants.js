import { cellKey } from './lib/positions.js';

export const CSS_LABEL = 'color:#212f3c;font-size: 12px;font-family: Arial';
export const CSS_VALUE = 'color:#212f3c;font-size: 14px;font-family: Arial;';
export const CSS_VALUE_BOLD = 'color:#212f3c;font-size: 14px;font-family: Arial;font-weight: bold;';
export const CSS_GREEN = 'color:#009933;font-size: 14px;font-family: Arial;';

export const VALUE_TYPES = ['', 'HTML', 'IMAGE', 'TEXT', 'CALCULATED'];
export const SOURCES = ['ITEM_FILE', 'SCOPS', 'CSORUITEXTFILE'];

// Known field keys seen in CSOR image-tile configs — used for autocomplete.
export const FIELD_CATALOG = [
  'ITEM_DESCRIPTION', 'INV_LVL', 'ITEM_CODE', 'PACK_SIZE', 'ORIGINAL_PRICE',
  'DEAL_VALUE', 'DEAL_PRICE', 'DLVD_COST', 'DEAL_EFFECTIVE', 'UNIT_COST',
  'QTY_ENTRY', 'IMAGE', 'BASE_RETAIL', 'GROSS_MARGIN', 'ITEM_UPC',
  'STORE_CATEGORY_LIST', 'ITEM_LIFE_1', 'WAREHOUSE_NAME', 'LOQ',
  'INFO1', 'INFO2', 'INFO3',
];

export function defaultHeader(formatName = 'CH65_IMAGE_TILE_FORMAT_V2.0', chain = '65') {
  return {
    formatName,
    chain,
    appVer: '4.0.27',
    tileHeight: '220',
    deviceConfig: 'orderTileConfigsTile1',
    schema: 'ISR_DAT',
    hdrTable: 'ISR_APP_CFG_ORDER_TILE_HDR',
    dtlTable: 'ISR_APP_CFG_ORDER_TILE_DTL',
    hdrSeq: 'ISR_APP_CFG_ORDER_TILE_HDR_SEQ',
    dtlSeq: 'ISR_APP_CFG_ORDER_TILE_DTL_SEQ',
    createdBy: 'ISR_DAT',
  };
}

// [name, value, vtype, math, labelRect|null, valueRect, nameCss, valueCss]
const PRESET = [
  ['', 'ITEM_DESCRIPTION', '', '', null, [1, 1, 1, 9], '', CSS_VALUE],
  ['', 'INV_LVL', 'HTML', '', null, [1, 10, 1, 12], '', CSS_VALUE],
  ['', 'ITEM_CODE', '', '', null, [2, 1, 2, 3], '', CSS_VALUE_BOLD],
  ['Pk/Sz', 'PACK_SIZE', '', '', [2, 4, 2, 4], [2, 5, 2, 9], CSS_LABEL, CSS_VALUE],
  ['LOQ', 'LOQ', '', '', [2, 10, 2, 10], [2, 11, 2, 12], CSS_LABEL, CSS_VALUE_BOLD],
  ['', 'IMAGE', 'IMAGE', '', null, [3, 1, 9, 3], '', ''],
  ['Cost', 'ORIGINAL_PRICE', 'HTML', '', [3, 4, 3, 5], [3, 6, 3, 9], CSS_LABEL, CSS_VALUE],
  ['Deal', 'DEAL_VALUE', 'HTML', '', [4, 4, 4, 5], [4, 6, 4, 9], 'color:#212f3c;font-size: 12px;font-family: Arial;', CSS_GREEN],
  ['Net Cost', 'DEAL_PRICE', 'HTML', '', [5, 4, 5, 5], [5, 6, 5, 9], CSS_LABEL, 'color:#212f3c;font-size: 14px;font-family: Arial;font-weight: bold;text-align: right'],
  ['DLVD Cost', 'DLVD_COST', 'CALCULATED', 'AD_EFFECTIVE*QTY_ENTRY', [6, 4, 6, 5], [6, 6, 6, 9], CSS_LABEL, 'color:#212f3c;font-size: 14px;font-family: Arial;font-weight: bold;text-align: right'],
  ['', 'DEAL_EFFECTIVE', 'HTML', '', null, [7, 4, 7, 9], '', 'color:#009933;font-size: 13px;font-family: Arial;'],
  ['Ucost', 'UNIT_COST', '', '', [8, 4, 8, 5], [8, 6, 8, 9], CSS_LABEL, CSS_VALUE_BOLD],
  ['', 'QTY_ENTRY', '', '', null, [3, 10, 8, 12], '', ''],
  ['SRP', 'BASE_RETAIL', 'HTML', '', [9, 4, 9, 4], [9, 5, 9, 7], 'color:#212f3c;font-size: 13px;font-family: Arial;', CSS_VALUE],
  ['GM%', 'GROSS_MARGIN', '', '', [9, 8, 9, 9], [9, 10, 9, 12], 'color:#212f3c;font-size: 12px;font-family: Arial;', CSS_VALUE],
  ['', 'ITEM_UPC', '', '', null, [10, 1, 10, 4], '', CSS_VALUE_BOLD],
  ['', 'STORE_CATEGORY_LIST', '', '', null, [10, 5, 10, 9], '', 'color:#212f3c;font-size: 13px;font-family: Arial;'],
  ['', 'INFO2', '', '', null, [10, 10, 10, 12], 'color:#212f3c;font-size: 13px;font-family: Arial;', CSS_VALUE_BOLD],
  ['Prev.Orders', 'ITEM_LIFE_1', '', '', [11, 1, 11, 3], [11, 4, 11, 9], 'color:#212f3c;font-size: 13px;font-family: Arial;', 'color:#212f3c;font-size: 13px;font-family: Arial;'],
  ['', 'INFO1', '', '', null, [11, 10, 11, 12], 'color:#212f3c;font-size: 13px;font-family: Arial;', CSS_VALUE_BOLD],
];

function rectCells(cells, rect, role) {
  if (!rect) return;
  const [r1, c1, r2, c2] = rect;
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) cells[cellKey(r, c)] = role;
}

export function buildPreset() {
  const regions = PRESET.map((p, i) => {
    const [name, value, vt, math, lbl, val, ncss, vcss] = p;
    const cells = {};
    rectCells(cells, lbl, 'name');
    rectCells(cells, val, 'value');
    return {
      id: i + 1,
      name, value, valueType: vt, math, source: 'ITEM_FILE',
      nameCss: ncss || CSS_LABEL, valueCss: vcss, cells,
    };
  });
  return {
    rows: 11,
    cols: 12,
    encoding: 'rdashc',
    activeId: null,
    nextId: regions.length + 1,
    header: defaultHeader(),
    regions,
  };
}

// [name, value, vtype, math, labelRect|null, valueRect, nameCss, valueCss]
const COMPACT_PRESET = [
  ['', 'ITEM_DESCRIPTION', '', '', null, [1,1,1,8], '', CSS_VALUE],
  ['', 'ITEM_CODE', '', '', null, [2,1,2,3], '', CSS_VALUE_BOLD],
  ['Pk/Sz', 'PACK_SIZE', '', '', [2,4,2,4], [2,5,2,8], CSS_LABEL, CSS_VALUE],
  ['', 'IMAGE', 'IMAGE', '', null, [3,1,6,3], '', ''],
  ['Cost', 'ORIGINAL_PRICE', 'HTML', '', [3,4,3,5], [3,6,3,8], CSS_LABEL, CSS_VALUE],
  ['Deal', 'DEAL_VALUE', 'HTML', '', [4,4,4,5], [4,6,4,8], CSS_LABEL, CSS_GREEN],
  ['Net', 'DEAL_PRICE', 'HTML', '', [5,4,5,5], [5,6,5,8], CSS_LABEL, CSS_VALUE],
  ['Ucost', 'UNIT_COST', '', '', [6,4,6,5], [6,6,6,8], CSS_LABEL, CSS_VALUE_BOLD],
  ['SRP', 'BASE_RETAIL', 'HTML', '', [7,1,7,2], [7,3,7,5], CSS_LABEL, CSS_VALUE],
  ['GM%', 'GROSS_MARGIN', '', '', [7,6,7,6], [7,7,7,8], CSS_LABEL, CSS_VALUE],
  ['', 'ITEM_UPC', '', '', null, [8,1,8,4], '', CSS_VALUE_BOLD],
  ['', 'STORE_CATEGORY_LIST', '', '', null, [8,5,8,8], '', CSS_VALUE],
];

export function buildCompactPreset() {
  const regions = COMPACT_PRESET.map((p, i) => {
    const [name, value, vt, math, lbl, val, ncss, vcss] = p;
    const cells = {};
    rectCells(cells, lbl, 'name');
    rectCells(cells, val, 'value');
    return {
      id: i + 1,
      name, value, valueType: vt, math, source: 'ITEM_FILE',
      nameCss: ncss || CSS_LABEL, valueCss: vcss, cells,
    };
  });
  return {
    rows: 8,
    cols: 8,
    encoding: 'rdashc',
    activeId: null,
    nextId: regions.length + 1,
    header: defaultHeader('COMPACT_TILE_FORMAT_V1.0', ''),
    regions,
  };
}

export function blankData(rows = 9, cols = 9) {
  return {
    rows, cols, encoding: 'rdashc', activeId: null, nextId: 1,
    header: defaultHeader('NEW_TILE_FORMAT_V1.0', ''), regions: [],
  };
}

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    projectName: 'Untitled',
    gridLabel: '9 × 9',
    desc: 'Empty grid — build your own layout from scratch.',
    build: () => blankData(9, 9),
  },
  {
    id: 'ch65',
    name: 'CH65 Standard',
    projectName: 'Chain 65 · 11×12',
    gridLabel: '11 × 12',
    desc: 'Full pricing tile with deals, delivery cost, image, QTY entry, and SRP/GM.',
    build: buildPreset,
  },
  {
    id: 'compact',
    name: 'Compact Pricing',
    projectName: 'Compact · 8×8',
    gridLabel: '8 × 8',
    desc: 'Smaller tile: item info, cost/deal/net, image, SRP/GM, UPC.',
    build: buildCompactPreset,
  },
];
