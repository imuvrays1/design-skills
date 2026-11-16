// Headless Chrome over the DevTools protocol, with nothing to install: Node 22+'s built-in
// WebSocket and the Chrome (or Chromium) already on the machine. Also a small static server for a
// built studio. Shared by record.mjs and rehearse.mjs.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** The first browser found: an explicit path, $CHROME_PATH, Google Chrome, Chromium, Playwright's headless shell. */
export async function findChrome(explicit) {
  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
  if (existsSync(cache)) {
    const shells = (await fs.readdir(cache)).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse();
    for (const d of shells) for (const arch of ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64"]) candidates.push(path.join(cache, d, arch, "chrome-headless-shell"));
  }
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error("No Chrome or Chromium found. Pass --chrome <path> or set CHROME_PATH.");
  return found;
}

class CDP {
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error(`Could not connect to ${url}`));
    });
    return new CDP(ws);
  }
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.waiters = [];
    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, method } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === "Runtime.exceptionThrown") this.errors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text);
        if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) {
          this.console.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
        }
        this.waiters = this.waiters.filter((w) => !(w.method === msg.method && (!w.sessionId || w.sessionId === msg.sessionId) && (w.resolve(msg.params), true)));
      }
    };
    this.errors = [];
    this.console = [];
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
  }
  once(method, sessionId) {
    return new Promise((resolve) => this.waiters.push({ method, sessionId, resolve }));
  }
}

/** Start headless Chrome and open one page. Returns { cdp, session, page helpers, close }. */
export async function launch({ chrome } = {}) {
  const bin = await findChrome(chrome);
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), "preview-chrome-"));
  const flags = [
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--mute-audio",
    "--force-color-profile=srgb",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "about:blank",
  ];
  if (!bin.includes("headless-shell")) flags.unshift("--headless=new");
  const child = spawn(bin, flags, { stdio: ["ignore", "ignore", "pipe"] });
  const url = await new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error(`Chrome didn't start: ${buf.slice(-500)}`)), 20000);
    child.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    child.on("exit", (code) => reject(new Error(`Chrome exited (${code}): ${buf.slice(-500)}`)));
  });
  const cdp = await CDP.connect(url);
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  for (const domain of ["Page", "Runtime"]) await cdp.send(`${domain}.enable`, {}, sessionId);

  const page = {
    cdp,
    session: sessionId,
    async evaluate(expression) {
      const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
      if (exceptionDetails) throw new Error(`In the page: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
      return result.value;
    },
    async viewport(width, height, scale) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false }, sessionId);
    },
    async reducedMotion(on) {
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "no-preference" }] }, sessionId);
    },
    async goto(target) {
      const loaded = cdp.once("Page.loadEventFired", sessionId);
      await cdp.send("Page.navigate", { url: target }, sessionId);
      await loaded;
    },
    /** A PNG of a CSS-pixel rectangle, at the viewport's device scale. */
    async shoot(file, clip) {
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false, clip: { ...clip, scale: 1 } }, sessionId);
      await fs.writeFile(file, Buffer.from(data, "base64"));
    },
  };

  const close = async () => {
    try {
      await cdp.send("Browser.close");
    } catch {}
    child.kill();
    await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
  };
  return { page, close };
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json", ".woff2": "font/woff2" };

/** Serve a folder on 127.0.0.1 at a free port. Returns { url, close }. */
export async function serve(root) {
  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = path.join(root, rel);
      if (!file.startsWith(root)) throw new Error("outside");
      if ((await fs.stat(file).catch(() => null))?.isDirectory()) file = path.join(file, "index.html");
      const body = await fs.readFile(file);
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((r) => server.close(r)) };
}
