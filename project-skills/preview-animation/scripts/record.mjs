#!/usr/bin/env node
// Film a Stageshow scene from the studio to a web clip, frame-exact.
//
//   node record.mjs <scene> --out <dir> [--name cover] [--studio research/prototype/previews/studio]
//                   [--fps 60] [--scale 2] [--crf 27] [--webm-crf 36] [--no-webm] [--budget 600]
//                   [--max 20] [--keep-frames] [--chrome <path>]
//
// Builds the studio into a temporary folder, serves it, and opens ?scene=<scene>&record in headless Chrome.
// The studio installs Stageshow's virtual clock before anything loads, so here time moves only
// when this script steps it: one frame at a time, timers, animation frames and every CSS
// transition together. It records exactly one loop: from the frame where the script's first
// act.mark() appears until that mark comes round again. The poster is the scene's own `poster`
// state (?still=1, what reduced motion shows). Then it encodes MP4 and WebM, checks the loop, and
// writes a report, a contact sheet and a seam strip. Nothing to install beyond the studio's own
// packages: Node 22+, ffmpeg and the Chrome on the machine.

import { spawnSync } from "node:child_process";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { launch, serve } from "./chrome.mjs";
import { check, diff, encode, parseArgs, printReport, run, sampleFrames, sampleImage, sheets } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const scene = args._[0];
if (!scene || !args.out) {
  console.error("usage: node record.mjs <scene> --out <dir> [--name cover] [--studio <dir>] [--fps 60] [--scale 2] [--crf 27] [--webm-crf 36] [--no-webm] [--budget 600] [--max 20] [--keep-frames] [--chrome <path>]");
  process.exit(1);
}
const studio = path.resolve(args.studio ?? "research/prototype/previews/studio");
const out = path.resolve(args.out);
const name = args.name ?? "cover";
const fps = Number(args.fps ?? 60);
const scale = Number(args.scale ?? 2);
const maxFrames = Math.round(Number(args.max ?? 20) * fps);
const started = Date.now();

if (!existsSync(path.join(studio, "node_modules"))) {
  console.error(`The studio has no packages yet: run npm install in ${studio}`);
  process.exit(1);
}
// Each run builds into its own folder, so scenes can be recorded side by side.
const dist = await fs.mkdtemp(path.join(os.tmpdir(), "studio-build-"));
const built = spawnSync(path.join(studio, "node_modules/.bin/vite"), ["build", "--logLevel", "warn", "--outDir", dist, "--emptyOutDir"], { cwd: studio, stdio: "inherit" });
if (built.status !== 0) process.exit(built.status ?? 1);

