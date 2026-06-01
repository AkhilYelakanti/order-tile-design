export default function RegionList({ regions, activeId, onSelect }) {
  return (
    <div className="rlist">
      <div className="rlist-head">
        <span className="pill">{regions.length} region{regions.length === 1 ? '' : 's'}</span>
      </div>
      {regions.map((rg) => (
        <div
          key={rg.id}
          className={'rg' + (rg.id === activeId ? ' on' : '')}
          onClick={() => onSelect(rg.id)}
        >
          <span className="nm mono">
            {rg.name && <span className="label-c">{rg.name} </span>}
            <span className="value-c">{rg.value || '(unset)'}</span>
            {rg.valueType === 'CALCULATED' && <span className="calc-c"> ƒ</span>}
          </span>
          <span className="pill">{Object.keys(rg.cells).length}</span>
        </div>
      ))}
    </div>
  );
}
