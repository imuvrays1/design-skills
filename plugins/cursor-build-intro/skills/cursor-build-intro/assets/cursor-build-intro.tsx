"use client";

// Cursor build intro: the page opens as a blank design canvas, and a few labelled multiplayer cursors
// build it like a team in a design tool. Each draws a part of the page as a frame (press, drag corner
// to corner with a live W × H badge) or types a line of text with an I-beam, and the real page shows
// through where it has been drawn. When everything is drawn the cursors fly off and the canvas fades.
//
// One <canvas> over the page, redrawn each frame. It never changes the page's elements, it only
// measures them, so it can sit on top of any layout. Frames follow each element's real outline on
// screen, so 3D-turned cards are drawn on their own slant; outlines are white while drawn, take on the
// element's colour (`data-tint="#rrggbb"` on it) as it shows through, then fade; an outline passes
// behind elements stacked in front of it. A scroll, click, key or resize skips it; it does
// not run with prefers-reduced-motion. No dependencies beyond React.
//
// Usage:
//   <CursorBuildIntro parts={[{ selector: ".hero-card", limit: 5 }, { selector: "header" },
//     { selector: "h1", kind: "text" }]} />

import * as React from "react";

type Ease = readonly [number, number, number, number];

export interface IntroPart {
  /** CSS selector. Every visible match becomes a part, in document order (or centre-out with `limit`). */
  selector: string;
  /** "frame": drawn as a dragged rectangle. "text": typed out left to right with an I-beam. */
  kind?: "frame" | "text";
  /** Corner radius of the revealed area, px. Match the element's own radius. */
  radius?: number;
  /** Take at most this many matches, the ones nearest the horizontal centre first. */
  limit?: number;
}

export interface IntroAgent {
  /** Name tag next to the cursor. */
  name: string;
  /** Cursor and tag colour. */
  fill: string;
  /** Tag text colour (must contrast with `fill`). */
  ink: string;
}

export interface CursorBuildIntroProps {
  parts: IntroPart[];
  agents?: IntroAgent[];
  /** The blank canvas: usually the page background. */
  canvasColor?: string;
  /** Dot-grid colour; "transparent" for a plain canvas. */
  dotColor?: string;
  /** Font for tags and badges (the site's UI font). */
  font?: string;
  /** Play once per browser session (sessionStorage key), or every visit when omitted. */
  onceKey?: string;
  /**
   * Wait for this window event before starting (for example a preloader announcing it is opening).
   * Starts anyway after `waitTimeout` ms. Omit to start on mount.
   */
  waitForEvent?: string;
  /** Only wait when this selector matches a displayed element (the preloader). */
  waitWhileVisible?: string;
  waitTimeout?: number;
  /** Speed multiplier for every duration (1 = default, 0.8 = faster). */
  pace?: number;
  /** z-index of the canvas; keep it under any preloader and over the page chrome. */
  zIndex?: number;
  /**
   * Don't play when it would start later than this after the page began loading, ms: on a slow
   * connection the visitor has waited enough, so the page shows straight away.
   */
  late?: number;
}

const DEFAULT_AGENTS: IntroAgent[] = [
  { name: "Product", fill: "#ffffff", ink: "#111111" },
  { name: "Brand", fill: "#ff4400", ink: "#ffffff" },
  { name: "Web", fill: "#fff569", ink: "#111111" },
  { name: "Motion", fill: "#9c9c9c", ink: "#111111" },
];

/** Durations, seconds. */
const T = {
  enter: 0.45,
  travel: 0.42,
  press: 0.08,
  drag: 0.38,
  open: 0.3,
  line: 0.45,
  char: 0.04,
  rest: 0.3,
  leave: 0.6,
  fade: 0.5,
  skip: 0.3,
};
const TRAVEL: Ease = [0.8, 0, 0.2, 1];
const DRAG: Ease = [0.27, 0, 0.51, 1];
const FADE: Ease = [0.12, 0.23, 0.5, 1];
const GRID = 16;
const ARROW = "M0 0 L0 15.5 L4.2 11.6 L7 18 L9.6 16.9 L6.9 10.6 L12.4 10.6 Z";
/** Set on <html> while building, so carousels or autoplay can hold still (check it in their loop). */
export const BUILDING_ATTRIBUTE = "data-building";

