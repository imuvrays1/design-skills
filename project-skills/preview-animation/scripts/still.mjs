#!/usr/bin/env node
// Render studio scenes as still images: each scene's poster state, edge to edge, as a PNG.
// For figures UV reviews in Figma before anything moves, and for figures that stay still.
//
//   node still.mjs <scene> [<scene> …] --out <dir> [--scale 3] [--studio research/prototype/previews/studio]
//                  [--chrome <path>]
//
// Builds the studio once, serves it, and for each scene opens ?scene=<scene>&still=1&bare at the
// stage's own size and device scale --scale (3 by default, so a 550 px figure is 1,650 px wide).
// Writes <out>/<scene>.png and prints each one's size, with any page error or Stageshow warning.
// Rehearse a still first (rehearse.mjs <scene> -- --still --gate …): this only renders it.

import { spawnSync } from "node:child_process";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { launch, serve } from "./chrome.mjs";
import { parseArgs } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const scenes = args._;
if (!scenes.length || !args.out) {
  console.error("usage: node still.mjs <scene> [<scene> …] --out <dir> [--scale 3] [--studio <dir>] [--chrome <path>]");
  process.exit(1);
}
const studio = path.resolve(args.studio ?? "research/prototype/previews/studio");
const out = path.resolve(args.out);
const scale = Number(args.scale ?? 3);
if (!existsSync(path.join(studio, "node_modules"))) {
  console.error(`The studio has no packages yet: run npm install in ${studio}`);
  process.exit(1);
}

const dist = await fs.mkdtemp(path.join(os.tmpdir(), "studio-build-"));
const built = spawnSync(path.join(studio, "node_modules/.bin/vite"), ["build", "--logLevel", "warn", "--outDir", dist, "--emptyOutDir"], { cwd: studio, stdio: "inherit" });
if (built.status !== 0) process.exit(built.status ?? 1);
await fs.mkdir(out, { recursive: true });

const server = await serve(dist);
const { page, close } = await launch({ chrome: args.chrome });
const STAGE = "document.querySelector('.ss-stage')";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(expression, ms, what) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await page.evaluate(`!!(${expression})`)) return;
    await pause(50);
  }
  throw new Error(`Timed out waiting for ${what}`);
}

const done = [];
let failed = 0;
try {
  for (const scene of scenes) {
    const at = `${server.url}?scene=${encodeURIComponent(scene)}&still=1&bare`;
    page.cdp.console.length = 0;
    page.cdp.errors.length = 0;
    try {
      await page.viewport(1200, 800, scale);
      await page.goto(at);
      await until(`${STAGE} && !${STAGE}.hasAttribute('data-placing')`, 15000, `${scene} to place itself`);
      const size = await page.evaluate(`(() => { const s = ${STAGE}; return { width: parseFloat(s.style.width), height: parseFloat(s.style.height) } })()`);
      await page.viewport(size.width, size.height, scale);
      await page.goto(at);
      await until(`${STAGE} && !${STAGE}.hasAttribute('data-placing')`, 15000, `${scene} to place itself`);
      await page.evaluate("document.fonts.ready.then(() => true)");
      await pause(800);
      const file = path.join(out, `${scene}.png`);
      await page.shoot(file, { x: 0, y: 0, ...size });
      const warnings = page.cdp.console.filter((m) => /stageshow|target/i.test(m));
      const errors = page.cdp.errors;
      done.push({ scene, file: path.relative(process.cwd(), file), width: size.width, height: size.height, scale, warnings, errors });
      console.log(`${scene}: ${size.width} × ${size.height} at ${scale}× -> ${path.relative(process.cwd(), file)}${errors.length ? `  ERRORS: ${errors.join(" | ")}` : ""}${warnings.length ? `  warnings: ${warnings.join(" | ")}` : ""}`);
      if (errors.length) failed++;
    } catch (e) {
      failed++;
      console.log(`${scene}: FAILED ${e.message}`);
    }
  }
} finally {
  await close();
  await server.close();
  await fs.rm(dist, { recursive: true, force: true });
}
// stills.json beside the images: one entry per scene, merged with what earlier runs wrote
const index = path.join(out, "stills.json");
const before = JSON.parse(await fs.readFile(index, "utf8").catch(() => "[]"));
const merged = [...before.filter((e) => !done.some((d) => d.scene === e.scene)), ...done].sort((a, b) => a.scene.localeCompare(b.scene));
await fs.writeFile(index, JSON.stringify(merged, null, 2) + "\n");
process.exit(failed ? 1 : 0);
