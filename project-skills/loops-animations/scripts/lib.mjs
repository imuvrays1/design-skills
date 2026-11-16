/* Shared helpers for the loops-animations scripts: where the repo is, argument
   parsing, and a small in-process static server, so the scripts need nothing
   running and nothing installed beyond the repo's own Playwright. */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = findRoot();
export const ANIM_DIR = join(ROOT, 'design', 'animations');
export const OUT_DIR = join(ANIM_DIR, 'out');

function findRoot() {
  for (const start of [process.cwd(), SKILL]) {
    for (let d = start; ; d = dirname(d)) {
      if (existsSync(join(d, 'styles', 'tokens.css')) && existsSync(join(d, 'DESIGN.md'))) return d;
      if (dirname(d) === d) break;
    }
  }
  console.error('Run this inside the loops-website repo: no styles/tokens.css and DESIGN.md above ' + process.cwd());
  process.exit(2);
}

/* --key value, --flag, and positionals */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) out[k] = true;
      else { out[k] = v; i++; }
    } else out._.push(a);
  }
  return out;
}

/* a slug, or a path to design/animations/<slug>.html */
export function target(arg) {
  if (!arg) {
    console.error('Name the animation: its slug, as in design/animations/<slug>.html');
    process.exit(2);
  }
  const slug = arg.replace(/^.*\//, '').replace(/\.html$/, '');
  const file = join(ANIM_DIR, slug + '.html');
  if (!existsSync(file)) {
    console.error('No such animation: ' + file + '\nScaffold one with: node .claude/skills/loops-animations/scripts/new.mjs ' + slug);
    process.exit(2);
  }
  return { slug, file, url: '/design/animations/' + slug };
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff'
};

/* Serves the repo the way the site is served (clean URLs), on a free port on
   this machine. Close it when done. */
export function serve() {
  const server = createServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.split('/').some(p => p === '..' || (p.startsWith('.') && p !== '.well-known'))) return res.writeHead(404).end();
    const tries = path.endsWith('/') ? [path + 'index.html'] : [path, path + '.html', path + '/index.html'];
    for (const p of tries) {
      const full = normalize(join(ROOT, p));
      if (!full.startsWith(ROOT)) continue;
      try {
        if (statSync(full).isFile()) {
          res.writeHead(200, { 'Content-Type': TYPES[extname(full)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
          return createReadStream(full).pipe(res);
        }
      } catch {}
    }
    res.writeHead(404).end('Not found');
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => {
    ok({ base: 'http://127.0.0.1:' + server.address().port, close: () => new Promise(r => server.close(r)) });
  }));
}

export async function chromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {
    console.error('Playwright is missing. In the repo run: npm install && npx playwright install chromium');
    process.exit(2);
  }
}

/* export shapes, shared by check.mjs (review images) and record.mjs (files).
   w is the stage's CSS width; files are captured at 2x. */
export const PRESETS = {
  site: { w: 960, ar: null, fps: 30, formats: 'mp4,webm,poster' },
  card: { w: 720, ar: '4/3', fps: 30, formats: 'mp4,poster' },
  square: { w: 540, ar: '1/1', fps: 30, formats: 'mp4,poster' },
  vertical: { w: 540, ar: '9/16', fps: 30, formats: 'mp4,poster' },
  email: { w: 400, ar: '1/1', fps: 20, formats: 'gif,poster' }
};

export function relRoot(p) { return p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p; }
