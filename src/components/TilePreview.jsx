import { useRef } from 'react';
import { bounds } from '../lib/validation.js';

function cssToObj(css) {
  const out = {};
  if (!css) return out;
  css.split(';').forEach((decl) => {
    const idx = decl.indexOf(':');
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop) return;
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  });
  return out;
}

export default function TilePreview({ data }) {
  const { rows, cols, regions } = data;
  const tileRef = useRef(null);

  async function exportPng() {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(tileRef.current, { scale: 2, useCORS: true });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.header?.formatName || 'tile') + '.png';
    a.click();
  }

  const cells = [];

  regions.forEach((rg) => {
    const nameEntries = Object.entries(rg.cells).filter(([, role]) => role === 'name');
    const valueEntries = Object.entries(rg.cells).filter(([, role]) => role === 'value');
    const hasName = nameEntries.length > 0;
    const hasValue = valueEntries.length > 0;

    const isImage = rg.valueType === 'IMAGE' || rg.value === 'IMAGE';
    const isEntry = rg.value === 'QTY_ENTRY';

    if (hasName || hasValue) {
      if (hasName) {
        const nb = bounds(Object.fromEntries(nameEntries));
        cells.push(
          <div
            key={`${rg.id}-name`}
            className="tcell"
            style={{
              gridColumn: `${nb.c1} / ${nb.c2 + 1}`,
              gridRow: `${nb.r1} / ${nb.r2 + 1}`,
            }}
          >
            <span style={cssToObj(rg.nameCss)}>{rg.name}</span>
          </div>
        );
      }
      if (hasValue) {
        const vb = bounds(Object.fromEntries(valueEntries));
        cells.push(
          <div
            key={`${rg.id}-value`}
            className="tcell"
            style={{
              gridColumn: `${vb.c1} / ${vb.c2 + 1}`,
              gridRow: `${vb.r1} / ${vb.r2 + 1}`,
            }}
            title={rg.value}
          >
            {isImage ? (
              <div className="tile-img">IMG</div>
            ) : isEntry ? (
              <div className="tile-entry">0</div>
            ) : (
              <span style={cssToObj(rg.valueCss)}>{sampleFor(rg.value)}</span>
            )}
          </div>
        );
      }
    } else {
      const b = bounds(rg.cells);
      cells.push(
        <div
          key={`${rg.id}-combined`}
          className="tcell"
          style={{
            gridColumn: `${b.c1} / ${b.c2 + 1}`,
            gridRow: `${b.r1} / ${b.r2 + 1}`,
          }}
          title={rg.value}
        >
          <div className="tile-content">
            {rg.name && <span style={cssToObj(rg.nameCss)}>{rg.name}</span>}
            <span style={cssToObj(rg.valueCss)}>{sampleFor(rg.value)}</span>
          </div>
        </div>
      );
    }
  });

  return (
    <div className="preview">
      <div className="preview-head">
        <h3>Tile preview</h3>
        <span className="dim small">approx · uses VALUE_CSS / NAME_CSS</span>
        <button className="ghost sm" style={{ marginLeft: 'auto' }} onClick={exportPng}>⬇ PNG</button>
      </div>
      <div
        ref={tileRef}
        className="tile"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, minmax(16px, auto))`,
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

function sampleFor(key) {
  const samples = {
    ITEM_DESCRIPTION: 'GENERAL MILLS CHEERIOS',
    INV_LVL: 'In Stock',
    ITEM_CODE: '123456',
    PACK_SIZE: '12 / 18 OZ',
    ORIGINAL_PRICE: '$42.50',
    DEAL_VALUE: '-$3.00',
    DEAL_PRICE: '$39.50',
    DLVD_COST: '$40.10',
    DEAL_EFFECTIVE: 'thru 06/30',
    UNIT_COST: '$3.29',
    BASE_RETAIL: '$4.99',
    GROSS_MARGIN: '34%',
    ITEM_UPC: '0 16000 12345 6',
    STORE_CATEGORY_LIST: 'CEREAL · BREAKFAST',
    ITEM_LIFE_1: '4 / 6 / 2',
    LOQ: '1',
    INFO1: '—', INFO2: '—',
  };
  return samples[key] || key || '—';
}
