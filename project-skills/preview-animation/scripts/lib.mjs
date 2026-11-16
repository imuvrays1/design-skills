// Shared by render.mjs and clip.mjs: running ffmpeg, encoding, and checking a finished loop.
// Needs only Node 22+ and ffmpeg/ffprobe on the PATH.

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

/** Run a command; resolve with its output, reject with its stderr when it fails. */
export function run(cmd, args, { quiet = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    let err = "";
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => {
      err += d;
      if (!quiet) process.stderr.write(d);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout: Buffer.concat(out), stderr: err });
      else reject(new Error(`${cmd} ${args.join(" ")}\n${err.slice(-2000)}`));
    });
  });
}

/** Read the parsed command-line flags: `--key value`, `--flag`, repeated keys collect into arrays. */
export function parseArgs(argv, repeatable = []) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      args._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    const value = next === undefined || next.startsWith("--") ? true : (i++, next);
    if (repeatable.includes(key)) (args[key] ??= []).push(value);
    else args[key] = value;
  }
  return args;
}

/** Colour tags for SDR web video. Without them ffmpeg converts RGB with the BT.601 matrix while
 * browsers decode HD with BT.709, which shifts every colour a little (oranges go red, greens go
 * blue). Convert and tag with BT.709 so the field colour survives the trip. */
export const COLOUR = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
export const TO_YUV =
  "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";

/** Encode the web loop: H.264 MP4 (every browser) and, unless skipped, VP9 WebM (often smaller). */
export async function encode({ input, inputArgs = [], filter, out, name, fps, crf = 23, webmCrf = 34, webm = true }) {
  const vf = filter ? `${filter},${TO_YUV}` : TO_YUV;
  const mp4 = path.join(out, `${name}.mp4`);
  await run("ffmpeg", [
    "-y", "-hide_banner", ...inputArgs, "-i", input,
    "-vf", vf, "-r", String(fps),
    "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", String(crf),
    "-profile:v", "high", ...COLOUR, "-movflags", "+faststart", "-an", mp4,
  ]);
  let webmPath = null;
  if (webm) {
    webmPath = path.join(out, `${name}.webm`);
    await run("ffmpeg", [
      "-y", "-hide_banner", ...inputArgs, "-i", input,
      "-vf", vf, "-r", String(fps),
      "-c:v", "libvpx-vp9", "-crf", String(webmCrf), "-b:v", "0", "-row-mt", "1",
      "-deadline", "good", "-cpu-used", "2", ...COLOUR, "-an", webmPath,
    ]);
  }
  return { mp4, webm: webmPath };
}

/** What the browser will get: size, length, frame rate, codec, audio, colour tags, index position. */
export async function probe(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  const info = JSON.parse(stdout.toString());
  const v = info.streams.find((s) => s.codec_type === "video");
  const [n, d] = (v.avg_frame_rate || v.r_frame_rate || "0/1").split("/").map(Number);
  const head = await fs.readFile(file).then((b) => b.subarray(0, 256 * 1024));
  const moov = head.indexOf("moov"), mdat = head.indexOf("mdat");
  return {
    width: v.width,
    height: v.height,
    duration: Number(info.format.duration),
    fps: d ? n / d : 0,
    codec: v.codec_name,
    profile: v.profile,
    pixFmt: v.pix_fmt,
    bytes: Number(info.format.size),
    kbps: Math.round(Number(info.format.bit_rate) / 1000),
    audio: info.streams.some((s) => s.codec_type === "audio"),
    colour: [v.color_space, v.color_primaries, v.color_transfer, v.color_range].join("/"),
    faststart: file.endsWith(".mp4") ? moov >= 0 && (mdat < 0 || moov < mdat) : null,
  };
}

/** Every frame of a video as small RGB images (96 px wide), for comparing frames by number. */
export async function sampleFrames(file, width = 96) {
  const meta = await probe(file);
  const w = width;
  const h = Math.max(2, Math.round((meta.height * w) / meta.width / 2) * 2);
  // To RGB at full size first, as a browser decodes it, then shrink: averaging in YUV skews colour.
  const { stdout } = await run("ffmpeg", ["-v", "error", "-i", file, "-vf", `format=rgb24,scale=${w}:${h}:flags=area`, "-f", "rawvideo", "-"]);
  const size = w * h * 3;
  const frames = [];
  for (let o = 0; o + size <= stdout.length; o += size) frames.push(stdout.subarray(o, o + size));
  return { frames, w, h, meta };
}