function bezier([x1, y1, x2, y2]: Ease, t: number) {
  const curve = (a: number, b: number, s: number) => 3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (curve(x1, x2, mid) < t) lo = mid;
    else hi = mid;
  }
  return curve(y1, y2, (lo + hi) / 2);
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Point = readonly [number, number];
/** Corners on screen: top-left, top-right, bottom-right, bottom-left. */
type Quad = readonly [Point, Point, Point, Point];
interface Part extends Box {
  kind: "frame" | "text";
  radius: number;
  quad: Quad;
  /** Its size as laid out, for the badge. */
  label: string;
  /** Stacking order, so outlines pass behind parts in front. */
  z: number;
  /** Outline colour once the part shows through. */
  rgb: [number, number, number];
}
interface Hole extends Part {
  open: number;
  typed: number;
  line: number;
}
interface Agent extends IntroAgent {
  x: number;
  y: number;
  shape: "arrow" | "beam";
  press: number;
  draft: { quad: Quad; label: string; z: number } | { caret: Box } | null;
  alpha: number;
}

function visible(el: Element): Box | null {
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  if (r.width < 4 || r.height < 4 || s.display === "none" || s.visibility === "hidden") return null;
  if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return null;
  // Clamped to the viewport, so the cursors never drag off screen.
  const x = Math.max(4, r.left);
  const y = Math.max(4, r.top);
  return { x, y, w: Math.min(innerWidth - 4, r.right) - x, h: Math.min(innerHeight - 4, r.bottom) - y };
}

/**
 * An element's corners on screen. A 3D-turned element's bounding box is only the rectangle round it,
 * so four 1px probes go in its corners for a moment and are read back: the browser projects them like
 * the element. A flat element's corners are its box's. (A transformed element is always the probes'
 * containing block.)
 */
