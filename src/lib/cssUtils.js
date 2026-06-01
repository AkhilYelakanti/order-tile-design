export function getCssProp(css, prop) {
  if (!css) return '';
  const decl = css.split(';').find((d) => {
    const t = d.trim();
    return t.toLowerCase().startsWith(prop.toLowerCase() + ':');
  });
  return decl ? decl.slice(decl.indexOf(':') + 1).trim() : '';
}

export function setCssProp(css, prop, val) {
  const propLower = prop.toLowerCase();
  const parts = (css || '').split(';').filter((d) => {
    const t = d.trim();
    return t && !t.toLowerCase().startsWith(propLower + ':');
  });
  if (val !== '' && val != null) parts.push(`${prop}: ${val}`);
  const result = parts.join(';');
  return result ? result + ';' : '';
}