/** One image file as the same small RGB sample. */
export async function sampleImage(file, w, h) {
  const { stdout } = await run("ffmpeg", ["-v", "error", "-i", file, "-vf", `format=rgb24,scale=${w}:${h}:flags=area`, "-frames:v", "1", "-f", "rawvideo", "-"]);
  return stdout;
}

/** Mean absolute difference between two samples, 0–255. Under ~1 is invisible; over ~10 is a cut. */
export function diff(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

/** The largest gap between two samples' average red, green and blue. A colour-matrix mistake moves
 * the averages; compression noise around text doesn't. */
function colourShift(a, b) {
  const avg = (f) => [0, 1, 2].map((c) => {
    let s = 0;
    for (let i = c; i < f.length; i += 3) s += f[i];
    return s / (f.length / 3);
  });
  const [x, y] = [avg(a), avg(b)];
  return Math.max(...x.map((v, i) => Math.abs(v - y[i])));
}

function luminance(f) {
  let s = 0;
  for (let i = 0; i < f.length; i += 3) s += 0.2126 * f[i] + 0.7152 * f[i + 1] + 0.0722 * f[i + 2];
  return s / (f.length / 3) / 255;
}

const round = (x, p = 2) => Math.round(x * 10 ** p) / 10 ** p;

/**
 * Check a finished loop the way a reader meets it: the seam, the biggest jumps, whether the poster
 * is a held frame, flashes, colour after encoding, weight and format. Returns the report object.
 */
export async function check({ video, webm, poster, posterMs, budgetKB, out, name, extra = [] }) {
  const meta = await probe(video);
  const { frames, w, h } = await sampleFrames(video);
  const fps = meta.fps || 30;
  const steps = frames.slice(1).map((f, i) => diff(f, frames[i]));
  const sorted = [...steps].sort((a, b) => a - b);
  const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
  const seam = diff(frames.at(-1), frames[0]);
  const seamLimit = Math.max(1.5, 1.5 * p75);
  const jumps = steps
    .map((d, i) => ({ at: round((i + 1) / fps, 2), d: round(d) }))
    .sort((a, b) => b.d - a.d)
    .slice(0, 3);

  // A poster is held when nothing changes for a tenth of a second either side of it.
  let posterHeld = null;
  if (posterMs != null) {
    const i = Math.min(frames.length - 1, Math.round((posterMs / 1000) * fps));
    const around = [-3, -2, -1, 1, 2, 3].map((k) => frames[i + k]).filter(Boolean);
    posterHeld = round(Math.max(...around.map((f) => diff(f, frames[i]))));
  }

  // Flashes: big swings in overall brightness between frames (WCAG 2.3.1 allows at most 3 a second).
  const lum = frames.map(luminance);
  const swings = lum.slice(1).map((l, i) => Math.abs(l - lum[i]) > 0.1);
  let flashesPerSecond = 0;
  for (let i = 0; i < swings.length; i++) {
    const windowed = swings.slice(i, i + Math.round(fps)).filter(Boolean).length;
    flashesPerSecond = Math.max(flashesPerSecond, windowed);
  }

  // Colour: the encoded poster frame against the lossless poster image.
  let colour = null;
  if (poster) {
    const i = Math.min(frames.length - 1, Math.round(((posterMs ?? 0) / 1000) * fps));
    colour = round(colourShift(await sampleImage(poster, w, h), frames[i]));
  }

  const webmMeta = webm ? await probe(webm) : null;
  const posterBytes = poster ? (await fs.stat(poster)).size : null;
  const kb = (b) => Math.round(b / 1024);

  const checks = [
    { name: "Length 4–10 s", ok: meta.duration >= 3.9 && meta.duration <= 10.1, value: `${round(meta.duration)} s` },
    { name: "Seam invisible", ok: seam <= seamLimit, value: `${round(seam)} (limit ${round(seamLimit)}; a normal step here is ≤ ${round(p75)})` },
    { name: "Poster is a held frame", ok: posterHeld == null ? null : posterHeld <= 1, value: posterHeld == null ? "no poster time given" : `max change ±100 ms: ${posterHeld}` },
    { name: "No flashes (≤ 3 a second)", ok: flashesPerSecond <= 3, value: `${flashesPerSecond} in the worst second` },
    { name: "Colour survives encoding", ok: colour == null ? null : colour <= 1.5, value: colour == null ? "no poster to compare" : `average colour moved by ${colour} (of 255)` },
    { name: "Silent (no audio track)", ok: !meta.audio, value: meta.audio ? "has audio" : "none" },
    { name: "Index at the front (faststart)", ok: meta.faststart, value: String(meta.faststart) },
    { name: `MP4 within ${budgetKB} KB`, ok: meta.bytes <= budgetKB * 1024, value: `${kb(meta.bytes)} KB, ${meta.kbps} kb/s` },
    ...extra,
  ];

  const report = {
    name,
    video: path.basename(video),
    size: `${meta.width}×${meta.height}`,
    fps: round(meta.fps),
    frames: frames.length,
    codec: `${meta.codec} ${meta.profile ?? ""}`.trim(),
    colourTags: meta.colour,
    mp4KB: kb(meta.bytes),
    webmKB: webmMeta ? kb(webmMeta.bytes) : null,
    posterKB: posterBytes ? kb(posterBytes) : null,
    biggestJumps: jumps,
    checks,
    passed: checks.every((c) => c.ok !== false),
  };

  const lines = [
    `# ${name}: loop check`,
    "",
    `${report.video}: ${report.size}, ${report.fps} fps, ${report.frames} frames, ${report.codec}, colour ${report.colourTags}.`,
    `Weights: MP4 ${report.mp4KB} KB${report.webmKB != null ? `, WebM ${report.webmKB} KB` : ""}${report.posterKB != null ? `, poster ${report.posterKB} KB` : ""}.`,
    `Biggest frame-to-frame changes (look at these moments): ${jumps.map((j) => `${j.at} s (${j.d})`).join(", ")}.`,
    "",
    "| Check | Result | Value |",
    "| --- | --- | --- |",
    ...checks.map((c) => `| ${c.name} | ${c.ok === null ? "–" : c.ok ? "pass" : "**fail**"} | ${c.value} |`),
    "",
    report.passed ? "All checks pass. Now look at contact.png and seam.png at full size." : "Fix the failed checks, then render again.",
    "",
  ];
  await fs.writeFile(path.join(out, `${name}-report.md`), lines.join("\n"));
  await fs.writeFile(path.join(out, `${name}-report.json`), JSON.stringify(report, null, 2));
  return report;
}

/** A contact sheet (12 evenly spaced frames) and a seam strip (the last three frames, then the first three). */
export async function sheets({ video, out, name }) {
  const meta = await probe(video);
  const n = Math.round(meta.duration * meta.fps);
  const every = Math.max(1, Math.floor(n / 12));
  await run("ffmpeg", [
    "-y", "-v", "error", "-i", video,
    "-vf", `select='not(mod(n\\,${every}))',scale=480:-2:flags=lanczos,tile=4x3:padding=8:margin=8:color=white`,
    "-frames:v", "1", "-update", "1", path.join(out, `${name}-contact.png`),
  ]);
  await run("ffmpeg", [
    "-y", "-v", "error", "-i", video, "-i", video,
    "-filter_complex",
    `[0:v]select='gte(n\\,${n - 3})',scale=360:-2:flags=lanczos,tile=3x1:padding=4:color=white[a];` +
      `[1:v]select='lt(n\\,3)',scale=360:-2:flags=lanczos,tile=3x1:padding=4:color=white[b];[a][b]hstack`,
    "-frames:v", "1", "-update", "1", path.join(out, `${name}-seam.png`),
  ]);
  return { contact: `${name}-contact.png`, seam: `${name}-seam.png`, everyFrames: every, fps: meta.fps };
}

export function printReport(report, out) {
  console.log(`\n${report.name}: ${report.size}, ${report.fps} fps, MP4 ${report.mp4KB} KB${report.webmKB != null ? `, WebM ${report.webmKB} KB` : ""}`);
  for (const c of report.checks) console.log(`  ${c.ok === null ? "–" : c.ok ? "✓" : "✗"} ${c.name}: ${c.value}`);
  console.log(`\nFiles in ${out}`);
}
