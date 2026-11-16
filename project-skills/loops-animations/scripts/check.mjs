#!/usr/bin/env node
/**
 * Check a Loops animation against the system (skill: loops-animations).
 *
 *   node .claude/skills/loops-animations/scripts/check.mjs <slug> [--preset square] [--w 540 --ar 1/1]
 *
 * --preset (or --w and --ar) shapes the end and sheet images like the export
 * they are for; the fit images always cover the site's widths.
 * Reads design/animations/<slug>.html, plays it, and writes what a reviewer
 * needs into design/animations/out/<slug>/:
 *   end-light.png, end-dark.png       the shipped end state (reduced motion)
 *   sheet-light.png, sheet-dark.png   twelve frames across one run, with times
 *   fit-<w>.png                       the end state at the site's widths
 *   compare.png                       the end frame beside its siblings on the live site
 *   report.json
 * Errors exit 1: they break a rule the site's guards or DESIGN.md enforce.
 * Warnings are for a person to judge. Passing the check is the floor, not the
 * bar: the bar is reading as a sibling of the site's own graphics.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUT_DIR, PRESETS, chromium, parseArgs, relRoot, serve, target } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const { slug, file, url } = target(args._[0]);
const out = join(OUT_DIR, slug);
mkdirSync(out, { recursive: true });

const errors = [], warnings = [], info = {};
const preset = args.preset ? PRESETS[args.preset] : null;
if (args.preset && !preset) { console.error('--preset is one of ' + Object.keys(PRESETS).join(', ')); process.exit(2); }
const LOOK_W = args.w ? parseInt(args.w, 10) : preset ? preset.w : null;
const LOOK = (args.ar || (preset && preset.ar)) ? '&ar=' + encodeURIComponent(args.ar || preset.ar) : '';
const err = (rule, msg) => errors.push(rule + ': ' + msg);
const warn = (rule, msg) => warnings.push(rule + ': ' + msg);

/* ---------- static: the file as written ---------- */
const src = readFileSync(file, 'utf8');
const own = src.replace(/\/\* LOOPS ENGINE START[\s\S]*?LOOPS ENGINE END \*\//, '');
const styles = [...own.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const scripts = [...own.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const markup = own.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '');
const styleAttrs = [...markup.matchAll(/\sstyle="([^"]*)"/g)].map(m => m[1]).join(';');
const css = styles + '\n' + styleAttrs;
const format = /class="ig[ "]/.test(markup) ? 'window' : 'stage';
info.format = format;

const COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(/;
if (COLOUR.test(css) || COLOUR.test(scripts)) err('colour', 'a raw colour value. Use a token: var(--ink), var(--rule), var(--accent)...');
if (/(fill|stroke|color|stop-color)="(?!currentColor|none|transparent)[^"]+"/i.test(markup)) err('colour', 'an SVG fill or stroke attribute with a value. Set fill and stroke in CSS from tokens, or use currentColor');
if (/box-shadow|text-shadow|drop-shadow|blur\(|backdrop-filter|(^|[;{\s])filter\s*:|mix-blend-mode/.test(css + scripts)) err('depth', 'a shadow, blur, filter or blend. Depth is a 1px --rule hairline plus a surface step');
if (/(linear|radial|conic)-gradient/.test(css + scripts)) err('gradient', 'a gradient. The only texture is the Accent Panel dots, which .panel already draws');
for (const m of css.matchAll(/border(?:-[a-z-]+)?-radius\s*:\s*([^;}]+)/g)) {
  if (!m[1].trim().split(/\s+/).every(v => /^(0|0px|4px|var\(--r-[a-z]+\))$/.test(v))) err('radius', `border-radius: ${m[1].trim()}. Square, or 4px (var(--r-tag)) on tags and pills only`);
}
for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/g)) {
  if (!/^(var\(--(sans|mono)\)|inherit)$/.test(m[1].trim())) err('type', `font-family: ${m[1].trim()}. Geist and Geist Mono only: var(--sans), var(--mono)`);
}
for (const m of css.matchAll(/font-weight\s*:\s*([^;}]+)/g)) {
  if (!/^(400|500|normal|inherit)$/.test(m[1].trim())) err('type', `font-weight: ${m[1].trim()}. 400 and 500 only`);
}
for (const m of css.matchAll(/(?:transition|animation)(?:-duration|-delay)?\s*:\s*([^;}]+)/g)) {
  if (/(^|[\s,(])\d*\.?\d+m?s\b/.test(m[1])) err('motion', `a raw time in "${m[0].trim()}". Durations come from tokens: var(--dur-fast), var(--dur-base)...`);
}
for (const m of css.matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/g)) {
  const props = m[1].split(',').map(p => p.trim().split(/\s+/)[0]);
  const bad = props.filter(p => p && !/^(opacity|transform|color|background-color|border-color|fill|stroke|none|var\(.*)$/.test(p));
  if (bad.length) err('motion', `transition on ${bad.join(', ')}. Animate opacity and transform; hover changes colour or border only`);
}
for (const m of styles.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)) {
  const props = [...m[2].matchAll(/([a-z-]+)\s*:/g)].map(x => x[1]).filter(p => p !== 'offset');
  const bad = [...new Set(props.filter(p => !['opacity', 'transform'].includes(p)))];
  if (bad.length) err('motion', `@keyframes ${m[1]} animates ${bad.join(', ')}. Opacity and transform only`);
}
if (/\bsetTimeout|\bsetInterval|requestAnimationFrame|\.onfinish\b|\.finished\b/.test(scripts)) err('clock', 'setTimeout, setInterval, requestAnimationFrame or onfinish in the build. Use t.at(time, fn) so pause and recording hold it');
if (/\.animate\(/.test(scripts)) warn('clock', 'element.animate() called directly. Use t.add() so the beat joins the clock (pause, loop, record)');
if (/Math\.random/.test(scripts)) err('clock', 'Math.random in the build. Every run must play identically');
if (/[–—]/.test(own)) err('copy', 'an em or en dash. House style has none; use a comma, a colon or "to"');
if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(markup)) err('copy', 'an emoji');
const words = markup.replace(/<[^>]+>/g, ' ');
const hype = words.match(/\b(revolutionary|seamless(ly)?|magic(al)?|unlock|supercharge|game-?changing|effortless(ly)?|AI-powered|insights?)\b/i);
if (hype) warn('copy', `"${hype[0]}". Plain, specific words: say what happened on the call`);
if (/!\s/.test(words.replace(/<!--[\s\S]*?-->/g, ''))) warn('copy', 'an exclamation mark');
if (/EXAMPLE/.test(own)) warn('starter', 'the starter EXAMPLE is still in the file (beat sheet or build). Replace it with this animation\'s own');
if (!/aria-label="Sample/.test(markup)) warn('copy', 'the figure\'s aria-label should start "Sample:" and say what it shows, as the site\'s do');

/* ---------- runtime ---------- */
const chrome = await chromium();
const srv = await serve();
const browser = await chrome.launch();

async function page(theme, reduce, w, extra = '', dpr = 2) {
  const ctx = await browser.newContext({ viewport: { width: Math.max(1200, (w || LOOK_W || 0) + 120), height: 1000 }, deviceScaleFactor: dpr, colorScheme: theme, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const problems = [];
  p.on('pageerror', e => problems.push(String(e.message || e)));
  p.on('console', m => { if (m.type() === 'error') problems.push(m.text()); });
  if (!reduce) {
    await p.addInitScript(() => {
      const log = (window.__animLog = []);
      const orig = Element.prototype.animate;
      Element.prototype.animate = function (frames, opts) {
        const o = typeof opts === 'number' ? { duration: opts } : (opts || {});
        const tag = this.tagName.toLowerCase() + (this.classList.length ? '.' + [...this.classList].join('.') : '');
        log.push({ el: tag, frames: JSON.parse(JSON.stringify(frames)), duration: o.duration, delay: o.delay || 0, easing: o.easing || 'linear' });
        return orig.call(this, frames, opts);
      };
    });
  }
  const q = new URLSearchParams({ theme });
  if (w) q.set('w', w);
  await p.goto(srv.base + url + '?' + q + extra, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  return { p, ctx, problems };
}

/* the token palette, resolved in the page's theme */
const PALETTE = ['canvas', 'surface', 'inset', 'rule', 'rule-2', 'ink', 'ink-2', 'ink-3', 'on-ink', 'ink-hover', 'accent', 'accent-wash', 'accent-deep', 'accent-edge', 'miss', 'partial'];

for (const theme of ['light', 'dark']) {
  const { p, ctx, problems } = await page(theme, true, LOOK_W, LOOK);
  const fig = p.locator('[data-demo]').first();
  if (!(await fig.count())) { err('markup', 'no [data-demo] figure'); break; }
  await p.locator('.ls-frame').first().screenshot({ path: join(out, `end-${theme}.png`) });
  const audit = await p.evaluate(names => {
    const fig = document.querySelector('[data-demo]');
    /* a fresh probe per token: under reduced motion tokens.css gives every
       property a .01ms transition, so a reused probe reads its last colour */
    const pal = {};
    for (const n of names) {
      const probe = document.createElement('i');
      probe.style.color = 'var(--' + n + ')';
      fig.appendChild(probe);
      pal[getComputedStyle(probe).color] = n;
      probe.remove();
    }
    const tagOf = el => el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    const name = el => el.classList.length || !el.parentElement ? tagOf(el) : tagOf(el.parentElement) + ' > ' + tagOf(el);
    const off = [], hidden = [], fonts = new Set(), weights = new Set(), radius = [], depth = [], accent = new Set(), verdict = [];
    const nodes = [fig, ...fig.querySelectorAll('*')];
    for (const el of nodes) {
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      if (el.closest('[hidden]')) continue;
      const deco = !!el.closest('[aria-hidden="true"]');
      if (!deco && r.width > 4 && r.height > 4 && (parseFloat(s.opacity) < 0.05 || s.visibility === 'hidden')) hidden.push(name(el));
      const svg = el instanceof SVGElement;
      const checks = [['color', s.color]];
      if (!svg || el.tagName.toLowerCase() === 'svg') checks.push(['background', s.backgroundColor]);
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(s['border' + side + 'Width']) > 0) checks.push(['border', s['border' + side + 'Color']]);
      /* only shapes draw a fill or stroke; the svg element and groups just pass them on */
      if (svg && /^(path|rect|circle|ellipse|line|polyline|polygon|text|tspan)$/.test(el.tagName.toLowerCase())) { if (s.fill && s.fill !== 'none' && !s.fill.startsWith('url')) checks.push(['fill', s.fill]); if (s.stroke && s.stroke !== 'none') checks.push(['stroke', s.stroke]); }
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
      for (const [k, v] of checks) {
        if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue;
        /* a text colour only matters where there is text to draw */
        if (k === 'color' && !hasText) continue;
        const tokenName = pal[v];
        if (!tokenName) { off.push(name(el) + ' ' + k + ' ' + v); continue; }
        if (tokenName === 'accent' || tokenName === 'accent-deep') accent.add(name(el) + ' (' + k + ')');
        if ((tokenName === 'miss' || tokenName === 'partial') && !el.closest('.pill, [class*="verdict"]')) verdict.push(name(el) + ' ' + k);
      }
      if (hasText) { fonts.add(s.fontFamily.split(',')[0].replace(/"/g, '').trim()); weights.add(s.fontWeight); }
      for (const c of ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight']) {
        if (parseFloat(s['border' + c + 'Radius']) > 4) { radius.push(name(el) + ' ' + s['border' + c + 'Radius']); break; }
      }
      if (s.boxShadow !== 'none' || s.filter !== 'none' || s.backdropFilter !== 'none') depth.push(name(el));
    }
    return { off: [...new Set(off)], hidden, fonts: [...fonts], weights: [...weights], radius, depth, accent: [...accent], verdict };
  }, PALETTE);
  for (const o of audit.off.slice(0, 8)) err('colour', `${theme}: ${o} is not a token colour`);
  if (audit.hidden.length) err('rest', `${theme}: at rest (reduced motion) these wait invisible: ${audit.hidden.slice(0, 6).join(', ')}. The markup must ship the end state`);
  for (const f of audit.fonts) if (!/^Geist( Mono)?$/.test(f)) err('type', `${theme}: text set in ${f}`);
  for (const w of audit.weights) if (!['400', '500'].includes(w)) err('type', `${theme}: font-weight ${w}`);
  for (const r of audit.radius) err('radius', `${theme}: ${r}`);
  for (const d of audit.depth) err('depth', `${theme}: ${d} has a shadow or filter`);
  for (const v of audit.verdict) err('verdict', `${theme}: ${v} uses a verdict colour outside a pill. --miss and --partial live on verdict pills and rows only`);
  if (theme === 'light') {
    info.accentMarks = audit.accent;
    if (audit.accent.length > 4) warn('accent', `${audit.accent.length} elements draw in the accent: ${audit.accent.join(', ')}. The accent marks progress and the one finding, nothing else`);
  }
  for (const pr of problems) err('script', `${theme}: ${pr}`);
  await ctx.close();
}

/* fit: the end state at three widths, nothing clipped by the figure */
/* a stage's three ratios (and the site's tighter rows under 400), or a window
   from a phone up to its full width in an industry section */
const WIDTHS = format === 'stage' ? [360, 520, 680] : [320, 400, 560, 760, 1260];
info.fit = {};
for (const w of WIDTHS) {
  const { p, ctx } = await page('light', true, w);
  const fit = await p.evaluate(() => {
    const fig = document.querySelector('[data-demo]'), fr = fig.getBoundingClientRect();
    const name = el => el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    const clipped = [], cut = [];
    for (const el of fig.querySelectorAll('[data-main], [data-chip], [data-body], .fo, .ig-body > *')) {
      const r = el.getBoundingClientRect();
      if (r.left < fr.left - 1 || r.right > fr.right + 1 || r.top < fr.top - 1 || r.bottom > fr.bottom + 1) clipped.push(name(el));
    }
    for (const el of fig.querySelectorAll('*')) {
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).textOverflow === 'ellipsis') cut.push(name(el) + ' "' + el.textContent.trim().slice(0, 30) + '"');
    }
    /* text that prints over other text: measured on the glyphs, not the boxes,
       because a squeezed grid cell lets its text spill out */
    const runs = [], range = document.createRange();
    const walker = document.createTreeWalker(fig, NodeFilter.SHOW_TEXT);
    /* text kept for screen readers only: the site's .vh and .sr-only, or any
       1px clipped box */
    const offscreen = el => {
      for (let e = el; e && e !== fig.parentElement; e = e.parentElement) {
        if ((e.offsetWidth <= 1 || e.offsetHeight <= 1) && getComputedStyle(e).overflow === 'hidden') return true;
      }
      return false;
    };
    for (let n; (n = walker.nextNode());) {
      if (!n.nodeValue.trim() || n.parentElement.closest('[hidden], .sr-only, .vh') || offscreen(n.parentElement)) continue;
      const st = getComputedStyle(n.parentElement);
      if (st.visibility === 'hidden' || parseFloat(st.opacity) < 0.05) continue;
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) runs.push({ el: n.parentElement, r, text: n.nodeValue.trim().slice(0, 24) });
    }
    const collide = [];
    for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i], b = runs[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 2 && y > 2) collide.push('"' + a.text + '" and "' + b.text + '"');
    }
    return { size: Math.round(fr.width) + 'x' + Math.round(fr.height), clipped: [...new Set(clipped)], cut, collide: [...new Set(collide)] };
  });
  info.fit[w] = fit.size;
  if (fit.clipped.length) err('fit', `at ${w}px the figure clips ${fit.clipped.join(', ')}. The window and chip always fit; tighten the content, the figure does not grow`);
  if (fit.collide.length) err('fit', `at ${w}px text prints over text: ${fit.collide.slice(0, 4).join(', ')}. Let the row stack or tighten it at this width`);
  if (fit.cut.length) warn('fit', `at ${w}px text is cut short: ${fit.cut.slice(0, 4).join(', ')}`);
  await p.locator('[data-demo]').first().screenshot({ path: join(out, `fit-${w}.png`) });
  await ctx.close();
}

/* motion: every beat of one run, checked against the tokens; then a contact sheet */
const T = {};
for (const theme of ['light', 'dark']) {
  const { p, ctx, problems } = await page(theme, false, LOOK_W, '&record=' + slug + LOOK);
  const ok = await p.waitForFunction(() => window.__loop, null, { timeout: 5000 }).then(() => true, () => false);
  if (!ok) { err('engine', 'the loop never mounted (no LoopsLoop.mount build for this data-demo, or a script error)'); for (const pr of problems) err('script', pr); await ctx.close(); break; }
  const total = await p.evaluate(() => window.__loop.prepare());
  const end = await p.evaluate(() => window.__loop.end());
  if (theme === 'light') {
    Object.assign(T, await p.evaluate(() => window.LoopsLoop.T));
    info.run = { endMs: Math.round(end), totalMs: Math.round(total) };
    if (end < 1500) warn('timing', `the beats end at ${Math.round(end)}ms. Too quick to read: three beats, each given room`);
    if (total > 16000) warn('timing', `one run is ${(total / 1000).toFixed(1)}s. Stages run 6 to 9s, the Hero Cycle 13s; cut a beat`);
    const log = await p.evaluate(() => window.__animLog);
    const norm = e => String(e).replace(/\s+/g, '').replace(/(^|[,(])0\./g, '$1.');
    const EASES = { [norm(T.EASE)]: 'enter', [norm(T.STD)]: 'standard', [norm(T.EXIT)]: 'exit' };
    const DURS = new Set([T.FAST, T.BASE, T.ENTER, T.LAND, T.SLOW, T.HOLD]);
    const groups = new Map(), seen = new Set();
    let moving = 0;
    for (const a of log) {
      const frames = Array.isArray(a.frames) ? a.frames : [];
      const props = new Set(frames.flatMap(f => Object.keys(f)).filter(k => !['offset', 'easing', 'composite'].includes(k)));
      const noop = frames.length > 1 && frames.every(f => JSON.stringify(f) === JSON.stringify(frames[0]));
      const bad = [...props].filter(k => k !== 'opacity' && k !== 'transform');
      const key = a.el + ' ' + [...props].join('+');
      if (bad.length && !seen.has('p' + key)) { seen.add('p' + key); err('motion', `${a.el} animates ${bad.join(', ')}. Opacity and transform only`); }
      if (noop) continue;
      if (props.has('transform')) moving++;
      if (!DURS.has(a.duration) && !seen.has('d' + a.el + a.duration)) { seen.add('d' + a.el + a.duration); err('motion', `${a.el} runs ${a.duration}ms. Durations: ${[...DURS].join(', ')}ms (--dur-fast, -base, -enter, -land, --slow, --dur-breathe)`); }
      if (!EASES[norm(a.easing)] && !seen.has('e' + a.el + a.easing)) { seen.add('e' + a.el + a.easing); (a.easing === 'linear' ? warn : err)('motion', `${a.el} eases "${a.easing}". Use --ease-enter (arrivals), --ease-standard (state changes) or --ease-exit (leaving)`); }
      const tf = frames.map(f => f.transform || '').join(' ');
      if (/rotate|skew|perspective|matrix/.test(tf) && !seen.has('t' + a.el)) { seen.add('t' + a.el); err('motion', `${a.el} rotates, skews or uses 3D. No spin, no 3D: translate and scale only`); }
      const scales = [...tf.matchAll(/scale(?:X|Y)?\(([\d.]+)/g)].map(m => parseFloat(m[1]));
      if (scales.some(s => s > 1.06 + 1e-9) && !seen.has('s' + a.el)) { seen.add('s' + a.el); warn('motion', `${a.el} scales past 1.06. Overshoot reads as bounce; land is the only zoom, and only on a hero surface`); }
      if (frames.length > 2 && !seen.has('f' + a.el)) { seen.add('f' + a.el); warn('motion', `${a.el} has ${frames.length} keyframes. The system uses two; a middle frame is usually a bounce or a pulse`); }
      const g = JSON.stringify(frames) + '|' + a.duration;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(a.delay);
    }
    for (const [g, delays] of groups) {
      const ds = [...new Set(delays)].sort((x, y) => x - y);
      if (ds.length > 8) {
        const steps = ds.slice(1).map((d, i) => Math.round(d - ds[i]));
        if (new Set(steps).size === 1) warn('stagger', `${ds.length} items on one ${steps[0]}ms stagger. Cap a stagger at 8; the rest arrive together`);
      }
    }
    info.beats = log.length;
    info.movingBeats = moving;
  }
  /* frames at the beats, not at even times, so a quick swap is never skipped:
     the start, the moments beats settle, the held end, and the fade out */
  const hold = await p.evaluate(() => window.LoopsLoop.T.HOLD);
  const settles = [...new Set((await p.evaluate(() => window.__animLog))
    .filter(a => Array.isArray(a.frames) && !(a.frames.length > 1 && a.frames.every(f => JSON.stringify(f) === JSON.stringify(a.frames[0]))))
    .map(a => Math.round(a.delay + a.duration)))].filter(x => x > 0 && x <= end).sort((x, y) => x - y);
  const pickN = 13, picked = settles.length <= pickN ? settles : Array.from({ length: pickN }, (_, i) => settles[Math.round((i * (settles.length - 1)) / (pickN - 1))]);
  const times = [...new Set([0, ...picked])].map(t => ({ t, note: '' }));
  times.push({ t: Math.round(end + hold / 2), note: ' held' }, { t: Math.round(total - 120), note: ' fading' });
  const shots = [];
  for (const { t, note } of times) {
    await p.evaluate(x => window.__loop.seek(x), t);
    const buf = await p.locator('.ls-frame').first().screenshot();
    shots.push({ t, note, src: 'data:image/png;base64,' + buf.toString('base64') });
  }
  const sheet = await ctx.newPage();
  await sheet.setContent(`<style>body{margin:0;padding:24px;background:${theme === 'dark' ? '#0A0A09' : '#FAF9F6'};font:12px ui-monospace,monospace;color:#868684}
    .g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.g img{width:100%;display:block;outline:1px solid #8884}</style>
    <div class="g">${shots.map(s => `<figure style="margin:0"><img src="${s.src}"><figcaption>${(s.t / 1000).toFixed(2)}s${s.note}</figcaption></figure>`).join('')}</div>`);
  await sheet.setViewportSize({ width: 1600, height: 900 });
  await sheet.screenshot({ path: join(out, `sheet-${theme}.png`), fullPage: true });
  for (const pr of problems) err('script', `${theme}: ${pr}`);
  await ctx.close();
}

/* compare: the end frame beside its siblings on the live pages, at their width */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' });
  const p = await ctx.newPage();
  const sibs = [];
  const where = format === 'stage' ? [['/', 'data-demo']] : [['/collections', 'data-ig'], ['/insurance', 'data-ig']];
  for (const [u, attr] of where) {
    await p.goto(srv.base + u, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const figs = p.locator('[' + attr + ']');
    for (let i = 0; i < await figs.count(); i++) {
      const f = figs.nth(i);
      await f.scrollIntoViewIfNeeded();
      await p.waitForTimeout(150);
      const bb = await f.boundingBox();
      sibs.push({ w: Math.round(bb.width), label: u + ' · ' + (await f.getAttribute(attr)), buf: await f.screenshot() });
    }
  }
  if (sibs.length) {
    const own = await page('light', true, sibs[0].w, '', 1);
    const buf = await own.p.locator('[data-demo]').first().screenshot();
    await own.ctx.close();
    const all = [{ label: slug + ' · this one', buf }, ...sibs];
    const cols = format === 'stage' ? 2 : 1;
    await p.setContent(`<style>body{margin:0;padding:24px;background:#FAF9F6;font:12px ui-monospace,monospace;color:#6E6C65}
      .g{display:grid;grid-template-columns:repeat(${cols},auto);gap:24px;justify-content:start}figure{margin:0}img{display:block}
      figure:first-child figcaption{color:#0B0B0A}</style><div class="g">${all.map(s => `<figure><img src="data:image/png;base64,${s.buf.toString('base64')}"><figcaption>${s.label}</figcaption></figure>`).join('')}</div>`);
    await p.screenshot({ path: join(out, 'compare.png'), fullPage: true });
  }
  await ctx.close();
}

await browser.close();
await srv.close();

const report = { slug, file: relRoot(file), errors, warnings, info, shots: relRoot(out) };
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${slug} (${info.format})${info.run ? `: beats end at ${info.run.endMs}ms, one run is ${info.run.totalMs}ms` : ''}`);
if (info.accentMarks) console.log('accent: ' + (info.accentMarks.join(', ') || 'none'));
if (info.fit) console.log('sizes: ' + Object.entries(info.fit).map(([w, s]) => w + 'px ' + s).join(', '));
for (const e of errors) console.log('ERROR  ' + e);
for (const w of warnings) console.log('warn   ' + w);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s). Look at ${relRoot(out)}/: sheet-light.png, sheet-dark.png, end-*.png, fit-*.png, and compare.png (yours beside the site's own)\n`);
process.exit(errors.length ? 1 : 0);
