const KEY = 'otd.projects.v1';
const THEME = 'otd.theme';

export function loadProjects() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {
    /* quota / unavailable — ignore */
  }
}

export function loadTheme() {
  try { return localStorage.getItem(THEME) || 'dark'; } catch { return 'dark'; }
}

export function saveTheme(t) {
  try { localStorage.setItem(THEME, t); } catch { /* ignore */ }
}

export function download(text, name, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
