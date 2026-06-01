import { useState } from 'react';

export default function SqlPanel({ sql, onCopy, onDownloadSql, onExportJson }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      onCopy && onCopy();
    });
  }
  return (
    <div className="sqlbox">
      <div className="sqlbox-head">
        <h3>Generated SQL</h3>
        <div className="actions">
          <button className="primary sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
          <button className="ghost sm" onClick={onDownloadSql}>.sql</button>
          <button className="ghost sm" onClick={onExportJson}>.json</button>
        </div>
      </div>
      <pre>{sql}</pre>
    </div>
  );
}
