// Rename generic layers (Frame 12, Text, Stack...) to descriptive names.
// Text layers get their first words; containers get "<nearest named ancestor> Content".
// CONFIG: { dryRun: true, words: 4, skip: ["Hero Group"] }
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const dry = C.dryRun !== false;
const words = C.words || 4;
const skip = new Set(C.skip || []);
const GENERIC = /^(Frame|Text|Stack|Group|Rectangle|Ellipse)( \d+)?$/;
const textOf = n => (n.children || []).flatMap(b => (b.children || []).map(r => r.attributes?.text || '')).join('').trim();

const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const comps = await framer.agent.getNodesOfTypes({ types: ['ComponentNode'] });
const tpls = await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] });
const roots = [...pages.map(p => [p.id, p.attributes.path || '/', p.attributes.path]), ...comps.map(c => [c.id, '/', c.name]), ...tpls.map(t => [t.id, '/', t.name])];

let total = 0;
for (const [rid, pp, label] of roots) {
  const s = await framer.agent.serialize({ id: rid, pagePath: pp });
  const cmds = [];
  const walk = (n, ancestor) => {
    const name = n.name || '';
    if (GENERIC.test(name) && !skip.has(name) && !String(n.id).startsWith('v:') && !n.$replicaId) {
      let nm;
      if (n.type === 'RichTextNode') {
        let t = textOf(n);
        if (!t && typeof n.attributes?.text === 'string' && n.attributes.text.startsWith('var(')) t = 'CMS Field';
        nm = t ? t.replace(/[“”"]/g, '').split(/\s+/).slice(0, words).join(' ').slice(0, 32) : 'Label';
      } else nm = (ancestor ? ancestor + ' ' : '') + 'Content';
      cmds.push([n.id, name, nm.replace(/"/g, "'")]);
    }
    const next = name && !GENERIC.test(name) ? name : ancestor;
    (n.children || []).forEach(c => walk(c, next));
  };
  walk(s, null);
  if (!cmds.length) continue;
  total += cmds.length;
  console.log(`${label}: ${cmds.length}  e.g. ${cmds.slice(0, 4).map(c => `${c[1]} → ${c[2]}`).join(' | ')}`);
  if (!dry) {
    const r = await framer.agent.applyChanges(cmds.map(c => `SET ${c[0]} name="${c[2]}";`).join('\n'), { pagePath: pp });
    if (r.errors) console.log('  ERR', JSON.stringify(r.errors).slice(0, 300));
  }
}
console.log(`${dry ? 'DRY RUN, would rename' : 'Renamed'}: ${total}`);
