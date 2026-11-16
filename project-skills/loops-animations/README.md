# Loops animations

The system behind every moving graphic on useloops.ai: the Hero Cycle, the How it works Step
Stages, the Industry Cycle and the Industry Graphics. I built the site and its animations, then
wrote this skill so anyone on the team, or their agent, could make a new one that sits beside them
and reads as made by the same hands.

**See it live:** [useloops.ai](https://useloops.ai). The hero, the How it works cards and the
industry pages.

Written for the Loops site's repo: its starters link the site's own stylesheets, fonts and
DESIGN.md. It's here to show how I turn a motion style into a system other people can use.

## The style in six lines

1. **It's the product, working.** A real Loops surface drawn in HTML with the site's own components.
   Never an illustration, an icon scene or a dashboard collage.
2. **One point, three beats.** Set the stage, show the one change, land the point and hold it long
   enough to read twice.
3. **Calm, exact motion.** Opacity and transform only, six durations, three curves, staggers in whole
   steps. No bounce, spin, 3D, blur or parallax.
4. **Almost no colour.** Ink, hairlines and two surfaces; the accent marks progress and the one
   finding.
5. **The end state is the truth.** The markup ships the finished frame. It loops only while on
   screen, and with no script, under reduced motion or in print, the finished frame simply stands.
6. **One sample world.** The same cast, rules and figures everywhere, labelled as sample data.

## The workflow

1. Write the beat sheet before any code: the point in one sentence, the product object, three beats
   with times, the one accent moment.
2. Scaffold it (`scripts/new.mjs`) as a Stage or a Window, with the loop engine inlined.
3. Build it: the markup as the finished frame, then one build function that schedules every beat on
   one seekable clock.
4. Check it (`scripts/check.mjs`). It fails on anything the system forbids (off-token colours,
   durations or curves, animated properties other than opacity and transform, text that collides
   or clips, things left invisible at rest) and renders contact sheets of every beat in light and
   dark.
5. Compare it: the end frame beside its siblings on the live pages, at their width.
6. Export it (`scripts/record.mjs`) frame-exact, at 2x, to MP4, WebM, a GIF for email or a poster.

## Handing it over

[`TEAM-HANDOFF.md`](TEAM-HANDOFF.md) is the guide I wrote for the team alongside the skill: what
each animation on the site shows, setup, what to ask Claude for, export presets, the rules that
matter most, and what's safe to do alone versus what needs a design-system decision.

## Inside

- [`SKILL.md`](SKILL.md): the style, formats, the build API, the timing grammar, sixteen rules, the
  sample world, export, and the versions that were built and replaced, with why.
- `assets/`: the loop engine and the two starters.
- `scripts/`: new, check and record.
- `references/`: every animation on the site beat by beat, the motion vocabulary as code, and how
  to put a finished one on a page.
