#!/usr/bin/env node
// Capture studio scenes into Figma as editable layers, with Figma's html-to-design capture.
//
//   node capture.mjs <scene>=<captureId> [<scene>=<captureId> …] [--wait 9000] [--delay 2500]
//                    [--studio research/prototype/previews/studio] [--chrome <path>]
//
// Get one capture id per scene from the Figma MCP's generate_figma_design (fileKey, and the nodeId
// of the frame the layers go under), run this, then poll generate_figma_design with each id until
// it says completed. Each scene opens edge to edge in its poster state (?still=1&bare); the
// studio loads Figma's capture script only when the URL carries #figmacapture, and the script
// sends the stage (.ss-stage) as layers. Ids are single use.

import { spawnSync } from "node:child_process";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { launch, serve } from "./chrome.mjs";
import { parseArgs } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const pairs = args._.map((a) => a.split("="));
if (!pairs.length || pairs.some((p) => p.length !== 2)) {
  console.error("usage: node capture.mjs <scene>=<captureId> [<scene>=<captureId> …] [--wait 9000] [--delay 2500] [--studio <dir>] [--chrome <path>]");
  process.exit(1);
}
const studio = path.resolve(args.studio ?? "research/prototype/previews/studio");
const wait = Number(args.wait ?? 9000);
const delay = Number(args.delay ?? 2500);
if (!existsSync(path.join(studio, "node_modules"))) {
  console.error(`The studio has no packages yet: run npm install in ${studio}`);
  process.exit(1);
}

const dist = await fs.mkdtemp(path.join(os.tmpdir(), "studio-build-"));
const built = spawnSync(path.join(studio, "node_modules/.bin/vite"), ["build", "--logLevel", "warn", "--outDir", dist, "--emptyOutDir"], { cwd: studio, stdio: "inherit" });
if (built.status !== 0) process.exit(built.status ?? 1);
const server = await serve(dist);
const { page, close } = await launch({ chrome: args.chrome });
const STAGE = "document.querySelector('.ss-stage')";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  for (const [scene, id] of pairs) {
    const endpoint = `https://mcp.figma.com/mcp/capture/${id}/submit?bindVariables=true`;
    const base = `${server.url}?scene=${encodeURIComponent(scene)}&still=1&bare`;
    page.cdp.console.length = 0;
    page.cdp.errors.length = 0;
    // First at any size, to read the stage's own; then at that size, so the layers are 1:1
    await page.viewport(1200, 800, 1);
    await page.goto(base);
    const end = Date.now() + 15000;
    while (Date.now() < end && !(await page.evaluate(`!!(${STAGE} && !${STAGE}.hasAttribute('data-placing'))`))) await pause(50);
    const size = await page.evaluate(`(() => { const s = ${STAGE}; return { width: parseFloat(s.style.width), height: parseFloat(s.style.height) } })()`);
    await page.viewport(size.width, size.height, 1);
    const hash = `#figmacapture=${id}&figmaendpoint=${encodeURIComponent(endpoint)}&figmadelay=${delay}&figmaselector=${encodeURIComponent(".ss-stage")}`;
    // A new query, so the page reloads (a hash alone would only scroll) and loads the capture script
    await page.goto(`${base}&capture=1${hash}`);
    await pause(wait);
    const said = page.cdp.console.filter((m) => /figma|capture/i.test(m)).slice(-3);
    console.log(`${scene}: ${size.width} × ${size.height} sent to capture ${id}${said.length ? `  (${said.join(" | ")})` : ""}${page.cdp.errors.length ? `  ERRORS: ${page.cdp.errors.join(" | ")}` : ""}`);
  }
} finally {
  await close();
  await server.close();
  await fs.rm(dist, { recursive: true, force: true });
}
