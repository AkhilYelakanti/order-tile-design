import { ENCODINGS } from '../lib/positions.js';

export default function Toolbar({ data, ops }) {
  const { rows, cols, encoding, header } = data;
  const h = (k) => (e) => ops.updateHeader({ [k]: e.target.value });
  return (
    <div className="toolbar">
      <div className="field"><label>Rows</label>
        <input className="sm" type="number" min="1" max="20" value={rows}
          onChange={(e) => ops.resizeGrid(+e.target.value, cols)} /></div>
      <div className="field"><label>Cols</label>
        <input className="sm" type="number" min="1" max="20" value={cols}
          onChange={(e) => ops.resizeGrid(rows, +e.target.value)} /></div>
      <div className="field"><label>Encoding</label>
        <select value={encoding} onChange={(e) => ops.setEncoding(e.target.value)}>
          {ENCODINGS.map((en) => <option key={en.id} value={en.id}>{en.label}</option>)}
        </select></div>
      <div className="field grow"><label>Format name</label>
        <input value={header.formatName} onChange={h('formatName')} /></div>
      <div className="field"><label>Chain</label>
        <input className="sm" value={header.chain} onChange={h('chain')} /></div>
      <div className="field"><label>App ver</label>
        <input className="sm" value={header.appVer} onChange={h('appVer')} /></div>
      <div className="field"><label>Tile height</label>
        <input className="sm" value={header.tileHeight} onChange={h('tileHeight')} /></div>
      <details className="adv">
        <summary>Schema / tables</summary>
        <div className="adv-grid">
          <div className="field"><label>Schema</label><input value={header.schema} onChange={h('schema')} /></div>
          <div className="field"><label>Device config</label><input value={header.deviceConfig} onChange={h('deviceConfig')} /></div>
          <div className="field"><label>HDR table</label><input value={header.hdrTable} onChange={h('hdrTable')} /></div>
          <div className="field"><label>DTL table</label><input value={header.dtlTable} onChange={h('dtlTable')} /></div>
          <div className="field"><label>HDR seq</label><input value={header.hdrSeq} onChange={h('hdrSeq')} /></div>
          <div className="field"><label>DTL seq</label><input value={header.dtlSeq} onChange={h('dtlSeq')} /></div>
          <div className="field"><label>Created by</label><input value={header.createdBy} onChange={h('createdBy')} /></div>
        </div>
      </details>
    </div>
  );
}
