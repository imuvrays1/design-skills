// Create or update an agent skill (SkillNode). The name becomes the chat command (/name).
// CONFIG: { name: "design-system", description: "Use whenever...", trigger: "on-demand", instructionFile: "/abs/path/skill.md" }
//   (or pass `instruction` inline instead of instructionFile)
const C = CONFIG;
if (!C || !C.name || !C.description) throw new Error('CONFIG needs name and description');
const fs = require('fs');
const instruction = (C.instruction || fs.readFileSync(C.instructionFile, 'utf8')).trim();
const trigger = C.trigger || 'on-demand';
const e = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

const existing = (await framer.agent.getNodesOfTypes({ types: ['SkillNode'] })).find(s => s.name === C.name);
const tmp = 'sk' + Math.random().toString(36).slice(2, 8);
const dsl = existing
  ? `SET ${existing.id} description="${e(C.description)}" instruction="${e(instruction)}" trigger="${trigger}";`
  : `+SkillNode ${tmp} name="${e(C.name)}" description="${e(C.description)}" instruction="${e(instruction)}" trigger="${trigger}";`;
const r = await framer.agent.applyChanges(dsl, { pagePath: '/' });
console.log(existing ? 'updated' : 'created', C.name, r.message, r.errors ? JSON.stringify(r.errors).slice(0, 400) : '');

for (const s of await framer.agent.getNodesOfTypes({ types: ['SkillNode'] })) {
  const ins = s.attributes?.instruction || '';
  console.log(` /${s.name} | ${s.attributes?.trigger} | ${ins.length} chars, ${(ins.match(/\n/g) || []).length} lines`);
}
