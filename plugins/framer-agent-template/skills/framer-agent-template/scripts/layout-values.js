// Reads real section layout values per breakpoint from one page (default "/").
// CONFIG: { pagePath: "/" }
const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};
const pp = C.pagePath || '/';
const pages = await framer.agent.getNodesOfTypes({ types: ['WebPageNode'] });
const page = pages.find(p => p.attributes.path === pp);
if (!page) throw new Error('No page at ' + pp);
const s = await framer.agent.serialize({ id: page.id, pagePath: pp });
const bps = (s.children || []).filter(b => b.$mediaQuery || b.$isPrimary);
const primary = bps.find(b => b.$isPrimary) || bps[0];
console.log('Breakpoints:', bps.map(b => `${b.name} ${b.attributes?.width} (${b.id})`).join(' | '));
for (const sec of primary.children || []) {
  const a = sec.attributes || {};
  const row = [`${sec.name}`, `tag=${a.htmlTag || '-'}`, `pad=${a.padding || '-'}`, `gap=${a.gap || '-'}`, `fill=${String(a.fill || '-').slice(0, 48)}`];
  for (const bp of bps) {
    if (bp.id === primary.id) continue;
    const r = await framer.agent.serialize({ id: bp.id + sec.id, pagePath: pp }).catch(() => null);
    if (r) row.push(`${bp.name}.pad=${r.attributes?.padding || '(inherits)'}`);
  }
  const inner = (sec.children || [])[0];
  if (inner) row.push(`inner=${inner.name} maxWidth=${inner.attributes?.maxWidth || '-'}`);
  console.log(row.join(' | '));
}
