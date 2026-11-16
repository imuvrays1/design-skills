#!/usr/bin/env node
/**
 * Export a Loops animation to video (skill: loops-animations).
 *
 *   node .claude/skills/loops-animations/scripts/record.mjs <slug> [--preset site] [--theme light|dark]
 *        [--fps 30] [--formats mp4,webm,gif,poster] [--name <feature>-<placement>] [--hold 4000]
 *
 * Frame-exact: the engine's one clock is paused and moved frame by frame, so
 * every frame lands on its beat (no screen-recording drops) and one run loops
 * seamlessly: it opens on the contents fading in and closes on them fading out.
 * Captured at 2x so 1px hairlines stay crisp. Needs ffmpeg for video and GIF.
 *
 * Presets (design/DEMO-GUIDE.md, Export specs). Width is the stage's CSS width; the
 * file is twice that.
 *   site      960 wide, 16:9    -> 1920 x 1080   mp4 + webm + poster, 30fps (a site or launch loop)
 *   card      720 wide, 4:3     -> 1440 x 1080   mp4 + poster
 *   square    540 wide, 1:1     -> 1080 x 1080   mp4 + poster (social)
 *   vertical  540 wide, 9:16    -> 1080 x 1920   mp4 + poster (stories, reels)
 *   email     400 wide, 1:1     ->  800 x  800   gif at 20fps, under 3MB
 * --hold <ms> holds the end frame longer than the site's 2.4s, when a clip has
 * more to read. Upload the poster as the cover image wherever the platform
 * asks for one: a clip's first frame is the window still filling in.
 * Output: design/animations/out/<slug>/loops-<name>-<WxH>.<ext>
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { OUT_DIR, PRESETS, chromium, parseArgs, relRoot, serve, target } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const { slug, url } = target(args._[0]);
const presetName = args.preset || 'site';
const preset = PRESETS[presetName];
if (!preset) { console.error('--preset is one of ' + Object.keys(PRESETS).join(', ')); process.exit(2); }
const theme = args.theme === 'dark' ? 'dark' : 'light';
const fps = parseInt(args.fps || preset.fps, 10);
const formats = String(args.formats || preset.formats).split(',').map(s => s.trim());
const w = parseInt(args.w || preset.w, 10);
const ar = args.ar || preset.ar;
const scale = 2;

const needsFfmpeg = formats.some(f => f !== 'poster');
if (needsFfmpeg) {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); }
  catch { console.error('ffmpeg is needed for ' + formats.filter(f => f !== 'poster').join(', ') + ' (brew install ffmpeg). --formats poster works without it.'); process.exit(2); }
}

const out = join(OUT_DIR, slug);
const frames = join(out, 'frames-' + presetName + '-' + theme);
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const chrome = await chromium();
const srv = await serve();
const browser = await chrome.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: 1200 }, deviceScaleFactor: scale, colorScheme: theme, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
const q = new URLSearchParams({ theme, w: String(w), record: slug });
if (ar) q.set('ar', ar);
if (args.hold) q.set('hold', String(parseInt(args.hold, 10)));
await page.goto(srv.base + url + '?' + q, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__loop, null, { timeout: 5000 }).catch(() => {
  console.error('The loop never mounted. Run check.mjs ' + slug + ' to see why.');
  process.exit(1);
});
const total = await page.evaluate(() => window.__loop.prepare());
const end = await page.evaluate(() => window.__loop.end());
const HOLD = await page.evaluate(() => window.LoopsLoop.T.HOLD);
const box = page.locator('.ls-frame').first();
const size = await box.boundingBox();
const W = Math.round(size.width * scale), H = Math.round(size.height * scale);
const n = Math.ceil((total * fps) / 1000);
console.log(`${slug}: ${(total / 1000).toFixed(2)}s run, ${n} frames at ${fps}fps, ${W} x ${H}, ${theme}`);

for (let i = 0; i < n; i++) {
  await page.evaluate(t => window.__loop.seek(t), (i * 1000) / fps);
  await box.screenshot({ path: join(frames, 'f' + String(i).padStart(5, '0') + '.png') });
  if (i % fps === 0) process.stdout.write('.');
}
process.stdout.write('\n');

/* the poster is the held end state, halfway through the breath */
const name = 'loops-' + (args.name || slug + '-' + presetName) + '-' + W + 'x' + H;
const written = [];
if (formats.includes('poster')) {
  await page.evaluate(t => window.__loop.seek(t), Math.round(end + HOLD / 2));
  const p = join(out, name + '-poster.png');
  await box.screenshot({ path: p });
  written.push(p);
}
await browser.close();
await srv.close();

const input = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%05d.png')];
/* sRGB in, BT.709 out, tagged, so the hexes match the site in a browser */
const even = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
/* tag the frames themselves too: libx264 and libvpx take colour from the frame */
const tags = ',setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv';
const colour = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
if (formats.includes('mp4')) {
  const p = join(out, name + '.mp4');
  execFileSync('ffmpeg', [...input, '-vf', even + ':out_color_matrix=bt709:out_range=tv,format=yuv420p' + tags, '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation', ...colour, '-movflags', '+faststart', p]);
  written.push(p);
}
if (formats.includes('webm')) {
  const p = join(out, name + '.webm');
  execFileSync('ffmpeg', [...input, '-vf', even + ':out_color_matrix=bt709:out_range=tv,format=yuv420p' + tags, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '24', '-row-mt', '1', ...colour, p]);
  written.push(p);
}
if (formats.includes('gif')) {
  const p = join(out, name + '.gif');
  const gw = Math.min(W, 800);
  execFileSync('ffmpeg', [...input, '-vf', `fps=${Math.min(fps, 20)},scale=${gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`, p]);
  written.push(p);
  const mb = statSync(p).size / 1048576;
  if (mb > 3) console.log(`warn: the GIF is ${mb.toFixed(1)}MB; email wants under 3MB. Try --fps 15 or a smaller --w.`);
}
if (!args['keep-frames']) rmSync(frames, { recursive: true, force: true });

for (const p of written) console.log('wrote ' + relRoot(p) + '  ' + (statSync(p).size / 1048576).toFixed(2) + 'MB');
