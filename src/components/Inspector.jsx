import { VALUE_TYPES, SOURCES, FIELD_CATALOG } from '../constants.js';
import { getCssProp, setCssProp } from '../lib/cssUtils.js';

function CssEditor({ label, cssClass, value, onChange }) {
  const color = getCssProp(value, 'color') || '#212f3c';
  const fontSize = parseInt(getCssProp(value, 'font-size')) || 12;
  const isBold = getCssProp(value, 'font-weight') === 'bold';
  const isItalic = getCssProp(value, 'font-style') === 'italic';
  const align = getCssProp(value, 'text-align') || 'center';

  const upd = (prop, val) => onChange(setCssProp(value, prop, val));

  return (
    <div>
      <label className={`lab ${cssClass}`}>{label}</label>
      <div className="css-quick">
        <input type="color" value={color}
          onChange={(e) => upd('color', e.target.value)}
          title="Text color" />
        <input type="number" className="sm css-size" value={fontSize} min="8" max="36"
          onChange={(e) => upd('font-size', e.target.value + 'px')}
          title="Font size (px)" />
        <span className="dim" style={{ fontSize: 10 }}>px</span>
        <button className={`ghost sm fmt-btn${isBold ? ' on' : ''}`}
          onClick={() => upd('font-weight', isBold ? 'normal' : 'bold')}
          title="Bold"><b>B</b></button>
        <button className={`ghost sm fmt-btn${isItalic ? ' on' : ''}`}
          onClick={() => upd('font-style', isItalic ? 'normal' : 'italic')}
          title="Italic"><i>I</i></button>
        <button className={`ghost sm fmt-btn${align === 'left' ? ' on' : ''}`}
          onClick={() => upd('text-align', 'left')} title="Left align">≡←</button>
        <button className={`ghost sm fmt-btn${align === 'center' ? ' on' : ''}`}
          onClick={() => upd('text-align', 'center')} title="Center">≡</button>
        <button className={`ghost sm fmt-btn${align === 'right' ? ' on' : ''}`}
          onClick={() => upd('text-align', 'right')} title="Right align">≡→</button>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function Inspector({ region, ops }) {
  if (!region) {
    return (
      <div className="insp">
        <h3>Inspector</h3>
        <p className="hint">No region selected. Drag across empty cells to draw one, or click an existing region.</p>
      </div>
    );
  }
  const nCells = Object.values(region.cells).filter((v) => v === 'name').length;
  const vCells = Object.values(region.cells).filter((v) => v === 'value').length;
  const patch = (p) => ops.updateRegion(region.id, p);

  return (
    <div className="insp">
      <h3>Inspector</h3>

      <label className="lab label-c">Label text (ATTR_NAME)</label>
      <input value={region.name} placeholder="blank = value-only"
        onChange={(e) => patch({ name: e.target.value })} />

      <label className="lab value-c">Value key (ATTR_VALUE)</label>
      <input list="field-catalog" value={region.value} placeholder="e.g. ORIGINAL_PRICE"
        onChange={(e) => patch({ value: e.target.value })} />
      <datalist id="field-catalog">
        {FIELD_CATALOG.map((f) => <option key={f} value={f} />)}
      </datalist>

      <div className="two">
        <div>
          <label className="lab">Value type</label>
          <select value={region.valueType} onChange={(e) => patch({ valueType: e.target.value })}>
            {VALUE_TYPES.map((t) => <option key={t} value={t}>{t || '(none)'}</option>)}
          </select>
        </div>
        <div>
          <label className="lab">Source</label>
          <input list="src-list" value={region.source} onChange={(e) => patch({ source: e.target.value })} />
          <datalist id="src-list">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
      </div>

      {region.valueType === 'CALCULATED' && (
        <>
          <label className="lab calc-c">ATTR_MATH formula</label>
          <input value={region.math} placeholder="e.g. AD_EFFECTIVE*QTY_ENTRY"
            onChange={(e) => patch({ math: e.target.value })} />
          <div className="mono dim small">{(region.value || 'VALUE')} = CALCULATED({region.math || '…'})</div>
        </>
      )}

      <CssEditor label="NAME_CSS" cssClass="label-c"
        value={region.nameCss} onChange={(v) => patch({ nameCss: v })} />
      <CssEditor label="VALUE_CSS" cssClass="value-c"
        value={region.valueCss} onChange={(v) => patch({ valueCss: v })} />

      <div className="roles">
        <span className="pill"><b className="label-c">{nCells}</b> label · <b className="value-c">{vCells}</b> value</span>
        <button className="ghost sm" onClick={() => ops.setAllRole(region.id, 'value')}>All value</button>
        <button className="ghost sm" onClick={() => ops.setAllRole(region.id, 'name')}>All label</button>
        <button className="ghost sm danger" onClick={() => ops.deleteRegion(region.id)}>Delete</button>
      </div>
      <p className="hint small">Alt-click a cell inside this region to flip it between label and value.</p>
    </div>
  );
}
