import { useState, useMemo, useEffect, useCallback } from 'react';
import { useHistory } from './hooks/useHistory.js';
import { generateSql } from './lib/sqlGenerator.js';
import { validate } from './lib/validation.js';
import { loadProjects, saveProjects, loadTheme, saveTheme, download } from './lib/storage.js';
import { blankData, CSS_LABEL, CSS_VALUE } from './constants.js';

import Header from './components/Header.jsx';
import ProjectBar from './components/ProjectBar.jsx';
import Toolbar from './components/Toolbar.jsx';
import GridEditor from './components/GridEditor.jsx';
import Inspector from './components/Inspector.jsx';
import RegionList from './components/RegionList.jsx';
import SqlPanel from './components/SqlPanel.jsx';
import TilePreview from './components/TilePreview.jsx';
import ValidationPanel from './components/ValidationPanel.jsx';
import ImportDialog from './components/ImportDialog.jsx';
import TemplatePickerModal from './components/TemplatePickerModal.jsx';

const genId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function App() {
  const savedProjects = useMemo(() => loadProjects(), []);
  const initialProjects = savedProjects || [{ id: 'p1', name: 'Untitled', data: blankData() }];
  const [projects, setProjects] = useState(initialProjects);
  const [currentId, setCurrentId] = useState(initialProjects[0].id);
  const [activeId, setActiveId] = useState(null);
  const [theme, setTheme] = useState(loadTheme);
  const [showImport, setShowImport] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(!savedProjects);
  const [replaceOnPick, setReplaceOnPick] = useState(!savedProjects);

  const [data, set, hist] = useHistory(initialProjects[0].data);

  // theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // keep the current project's data in sync + persist
  useEffect(() => {
    setProjects((ps) => ps.map((p) => (p.id === currentId ? { ...p, data } : p)));
  }, [data, currentId]);
  useEffect(() => { saveProjects(projects); }, [projects]);

  // keyboard undo/redo
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) { e.preventDefault(); hist.undo(); }
      else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (e.shiftKey && k === 'z'))) { e.preventDefault(); hist.redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hist]);

  const sql = useMemo(() => generateSql(data), [data]);
  const validation = useMemo(() => validate(data), [data]);
  const activeRegion = data.regions.find((r) => r.id === activeId) || null;

  // ---- editing ops (history-recording) ----
  const ops = {
    createRegion: (coords) => {
      let newId;
      set((d) => {
        newId = d.nextId;
        const cells = {};
        coords.forEach(([r, c]) => { cells[`${r}-${c}`] = 'value'; });
        const rg = { id: newId, name: '', value: 'NEW_FIELD', valueType: '', math: '', source: 'ITEM_FILE', nameCss: CSS_LABEL, valueCss: CSS_VALUE, cells };
        return { ...d, regions: [...d.regions, rg], nextId: newId + 1 };
      });
      setActiveId(newId);
    },
    updateRegion: (id, patch) =>
      set((d) => ({ ...d, regions: d.regions.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    deleteRegion: (id) => {
      set((d) => ({ ...d, regions: d.regions.filter((r) => r.id !== id) }));
      setActiveId((a) => (a === id ? null : a));
    },
    flipCell: (id, r, c) => {
      set((d) => ({
        ...d,
        regions: d.regions.map((rg) => {
          if (rg.id !== id) return rg;
          const k = `${r}-${c}`;
          return { ...rg, cells: { ...rg.cells, [k]: rg.cells[k] === 'name' ? 'value' : 'name' } };
        }),
      }));
      setActiveId(id);
    },
    setAllRole: (id, role) =>
      set((d) => ({
        ...d,
        regions: d.regions.map((rg) => {
          if (rg.id !== id) return rg;
          const cells = {};
          Object.keys(rg.cells).forEach((k) => { cells[k] = role; });
          return { ...rg, cells };
        }),
      })),
    selectRegion: (id) => setActiveId(id),
    resizeGrid: (rows, cols) => {
      const R = Math.max(1, Math.min(20, rows || 1));
      const C = Math.max(1, Math.min(20, cols || 1));
      set((d) => ({
        ...d,
        rows: R,
        cols: C,
        regions: d.regions
          .map((rg) => {
            const cells = {};
            Object.entries(rg.cells).forEach(([k, role]) => {
              const [r, c] = k.split('-').map(Number);
              if (r <= R && c <= C) cells[k] = role;
            });
            return { ...rg, cells };
          })
          .filter((rg) => Object.keys(rg.cells).length > 0),
      }));
    },
    setEncoding: (enc) => set((d) => ({ ...d, encoding: enc })),
    updateHeader: (patch) => set((d) => ({ ...d, header: { ...d.header, ...patch } })),
  };

  // ---- project management ----
  const commit = useCallback(
    () => projects.map((p) => (p.id === currentId ? { ...p, data: hist.getPresent() } : p)),
    [projects, currentId, hist]
  );

  function switchProject(id) {
    if (id === currentId) return;
    const ps = commit();
    const target = ps.find((p) => p.id === id);
    setProjects(ps);
    setCurrentId(id);
    setActiveId(null);
    hist.reset(target.data);
  }
  function newProject(initData, name) {
    const ps = commit();
    const id = genId();
    const proj = { id, name: name || `Tile ${ps.length + 1}`, data: initData || blankData() };
    setProjects([...ps, proj]);
    setCurrentId(id);
    setActiveId(null);
    hist.reset(proj.data);
  }
  function duplicateProject() {
    const cur = commit().find((p) => p.id === currentId);
    newProject(JSON.parse(JSON.stringify(cur.data)), cur.name + ' (copy)');
  }
  function renameProject(id) {
    const cur = projects.find((p) => p.id === id);
    const name = window.prompt('Project name', cur.name);
    if (name) setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  }
  function deleteProject() {
    if (projects.length <= 1) return;
    if (!window.confirm('Delete this project?')) return;
    const remaining = projects.filter((p) => p.id !== currentId);
    setProjects(remaining);
    const next = remaining[0];
    setCurrentId(next.id);
    setActiveId(null);
    hist.reset(next.data);
  }
  function importProject(parsed) {
    setShowImport(false);
    newProject(parsed, parsed.header.formatName || 'Imported');
  }

  function applyTemplate(tpl) {
    const data = tpl.build();
    if (replaceOnPick) {
      setProjects([{ id: currentId, name: tpl.projectName, data }]);
      hist.reset(data);
      setReplaceOnPick(false);
    } else {
      newProject(data, tpl.projectName);
    }
    setShowTemplatePicker(false);
  }

  function handleNewProject() {
    setReplaceOnPick(false);
    setShowTemplatePicker(true);
  }

  const downloadSql = () => download(sql, (data.header.formatName || 'order_tile') + '.sql', 'text/plain');
  const exportJson = () => download(JSON.stringify(data, null, 2), (data.header.formatName || 'layout') + '.json', 'application/json');

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onImport={() => setShowImport(true)} hist={hist} />

      <ProjectBar
        projects={projects} currentId={currentId}
        onSwitch={switchProject} onNew={handleNewProject} onDuplicate={duplicateProject}
        onRename={renameProject} onDelete={deleteProject}
      />

      <Toolbar data={data} ops={ops} />

      <div className="layout">
        <main className="canvas">
          <GridEditor data={{ ...data, activeId }} ops={ops} />
          <p className="hint">
            <b>Drag</b> across empty cells to create a region · <b>click</b> a region to edit ·
            <b> Alt-click</b> a cell to flip label/value.
          </p>
          <ValidationPanel result={validation} />
          <TilePreview data={data} />
        </main>

        <aside className="side">
          <Inspector region={activeRegion} ops={ops} />
          <RegionList regions={data.regions} activeId={activeId} onSelect={ops.selectRegion} />
          <SqlPanel sql={sql} onDownloadSql={downloadSql} onExportJson={exportJson} />
        </aside>
      </div>

      {showImport && <ImportDialog onImport={importProject} onClose={() => setShowImport(false)} />}
      {showTemplatePicker && (
        <TemplatePickerModal
          onPick={applyTemplate}
          onClose={() => { setReplaceOnPick(false); setShowTemplatePicker(false); }}
        />
      )}
    </div>
  );
}