await fs.mkdir(out, { recursive: true });
const frames = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-frames-`));
const server = await serve(dist);
const { page, close } = await launch({ chrome: args.chrome });
const at = (query) => `${server.url}?scene=${encodeURIComponent(scene)}${query}`;
const STAGE = "document.querySelector('.ss-stage')";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait (in real time) until a page expression is truthy. */
async function until(expression, ms, what) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await page.evaluate(`!!(${expression})`)) return;
    await pause(50);
  }
  throw new Error(`Timed out waiting for ${what}`);
}

let size, clip, count = 0, firstMark = null, reduced;
try {
  // The poster: the scene's own poster state, as reduced motion shows it. It also gives the stage's size.
  await page.viewport(1200, 800, scale);
  await page.goto(at("&still=1&bare"));
  await until(`${STAGE} && !${STAGE}.hasAttribute('data-placing')`, 15000, "the stage to place itself");
  size = await page.evaluate(`(() => { const s = ${STAGE}; return { width: parseFloat(s.style.width), height: parseFloat(s.style.height) } })()`);
  clip = { x: 0, y: 0, ...size };
  await page.viewport(size.width, size.height, scale);
  await page.goto(at("&still=1&bare"));
  await until(`${STAGE} && !${STAGE}.hasAttribute('data-placing')`, 15000, "the stage to place itself");
  await page.evaluate("document.fonts.ready.then(() => true)");
  await pause(800);
  const poster = path.join(out, `${name}-poster.png`);
  await page.shoot(poster, clip);

  // Reduced motion on the live scene: it should show that same poster and stay still.
  await page.reducedMotion(true);
  await page.goto(at("&bare"));
  await until(`${STAGE} && !${STAGE}.hasAttribute('data-placing')`, 15000, "the stage under reduced motion");
  await pause(700);
  await page.shoot(path.join(frames, "reduced-a.png"), clip);
  await pause(900);
  await page.shoot(path.join(frames, "reduced-b.png"), clip);
  await page.reducedMotion(false);
  const h = Math.round((96 * size.height) / size.width);
  const [ra, rb, rp] = await Promise.all(["reduced-a.png", "reduced-b.png"].map((f) => sampleImage(path.join(frames, f), 96, h)).concat(sampleImage(poster, 96, h)));
  reduced = { still: diff(ra, rb), poster: diff(ra, rp) };

  // The loop, on the stepped clock.
  page.cdp.console.length = 0;
  await page.goto(at(`&record&fps=${fps}`));
  await until(`window.__stageshow?.clock && ${STAGE}`, 15000, "the virtual clock and the stage");
  await page.evaluate("document.fonts.ready.then(() => true)");
  // One frame: placement first (the kit measures targets in layout frames, which move no time, as
  // the playground's driver does), then the frame itself, then any measuring it asked for.
  const step = `(async () => {
    const c = window.__stageshow.clock;
    for (let i = 0; i < 8 && c.layoutPending; i++) await c.flushLayout();
    await c.step(1);
    for (let i = 0; i < 8 && c.layoutPending; i++) await c.flushLayout();
    return ${STAGE}.getAttribute('data-mark');
  })()`;
  let mark = null;
  // Let it place itself and start its script: the first mark begins the loop.
  for (let i = 0; i < 10 * fps && !mark; i++) mark = await page.evaluate(step);
  if (!mark) throw new Error("The scene never set a mark. Start its script with a.mark('<first beat>') so the recorder can find the loop.");
  firstMark = mark;
  let sawOther = false;
  for (;;) {
    await page.shoot(path.join(frames, `${String(count).padStart(5, "0")}.png`), clip);
    count++;
    if (count % 30 === 0) process.stdout.write(`\r  frame ${count}`);
    if (count > maxFrames) throw new Error(`No loop within ${maxFrames / fps} s: does the script come back to its first mark ("${firstMark}")?`);
    mark = await page.evaluate(step);
    if (mark !== firstMark) sawOther = true;
    else if (sawOther) break;
  }
  process.stdout.write(`\r  ${count} frames, one loop of ${(count / fps).toFixed(2)} s from mark "${firstMark}"\n`);
} finally {
  await close();
  await server.close();
  await fs.rm(dist, { recursive: true, force: true });
}

const warnings = page.cdp.console.filter((m) => /stageshow|loop seam|target/i.test(m));
const errors = page.cdp.errors;
const { mp4, webm } = await encode({
  input: path.join(frames, "%05d.png"),
  inputArgs: ["-framerate", String(fps)],
  out,
  name,
  fps,
  crf: Number(args.crf ?? 27),
  webmCrf: Number(args["webm-crf"] ?? 36),
  webm: !args["no-webm"],
});
const poster = path.join(out, `${name}-poster.png`);
await run("ffmpeg", ["-y", "-v", "error", "-i", poster, "-q:v", "2", path.join(out, `${name}-poster.jpg`)]);

// Where the poster sits in the loop: the earliest frame that looks as much like it as any does.
// A held poster is many identical frames, and encoding noise alone would pick one at random.
const { frames: loop, w, h } = await sampleFrames(mp4);
const p = await sampleImage(poster, w, h);
const diffs = loop.map((f) => diff(f, p));
const closest = Math.min(...diffs);
const best = diffs.findIndex((d) => d <= closest + 0.15);
const posterMs = Math.round((best * 1000) / fps);

const report = await check({
  video: mp4,
  webm,
  poster,
  posterMs,
  budgetKB: Number(args.budget ?? 600),
  out,
  name,
  extra: [
    { name: "The poster is a frame of the loop", ok: diff(loop[best], p) <= 3, value: `closest at ${(posterMs / 1000).toFixed(2)} s, difference ${diff(loop[best], p).toFixed(2)}` },
    { name: "Reduced motion shows the poster, still", ok: reduced.still < 0.5 && reduced.poster < 1, value: `change over 0.9 s: ${reduced.still.toFixed(2)}; difference from the poster: ${reduced.poster.toFixed(2)}` },
    { name: "No Stageshow warnings or page errors", ok: warnings.length + errors.length === 0, value: [...warnings, ...errors].join(" | ").slice(0, 300) || "none" },
  ],
});
await sheets({ video: mp4, out, name });
if (args["keep-frames"]) console.log(`Frames kept in ${frames}`);
else await fs.rm(frames, { recursive: true, force: true });
printReport(report, out);
console.log(`Done in ${Math.round((Date.now() - started) / 1000)} s.`);
process.exit(report.passed ? 0 : 2);
