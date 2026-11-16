---
name: loops-animations
description: Make a new animation in the exact Loops style (useloops.ai), the way the Hero Cycle, the How it works Step Stages, the Industry Cycle and the Industry Graphics were made, and export it to MP4, WebM, GIF or a poster when it leaves the site. Use it whenever someone on the Loops team asks for an animation, a motion graphic, an animated demo or product loop, a hero or section animation, an explainer, social or email clip, or "something like the cards on the site", or wants to change how an existing Loops graphic moves, review one for being on-brand, or turn one into a video, even if they never say "animation" (for example "show how release compare works, like the how-it-works cards" or "make a GIF of the call grading for the newsletter").
---

# Loops animations

Every moving graphic on useloops.ai comes from one system, which is why they look made by the same hands. This skill is that system: what the graphics have in common, a starter and an engine that build them the same way, and a check that holds a new one to the same rules. The bar for anything you make is that it could sit on the page beside the four Step Stages and read as a fifth.

## Setup, once per machine

The skill only works inside a clone of this repo: its starters link the site's own stylesheets and fonts, its rules come from DESIGN.md and the sample SOP, and its scripts drive the repo's Playwright. Claude Code finds it on its own when started in the repo (it is a project skill, in `.claude/skills/`).

```bash
npm install                       # Playwright, which check and record drive
npx playwright install chromium   # the browser they use
brew install ffmpeg               # only for record.mjs: MP4, WebM and GIF
```

What it relies on in the repo: `styles/` and `fonts/` (linked by every animation), `DESIGN.md`, `CLAUDE.md`, `design/DEMO-GUIDE.md`, `tools/example-sop.md` and `tools/page_industry.py` (the rules and the sample world), `site.js` and `ui.js` (the shipped animations it learns from), and `scripts/dev-server.mjs` (to look at work in a browser). People can run the same scripts without Claude: `npm run anim:new`, `anim:check`, `anim:record` and `npm run dev`.

## The style in six lines

1. **It is the product, working.** A real Loops surface (rules from an SOP, a graded call, a release chart, a week of dials, a claims clock) drawn in HTML with the site's own components. Never an illustration, an icon scene, a mock phone or a dashboard collage.
2. **One point, three beats.** Set the stage, show the one change, land the point and hold it long enough to read twice. Everything that is not the change stays still.
3. **Calm, exact motion.** Opacity and transform only, six durations, three curves, staggers in whole steps. No bounce, spin, 3D, blur, parallax or anything tied to scroll.
4. **Almost no colour.** Ink, hairlines and two surfaces. The verdigris accent marks progress and the one finding. Red and amber appear only on verdict pills. A pass is grey.
5. **The end state is the truth.** The markup ships the finished frame. It loops only while on screen, and without script, under reduced motion and in print the finished frame simply stands.
6. **One sample world.** The same cast, SOP, rule numbers and figures everywhere, labelled as sample data.

## Read first

The first time in a session, read these; they are the source of truth and this skill only distils them:

- `styles/tokens.css`: every value. If you need a value it does not have, stop and ask: a new token is a system decision.
- `DESIGN.md`: Motion, Step Stage, Industry Graphic, Industry Cycle, Hero Cycle, Accent Panel, Verdict Pill, Tag, Transcript Turn. Plus `CLAUDE.md`, Non-negotiables.
- The sample world (see "Sample world" below): `tools/example-sop.md` for collections, the industry page's own sample for insurance and healthcare. Take rule numbers, names and figures from them.
- `design/DEMO-GUIDE.md`: for anything that leaves the site (video, social, deck, email).
- `references/catalogue.md` (this skill): every animation on the site, beat by beat. Read the entry closest to what you are making.
- `references/moves.md` (this skill): the motion vocabulary as code. Reuse a move before inventing one.

If this skill and DESIGN.md or tokens.css disagree, they win; fix this skill in the same change.

Not the reference: the three explainer videos in `media/` (overview, how it works, release story). They predate the design system (rounded cards, blue, red bars, shadows) and break most of the rules below.

