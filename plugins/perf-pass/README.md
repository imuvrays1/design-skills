# Performance pass

Making a design-heavy site load fast and scroll smoothly on an ordinary phone, without giving up the
motion that makes it worth visiting.

**See it live:** [rifa.ai](https://rifa.ai) and [openfile.pro](https://openfile.pro).

- On rifa.ai's home page, one pass took Lighthouse mobile from 71 to 85 and LCP from 11.0 s to 4.1 s
  (median of three runs); desktop went from 81 to 99. Scrolling went back to native, and first-load
  JS dropped from 470 KB to 370 KB gzipped.
- openfile.pro is held to a mid-range-phone budget on every deploy. Its local production build
  scored 98 performance and 100 for accessibility, best practices and SEO on Lighthouse mobile.

## How it works

1. **A budget**, measured on a mid-range Android phone (CPU 4× slower, 1.6 Mbps), median of three:
   first paint 1.8 s, LCP 2.5 s, CLS 0.1, blocking 300 ms, 1,000 KB, 250 KB of it scripts.
2. **Measure before**: Lighthouse on mobile and desktop, main-thread time while idle and while
   scrolling, what's still animating off screen, and a frame-by-frame check of anything tied to
   scroll.
3. **A cause for every symptom**, written as Problem, Cause, Effect.
4. **Fix the cause, keep the design.**
5. **Measure after** on the same setup, and record the before and after.
6. **Write the rules that keep it fast**, so the next change doesn't undo it.

The skill includes a table of causes found on real sites (smooth-scroll libraries, a hero headline
fading in from 0, duplicate font calls, analytics on the critical path, loops running off screen,
blur over video, scroll effects on the main thread) and the fix for each.

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install perf-pass@design-skills
```

Then: "the site feels slow on phones" or "why is scrolling laggy?"

## Inside

[`SKILL.md`](skills/perf-pass/SKILL.md): the budget, the routine, the causes and fixes, and how to
report it.