function corners(el: HTMLElement): Quad {
  if (getComputedStyle(el).transform === "none") {
    const r = el.getBoundingClientRect();
    return [
      [r.left, r.top],
      [r.right, r.top],
      [r.right, r.bottom],
      [r.left, r.bottom],
    ];
  }
  const probes = ["0% 0%", "100% 0%", "100% 100%", "0% 100%"].map((at) => {
    const [left, top] = at.split(" ");
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;left:${left};top:${top};width:1px;height:1px;margin:-0.5px;pointer-events:none;`;
    el.append(probe);
    return probe;
  });
  const quad = probes.map((probe) => {
    const r = probe.getBoundingClientRect();
    return [(r.left + r.right) / 2, (r.top + r.bottom) / 2] as const;
  }) as unknown as Quad;
  for (const probe of probes) probe.remove();
  return quad;
}

/** `data-tint="#rrggbb"` on the element, lifted a little towards white; white when absent. */
function tintOf(el: HTMLElement): [number, number, number] {
  const hex = el.dataset.tint;
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return [255, 255, 255];
  return [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.85 + 255 * 0.15)) as [number, number, number];
}

function measure(config: IntroPart[]): Part[] {
  const parts: Part[] = [];
  for (const { selector, kind = "frame", radius = 6, limit } of config) {
    let found = [...document.querySelectorAll<HTMLElement>(selector)]
      .map((el) => ({ el, box: visible(el) }))
      .filter((p): p is { el: HTMLElement; box: Box } => !!p.box && p.box.w > 12);
    if (limit) {
      const middle = innerWidth / 2;
      found = found
        .sort((a, b) => Math.abs(a.box.x + a.box.w / 2 - middle) - Math.abs(b.box.x + b.box.w / 2 - middle))
        .slice(0, limit);
    }
    for (const { el, box } of found) {
      const z = Number.parseInt(getComputedStyle(el).zIndex, 10);
      const flat: Quad = [
        [box.x, box.y],
        [box.x + box.w, box.y],
        [box.x + box.w, box.y + box.h],
        [box.x, box.y + box.h],
      ];
      parts.push({
        ...box,
        kind,
        radius,
        quad: kind === "frame" ? corners(el) : flat,
        label: `${Math.round(el.offsetWidth || box.w)} × ${Math.round(el.offsetHeight || box.h)}`,
        z: Number.isNaN(z) ? 0 : z,
        rgb: tintOf(el),
      });
    }
  }
  return parts;
}

function roundRect(c: CanvasRenderingContext2D, { x, y, w, h }: Box, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

/** A four-cornered outline with rounded corners; `fresh` false appends it to the current path. */
function quadPath(c: CanvasRenderingContext2D, quad: Quad, r: number, fresh = true) {
  if (fresh) c.beginPath();
  const mid = (a: Point, b: Point) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  const start = mid(quad[3], quad[0]);
  c.moveTo(start[0], start[1]);
  for (let i = 0; i < 4; i++) {
    const p = quad[i]!;
    const next = quad[(i + 1) % 4]!;
    c.arcTo(p[0], p[1], next[0], next[1], Math.min(r, Math.hypot(next[0] - p[0], next[1] - p[1]) / 2));
  }
  c.closePath();
}

/** The quad grown from its first corner: u 0 is a point, 1 the whole outline. */
function grow(quad: Quad, u: number): Quad {
  const [ox, oy] = quad[0];
  return quad.map(([x, y]) => [ox + (x - ox) * u, oy + (y - oy) * u] as const) as unknown as Quad;
}

export default function CursorBuildIntro({
  parts,
  agents: agentConfig = DEFAULT_AGENTS,
  canvasColor = "#0e1011",
  dotColor = "rgba(255, 255, 255, 0.07)",
  font = "Inter, system-ui, sans-serif",
  onceKey,
  waitForEvent,
  waitWhileVisible,
  waitTimeout = 4000,
  pace = 1,
  zIndex = 50,
  late = 6500,
}: CursorBuildIntroProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [done, setDone] = React.useState(false);
  const config = React.useRef({ parts, agentConfig, canvasColor, dotColor, font, pace });

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { parts, agentConfig, canvasColor, dotColor, font, pace } = config.current;
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setDone(true);
    if (onceKey) {
      try {
        if (sessionStorage.getItem(onceKey) === "1") return setDone(true);
      } catch {}
    }
    const mounted = Date.now();
    // Marked played only after a real run, not on React's instant development remount.
    const played = () => {
      if (!onceKey || Date.now() - mounted < 500) return;
      try {
        sessionStorage.setItem(onceKey, "1");
      } catch {}
      root.setAttribute("data-intro-seen", "");
    };
    const c = canvas.getContext("2d");
    if (!c) return setDone(true);
    root.setAttribute(BUILDING_ATTRIBUTE, "");

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = innerWidth;
    const H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const tile = document.createElement("canvas");
    tile.width = tile.height = GRID * dpr;
    const tc = tile.getContext("2d")!;
    tc.fillStyle = canvasColor;
    tc.fillRect(0, 0, tile.width, tile.height);
    tc.fillStyle = dotColor;
    tc.beginPath();
    tc.arc(GRID * dpr * 0.5, GRID * dpr * 0.5, dpr, 0, Math.PI * 2);
    tc.fill();
    const grid = c.createPattern(tile, "repeat")!;
    const arrow = new Path2D(ARROW);

    const holes: Hole[] = [];
    let fade = 1;
    let finished = false;
    const starts = [
      [-30, H * 0.3],
      [W + 30, H * 0.25],
      [W * 0.3, H + 30],
      [W * 0.75, H + 30],
    ];
    const agents: Agent[] = agentConfig.map((a, i) => ({
      ...a,
      x: starts[i % 4]![0]!,
      y: starts[i % 4]![1]!,
      shape: "arrow",
      press: 0,
      draft: null,
      alpha: 1,
    }));

    let now = 0;
    function* tween(seconds: number, curve: Ease | null, step: (u: number) => void) {
      const start = now;
      const span = seconds * pace;
      for (;;) {
        const u = span <= 0 ? 1 : Math.min(1, (now - start) / 1000 / span);
        step(curve ? bezier(curve, u) : u);
        if (u >= 1) return;
        yield;
      }
    }
    function* moveTo(agent: Agent, x: number, y: number, seconds: number) {
      const fx = agent.x;
      const fy = agent.y;
      const len = Math.hypot(x - fx, y - fy) || 1;
      // A slight arc, so the cursors don't glide on rails.
      const bend = len * 0.12 * (agent.name.length % 2 ? 1 : -1);
      yield* tween(seconds, TRAVEL, (u) => {
        const arc = Math.sin(u * Math.PI) * bend;
        agent.x = fx + (x - fx) * u + (-(y - fy) / len) * arc;
        agent.y = fy + (y - fy) * u + ((x - fx) / len) * arc;
      });
    }
    function* click(agent: Agent, down: boolean) {
      yield* tween(T.press, null, (u) => (agent.press = down ? u : 1 - u));
    }

    let queue: Part[] = [];
    const running = new Set<Iterator<void>>();

    function* work(agent: Agent, index: number): Generator<void> {
      yield* tween(index * 0.08, null, () => {});
      let first = true;
      for (let part = queue.shift(); part; part = queue.shift()) {
        const travel = first ? T.enter : T.travel;
        first = false;
        if (part.kind === "frame") {
          // From the outline's first corner to the opposite one, on the element's own slant.
          agent.shape = "arrow";
          const p = part;
          const [from, , to] = p.quad;
          yield* moveTo(agent, from[0], from[1], travel);
          yield* click(agent, true);
          const draft = { quad: grow(p.quad, 0), label: p.label, z: p.z };
          agent.draft = draft;
          yield* tween(T.drag, DRAG, (u) => {
            draft.quad = grow(p.quad, u);
            agent.x = from[0] + (to[0] - from[0]) * u;
            agent.y = from[1] + (to[1] - from[1]) * u;
          });
          yield* click(agent, false);
          agent.draft = null;
          const hole: Hole = { ...part, open: 0, typed: 1, line: 1 };
          holes.push(hole);
          // The page shows through while the white outline takes the element's colour, then it fades.
          running.add(
            (function* () {
              yield* tween(T.open, FADE, (u) => (hole.open = u));
              yield* tween(T.line, FADE, (u) => (hole.line = 1 - u));
            })(),
          );
        } else {
          agent.shape = "beam";
          yield* moveTo(agent, part.x, part.y + part.h / 2, travel);
          yield* click(agent, true);
          const hole: Hole = { ...part, open: 1, typed: 0, line: 0 };
          const caret = { x: part.x, y: part.y, w: 0, h: part.h };
          agent.draft = { caret };
          yield* click(agent, false);
          holes.push(hole);
          const chars = Math.max(4, Math.round(part.w / 9));
          const p = part;
          yield* tween(chars * T.char, null, (u) => {
            hole.typed = Math.round(u * chars) / chars;
            caret.x = p.x + p.w * hole.typed;
            caret.w = hole.typed;
            agent.x = caret.x + 6;
          });
          agent.draft = null;
          agent.shape = "arrow";
        }
      }
    }

    const scripts = new Map<Agent, Iterator<void>>(agents.map((a, i) => [a, work(a, i)]));
    let leaving: Iterator<void> | null = null;

    function* leave(): Generator<void> {
      yield* tween(T.rest, null, () => {});
      const from = agents.map((a) => [a.x, a.y] as const);
      const to = agents.map((a) => [a.x + (a.x < W / 2 ? -1 : 1) * W * 0.35, a.y + H * 0.15] as const);
      yield* tween(T.leave, TRAVEL, (u) =>
        agents.forEach((a, i) => {
          a.x = from[i]![0] + (to[i]![0] - from[i]![0]) * u;
          a.y = from[i]![1] + (to[i]![1] - from[i]![1]) * u;
          a.alpha = 1 - u;
        }),
      );
    }

    const finish = (seconds: number) => {
      if (finished) return;
      finished = true;
      root.removeAttribute(BUILDING_ATTRIBUTE);
      const from = fade;
      running.add(
        tween(seconds, FADE, (u) => {
          fade = from * (1 - u);
          agents.forEach((a) => (a.alpha = Math.min(a.alpha, 1 - u)));
        }),
      );
    };

    /** Clips out drawn parts in front of `z`, so an outline passes behind an element overlapping it. */
    const behind = (z: number) => {
      const front = holes.filter((hole) => hole.kind === "frame" && hole.z > z && hole.open > 0);
      if (!front.length) return;
      c.beginPath();
      c.rect(0, 0, W, H);
      for (const hole of front) quadPath(c, hole.quad, hole.radius, false);
      c.clip("evenodd");
    };

    const draw = () => {
      canvas.style.background = "none";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      c.globalAlpha = fade;
      c.fillStyle = grid;
      c.save();
      c.scale(1 / dpr, 1 / dpr);
      c.fillRect(0, 0, W * dpr, H * dpr);
      c.restore();
      // Drawn parts let the page show through.
      c.globalCompositeOperation = "destination-out";
      for (const hole of holes) {
        c.globalAlpha = hole.open;
        c.save();
        c.beginPath();
        c.rect(hole.x - 2, hole.y - 2, (hole.w + 4) * hole.typed, hole.h + 4);
        c.clip();
        quadPath(c, hole.quad, hole.radius);
        c.fill();
        c.restore();
      }
      c.globalCompositeOperation = "source-over";

      for (const hole of holes) {
        if (hole.line <= 0) continue;
        const [r, g, b] = hole.rgb.map((v) => Math.round(255 + (v - 255) * hole.open));
        c.globalAlpha = fade * hole.line;
        c.save();
        behind(hole.z);
        quadPath(c, hole.quad, hole.radius);
        c.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        c.lineWidth = 1;
        c.stroke();
        c.restore();
      }

      for (const agent of agents) {
        const alpha = agent.alpha * Math.min(1, fade * 2);
        if (alpha <= 0) continue;
        c.globalAlpha = alpha;
        const d = agent.draft;
        if (d && "quad" in d) {
          // White outline on the element's slant, a light fill, the badge in the cursor's colour.
          const [, , br, bl] = d.quad;
          const width = Math.hypot(br[0] - bl[0], br[1] - bl[1]);
          if (width > 1) {
            c.save();
            behind(d.z);
            quadPath(c, d.quad, 4);
            c.fillStyle = "rgba(255, 255, 255, 0.04)";
            c.fill();
            c.strokeStyle = "#ffffff";
            c.lineWidth = 1;
            c.stroke();
            c.restore();
          }
          if (width > 40) {
            c.font = `500 11px ${font}`;
            const tw = c.measureText(d.label).width;
            const bx = (br[0] + bl[0]) / 2 - tw / 2 - 6;
            const by = Math.max(br[1], bl[1]) + 8;
            roundRect(c, { x: bx, y: by, w: tw + 12, h: 18 }, 4);
            c.fillStyle = agent.fill;
            c.fill();
            c.fillStyle = agent.ink;
            c.textBaseline = "middle";
            c.fillText(d.label, bx + 6, by + 9.5);
          }
        }
        if (d && "caret" in d && (Math.floor(now / 260) % 2 === 0 || d.caret.w > 0)) {
          c.fillStyle = agent.fill;
          c.fillRect(d.caret.x, d.caret.y, 1.5, d.caret.h);
        }
        c.save();
        c.translate(agent.x, agent.y);
        const s = 1 - agent.press * 0.12;
        c.scale(s, s);
        if (agent.shape === "beam") {
          c.strokeStyle = agent.fill;
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(-3, -9);
          c.lineTo(3, -9);
          c.moveTo(0, -9);
          c.lineTo(0, 9);
          c.moveTo(-3, 9);
          c.lineTo(3, 9);
          c.stroke();
        } else {
          c.fillStyle = agent.fill;
          c.strokeStyle = "rgba(0, 0, 0, 0.85)";
          c.lineWidth = 1.2;
          c.lineJoin = "round";
          c.fill(arrow);
          c.stroke(arrow);
        }
        c.font = `600 11px ${font}`;
        const tw = c.measureText(agent.name).width;
        roundRect(c, { x: 10, y: 18, w: tw + 12, h: 18 }, 9);
        c.fillStyle = agent.fill;
        c.fill();
        c.fillStyle = agent.ink;
        c.textBaseline = "middle";
        c.fillText(agent.name, 16, 27.5);
        c.restore();
      }
      c.globalAlpha = 1;
    };

    let frame = 0;
    const tick = (time: number) => {
      now = time;
      for (const [agent, script] of scripts) if (script.next().done) scripts.delete(agent);
      for (const script of running) if (script.next().done) running.delete(script);
      if (!scripts.size && !finished) {
        if (!leaving) {
          leaving = leave();
          running.add(
            (function* () {
              yield* tween(T.rest, null, () => {});
              yield* tween(T.fade, FADE, (u) => (fade = 1 - u));
            })(),
          );
          root.removeAttribute(BUILDING_ATTRIBUTE);
        }
        if (leaving.next().done && !running.size) finished = true;
      }
      draw();
      if (finished && fade <= 0.001 && !running.size) {
        played();
        return setDone(true);
      }
      frame = requestAnimationFrame(tick);
    };

    let started = false;
    let fallback = 0;
    const start = () => {
      if (started) return;
      started = true;
      if (waitForEvent) window.removeEventListener(waitForEvent, start);
      clearTimeout(fallback);
      if (performance.now() > late) {
        root.removeAttribute(BUILDING_ATTRIBUTE);
        played();
        setDone(true);
        return;
      }
      // Measured at start, once the page has laid out (behind any preloader).
      queue = measure(parts);
      frame = requestAnimationFrame((time) => {
        now = time;
        tick(time);
      });
    };

    const gate = waitWhileVisible ? document.querySelector(waitWhileVisible) : null;
    const waiting =
      !!waitForEvent && (!waitWhileVisible || (!!gate && getComputedStyle(gate).display !== "none"));
    draw(); // the empty canvas, until it starts
    if (waiting) {
      window.addEventListener(waitForEvent!, start);
      fallback = window.setTimeout(start, waitTimeout);
    } else start();

    const skip = () => {
      finish(T.skip);
      start();
    };
    const events = ["wheel", "pointerdown", "keydown", "touchstart", "resize"] as const;
    for (const e of events) window.addEventListener(e, skip, { passive: true });
    return () => {
      if (started) played();
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
      if (waitForEvent) window.removeEventListener(waitForEvent, start);
      root.removeAttribute(BUILDING_ATTRIBUTE);
      for (const e of events) window.removeEventListener(e, skip);
    };
  }, [onceKey, waitForEvent, waitWhileVisible, waitTimeout, late]);

  if (done) return null;
  // Hidden before paint when already played this session, so it never flashes.
  const hideIfSeen = onceKey
    ? `try{if(sessionStorage.getItem(${JSON.stringify(onceKey)})==="1")document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`
    : "";
  return (
    <>
      {onceKey && <script dangerouslySetInnerHTML={{ __html: hideIfSeen }} />}
      {onceKey && <style>{`html[data-intro-seen] [data-cursor-intro]{display:none}`}</style>}
      <style>{`@keyframes cursor-intro-give-way{to{opacity:0;visibility:hidden}}`}</style>
      <canvas
        ref={ref}
        aria-hidden="true"
        data-cursor-intro=""
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex,
          // Covers the page until the first frame is drawn (no flash of the finished page).
          background: canvasColor,
          // If the script never runs, the page still shows after 12s.
          animation: "cursor-intro-give-way 0.3s 12s forwards",
        }}
      />
    </>
  );
}
