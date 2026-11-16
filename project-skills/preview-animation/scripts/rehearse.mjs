#!/usr/bin/env node
// Rehearse a studio scene with Stageshow's own film.mjs: start the studio's dev server and run film
// against the scene with whatever flags you pass (contact sheets, --gate, --states, --still,
// --zoom, --reduced …; see the top of film.mjs).
//
//   node rehearse.mjs <scene> [--studio research/prototype/previews/studio] -- <film.mjs flags>
//   node rehearse.mjs rifa-portal -- --gate --every 300 --count 36 --width 960 --out /tmp/rifa-portal-film.png
//
// film.mjs lives in the installed stageshow skill (~/.claude/skills/stageshow, or $STAGESHOW) and
// needs that folder's packages: run `npm install` there once.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const split = process.argv.indexOf("--");
const own = process.argv.slice(2, split < 0 ? undefined : split);
const film = split < 0 ? [] : process.argv.slice(split + 1);
const scene = own.find((a) => !a.startsWith("--"));
const studioAt = own.indexOf("--studio");
const studio = path.resolve(studioAt >= 0 ? own[studioAt + 1] : "research/prototype/previews/studio");
const skill = process.env.STAGESHOW ?? path.join(os.homedir(), ".claude/skills/stageshow");
const filmScript = path.join(skill, "scripts/film.mjs");

if (!scene) {
  console.error("usage: node rehearse.mjs <scene> [--studio <dir>] -- <film.mjs flags>");
  process.exit(1);
}
if (!existsSync(filmScript)) {
  console.error(`No film.mjs at ${filmScript}. Install the stageshow skill, or set STAGESHOW to its folder.`);
  process.exit(1);
}
if (!existsSync(path.join(skill, "node_modules/playwright-core"))) {
  console.error(`film.mjs needs the stageshow skill's packages: run npm install in ${skill}`);
  process.exit(1);
}
// The Vite dev server, as Stageshow's playground runs: film.mjs tells the kit's CSS from the
// scene's by the file each rule comes from, which a production bundle merges away.
const { spawn } = await import("node:child_process");
const port = 5300 + Math.floor(Math.random() * 400);
const vite = spawn(path.join(studio, "node_modules/.bin/vite"), ["--port", String(port), "--strictPort"], { cwd: studio, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("The studio's dev server didn't start")), 30000);
  vite.stdout.on("data", (d) => { if (String(d).includes(String(port))) { clearTimeout(timer); resolve(); } });
});
const url = `http://127.0.0.1:${port}/?scene=${encodeURIComponent(scene)}`;
console.log(`Filming ${url}`);
const child = spawn(process.execPath, [filmScript, url, ...film], { stdio: "inherit" });
const code = await new Promise((r) => child.on("close", r));
vite.kill();
process.exit(code ?? 1);
