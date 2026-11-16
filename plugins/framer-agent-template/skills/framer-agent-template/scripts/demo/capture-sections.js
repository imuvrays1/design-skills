// Capture page sections and the layout template's nav/footer as 2x PNGs for the demo video.
// Run with the Framer agent CLI (exec), config line in front:
// CONFIG: { out: "/abs/work/raw", shots: [["/", "Desktop"], ["/design-system", "Desktop"], ["/about", "Phone"]], scale: 2, template: true }
// Whole pages fail above 16384px at 2x and `clip` does not get around it, so each breakpoint child
// (each section) is captured on its own. A section too tall for 2x falls back to 1x.
// Writes <out>/<page>_<d|t|p>_<nn>.png, <out>/tpl_<d|t|p>_<nn>.png and <out>/manifest.json (+ manifest.js for the stage).
// Section heights in the manifest are in 1x page pixels.
const fs = require('fs');
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const out = C.out; if (!out) throw new Error('CONFIG.out is required');
fs.mkdirSync(out, { recursive: true });
const scale = C.scale || 2;
const manifest = fs.existsSync(`${out}/manifest.json`) ? JSON.parse(fs.readFileSync(`${out}/manifest.json`, 'utf8')) : {};

async function shoot(id, file, pagePath) {
  for (const s of [scale, 1]) {
    try {
      const r = await framer.screenshot(id, { format: 'png', scale: s });
      const b = Buffer.from(r.data); fs.writeFileSync(`${out}/${file}`, b);
      return { f: file, scale: s, w: b.readUInt32BE(16) / s, h: b.readUInt32BE(20) / s };
    } catch (e) { if (!/too large/i.test(e.message) || s === 1) { console.log(file, 'ERR', e.message.slice(0, 160)); return null; } }
  }
}
const short = (bp) => (bp || '').trim()[0].toLowerCase();
const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });

for (const [path, bpName = 'Desktop'] of C.shots || []) {
  const pg = pages.find(p => p.attributes?.path === path);
  if (!pg) { console.log('no page at', path); continue; }
  const ps = await framer.agent.serialize({ id: pg.id, depth: 1 }, { pagePath: path });
  const bp = (ps.children || []).find(c => (c.name || '').toLowerCase() === bpName.toLowerCase()) || (bpName === 'Desktop' ? ps.children?.[0] : null);
  if (!bp) { console.log(path, 'has no breakpoint', bpName, '- found:', (ps.children || []).map(c => c.name).join(', ')); continue; }
  const tag = (path === '/' ? 'home' : path.replace(/^\//, '').replace(/[\/:]/g, '-')) + '_' + short(bpName);
  const bs = await framer.agent.serialize({ id: bp.id, depth: 1 }, { pagePath: path });
  const list = []; let i = 0;
  for (const c of bs.children || []) {
    if (c.attributes?.visible === false) continue;
    const r = await shoot(c.id, `${tag}_${String(i).padStart(2, '0')}.png`, path); i++;
    if (r) list.push({ ...r, name: c.name || '' });
  }
  manifest[tag] = { path, breakpoint: bp.name, width: list[0]?.w, sections: list };
  let y = 0; console.log(tag, list.map(x => { const s = `${x.name || '?'}@${y}`; y += x.h; return s; }).join(' | '), `| total ${y}px`);
}

if (C.template !== false) {
  const tpls = await framer.agent.getNodesOfTypes({ types: ['LayoutTemplateNode'] });
  for (const tpl of tpls.slice(0, 1)) {
    const ts = await framer.agent.serialize({ id: tpl.id, depth: 2 });
    for (const bp of ts.children || []) {
      const tag = 'tpl_' + short(bp.name); const list = []; let i = 0;
      for (const c of bp.children || []) {
        if (c.type === 'PlaceholderNode') continue;
        const r = await shoot(c.id, `${tag}_${String(i).padStart(2, '0')}.png`); i++;
        if (r) list.push({ ...r, name: c.name || '' });
      }
      manifest[tag] = { template: tpl.name, breakpoint: bp.name, sections: list };
      console.log(tag, list.map(x => `${x.name} ${x.w}x${x.h}`).join(' | '));
    }
  }
}
fs.writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 1));
fs.writeFileSync(`${out}/manifest.js`, 'window.M = ' + JSON.stringify(manifest) + ';');
console.log('manifest:', `${out}/manifest.json`);
