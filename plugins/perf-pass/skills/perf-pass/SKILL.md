---
name: perf-pass
description: Make a design-heavy website load fast and scroll smoothly on an ordinary phone, and keep it that way - measure against a mid-range-phone budget (median of three runs), find the cause behind each symptom, change it, re-measure on the same setup, and write down the results and the rules that keep it fast. Use when a site feels slow, laggy or janky to scroll, when Lighthouse or Core Web Vitals (LCP, CLS, TBT) are poor, before a launch, after adding heavy motion, video, fonts or analytics, or when someone asks for a performance audit or budget.
---

# Performance pass

How UV made rifa.ai and openfile.pro fast, as one routine: a budget, a measured before, a cause for
every symptom, a measured after, and rules written down so the next change doesn't undo it.

## The budget

Per page, on a mid-range Android phone (CPU slowed 4×, 1.6 Mbps, 150 ms latency), three loads in a
fresh profile, the middle one kept:

| | Budget |
| --- | --- |
| First paint | 1.8 s |
| Largest paint (LCP) | 2.5 s |
| Layout shift (CLS) | 0.1 |
| Blocking time | 300 ms |
| Downloaded before any scroll | 1,000 KB |
| Of it, scripts | 250 KB |

Put it in the project's docs and in a `perf` command that exits 1 over budget. Run it after every
deploy and before any change to the home page goes out.

## The routine

1. **Hear the symptom in the visitor's words** ("slow to load", "scrolling feels laggy"), and decide
   what would prove it fixed.
2. **Measure before**, on the same build you'll measure after (a production build served the same
   way, or the live site):
   - Lighthouse, mobile preset and desktop preset, three runs each, median:
     `npx lighthouse@12 <url> --only-categories=performance`.
   - Main-thread cost while idle and while scrolling: Chrome DevTools Protocol
     `Performance.getMetrics` (`TaskDuration`) sampled over 5 s idle and over a scripted wheel
     scroll, CPU throttled 4×.
   - What's still animating: `document.getAnimations()` filtered to `playState === "running"`,
     scrolled past the section in question.
   - For anything tied to scroll: a screencast while wheel-scrolling, comparing each frame's painted
     edge with where the scroll position says it should be.
3. **Write the problem table:** Problem, Cause, Effect, one row per symptom, the cause found in code
   (with the setting or line), the effect measured.
4. **Change one cause at a time** where you can, and keep the design: the fix is to make the effect
   cheap, not to remove it.
5. **Measure after**, same method, same setup, and write the results as before → after per page,
   naming the commit measured before.
6. **Write "Rules that keep it fast"** into the project's docs, one line per cause, and "What is left,
   and needs a decision" for what you can't fix alone (a tracker someone else owns, a costly animation
   that is the design).

Scrolling smoothness on a phone isn't measurable from a desktop browser: a phone scrolls on its own
thread. So the rules that protect it matter as much as the numbers.

## Causes found before, and their fixes

These came up on real sites. Check for each.

| Symptom | Cause | Fix |
| --- | --- | --- |
| Scroll trails the wheel | A smooth-scroll library easing every wheel tick | Native scrolling. Glides the site starts itself use `behavior: "smooth"`. On touch, never take over scrolling |
| Wheel does nothing once the library is gone | `overflow-x: hidden` made `<body>` a scroll container; `overscroll-behavior` on `<body>` | `overflow-x: clip` on body and page wrappers; `overscroll-behavior` on `<html>` only |
| LCP is a small label, seconds late | The hero headline fades in from opacity 0, so the browser doesn't count it | The headline rises without fading, and doesn't animate on phones or under reduced motion |
| Fonts download twice | Two font calls for one family (one per script) redeclare the same faces | One `next/font` call per family |
| Seconds of script before the page responds | Analytics and session recorders in the first bundle or preloaded high | Heavy SDKs imported after load and idle, calls queued; third-party scripts `lazyOnload` |
| Steady main-thread work while reading | Loops (waveforms, pulses, tickers) running on sections scrolled past | Pause everything off screen (a `data-offscreen` attribute 200 px out and one CSS rule); JS loops stop off screen and in hidden tabs themselves |
| Every video frame re-blurred | `backdrop-filter` over a playing video | No backdrop blur over anything that moves; no fixed blur or blend layer over the page on touch screens |
| An element jitters on scroll | A scroll listener or scrubbed timeline sets a transform on the main thread, a frame behind native scroll | A CSS scroll timeline (`animation-timeline`, `view-timeline`), with the old path only where scroll timelines aren't supported |
| Session recorders upload constantly | They serialise every DOM change of animated product UI | Keep one recorder at most |
| Images wait on first visit | Images resized on request at the edge | Every size made at build time and served as static files; `sizes` honest |
| Slow first response on a cold worker | Pages rendered by the framework on every request | Keep pages static, and serve the prerendered HTML straight from static assets |
| Long pages | Everything below the fold laid out up front | `content-visibility: auto` on sections past the first screen |
| Heavy media on phones | Desktop video sent to phones; sounds loaded up front | A 720 px copy for phones; sounds load on the first tap |

## Reporting

Keep the record in the repo (`docs/performance.md`): what was wrong (the table), what changed, the
results (mobile and desktop tables, JS on first load, main-thread time per second of scrolling), what
is left, the rules, and how to measure, so anyone can re-run it.
