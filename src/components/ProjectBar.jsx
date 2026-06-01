export default function ProjectBar({ projects, currentId, onSwitch, onNew, onDuplicate, onRename, onDelete }) {
  return (
    <div className="projectbar">
      <div className="tabs">
        {projects.map((p) => (
          <button
            key={p.id}
            className={'tab' + (p.id === currentId ? ' on' : '')}
            onClick={() => onSwitch(p.id)}
            onDoubleClick={() => onRename(p.id)}
            title="double-click to rename"
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="tab-actions">
        <button className="ghost sm" onClick={onNew}>+ New</button>
        <button className="ghost sm" onClick={onDuplicate}>Duplicate</button>
        <button className="ghost sm" onClick={() => onRename(currentId)}>Rename</button>
        <button className="ghost sm danger" onClick={onDelete} disabled={projects.length <= 1}>Delete</button>
      </div>
    </div>
  );
}
