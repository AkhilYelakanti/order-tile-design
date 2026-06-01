import { useState } from 'react';
import { parseSql } from '../lib/sqlParser.js';

export default function ImportDialog({ onImport, onClose }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function doImport() {
    try {
      const data = parseSql(text);
      if (!data.regions.length) throw new Error('Parsed 0 detail rows.');
      onImport(data);
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(f);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Import existing tile SQL</h3>
          <button className="ghost sm" onClick={onClose}>✕</button>
        </div>
        <p className="hint small">
          Paste an existing <span className="mono">ORDER_TILE_HDR</span> + <span className="mono">ORDER_TILE_DTL</span> insert
          script. The position encoding is auto-detected and the layout is reconstructed for editing.
        </p>
        <input type="file" accept=".sql,.txt" onChange={onFile} className="file" />
        <textarea
          className="import-area mono"
          value={text}
          placeholder="Insert into ISR_DAT.ISR_APP_CFG_ORDER_TILE_HDR (...) values (...);"
          onChange={(e) => { setText(e.target.value); setError(''); }}
        />
        {error && <div className="err mono small">⚠ {error}</div>}
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={doImport} disabled={!text.trim()}>Import as new project</button>
        </div>
      </div>
    </div>
  );
}