## Workflow

1. **Write the beat sheet before any code.** Say the point in one sentence. Name the product object. List three beats with times, the one accent moment, and the chip if there is one. Then open `references/catalogue.md`: if your composition repeats one already on the site, change it. The four stages differ on purpose, so the steps never read as one window four times.
2. **Pick the format** (below).
3. **Scaffold it:**
   ```bash
   node .claude/skills/loops-animations/scripts/new.mjs <slug> --format stage
   ```
   This writes `design/animations/<slug>.html`: the site's stylesheets, a working EXAMPLE figure and build, and the loop engine inlined. Keep the structure; replace the example's beat sheet, markup, styles and build with yours. (`--format window --segs <n>` for the Window format; `n` is the number of ring arcs, one per beat that lands.)
4. **Build it** (see Building, below): the markup as the finished frame, the styles scoped to the figure, then the build function that rewinds and plays it.
5. **Look at it.** `node scripts/dev-server.mjs`, then `http://localhost:8080/design/animations/<slug>` (or the `loops-site` preview in the browser pane). Add `?theme=dark`, and for a stage `?w=360`, `?w=520` and `?w=680` for its three aspect ratios. Space pauses.
6. **Check it:**
   ```bash
   node .claude/skills/loops-animations/scripts/check.mjs <slug>
   ```
   It fails on anything the system forbids (colours, durations, curves, properties, radius, type, shadows, text that collides or clips, things left invisible at rest, script errors) and writes images to `design/animations/out/<slug>/`. Fix every error. Then **look at the images**: `sheet-light.png` and `sheet-dark.png` are frames at every moment a beat settles, plus the held end and the fade; `end-*.png` and `fit-*.png` are the finished frame. The check is the floor; your eye on those images is the bar.
7. **Compare with the site.** `compare.png` puts your end frame beside its siblings on the live pages at their width: the four How it works stages for a Stage, the three industry graphics for a Window. Same density, same quiet, same type sizes, same amount of accent? If yours is busier, it is wrong.
8. **Finish:** export it (`record.mjs`, below) if it leaves the site, or move it onto a page with `references/porting.md`. Tell the person what you made, where the files are, what the check said, and show them the sheet.

## Formats

| Format | Is | Use for | Starter |
|---|---|---|---|
| **Stage** | The Accent Panel's dotted wash; on it one product window and one chip that carries the point. No controls. 16:9 from 620px wide, 4:3 from 440, 1:1 below. | A feature or step explained in one loop; most social and email clips. | `--format stage` |
| **Window** | A surface window with a quiet `--rule-2` stroke, a Mono bar naming what it shows, the ring as its pause control, hairline structure inside and exactly one accent finding. Sits on the page canvas. | A figure inside a section: a calendar, a clock, a comparison, a rulebook. | `--format window` |
| **Hero surface** | An App Shell with a rail of steps, a ring and several screens on one clock (the Hero Cycle), landing with the hero. | One per page, and only the hero. A new one is the owner's decision: ask before building. Its reference build is `design/reference/loops-hero-loop.html`. | not scaffolded |

## Building

**Markup is the finished frame.** Write the figure exactly as it looks when the run ends: every row filled, every verdict landed, the chip in place, the status at its final text. Mark the parts:

