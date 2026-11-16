// Check that every style / component / template / collection a skill names exists in the project.
// CONFIG: { extraNames: ["Main Layout", "Button"], designPagePath: "/design-system",
//           ignore: ["Desktop/Tablet"], text: "<skill text to lint instead of the installed skills>" }
//   A style name can have any number of folders ("Colors/Text/On Dark Muted"), and may be written in full
//   or without its leading folders ("Text/On Dark Muted", "Accent/Link").
//   Layer names on the design system page (e.g. "Section Header example") also count as known.
//   `ignore` lists slash phrases that are not names. `text` lints a draft before installing it.
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const strip = p => p.replace(/^\//, '');
const colorPaths = (await framer.getColorStyles()).map(c => strip(c.path));
const textPaths = (await framer.getTextStyles()).map(t => strip(t.path));
const comps = (await framer.agent.getNodesOfTypes({ types: ['ComponentNode'] })).map(c => c.name);
const tpls = (await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] })).map(t => t.name);
const cols = (await framer.getCollections()).map(c => c.name);

// a name matches if it equals a full path or the path minus any leading folders
const tails = p => { const parts = p.split('/'); return parts.map((_, i) => parts.slice(i).join('/')); };
const layerNames = [];
const dsPath = C.designPagePath || '/design-system';
const dsPage = (await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] })).find(p => p.attributes.path === dsPath);
if (dsPage) { const s = await framer.agent.serialize({ id: dsPage.id, pagePath: dsPath }); const w = n => { if (n.name) layerNames.push(n.name); (n.children || []).forEach(w); }; w(s); }
else console.log('No design system page at', dsPath);
const known = new Set([...colorPaths, ...textPaths, ...comps, ...tpls].flatMap(tails).concat(cols, layerNames));
const ignore = new Set(C.ignore || []);

// A path is two or more "/"-joined segments of capitalised words or numbers, e.g. "Colors/Text/On Dark Muted".
// The first word must start with a capital letter, so ratios such as "3/2" are skipped.
const SEG = '[A-Z0-9][A-Za-z0-9]*(?: [A-Z0-9][A-Za-z0-9]*)*';
const PATH = new RegExp(`\\b[A-Z][A-Za-z0-9]*(?: [A-Z0-9][A-Za-z0-9]*)*(?:\\/${SEG})+`, 'g');

// The regex can pick up a capitalised word in front of a name ("Use Text/Primary") and stop before a
// lowercase word inside one ("Surface/Warm card"). Try dropping leading words of the first folder and
// adding up to three following words; only an exact known name counts, so misspellings still fail.
function variants(text, m) {
  const [first, ...rest] = m[0].split('/');
  const firstWords = first.split(' ');
  const more = ((text.slice(m.index + m[0].length).match(/^(?: [A-Za-z0-9]+){1,3}/) || [''])[0]).split(' ').filter(Boolean);
  const out = [];
  for (let k = 0; k < firstWords.length; k++) {
    const base = [firstWords.slice(k).join(' '), ...rest].join('/');
    out.push(base);
    for (let j = 1; j <= more.length; j++) out.push(base + ' ' + more.slice(0, j).join(' '));
  }
  return out;
}

function lint(name, text) {
  const refs = [], missing = [];
  for (const m of text.matchAll(PATH)) {
    const vs = variants(text, m);
    if (vs.some(v => ignore.has(v))) continue;
    const hit = vs.find(v => known.has(v));
    refs.push(hit || m[0]);
    if (!hit) missing.push(m[0]);
  }
  // quoted layer names such as "Section Header example"
  for (const m of text.matchAll(/"([^"]{3,40} example)"/g)) { refs.push(m[1]); if (!known.has(m[1])) missing.push(m[1]); }
  const miss = [...new Set(missing)];
  console.log(`/${name}: ${new Set(refs).size} style-like names, missing: ${miss.join(', ') || 'none'}`);
  return miss.length;
}

let missingAll = 0;
if (C.text) missingAll += lint('draft', C.text);
else {
  const skills = await framer.agent.getNodesOfTypes({ types: ['SkillNode'] });
  if (!skills.length) console.log('No skills installed.');
  for (const s of skills) missingAll += lint(s.name, s.attributes?.instruction || '');
}
for (const n of C.extraNames || []) if (!known.has(n)) { missingAll++; console.log('missing explicit name:', n); }
console.log('\nKnown components:', comps.join(', '));
console.log('Known templates:', tpls.join(', '));
console.log(missingAll ? `\n${missingAll} unresolved names. Fix the skill text or the project.` : '\nAll names resolve.');
