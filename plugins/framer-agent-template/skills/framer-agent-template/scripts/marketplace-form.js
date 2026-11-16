// Gather what the Marketplace "Edit Template > Agent" tab asks for, from the open project.
// CONFIG: { designPagePath: "/design-system" }
// Prints: whether a design system page exists (and its sections), every installed skill with its
// name, agent-facing description and size, and pages missing the layout template.
// Buyer-facing skill descriptions are written from this output; see SKILL.md "Marketplace Agent form".
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const dsPath = C.designPagePath || '/design-system';
const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const ds = pages.find(p => p.attributes?.path === dsPath) || pages.find(p => /design|style.?guide/i.test(p.attributes?.path || ''));
if (ds) {
  const s = await framer.agent.serialize({ id: ds.id, depth: 2 }, { pagePath: ds.attributes.path });
  const bp = (s.children || [])[0];
  console.log(`Design System page: ${ds.attributes.path} (${(s.children || []).length} breakpoints)`);
  console.log('  sections:', (bp?.children || []).map(c => c.name).join(' | '));
} else {
  const dps = await framer.getNodesWithType('DesignPageNode');
  const d = dps.find(p => /design|style.?guide/i.test(p.name || ''));
  if (d) {
    const board = (await framer.agent.serialize({ id: d.id, depth: 2 })).children?.[0];
    console.log(`Design System page: "${d.name}" canvas page (counts as Yes)`);
    console.log('  sections:', (board?.children || []).map(c => c.name).join(' | '));
  } else console.log('Design System page: none found. Answer "No", or build one first (step 4).');
}

const skills = await framer.agent.getNodesOfTypes({ types: ['SkillNode'] });
console.log(`\nSkills (${skills.length}):`);
for (const k of skills) {
  const a = k.attributes || {};
  console.log(`- ${k.name}  [trigger: ${a.trigger || '?'}, ${(a.instruction || '').length} chars]`);
  console.log(`  agent description: ${a.description || '(none)'}`);
  console.log(`  first line: ${(a.instruction || '').split('\n')[0].slice(0, 200)}`);
}
const tpls = await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] });
const noTpl = pages.filter(p => !p.attributes?.layoutTemplateId && !p.attributes?.layoutTemplate).map(p => p.attributes?.path);
console.log(`\nLayout templates: ${tpls.map(t => t.name).join(', ') || 'none'}`);
if (noTpl.length && tpls.length) console.log('Pages that may not use one (check in the editor):', noTpl.join(', '));
