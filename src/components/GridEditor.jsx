import { useState } from 'react';
import { encode, cellKey } from '../lib/positions.js';
import { bounds } from '../lib/validation.js';

const PALETTE = ['#1f6feb', '#2ea043', '#db6d28', '#8957e5', '#1f968b', '#bb8009', '#cf6679', '#0969da', '#bf3989', '#d29922'];

export default function GridEditor({ data, ops }) {
  const { rows, cols, encoding, regions, activeId } = data;
  const [drag, setDrag] = useState(null);

  const owner = {};
  regions.forEach((rg, i) => {
    Object.entries(rg.cells).forEach(([k, role]) => { owner[k] = { i, role, id: rg.id }; });
  });

  const labelCell = {};
  regions.forEach((rg) => { const b = bounds(rg.cells); labelCell[`${b.r1}-${b.c1}`] = rg; });

  function down(r, c, e) {
    const o = owner[cellKey(r, c)];
    if (e.altKey && o) { ops.flipCell(o.id, r, c); return; }
    if (o) { ops.selectRegion(o.id); return; }
    setDrag({ sr: r, sc: c, er: r, ec: c });
  }
  function enter(r, c) { if (drag) setDrag((d) => ({ ...d, er: r, ec: c })); }
  function up() {
    if (!drag) return;
    const r1 = Math.min(drag.sr, drag.er), r2 = Math.max(drag.sr, drag.er);
    const c1 = Math.min(drag.sc, drag.ec), c2 = Math.max(drag.sc, drag.ec);
    const coords = [];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
      if (!owner[cellKey(r, c)]) coords.push([r, c]);
    }
    setDrag(null);
    if (coords.length) ops.createRegion(coords);
  }
  const inDrag = (r, c) => {
    if (!drag) return false;
    const r1 = Math.min(drag.sr, drag.er), r2 = Math.max(drag.sr, drag.er);
    const c1 = Math.min(drag.sc, drag.ec), c2 = Math.max(drag.sc, drag.ec);
    return r >= r1 && r <= r2 && c >= c1 && c <= c2 && !owner[cellKey(r, c)];
  };

  return (
    <div className="gridhost" onMouseUp={up} onMouseLeave={() => drag && up()}>
      <table className="grid">
        <thead>
          <tr>
            <th className="rowh" />
            {Array.from({ length: cols }, (_, i) => <th key={i}>{i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, ri) => {
            const r = ri + 1;
            return (
              <tr key={r}>
                <th className="rowh">{r}</th>
                {Array.from({ length: cols }, (_, ci) => {
                  const c = ci + 1;
                  const o = owner[cellKey(r, c)];
                  const cls = ['cell'];
                  if (o) { cls.push('region', o.role === 'name' ? 'isname' : 'isvalue'); if (o.id === activeId) cls.push('active'); }
                  if (inDrag(r, c)) cls.push('sel');
                  const bg = o ? PALETTE[o.i % PALETTE.length] + '33' : undefined;
                  const lbl = labelCell[cellKey(r, c)];
                  return (
                    <td
                      key={c}
                      className={cls.join(' ')}
                      style={{ background: bg }}
                      onMouseDown={(e) => down(r, c, e)}
                      onMouseEnter={() => enter(r, c)}
                    >
                      <span className="pid">{encode(encoding, r, c, cols)}</span>
                      {lbl && <span className="tag">{lbl.value || lbl.name || '—'}</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
