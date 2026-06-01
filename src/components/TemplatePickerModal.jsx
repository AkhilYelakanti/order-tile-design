import { TEMPLATES } from '../constants.js';

export default function TemplatePickerModal({ onPick, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal tpl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Start with a template</h3>
          <button className="ghost sm" onClick={onClose}>✕</button>
        </div>
        <p className="dim small" style={{ margin: '0 0 14px' }}>
          Grid size and regions can be changed at any time.
        </p>
        <div className="tpl-grid">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} className="tpl-card" onClick={() => onPick(tpl)}>
              <div className="tpl-badge">{tpl.gridLabel}</div>
              <div className="tpl-name">{tpl.name}</div>
              <p className="tpl-desc dim small">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
