#!/usr/bin/env node
// Turn a screen recording into a web loop: trim, cover what can't be shown, crop, fit the cover's
// shape, cross-fade the end into the start so the loop point can't be seen, encode, take the
// poster, and check it.
//
//   node clip.mjs <recording> --out <dir> [--name cover] [--from 2.4] [--to 10.4]
//                 [--cover x:y:w:h[:#hex]]... [--crop w:h:x:y] [--size 1920x1200] [--field #f4f4f3]
//                 [--seam 0.5] [--speed 1] [--fps 30] [--poster 1.2] [--crf 23] [--no-webm] [--budget 1500]
//
// Coordinates for --cover and --crop are in the recording's own pixels (measure them on a still:
// `ffmpeg -ss 3 -i rec.mov -frames:v 1 still.png`). --cover paints a solid box (a blur can be
// undone; a box can't). --seam is the cross-fade length in seconds (0 for a hard loop, when the
// recording already ends on its first frame). --poster is a time in the finished loop.

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { check, encode, parseArgs, printReport, probe, run, sheets } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2), ["cover"]);
const input = args._[0];
if (!input || !args.out) {
  console.error("usage: node clip.mjs <recording> --out <dir> [--name cover] [--from s] [--to s] [--cover x:y:w:h[:#hex]]... [--crop w:h:x:y] [--size 1920x1200] [--field #f4f4f3] [--seam 0.5] [--speed 1] [--fps 30] [--poster s] [--crf 23] [--no-webm] [--budget 1500]");
  process.exit(1);
}

const out = path.resolve(args.out);
const name = args.name ?? "cover";
const fps = Number(args.fps ?? 30);
const speed = Number(args.speed ?? 1);
const seam = Number(args.seam ?? 0.5);
const field = (args.field ?? "#f4f4f3").replace("#", "0x");
const [W, H] = String(args.size ?? "1920x1200").split("x").map(Number);
const src = await probe(path.resolve(input));
const from = Number(args.from ?? 0);
const to = Number(args.to ?? src.duration);
const length = (to - from) / speed;

if (length < 2 * seam + 1) throw new Error(`The trimmed clip (${length.toFixed(2)} s) is too short for a ${seam} s seam.`);

// Covers first (in the recording's pixels), then crop, then fit the stage with the field colour.
const shape = [];
for (const c of args.cover ?? []) {
  const [x, y, w, h, colour = "#ffffff"] = String(c).split(":");
  shape.push(`drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${colour.replace("#", "0x")}@1:t=fill`);
}
if (args.crop) {
  const [cw, ch, cx, cy] = String(args.crop).split(":");
  shape.push(`crop=${cw}:${ch}:${cx}:${cy}`);
}
shape.push(`scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos`);
shape.push(`pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${field}`);
shape.push(`fps=${fps}`);
const base = `trim=start=${from}:end=${to},setpts=(PTS-STARTPTS)/${speed},${shape.join(",")}`;

// The seam: start the loop `seam` seconds in, and cross-fade the clip's end into its first
// `seam` seconds, so the last frame flows into the first.
const graph =
  seam > 0
    ? `[0:v]${base},split[a][b];` +
      `[a]trim=start=${seam},setpts=PTS-STARTPTS[body];` +
      `[b]trim=end=${seam},setpts=PTS-STARTPTS[head];` +
      `[body][head]xfade=transition=fade:duration=${seam}:offset=${(length - 2 * seam).toFixed(3)},format=rgb24[v]`
    : `[0:v]${base},format=rgb24[v]`;

await fs.mkdir(out, { recursive: true });
const work = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-clip-`));
const master = path.join(work, "master.mkv");
// A lossless intermediate, so the MP4 and WebM are each encoded once from the same frames.
await run("ffmpeg", ["-y", "-v", "error", "-i", path.resolve(input), "-filter_complex", graph, "-map", "[v]", "-an", "-c:v", "ffv1", master]);

const loopLength = seam > 0 ? length - seam : length;
const posterAt = Math.min(loopLength - 1 / fps, Number(args.poster ?? 0));
const poster = path.join(out, `${name}-poster.png`);
await run("ffmpeg", ["-y", "-v", "error", "-ss", String(posterAt), "-i", master, "-frames:v", "1", "-update", "1", poster]);
await run("ffmpeg", ["-y", "-v", "error", "-i", poster, "-q:v", "2", path.join(out, `${name}-poster.jpg`)]);

const { mp4, webm } = await encode({
  input: master,
  out,
  name,
  fps,
  crf: Number(args.crf ?? 23),
  webmCrf: Number(args["webm-crf"] ?? 34),
  webm: !args["no-webm"],
});

const report = await check({ video: mp4, webm, poster, posterMs: posterAt * 1000, budgetKB: Number(args.budget ?? 1500), out, name });
await sheets({ video: mp4, out, name });
await fs.rm(work, { recursive: true, force: true });
printReport(report, out);
console.log(`Loop: ${loopLength.toFixed(2)} s from ${from}–${to} s of the recording${speed !== 1 ? ` at ${speed}×` : ""}${seam > 0 ? `, ${seam} s cross-fade at the seam` : ""}.`);
process.exit(report.passed ? 0 : 2);
