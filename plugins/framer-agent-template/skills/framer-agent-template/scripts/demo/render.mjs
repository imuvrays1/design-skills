#!/usr/bin/env node
// Render the demo stage (stage.html + video.js + raw/ images in the work dir) with headless Chromium.
//   node render.mjs --dir <work> stills 1,5.5,12          -> <work>/stills/t<time>.jpg
//   node render.mjs --dir <work> video out.mp4 [--fps 60] -> H.264 + AAC from vo_timed.wav
// Needs `npm i playwright-core` in the work dir and a cached Playwright Chromium (headless shell preferred).
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const argv = process.argv.slice(2); const a = {}; const pos = [];
for (let i = 0; i < argv.length; i++) argv[i].startsWith('--') ? (a[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
const dir = path.resolve(a.dir || '.'); process.chdir(dir);
const [mode = 'stills', arg = ''] = pos; const fps = +(a.fps || 60);
const { chromium } = createRequire(path.join(dir, 'noop.js'))('playwright-core');

function findChrome() {
  const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (!fs.existsSync(base)) return undefined;
  const dirs = fs.readdirSync(base).sort().reverse();
  for (const d of dirs.filter(d => d.startsWith('chromium_headless_shell-'))) {
    for (const sub of fs.readdirSync(path.join(base, d))) { const p = path.join(base, d, sub, 'chrome-headless-shell'); if (fs.existsSync(p)) return p; }
  }
  for (const d of dirs.filter(d => /^chromium-\d+/.test(d))) {
    for (const sub of fs.readdirSync(path.join(base, d))) {
      const p = path.join(base, d, sub, 'Chromium.app/Contents/MacOS/Chromium'); if (fs.existsSync(p)) return p;
      const q = path.join(base, d, sub, 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'); if (fs.existsSync(q)) return q;
    }
  }
}
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', e => console.log('page error:', e.message));
await page.goto('file://' + path.join(dir, 'stage.html'));
console.log('images ready:', await page.evaluate(() => window.ready()));
const dur = await page.evaluate(() => window.V.dur);

if (mode === 'stills') {
  fs.mkdirSync('stills', { recursive: true });
  const times = arg ? arg.split(',').map(Number) : Array.from({ length: 16 }, (_, i) => +(0.6 + i * (dur - 1.2) / 15).toFixed(2));
  for (const t of times) { await page.evaluate(t => seek(t), t); await page.screenshot({ path: `stills/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 }); }
  console.log('stills:', times.join(', '));
} else {
  const outFile = arg || 'demo.mp4'; const n = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', 'vo_timed.wav',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => seek(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 600 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`done ${outFile} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
