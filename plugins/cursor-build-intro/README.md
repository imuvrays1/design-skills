# Cursor build intro

A page intro where labelled multiplayer cursors, like a team in a design tool, build the page in
front of the visitor and then hand over to the real thing.

**See it live:** [meetuv.com](https://meetuv.com). The home page opens with it.

## What happens

- The page opens as a blank canvas with a faint dot grid.
- Four cursors (Product, Brand, Web, Motion) share one queue of parts. Each one flies to a part,
  drags out a frame with a live `W × H` badge, and lets the real page show through. Text parts are
  typed out with an I-beam and a blinking caret.
- Frames follow the real outline, so a card turned in 3D is drawn on its own angle.
- After about 4 seconds the cursors fly off and the page is yours.

## Why it's built the way it is

- **One canvas over the page.** It measures the page and never moves or clones it, so it drops onto
  any layout and the reveal is always pixel-true.
- **Polite.** Any scroll, click, key, touch or resize skips it. It doesn't run under reduced motion.
  If it would start more than 6.5 s after the page began loading, it doesn't play at all: nobody on
  a slow connection should wait out a preloader and then an intro.
- **Safe.** The canvas is in the server render, so there's no flash of the finished page, and a CSS
  fallback removes it after 12 s if the script never runs.

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install cursor-build-intro@design-skills
```

Then ask Claude for "a cursor build intro on the home page". The skill looks at the page first,
picks the parts and their order, wires up the component and checks it on a throttled phone.

## Inside

- [`SKILL.md`](skills/cursor-build-intro/SKILL.md): how it works, the steps, the loading checks and
  the pitfalls I hit building it.
- [`assets/cursor-build-intro.tsx`](skills/cursor-build-intro/assets/cursor-build-intro.tsx): the
  component. React 18+, no other dependencies.

Inspired by an earlier swarm-cursor experiment. The code is mine; that project isn't
licensed for reuse, so none of it is copied.
