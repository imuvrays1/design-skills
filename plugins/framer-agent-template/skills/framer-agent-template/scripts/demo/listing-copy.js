// Build the paste-ready listing copy from the open project: skill details, YouTube title and description,
// and the Marketplace Agent form answers. Run it every time a demo video is delivered (and after skills change).
// Framer exec script, config line in front:
// CONFIG: {
//   name: "Polaris",                      // optional, defaults to the project name
//   remixLine: "Remix it, then type /design-system in the agent chat to start.",   // optional
//   designPagePath: "/design-system",     // optional; a canvas Design Page named like "Design System" also counts
//   formDescriptions: { "design-system": "Builds new pages and sections from ...", "<other>": "..." },  // buyer-facing, under 100 chars
//   chapters: [["0:00","Overview"],["0:05","Design system page"]],   // optional, from the video's sentence times
//   out: "/tmp/<work>/listing-copy.md"    // optional; the file is also printed
// }
// Skills without a formDescriptions entry get a draft from their agent description. Rewrite those drafts,
// the form caps the field at 100 characters, and every line printed here is counted.
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const info = await framer.getProjectInfo();
const name = C.name || info.name;
const skills = await framer.agent.getNodesOfTypes({ types: ['SkillNode'] });
const webPages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const dsPath = C.designPagePath || '/design-system';
let ds = webPages.find(p => p.attributes?.path === dsPath);
let dsLabel = ds ? dsPath : null;
if (!ds) {
  const dps = await framer.getNodesWithType('DesignPageNode');
  const d = dps.find(p => /design|style.?guide/i.test(p.name || ''));
  if (d) { ds = d; dsLabel = `"${d.name}" canvas page`; }
}
const first = skills.find(s => s.name === 'design-system') || skills[0];
const cmd = n => '/' + n;
const strip = t => String(t || '').replace(/—/g, ',');
const draftForm = s => {
  const d = strip((s.attributes?.description || '').replace(/^Use (whenever|when|to)\s+/i, '')).replace(/\.\s.*$/, '').replace(/\.$/, '');
  return d.charAt(0).toUpperCase() + d.slice(1) + '.';
};
const rows = skills.map(s => {
  const given = C.formDescriptions?.[s.name];
  const text = strip(given || draftForm(s));
  return { name: s.name, cmd: cmd(s.name), agent: s.attributes?.description || '', form: text, drafted: !given, len: text.length };
});

const remix = C.remixLine || (first ? `Remix it, then type ${cmd(first.name)} in the agent chat to start.` : 'Remix it to start.');
const ytTitle = `${name}: Agent Template for Framer`;
const skillList = rows.map(r => r.cmd).join(', ');
const ytDesc = [
  `${name} is a Framer Agent Template${ds ? ' with a design system page' : ''} and ${rows.length} agent skill${rows.length === 1 ? '' : 's'} (${skillList}). ${remix}`,
  ...(C.chapters?.length ? ['', ...C.chapters.map(([t, l]) => `${t} ${l}`)] : []),
].join('\n');

const out = [];
out.push(`# ${name}: listing copy`, '');
out.push('## YouTube', `Title: ${ytTitle}`, 'Description:', ytDesc, '');
out.push('## Skills');
for (const r of rows) {
  out.push(`- ${r.cmd}`, `  agent description: ${r.agent}`, `  form description (${r.len}/100${r.len > 100 ? ', TOO LONG' : ''}${r.drafted ? ', DRAFT: rewrite for buyers' : ''}): ${r.form}`);
}
out.push('', '## Marketplace Agent form',
  'Agent Template: On',
  `Design System: ${ds ? `Yes (${dsLabel})` : 'No (build the page first)'}`,
  'Demo: <YouTube link>  (upload pending)',
  'Skills:', ...rows.map(r => `  ${r.name.padEnd(16)} ${r.form}`));
const text = out.join('\n');
console.log(text);
if (C.out) { require('fs').writeFileSync(C.out, text + '\n'); console.log('\nwritten:', C.out); }
