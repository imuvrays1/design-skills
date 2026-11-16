#!/usr/bin/env node
/**
 * Scaffold a new Loops animation (skill: loops-animations).
 *
 *   node .claude/skills/loops-animations/scripts/new.mjs <slug> [--format stage|window] [--title "Name"] [--segs 3] [--force]
 *
 * Writes design/animations/<slug>.html from the format's starter, with the loop
 * engine inlined, and prints where to open it. The starter holds a working
 * EXAMPLE figure and build: replace both, keep the structure.
 *   stage   a Step Stage: one product window and one chip on the Accent Panel (default)
 *   window  an Industry Graphic: a surface window with a mono bar, the ring as
 *           pause control (--segs arcs, one per beat that lands), one accent finding
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ANIM_DIR, SKILL, parseArgs, relRoot } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const slug = args._[0];
const format = args.format || 'stage';

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: new.mjs <slug> [--format stage|window] [--title "Name"] [--segs 3] [--force]\nThe slug is lowercase words joined by hyphens, e.g. release-gate.');
  process.exit(2);
}
if (!['stage', 'window'].includes(format)) {
  console.error('--format is stage or window. A hero-scale cycle is not scaffolded: see SKILL.md, Formats.');
  process.exit(2);
}

const file = join(ANIM_DIR, slug + '.html');
if (existsSync(file) && !args.force) {
  console.error(relRoot(file) + ' already exists. Edit it, or pass --force to start it over.');
  process.exit(1);
}

/* the ring: N arcs with a gap between them, drawn as the site's Industry Cycle ring */
function ring(n) {
  const C = 2 * Math.PI * 11, pitch = C / n, d = (pitch - 3.48).toFixed(2);
  let arcs = '';
  for (let i = 0; i < n; i++) {
    const off = (-pitch * i).toFixed(2);
    arcs += `<circle class="trk" cx="13" cy="13" r="11" style="--d:${d};stroke-dashoffset:${off}"/>`;
    arcs += `<circle class="arc" cx="13" cy="13" r="11" style="--d:${d};stroke-dashoffset:${off}" data-seg/>`;
  }
  return '<button type="button" class="ic-ring" data-toggle hidden aria-pressed="false" aria-label="Pause the figure">' +
    '<svg viewBox="0 0 26 26" aria-hidden="true"><g transform="rotate(-90 13 13)">' + arcs + '</g>' +
    '<g class="glyph g-pause"><rect x="9.8" y="9.5" width="2.2" height="7" rx=".4"/><rect x="14" y="9.5" width="2.2" height="7" rx=".4"/></g>' +
    '<g class="glyph g-play"><path d="M10.6 9.2 L16.8 13 L10.6 16.8 Z"/></g></svg></button>';
}

const title = args.title || slug.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
const engine = readFileSync(join(SKILL, 'assets', 'engine.js'), 'utf8').trim();
let html = readFileSync(join(SKILL, 'assets', format + '.html'), 'utf8');
html = html
  .replaceAll('__SLUG__', slug)
  .replaceAll('__TITLE__', title)
  .replace('__RING__', ring(Math.max(1, Math.min(8, parseInt(args.segs || '3', 10) || 3))))
  .replace('/*__ENGINE__*/', () => '\n' + engine + '\n');

mkdirSync(ANIM_DIR, { recursive: true });
const ignore = join(ANIM_DIR, '.gitignore');
if (!existsSync(ignore)) writeFileSync(ignore, '# check and record output: images and video, regenerated on demand\nout/\n');
writeFileSync(file, html);

console.log(`Wrote ${relRoot(file)} (${format}).

Next:
  1. Fill in its BEAT SHEET comment, then replace the EXAMPLE figure, styles and build.
  2. Look at it: node scripts/dev-server.mjs, then http://localhost:8080/design/animations/${slug}
     (?theme=dark, ?w=360 / 520 / 680 for the three stage ratios, Space pauses)
  3. node .claude/skills/loops-animations/scripts/check.mjs ${slug}
  4. Export, if it leaves the site: node .claude/skills/loops-animations/scripts/record.mjs ${slug} --preset site`);
