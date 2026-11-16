// Replace hardcoded fill/textColor values with color styles.
// CONFIG: {
//   dryRun: true,                       // print the plan only
//   newStyles: { "#f1eff5": "Chat/Surface", "#6e47ff@0.18": "Accent/Purple Glow" }, // keys as printed under "unmatched"
//   textPrefix: "Text/",                // folder preferred for textColor matches
//   avoidForFill: ["Text/"]             // folders not used for fills when another match exists
// }
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const dry = C.dryRun !== false;
const textPrefix = C.textPrefix || 'Text/';
const avoidForFill = C.avoidForFill || ['Text/'];

const norm = v => {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase().replace(/\s+/g, '');
  const m = s.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/);
  if (m) { const a = m[4] === undefined ? 1 : +m[4]; const h = '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''); return a === 1 ? h : h + '@' + a; }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) return '#' + s.slice(1).split('').map(c => c + c).join('');
  return null;
};
const toRgba = k => { const [h, a] = k.split('@'); const n = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return a ? `rgba(${n.join(', ')}, ${a})` : `rgb(${n.join(', ')})`; };

// create requested styles (only when applying)
let styles = await framer.getColorStyles();
const pathOf = c => c.path.replace(/^\//, '');
if (!dry && C.newStyles) {
  for (const [k, p] of Object.entries(C.newStyles)) {
    if (styles.some(s => pathOf(s) === p)) continue;
    await framer.createColorStyle({ name: p, light: toRgba(k) });
    console.log('created style', p, toRgba(k));
  }
  styles = await framer.getColorStyles();
}

// value -> candidate styles
const byVal = {};
for (const s of styles) { const k = norm(s.light); if (k) (byVal[k] ||= []).push(s); }
if (dry && C.newStyles) for (const [k, p] of Object.entries(C.newStyles)) (byVal[k] ||= []).push({ id: '(new)', path: '/' + p });
const pick = (k, prop) => {
  const c = byVal[k]; if (!c) return null;
  if (prop === 'textColor') return c.find(s => pathOf(s).startsWith(textPrefix)) || c[0];
  return c.find(s => !avoidForFill.some(f => pathOf(s).startsWith(f))) || c[0];
};

const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const comps = await framer.agent.getNodesOfTypes({ types: ['ComponentNode'] });
const tpls = await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] });
const roots = [...pages.map(p => [p.id, p.attributes.path || '/', p.attributes.path]), ...comps.map(c => [c.id, '/', c.name]), ...tpls.map(t => [t.id, '/', t.name])];

const unmatched = {}; let total = 0;
for (const [rid, pp, label] of roots) {
  const s = await framer.agent.serialize({ id: rid, pagePath: pp });
  const cmds = [];
  const walk = n => {
    const a = n.attributes || {};
    if (!String(n.id).startsWith('v:')) {
      for (const prop of ['fill', 'textColor']) {
        const k = norm(a[prop]); if (!k) continue;
        const st = pick(k, prop);
        if (st) cmds.push(`SET ${n.id} ${prop}="var(--token-${st.id})";`);
        else if (!n.$replicaId) unmatched[k] = (unmatched[k] || 0) + 1;
      }
    }
    (n.children || []).forEach(walk);
  };
  walk(s);
  if (!cmds.length) continue;
  total += cmds.length;
  if (dry) { console.log(`${label}: ${cmds.length} would change`); continue; }
  let errs = 0;
  for (let i = 0; i < cmds.length; i += 150) {
    const r = await framer.agent.applyChanges(cmds.slice(i, i + 150).join('\n'), { pagePath: pp });
    if (r.errors) { errs++; console.log(label, 'ERR', JSON.stringify(r.errors).slice(0, 300)); }
  }
  console.log(`${label}: ${cmds.length} changed${errs ? ` (${errs} batch errors)` : ''}`);
}
console.log(`\n${dry ? 'DRY RUN, would change' : 'Changed'}: ${total}`);
console.log('\nUnmatched values (primary layers), candidates for newStyles:');
Object.entries(unmatched).sort((a, b) => b[1] - a[1]).slice(0, C.top || 40).forEach(([k, n]) => console.log(` ${n}× ${k}`));