- `data-demo="<slug>"` on the figure, with an `aria-label` that starts "Sample:" and says what it shows.
- `data-main` on the product window and `data-chip` on the chip (Stage).
- `data-body` on the boxes whose contents fade out and back in between loops. Animate what is inside a `data-body` box, never the box itself (the chip is the exception: it rises on its own).
- Text for screen readers only goes in `.sr-only` (or the site's `.vh`).
- `data-stat` with `data-busy="Grading"` on a status that reads "Grading…" while the run plays; `data-prog` on the 2px progress line; `.sel` for a sliding selection band; `data-seg` on ring arcs (Window).

**Styles** go in the file's own `<style>`, scoped under `[data-demo="<slug>"]`, using tokens only. Reuse the site's classes first: for a stage `fo`, `win`, `fo-h`, `stat`, `prog`, `win-b`, `rows`, `sel`, `fo-rows`, `chip`, `chip-q`, `rail`, `av`, `ok`, `page`, `cards`, `rc`, `spark` (home.css); for a window `ig`, `ig-bar`, `ig-body`, `ig-foot`, `ic-ring` (site.css); everywhere `pill`, `pill-miss`, `pill-partial`, `tag`, `tag-fill`, `panel` (primitives.css).

**The build** is one function per figure, keyed by its `data-demo`, that schedules every beat on one clock starting at 0 and returns when the last beat ends. The engine rewinds to the first frame, plays it, holds the end for `--dur-breathe`, fades out, and plays again; it also handles pause, off screen, hidden tabs, print, reduced motion and frame-exact recording. The API, the same as the site's Step Stage engine in `site.js`, so a build ports unchanged:

| Call | Does |
|---|---|
| `t.T` | the tokens in ms and curves: `STEP` 100, `TIGHT` 60, `DOT` 30, `FAST` 150, `BASE` 240, `ENTER` 600, `LAND` 720, `SLOW` 640, `HOLD` 2400, `EASE`, `STD`, `EXIT` |
| `t.add(node, frames, at, dur, ease, fill)` | any beat: two keyframes of opacity and/or transform. `fill` defaults to `backwards` (hold the first frame through the delay, return to the shipped state after). Use `forwards` only for a value that must stay changed until the run ends |
| `t.rise(node, at, travel)` | the house arrival: fade up from `--travel-sm` (or `'travel'`, `'travel-lg'`) on `--ease-enter` |
| `t.fade(node, at, dur)` | opacity 0 to 1 on `--ease-standard`, `--dur-base` unless given |
| `t.at(time, fn)` | anything that is not an animation: change a status, a timestamp, a counter. Never `setTimeout`, `requestAnimationFrame` or `onfinish`: they escape the clock, so pause and recording miss them. Every text the markup ships is put back when a run stops, so set any text this way freely |
| `t.count(node, from, to, at, fmt)` | a figure counting up over `--slow`, cubic ease out, ending on its shipped text |
| `t.busy(end)` | the status reads `data-busy` + "…" until `end` |
| `t.progress([[at, 0.25], [at2, 0.5], ...])` | the 2px accent line, advanced in steps |
| `t.select(rows, times, endAt)` | the row-high `--inset` band sliding from row to row (it stretches to rows of different heights) |
| `t.seg(i, at)` | light ring arc `i` (Window). Only when the figure counts verdicts as they land, as the Industry Cycle does; in an Industry Graphic the ring is just the pause control, so leave its arcs full and drop `t.seg` |
| `t.settle(at)` | the window slides up to make room as the chip arrives (Stage) |
| `t.temp(node)` | an element that exists only during the run (a ghost bar in flight); removed after |

**Timing grammar.** Read the existing builds in `references/catalogue.md`; they all count the same way:

- Open on `T.STEP * 3`: 300ms of stillness so the eye finds the window before anything moves.
- Items that each carry a reading or a verdict arrive one per `T.ENTER` (or `T.STEP * 5` when quicker). Rows in a list rise on `T.TIGHT`. Every stagger is a whole number of steps and stops at 8 items; the rest arrive together.
- Arrivals on `T.EASE` at `T.ENTER` (`T.LAND` for one large move); state changes (a verdict, a selection, a status, the progress line) on `T.STD` at `T.BASE`; anything leaving on `T.EXIT`.
- The point lands at the end: settle and the chip at `end + T.STEP`, the chip's own detail (a rail drawing, a range opening) at `end + T.STEP * 3`.
- Beats end at 2.5 to 5 seconds. With the hold and the fade, one run lasts 5 to 9 seconds (the Hero Cycle, the longest, is 13).

## The rules

The check enforces what it can; you hold the rest. Each comes from a decision the owner made, usually after seeing the alternative fail.

**Content**
1. One point, said in the beat sheet, that the end frame states on its own. If you need two sentences, make two animations.
2. Real product words, short: a rule is "2.3 Disclosure first", a verdict is a pill plus its evidence in Mono. Sentence case, numerals with units, no hype words (seamless, unlock, magic, AI-powered, insights), no exclamation marks, no emoji, no em or en dashes.
3. Names, rules and numbers come from the sample world below. Claims match the site (read the homepage and `content/faq.json` before stating a figure or promise). Every figure is sample data and says so: on the site a stage carries it in its `aria-label` ("Sample: ..."); anything that leaves the site shows it, as a `Sample` pill in the window's header (as the Industry Cycle does) or "Sample data" in a foot.

**Composition**
4. One product object and, on a stage, one chip that carries the point. At most four rows; show "4 of 41" rather than 41. No tabs, stat strips, side panes, nested panels, typed-out transcripts, Replay buttons or fake loading. Three stacked surfaces buried the point of the old steps; that is why they were cut.
5. The chip is a smaller surface that overlaps only the window's bottom padding, never its content. The window starts centred and slides up to make room as the chip arrives, so the composition is balanced at every moment of the loop.
6. Nothing grows the frame: if a width needs room, the content tightens. Check all three stage ratios (360, 520, 680) or the window from 320 up to its full section width (1260). Under 400px the site tightens a stage's window (`home.css`, the `@container (max-width:400px)` block: smaller row padding, 13px text, narrower chips), so line your own rows up with that at 360, not only at 680.

**Colour**
7. Tokens only. Surfaces `--canvas`, `--surface`, `--inset`; lines `--rule` (and `--rule-2` for a window's stroke); text `--ink`, `--ink-2`, `--ink-3`.
8. The accent marks progress (the 2px line, the ring's arcs) and the one finding (a flagged line's 2px rail, the one bar or point that moved, the approval check). Two or three accent marks in a frame, never decoration, never a button, never a loss. A big figure on the wash takes `--accent-deep`. The finding's fill depends on what it is: a flagged *transcript line* (something said) takes `--accent-wash` and the rail; a flagged *row* in a list (a rule, a call, a tool call) takes `--inset`, plus the rail when it is the finding.
9. `--miss` and `--partial` live on verdict pills and verdict rows only. The verdict states: met is the neutral pill in `--ink-3` (so the eye goes to what needs action), missed is `pill-miss`, needs review (a stretch a person must hear) is `pill-partial`, and not checked (the rule needs records that were not sent) is the neutral pill reading "not checked", never needs review.
10. No gradients, shadows, glows or blur. Depth is a 1px hairline plus a surface step. The dotted wash comes from `.panel`; use it once.

**Type and shape**
11. Geist and Geist Mono, 400 and 500. Mono only for identifiers (rule IDs, call IDs, times, citations, eyebrows); never a sentence in Mono. Tabular numerals stay on, so counting figures never change width.
12. Square everything. Only tags and pills take the 4px radius.

**Motion**
13. Opacity and transform only, never width, height, colour fades across a panel, or filters. Bars grow by `scaleX` from the left; rails draw by `scaleY` from the top.
14. Durations 150, 240, 600, 720ms (and 640 for a counting figure, 2400 for the hold), curves `--ease-enter`, `--ease-standard`, `--ease-exit`, two keyframes per beat. No bounce, overshoot, spin, 3D, parallax or elastic easing. Scale stays between 0 and 1, except the 1.06 land of a hero surface.
15. One animation carries the point and everything else holds still while it happens. A second thing moving at the same moment halves the first.
16. Loops only while at least 30% on screen; stops in a hidden tab and in print; resting state is the finished frame. Never animate decoration to look busy: one quiet status ("Grading…") is enough.

## Sample world

Every graphic tells part of one story. Use it; don't start a new one.

- **Collections** (the homepage and /collections): `tools/example-sop.md` is canon: the rules (1.1 to 6.2), the cast (Maya, the agent for Quillfeather Services; Daniel Reyes and his Alder Card balance of $1,284.16; Priya Shah; Luis Ortega), the release story (v13 to v14, 2.3 regressed, 190 calls) and the money figures.
- **Insurance and healthcare**: the industry page's own sample in `tools/page_industry.py` (its hero call and rulebook) wins on that page. The carrier is Cedar Mutual; the provider is Birchwood Community Hospital.
- **The Hero Cycle's three passes** (`site.js`, `PASSES`, reused by the Closing Banner in `tools/banner.py`) carry a shorter sample per industry, and its insurance pass numbers rules differently from the insurance page (it calls the recording notice 2.3; the page's rulebook calls it 1.1 and uses 2.3 for timelines). Near a page's rulebook, follow the rulebook, and say in your hand-off which numbering you used.
- **Approvers** are the compliance leads from the Hero Cycle: Priya K (collections), Dana R (healthcare), Marcus T (insurance), shown as initials on an `--ink` square.
- **What you may invent**, in the same shape and marked illustrative in the beat sheet: call IDs (4 hex, a hyphen, 4 digits; only `8f3a-2291` is canon, so never reuse it for a different call), call times in Mono `mm:ss`, dates in October 2026, a tool name the SOP implies. What you may not: a new rule number, a new figure in the release story, a customer, a claim about the product.

## Export

```bash
node .claude/skills/loops-animations/scripts/record.mjs <slug> --preset site
```

Frame-exact (the clock is moved frame by frame, so no beat is dropped), captured at 2x so hairlines stay crisp, and one run loops seamlessly because it opens and closes on the contents fading. Presets: `site` 1920 x 1080 MP4 + WebM + poster, `card` 1440 x 1080, `square` 1080 x 1080, `vertical` 1080 x 1920, `email` 800 x 800 GIF under 3MB. Add `--theme dark` for a dark page or feed, `--name <feature>-<placement>` for the file name the demo guide asks for, `--hold <ms>` when the end frame has more to read than 2.4s allows. Files land in `design/animations/out/<slug>/` (git-ignored). Needs ffmpeg for anything but the poster.

- Run the check with the same preset first (`check.mjs <slug> --preset square`), so its sheet shows the shape you will ship.
- Upload the poster as the cover or thumbnail wherever the platform asks for one: a clip's first frame is the window still filling in.
- A clip that leaves the site shows that it is sample data (rule 3).

## Putting it on the site

A new graphic on a page is a system change: its spec goes into DESIGN.md first, its accent use into CLAUDE.md rule 3, and a dated line into `design/CHANGELOG.md`, all in the same commit, and copy on a page is the owner's to approve. `references/porting.md` has the steps for each format.

## Where earlier versions went wrong

These were built, shown and replaced; don't rebuild them:

- A step chart with a rail and a tile grid: too many parts to read at a glance. Replaced by one line chart of one rule.
- Product UI panels with tabs, stat rows and sub-cards inside a field inside a card: the point was buried. Replaced by one window and one chip on the wash.
- A static call taller than the hero, with nothing to show it was a product at work. Replaced by the Industry Cycle, five turns, graded line by line.
- The release's regressed point in `--miss`: a loss in a verdict colour outside a pill. It takes the accent; the miss colour stays on its pill.
- A stage stopped mid-count kept "0.0" as its next end state. The engine now restores every shipped text on stop.
- Screens waiting at opacity 0 at rest, read by screen readers and failing contrast checks. Off screens leave the page, and everything rests finished.
- A frame stroke at `--ink-2` in light mode read too strong. Windows rest at `--rule-2` in light and `--ink-2` on the dark canvas.

## Files in this skill

- `assets/engine.js`: the loop engine (one clock, seekable). `new.mjs` inlines it; edit it here.
- `assets/stage.html`, `assets/window.html`: the starters.
- `scripts/new.mjs`, `scripts/check.mjs`, `scripts/record.mjs`: scaffold, check, export. They run inside the repo and use its Playwright; nothing else to install but ffmpeg for video.
- `references/catalogue.md`: every animation on the site, beat by beat, with file locations.
- `references/moves.md`: the motion vocabulary as code.
- `references/porting.md`: moving a finished animation onto a page.
