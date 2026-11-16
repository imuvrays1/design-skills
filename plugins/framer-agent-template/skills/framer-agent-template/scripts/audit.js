// Agent-template audit. Run: (echo 'const CONFIG = {};'; cat audit.js) | npx @framer/agent@latest exec -s <session>
// Prints what Framer's agent-template guide checks: styles, components, layout templates,
// hardcoded colors, generic layer names, skills, CMS and locales.
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const topN = C.topColors || 40;

const info = await framer.getProjectInfo();
console.log('# Project:', info.name);

const colorStyles = await framer.getColorStyles();
const textStyles = await framer.getTextStyles();
const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const comps = await framer.agent.getNodesOfTypes({ types: ['ComponentNode'] });
const tpls = await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] });
const skills = await framer.agent.getNodesOfTypes({ types: ['SkillNode'] }).catch(() => []);

const roots = [
  ...pages.map(p => ({ id: p.id, pagePath: p.attributes.path || '/', label: 'page ' + p.attributes.path })),
  ...comps.map(c => ({ id: c.id, pagePath: '/', label: 'component ' + c.name })),
  ...tpls.map(t => ({ id: t.id, pagePath: '/', label: 'template ' + t.name })),
];

const norm = v => {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase().replace(/\s+/g, '');
  const m = s.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/);
  if (m) { const a = m[4] === undefined ? 1 : +m[4]; const h = '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''); return a === 1 ? h : h + '@' + a; }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) return '#' + s.slice(1).split('').map(c => c + c).join('');
  return null;
};

let all = '';
const hard = {}; const generic = []; const bpByPage = {}; const inlineType = [];
const FONT_KEYS = ['fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
const GENERIC = /^(Frame|Text|Stack|Group|Rectangle|Ellipse|Image)( \d+)?$/;
for (const r of roots) {
  const s = await framer.agent.serialize({ id: r.id, pagePath: r.pagePath }).catch(e => ({ err: e.message }));
  if (s.err) { console.log('could not read', r.label, s.err); continue; }
  all += JSON.stringify(s);
  if (r.label.startsWith('page')) bpByPage[r.label] = (s.children || []).map(c => c.$mediaQuery || c.$isPrimary ? c.name + ' ' + (c.attributes?.width || '') : '(canvas item: ' + (c.name || c.type) + ')');
  const walk = n => {
    const a = n.attributes || {};
    if (!String(n.id).startsWith('v:') && !n.$replicaId) {
      for (const k of ['fill', 'textColor']) { const v = norm(a[k]); if (v) hard[v] = (hard[v] || 0) + 1; }
      if (GENERIC.test(n.name || '')) generic.push(`${r.label} › ${n.name} (${n.id})`);
      // inline type: text without a text style, or text carrying its own font settings
      const perTag = Object.keys(a).some(k => k.startsWith('stylePreset')); // CMS rich text styled per tag is fine
      if (n.type === 'RichTextNode' && !perTag && (!a.textStylePreset || FONT_KEYS.some(k => a[k] != null))) {
        const why = a.textStylePreset ? 'overrides ' + FONT_KEYS.filter(k => a[k] != null).join('/') : 'no text style';
        inlineType.push(`${r.label} › ${n.name || n.id} (${n.id}) ${why}`);
      }
    }
    if (n.type === 'TextRun' && FONT_KEYS.some(k => a[k] != null)) {
      inlineType.push(`${r.label} › run ${n.id} sets ${FONT_KEYS.filter(k => a[k] != null).join('/')}`);
    }
    (n.children || []).forEach(walk);
  };
  walk(s);
}

console.log('\n## Color styles', colorStyles.length);
colorStyles.forEach(c => console.log(` ${c.path}  ${c.light}${all.includes(c.id) ? '' : '  [UNUSED]'}`));
console.log('\n## Text styles', textStyles.length);
textStyles.forEach(t => console.log(` ${t.path}  ${t.font?.family || ''} ${t.font?.weight || ''} ${t.fontSize || ''}${all.includes(t.id) ? '' : '  [UNUSED?]'}`));
console.log('\n## Components', comps.length);
for (const c of comps) {
  const s = await framer.agent.serialize({ id: c.id, pagePath: '/' }).catch(() => null);
  const variants = s ? [...new Set((s.children || []).map(v => v.name))] : [];
  console.log(` ${c.name}: ${variants.join(', ')}${all.split(c.id).length > 2 ? '' : '  [no instances found?]'}`);
}
console.log('\n## Layout templates:', tpls.map(t => t.name).join(', ') || 'NONE');
const noTpl = pages.filter(p => !p.attributes.layoutTemplate).map(p => p.attributes.path);
console.log('Pages without a layout template:', noTpl.join(', ') || 'none');
console.log('\n## Pages and breakpoints');
Object.entries(bpByPage).forEach(([p, b]) => console.log(` ${p}: ${b.join(' | ')}`));
console.log('\n## Hardcoded colors (primary layers only, fill + textColor), top', topN);
Object.entries(hard).sort((a, b) => b[1] - a[1]).slice(0, topN).forEach(([v, n]) => console.log(` ${n}× ${v}`));
console.log('Total hardcoded:', Object.values(hard).reduce((a, b) => a + b, 0));
console.log('\n## Generic layer names:', generic.length);
generic.slice(0, C.genericLimit || 30).forEach(g => console.log(' ' + g));
console.log('\n## Inline text styling (should move into text styles):', inlineType.length);
inlineType.slice(0, C.inlineLimit || 30).forEach(g => console.log(' ' + g));
console.log('\n## Skills:', skills.length ? skills.map(s => `${s.name} (${s.attributes?.trigger})`).join(', ') : 'none');
const cols = await framer.getCollections();
console.log('## CMS collections:', cols.map(c => c.name).join(', ') || 'none');
for (const c of cols) { const f = await c.getFields(); console.log(`  ${c.name}: ${f.map(x => x.name + ':' + x.type).join(', ')}`); }
const locales = await framer.getLocales().catch(() => []);
console.log('## Locales:', locales.map(l => (l.name || l.code) + (l.slug ? ' /' + l.slug : '')).join(', ') || 'default only');
