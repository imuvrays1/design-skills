# Catalogue: every animation on useloops.ai

What each one shows, how it moves, beat by beat, and where its code lives. Read the entry closest to what you are making, then open its build: they are short and they are the best teacher of the timing. A new animation takes a composition none of these use.

Contents: Hero Cycle · Step Stages 1 to 4 · Industry Cycle · Industry Graphics (week, clock, release compare) · Page motions (not loops) · Not the reference

---

## Hero Cycle (homepage hero)

- **Code:** `site.js` "Hero cycle" (its own rAF clock, not the Step Stage engine), `styles/home.css` `.hero-cycle` and `.hc-*`, markup in `index.html` `[data-cycle]`. Standalone reference: `design/reference/loops-hero-loop.html`. Spec: DESIGN.md, Hero Cycle and App Shell.
- **Point:** ten thousand calls checked, the misses grouped by the rule they broke, the SOP rewritten from them and approved, and what fixing the top rule is worth. One industry per revolution (Collections, Healthcare, Insurance), driven by one data array of three passes.
- **Object:** an App Shell in the hero's Accent Panel, 920 x 570 at desktop: identity row (industry buttons, then the ring and an overall percentage), a rail of four steps, the stage area, an audit footer.
- **Beats** (about 13s a revolution, starts only after the hero's land finishes):
  - 01 Scan, 0 to 2600ms: a surface veil slides right on `translate3d` with a beam at its edge (flat `--accent-wash` trail, 1.5px accent edge); the count runs to 10,000; each flagged dot appears with a one-shot ring as the beam passes it.
  - 02 Group, 2900 to 5800ms: the field collapses (`scaleY` to 0.34 from its top, its dot texture counter-scaled by 1/0.34); the flagged total reads in `--miss` as the headline; dots fly home on a `--step-dot` (30ms) stagger capped at 12; labels, counts, share bars and "Since v13" arrive 260ms later.
  - 03 Improve, 5800 to 9200ms: a neutral `--inset` sheet; every flagged dot flies (FLIP) into the "Drafted from" strip; three SOP changes arrive at 0, 380, 1020ms, the primary struck through at 760 and rewritten in an accent frame; the approver at 1560; v14 to v15.
  - 04 Outcome, 9200 to 10400ms, then a 3000ms rest: only the dominant rule's dots come through to the "Because" strip (FLIP again), the figure counts up in `--accent-deep`.
- **Moves to reuse:** the frame carries the state (a 1px accent layer over the frame stroke fades from 0 to a third on Improve to full on Outcome, by opacity); the ring as four arcs, one per screen, each filling with its screen's progress, written at most once per percent; rail rings that turn into a grey `--ink-3` tick when done; FLIP into a strip; counts that hold the width of their widest value.
- **Accent:** progress (ring arcs, rail rings, beam edge, live dots), the frame's state layer, Improve's primary change and version arrow, the outcome screen (wash, 2px rule, eyebrow, the figure in `--accent-deep`).

## Step Stages (homepage, How it works)

All four: `site.js` "Step stages" (`Loop()` and `BUILD`), `styles/home.css` `.stage`, markup in `index.html` `[data-demo]`. Spec: DESIGN.md, Step Card and Step Stage. One window and one chip each; the four objects differ on purpose. The engine in this skill is this `Loop()`, made seekable.

### 1 · `sop`: Turn your SOP into rules
- **Point:** your SOP becomes numbered rules, each citing its source, and your compliance lead approves them.
- **Object:** a portrait SOP page (title in Mono eyebrow, lines as 4px `--rule-2` bars) beside a stack of small rule cards (ID, name, citation). **Chip:** the approval, the approver's initials on an `--ink` square, an accent check.
- **Beats:** from 300ms, one source line every `ENTER + STEP*2` (800ms): a 2px accent scan line steps down to it (`ENTER`, `STD`); the line lights (`fade`); a ghost bar lifts off it and flies to its card, translating and scaling X to the card's width (`BASE` lift, `ENTER` flight on `EASE`, `BASE` exit); the card slides in from `-travel-sm` on X. The scan line leaves; the window settles; the chip rises.
- **Moves:** scan line stepping; ghost bar flight (a `t.temp` element measured with `getBoundingClientRect` before any first frame is applied).

### 2 · `call`: Every call graded, with evidence
- **Point:** one call graded rule by rule as its recording plays; the missed rule quotes the line it relied on.
- **Object:** a window: "Call 8f3a-2291", status "Grading…", the progress line, a recording row (play square, waveform in `--rule-2` with the played part in `--ink-3`, a 2px `--ink` playhead, the time in Mono), then four verdict rows. **Chip:** the quote behind the flagged-line rail.
- **Beats:** from 300ms, one rule every `ENTER` (600ms): the playhead and the played waveform step to that rule's moment (`data-at`, a fraction of the call) on `STD`; the time label changes (`t.at`); the selection band arrives on the row and its pill lands from +8px X (`BASE`, `STD`); at the miss a 2px accent flag appears on the waveform. At the end the miss row keeps its `--inset` fill, the window settles, the chip rises (`travel`) and its rail draws down (`scaleY`, `end + STEP*3`).
- **Moves:** playhead stepping (two nested masks translated in opposite directions so the played part reveals), selection band, verdict landing, flag, quote chip with rail.

### 3 · `release`: See exactly what a release broke
- **Point:** rule 2.3 was missed on 0.3% of calls in v12 and v13 and on 1.9% in v14, up 1.6 points.
- **Object:** a window "Rule 2.3 · Disclosure first", status "Comparing…" settling on "v13 → v14", the figure in Heading / L ("1.9% missed in v14") with the change in Mono on the right, one line chart over a `--rule` baseline. **Chip:** the calls behind it.
- **Beats:** v12's point pops (`scale(.4)` to 1, `BASE`); the flat `--ink-3` segment grows by `scaleX` (`ENTER`, `STD`); v13's point; then the climb to v14 in the accent grows by `scale(0)` to 1 from its bottom-left (`LAND`, `EASE`) while the figure counts 0.3 to 1.9% (`SLOW`); v14's solid accent point; the change fades in; settle; chip.
- **Moves:** a line chart drawn segment by segment; a figure counting in step with the move it describes.

### 4 · `earned`: Know what each release earned
- **Point:** v14 earned $18,400 more than v13 per 10,000 accounts reached, 95% range $11,200 to $25,600.
- **Object:** a window with the release figure and its two drivers as label and value rows. **Chip:** the 95% range.
- **Beats:** the figure counts to +$18,400 (`SLOW`); the drivers rise on `TIGHT` and count; settle; the chip rises; the estimate mark fades in; the range band opens out from the estimate (`scaleX`, origin at the estimate, `LAND`).
- **Moves:** a range or interval opening from its estimate.

## Industry Cycle (collections and insurance heroes)

- **Code:** `ui.js` "Industry Cycle", `styles/site.css` `.icall` and `.ic-*`, markup from `tools/page_industry.py` (`[data-icall]`). Spec: DESIGN.md, Industry Cycle.
- **Point:** one sample call, graded line by line.
- **Object:** a transcript card in the Hero Cycle's frame stroke (`--frame`: `--rule-2` light, `--ink-2` dark): title, the score in Mono ("Grading… 2 of 4" while it runs, "3 of 4 met" at rest), the Sample pill, the ring as pause control (one arc per verdict), a 1px rule carrying the 2px progress line. Five turns, no more: speaker in Mono over the line in Body / L; a verdict pill and its reason beside the turn it judges.
- **Beats:** start at `STEP*3`; every turn waits dimmed at 0.32 and comes up to full as it is read (`ENTER`, `STD`); a turn with a verdict takes `STEP*8`, one without `STEP*5`; each verdict slides in from +8px X at the turn's time + `STEP*4` (`BASE`, `STD`), lights its ring arc, advances the progress line and the score. The flagged turn's wash fades in and its rail draws down. Footer verdicts land `STEP*6` apart. Hold `HOLD`, fade out `BASE` on `EXIT`, play again.
- **Moves:** queued rows dimmed then read; ring arcs lighting per verdict; the score as a live status.

## Industry Graphics (industry page sections)

- **Code:** `ui.js` "Industry graphics" (`BUILD.week`, `.clock`, `.rel`, keyed by `data-ig`), `styles/site.css` `.ig` and `.ig-*`, markup from `tools/page_industry.py` and `tools/page_collections.py`. Spec: DESIGN.md, Industry Graphic. Each is a Window: Mono bar with the ring, hairline structure, one accent finding, loops while on screen.

### `week`: the Reg F 7-in-7 week
- **Object:** a calendar week of one person's dial log: toolbar (dates between prev and next squares, rule tags, a "Calls n / 7" counter), a bracket for the rolling seven days, a time grid (9:00 to 18:00), each call an event block (time in Mono, outcome) on `--inset` with a `--rule-2` left edge; the eighth takes `--accent-wash`, an `--accent` edge and outline.
- **Beats:** the bracket draws (`scaleX`, `LAND`, `STD`) and its label fades in; calls drop in from above (`-travel-sm` Y and `scale(.96)`, `ENTER`, `EASE`) every `STEP*3`, the counter ticking with each; the eighth lands last after an extra `STEP*4`; the foot rises.

### `clock`: the claims clock
- **Object:** a fifteen-day ruler of fine ticks (days 0, 7 and 15 tall), an accent fill and playhead, three milestones under their ticks.
- **Beats:** the fill grows by `scaleX` over `HOLD` (`STD`) while the playhead travels the ruler with it, then fades; each milestone comes up from 0.25 to full as the playhead passes it.
- **Known nit:** the fill and playhead ease on `--ease-standard`, but the milestones light at linear fractions of the run, so they light a little before the playhead reaches them. If you reuse this move, time each light from the eased position (or run the sweep on `linear`, the ticker's curve, and say why).

### `rel`: the release compare
- **Object:** one row per rule: the estimate as a ring and its 95% interval as a 2px line on one scale around a dashed zero, the value in Mono and a verdict pill. The regressed rule's row takes `--inset`; its point and interval take the accent.
- **Beats:** rows `STEP*2` apart: the point slides out from zero to its change (`LAND`, `EASE`); the interval opens (`scaleX` from the point, `ENTER`); the value fades in; the pill `TIGHT` later.

## Page motions (not loops)

Behaviours the page already has. A new animation never re-implements them, and never stacks its own entry on top of them:

- **Rise and land** (`tokens.css`, `ui.js`): every block rises once on intersect (`--travel`, `--dur-enter`, `--ease-enter`, staggers capped at 8); only a hero surface lands (`scale(1.06)` plus `--travel-sm`, `--dur-land`). A loop starts only after its figure's rise or land has finished.
- **H1 decode** (`ui.js`): the home headline only, characters settling through digits and operators, line breaks locked.
- **Title decode**: a section's h2, once, word by word (280ms a word, 50ms stagger).
- **Scramble**: action labels on hover and focus, 240 to 640ms.
- **Count-up figures**: once in view, 640ms cubic out.
- **Partner ticker**: the one continuous motion, 40s a loop, pauses on hover.
- **Scroll progress**: the 2px top bar, reporting position; never animates content.
- **Video Panel**: the 2px accent line filling with playback.

## Not the reference

- The explainer videos in `media/` (`loops-overview-*`, `loops-how-it-works-*`, `loops-release-story-*`) were made on 2026-09-24, before the design system: rounded cards, a blue accent, red bars, shadows, pill tabs, big captions. Remaking them is a job for this skill; copying them is not.
- `design/snapshots/`: before-and-after captures of the reskin, some of them before.
