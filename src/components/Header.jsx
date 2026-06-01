export default function Header({ theme, onToggleTheme, onImport, hist }) {
  return (
    <header className="appheader">
      <h1><b>Order Tile</b> Designer</h1>
      <span className="sub">visual layout → ISR_APP_CFG_ORDER_TILE_HDR / _DTL</span>
      <div className="head-actions">
        <button className="ghost sm" onClick={hist.undo} disabled={!hist.canUndo} title="Ctrl+Z">↶</button>
        <button className="ghost sm" onClick={hist.redo} disabled={!hist.canRedo} title="Ctrl+Y">↷</button>
        <button className="ghost sm" onClick={onImport}>Import SQL</button>
        <button className="ghost sm" onClick={onToggleTheme}>{theme === 'light' ? '☾ Dark' : '☀ Light'}</button>
      </div>
    </header>
  );
}
