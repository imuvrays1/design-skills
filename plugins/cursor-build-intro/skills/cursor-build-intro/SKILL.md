---
name: cursor-build-intro
description: Add a "cursor build" intro to a web page — the page opens as a blank design canvas and a few labelled multiplayer cursors (Figma-style) draw its parts as frames with live W × H badges and type its headings, revealing the real page underneath, then fly off. Ships a dependency-free React/Next.js component. Use this whenever someone wants a page, hero or portfolio home to "build itself", wants multiplayer cursors, a swarm of cursors, a cursor swarm or "cursor swamp" effect, a design-tool style intro, a Figma-like canvas reveal, an intro that plays after a preloader, or asks to reuse the meetuv.com cursor intro — even if they only describe it ("cursors that draw the site in").
---

# Cursor build intro

A page intro where labelled cursors build the page in front of the visitor, like a team working in a
design tool, then hand over to the real page. Built for meetuv.com (UV's portfolio, 2026-11-06), made
reusable here.

It is our own code. It was inspired by an earlier swarm-cursor Chrome extension (itself adapted from a
design studio's site). Those projects have no licence and ask not to be reused, so
never copy code from them. Use the component in `assets/`.

## How it works (so you can adapt it)

- **One `<canvas>` over the page** (`position: fixed`, `pointer-events: none`), redrawn each frame. It
  never changes the page's own elements; it only **measures** them with `getBoundingClientRect`. So it
  drops onto any layout, including 3D or animated ones, without breaking them.
- The canvas is filled with the page background and a faint dot grid. Each part a cursor finishes is
  cut out of the canvas (`destination-out`), so the **real page shows through**. There are no
  screenshots or clones, and the result is always pixel-true.
- **Parts** come from CSS selectors, in order. A `frame` part: the cursor flies to its top-left
  corner, presses, and drags to the bottom-right with a white 1px outline and a `W × H` badge in the
  cursor's colour. On release the area fades open.
- **Frames follow the real outline, slant included.** For a 3D-turned element (a cover-flow card),
  the bounding box is only the rectangle round it. So four 1px probes are put in the element's
  corners for a moment and read back: the browser projects them exactly like the element. The
  outline, the drag and the reveal all use that four-cornered shape, so a turned card is drawn on its
  own angle. (A flat frame over a slanted card was UV's main complaint about the first version.)
- **Outlines tint, then fade.** While the element shows through, its white outline takes on the
  element's own colour (`data-tint="#rrggbb"` on the element), then fades out. Where elements overlap,
  an outline passes behind the ones already drawn in front of it (their z-index). A `text` part: an I-beam cursor types it out left to right with a
  blinking caret.
- **Cursors** (default four: Product, Brand, Web, Motion) share one queue. Each takes the next part
  when it's free, so they work in parallel. Each runs as a small generator script that yields once
  per frame, which keeps the choreography readable and easy to change.
- **Timing** (seconds): fly in 0.45, travel 0.42, press 0.08, drag 0.38, open 0.3, typing 0.04 per
  character, a 0.3 rest, fly out 0.6, fade 0.5. About 4s for ~10 parts. `pace` scales every duration.
- While it builds, `<html data-building>` is set, so carousels or autoplay can hold still. Otherwise
  the parts the cursors measured would move away from where they were drawn.
- **Skips**: a scroll, click, key, touch or resize fades it out in 0.3s. It doesn't run with
  `prefers-reduced-motion`.
- **Slow connections**: if it would start more than `late` ms (6.5s by default) after the page began
  loading, it doesn't play and the page shows straight away. Nobody on 3G should wait out a
  preloader and then an intro.
- **Safety**: the canvas covers the page from the server render, so there's no flash of the finished
  page. A CSS animation removes it after 12s if the script never runs.

## Steps

1. **Look at the page first.** Open it (dev server or a headless browser) and list what is visible
   in the first viewport: hero cards, header, the main heading or caption, corner controls. Those are
   the parts. Prefer stable selectors. If an element has none, add a `data-*` attribute rather than
   relying on hashed CSS-module class names.
2. **Copy `assets/cursor-build-intro.tsx`** into the project's components folder. It needs React 18+
   and nothing else, and it's a client component (`"use client"`). For a non-React site, port the
   effect body to a plain script: nothing in it depends on React except mount and unmount.
3. **Pick the order.** It reads best as: the hero (centre first, then outwards, using `limit`), the
   header, the main text as `text`, then small chrome. Keep it to about 6–12 parts. More makes the
   intro drag on, and fewer feels empty.
4. **Give image cards their colour** (optional, but it makes the tint work): set `data-tint` to
   the average colour of each card's picture. The browser usually can't read the pixels of
   cross-origin images (Sanity's CDN sends no CORS headers), so work the colours out ahead of time.
   For example, run ffmpeg on each image URL, `-vf scale=1:1:flags=area -f rawvideo -pix_fmt rgb24 -`,
   which gives 3 bytes, and store them as JSON next to the content. meetuv.com does this in
   `scripts/card-tints.mjs` (`npm run tints`). Without `data-tint`, outlines stay white and fade.
5. **Match the site.** Set `canvasColor` to the page background, `font` to the site's UI font, and
   `agents` names and colours from the site's own tokens. Name tags should mean something for the
   site (disciplines, team roles, product areas), never invented people. `radius` per part should
   match the element's corner radius.
6. **Mount it** on the page, after the content:
   ```tsx
   <CursorBuildIntro
     parts={[
       { selector: "main a.card", limit: 5, radius: 6 },
       { selector: "header", radius: 8 },
       { selector: "main h1", kind: "text", radius: 2 },
       { selector: "[data-scroll-hint]", radius: 8 },
     ]}
     onceKey="seen:intro"
   />
   ```
7. **If the page has a preloader**, the intro must start as the preloader opens, not behind it.
   Otherwise the cursors play hidden, which was UV's first complaint. Make the preloader fire an event
   when it starts to reveal the page:
   `window.dispatchEvent(new Event("preloader:open"))`. Then pass `waitForEvent="preloader:open"` and
   `waitWhileVisible="[data-preloader]"`, so it only waits while a preloader is on screen. Keep the
   canvas `zIndex` under the preloader and over the page chrome.
8. **Hold autoplay.** If the page has a carousel or anything that moves on its own, have its loop
   skip steps while `document.documentElement.hasAttribute("data-building")`.
9. **Once per visit:** pass `onceKey` (sessionStorage) on a home page people return to. Leave it out
   on a review or test route so it plays every time.
10. **Visual tests:** if the project screenshots pages (Playwright and the like), set the `onceKey` in
   sessionStorage in an init script so the intro doesn't appear in baselines.

## Loading (check this before calling it done)

The intro reveals whatever has loaded, so the page underneath has to load well on a phone. Test it on
a phone viewport with the CPU slowed 4×, on slow 4G (1.6 Mbit/s, 150 ms) and 3G (400 kbit/s, 400 ms),
using CDP `Network.emulateNetworkConditions`. Log when the scripts are ready (the intro's effect runs)
and what's on screen. On meetuv.com, fifteen eager hero images downloading alongside the scripts
pushed script-ready from 3s to 7s on slow 4G. Fix it with:
- Only the hero images in view load with the page (the centre one with `fetchPriority="high"`). Give
  the rest their `src` once the page has hydrated: `loading="lazy"` doesn't help for cards that are
  near the viewport.
- `sizes` that match the rendered width, so a 3× phone doesn't take the largest copy.

## Verify

- Record or screenshot the page at 0.3s, 1s, 2s, 3s, 5s (Playwright `recordVideo` or timed
  screenshots) on desktop (1440×900) and phone (390×844). Check that the cursors are visible, frames
  line up with the elements, the text types, and the canvas is gone at the end.
- Measure smoothness with the CPU throttled 4× (`Emulation.setCPUThrottlingRate`). Collect
  `requestAnimationFrame` deltas and compare with the page without the intro: frames should stay near
  16ms. On meetuv.com it held 60 fps with one 33ms frame in 7s.
- Judge speed in a production build, not `next dev`. The dev server compiles each page on first visit
  and runs development React, so it always feels laggy.

## Pitfalls seen while building it

- `new Path2D()` at module level crashes server rendering: create canvas objects inside the effect.
- Measure the parts when the intro **starts**, not on mount. A preloader or entrance animation may
  still be moving things.
- For 3D-transformed cards, point the selector at the element that carries the 3D pose (the card),
  not a child that is still animating in: the probes measure its final pose.
- Don't sample image colours in the browser with `crossOrigin` unless the CDN allows it. Otherwise it
  logs CORS errors and gets nothing; precompute `data-tint` instead.
- React's development double mount: only mark the intro played if it ran for more than 500ms.
