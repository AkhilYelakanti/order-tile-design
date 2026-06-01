export default function ValidationPanel({ result, onJumpGap }) {
  const { total, covered, gaps, overlaps, issues, ok } = result;
  return (
    <div className="validation">
      <div className="vrow">
        <span className={'dot ' + (ok ? 'ok' : 'bad')} />
        <span className="mono small">
          {covered}/{total} cells covered
          {gaps.length > 0 && <span className="warn-c"> · {gaps.length} empty</span>}
          {overlaps.length > 0 && <span className="err-c"> · {overlaps.length} overlap</span>}
        </span>
      </div>
      {issues.length > 0 && (
        <ul className="issues">
          {issues.map((it, i) => (
            <li key={i} className={it.level === 'error' ? 'err-c' : 'warn-c'}>
              {it.level === 'error' ? '✕' : '!'} {it.msg}
            </li>
          ))}
        </ul>
      )}
      {gaps.length > 0 && gaps.length <= 24 && (
        <div className="gaps mono small dim">empty: {gaps.join(' ')}</div>
      )}
    </div>
  );
}
