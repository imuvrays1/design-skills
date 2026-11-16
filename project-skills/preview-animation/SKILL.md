---
name: preview-animation
description: Make every animation UV's portfolio needs (case-study covers, section clips, animated diagrams and faux-UI stills) with Stageshow (the installed `stageshow` skill and its React kit), in the soft, looping manner of the reference portfolio's previews. Picks the moment from a case study's cue, storyboards a 4–10 s loop that ends where it began, builds it as a Stageshow scene in the project's studio, rehearses it with Stageshow's film.mjs gate, records it frame-exact on Stageshow's virtual clock to MP4/WebM with its poster, checks seam, weight, colour and reduced motion, and hands it to the site's LoopingVideo. Also turns screen recordings into clean loops. Use whenever someone in this project wants a cover clip, a preview loop, an animated figure or diagram, faux product UI, or a "Clip to record" / "Animation to make" / "Diagram to make" cue filled, or says "make the cover move", "animate the portal preview" or "do the Reflect cover", even without naming Stageshow or this skill.
---

# Preview animation

Every animation on UV's site is a Stageshow scene, filmed to video. Stageshow (`~/.claude/skills/stageshow`,
its skill and kit) does the craft: a real product, simplified to what the viewer needs,
framed with intent, every motion with a cause. This skill is the project's layer around it: the
briefs (each case study's cues), the studio the scenes live in, the recorder that turns a scene into
a silent loop, the checks, and the hand-off to the site.

The look is the reference portfolio's previews, measured in `references/the-bar.md`: one idea, one object at a
time, on a calm field; 4–10 s; the last frame is the first; quick changes and real holds; a poster
that tells the story alone; under 600 KB. UV's review of the first four covers set the rest (a grey
ground, a full frame, one screen, smooth 60 fps motion, the five Stageshow demos as the bar): read
"What UV asked for" below before you build anything.

## Set up (once per machine)

```bash
npx skills add <stageshow's repo> --skill stageshow     # if ~/.claude/skills/stageshow is missing
npm install --prefix ~/.claude/skills/stageshow         # its film.mjs and playground
npm install --prefix research/prototype/previews/studio # the studio: React 18, Vite, Stageshow's kit
```

## Where things go

| What | Where |
| --- | --- |
| A scene (one folder per animation) | `research/prototype/previews/studio/scenes/<slug>[-<figure>]/index.tsx` + its CSS |
| Stageshow's kit, copied as its README says | `research/prototype/previews/studio/kit/` (MIT; refresh it from the skill, don't edit it) |
| The clip, poster, report, sheets | `materials/visuals/<slug>/` (gitignored: UV's drop folder) |
| The brief | the cue in `src/content/case-studies.json` (or `research/site/<slug>.json`) |
| What the site should change | the research file you own, for the main session (it owns `src/`, DESIGN.md, CONTEXT.md) |

## Read first

1. **Stageshow's `SKILL.md`**, whole: the one idea, the five ways faux UI fails (too much, wireframe,
   boxed, flat, bland), its seven-step workflow and the gold examples. Then its references as each
   step needs them: `framing.md` (crops, layouts, phones), `craft.md` (restraint, type, spacing),
   `motion.md` (story, loops, pace, touch), `kit.md` (every part's props), `rehearse.md` (filming
   and the lines that are never intentional).
2. `references/the-bar.md`: what the two reference sites' previews do, measured.
3. `references/studio.md`: how the studio, the recorder and a scene fit together, and the traps.

## Workflow

**Stills in Figma first, as editable layers.** Nothing gets animated before UV has seen it still:
every cover and figure is first a scene with no script, rendered by `scripts/still.mjs`, and
captured onto its case study's board in UV's Figma as editable layers, never as a picture
(`scripts/capture.mjs`, `scripts/figma-place.js`, `references/figma-review.md`). Write the script of
beats only after UV approves the layout and content, and follow UV's direction for the motion.

Stageshow's seven steps, with this project's inputs and outputs around them.

1. **Brief.** Read the cue (`format`, `brief`, `source`, `notes`, `alt`) and the case study's draft
   for what is confirmed. Never invent content (AGENTS.md): every word and number comes from the real
   product, prototype or Figma, or is plain arithmetic on them. Rifa NDA: real screens and numbers
   may be shown, client names may not: an agency or client name becomes a bar, a logo a neutral
   mark, a phone number a fictional 555-01xx one, a consumer's name another first name, an ID a bar.
2. **Medium.** A cover: animation, `loop`, a 960 × 600 stage (16:10, the cover's shape on the home
   page), recorded at 2× and 60 fps; the case study shows the same file in its 550 px column. A section figure:
   the figure's shape at the column's 550 px, recorded at `--scale 3`. A diagram: a still or a loop;
   Stageshow's annotations and `Connector` draw it. If the cue's notes (written for a screen
   recording) clash with this skill, such as where the loop starts, this skill wins: say so in the
   hand-off.
3. **Look.** The ground is flat `--surface` (#f4f4f3), the grey the reference site's product panels sit on. The
   site's page is near white (`--bg` #fdfdfc), so a white ground, or a white glow over the grey,
   reads as no ground at all (UV: "the background can't be white"). A glass scene sits on soft
   colour orbs over the grey, after the reference site's Juniper checkout (a violet glow at the left, an orange
   one at the right). The product inside keeps its own look: read its real colours, type, radii and
   timing (UV's Figma, computed styles from the prototype or the live product) and map them onto
   the kit's tokens (`looks.md`). Real chrome only: a phone or window from the kit, never drawn by
   hand.
4. **Story.** One sentence: "In this loop, <who> <does what> and <what happens>." Three to five
   beats. Pick the seam first (`references/storyboard.md`). **The poster is the first frame:** the
   site shows the poster, then plays from frame 0, so a loop that starts anywhere else cuts on its
   first play. Set the Stage's `poster` to the `initial` state unless the cue says otherwise, and
   make that state tell the story.
5. **Example.** Copy the closest gold example from `~/.claude/skills/stageshow/examples/` into
   `scenes/<slug>/`, change its kit import to `../../kit`, and keep its structure: stage size, crop,
   type sizes, beats, kit parts. Then make it the brief's product. Phones: `phone-touch`, `swipe`,
   `messages`. Windows: `hero-demo`, `linear`, `table-edit`. Systems: `subscriptions`, `story`.
   Phone and window: `device-pair`. Diagrams: `annotations`, `blog/annotation-*`. The five demos UV
   chose as the bar are on the Stageshow demo page (`references/the-bar.md` says where each lives and
   what it teaches); read their code there before you plan, as the portal cover did with Tandem's.
6. **Screen.** 3–7 real strings, where the story is; `Bar` for the rest. Redesign the product's
   screen at 1:1 for the cover, simplified: 11–15 px UI text in a window about 600–800 px wide (as
   Tandem's is 590), never a 1,440 px screen shrunk to fit. Crop only filler: no label, control or
   word sliced by an edge; nothing tangent to an edge.
7. **Choreograph.** The `Act` script: `mark`, `wait`, `move`, `click`, `drag`, `set`, `put`, `snap`.
   Start the script with `a.mark('<first beat>')`: the recorder finds the loop by it. One screen per
   story: things arrive through the kit's moves (`Expand`, `Fly`, `Collapse`, `Roll`, `Count`,
   `Popover`, `Camera`), never by scrolling, swapping pages or crossfading between screens. End
   where it began (state and cursor), with a reset the viewer sees a cause for (a back arrow, a
   close, the app put away) or one done out of sight (`snap`, scoped to its target), never by
   playing it backwards. Storytelling motion takes DESIGN.md's values; the product's own feedback
   keeps the product's timing (table below). 8–10 s for a cover.
8. **Rehearse**, with Stageshow's film:

   ```bash
   node .claude/skills/preview-animation/scripts/rehearse.mjs <scene> -- --gate --every 330 --count 30 --width 960 --pad 0 --out /tmp/<scene>-film.png
   ```

   It starts the studio's dev server and runs `film.mjs`. Fix every line `rehearse.md` calls never
   intentional by its cause (clearing one by hiding or marking it is a bug), read every frame of the
   sheet, and judge the rest. Also `--states` (every beat), `--reduced` (the poster).
9. **Record:**

   ```bash
   node .claude/skills/preview-animation/scripts/record.mjs <scene> --out materials/visuals/<slug> --name cover
   ```

   It builds the studio, steps Stageshow's virtual clock one frame at a time at 60 fps, records
   exactly one loop (from the first mark until it comes round again), takes the poster from the scene's own
   `poster` state, encodes MP4 (H.264, CRF 27, BT.709, faststart, silent) and WebM, and checks
   length, seam, poster, flashes, colour, weight, reduced motion and Stageshow's warnings. Then look
   at `cover-contact.png` and `cover-seam.png` yourself.
10. **Hand off** (`references/export.md`): the files, the media entry with alt text, what's rebuilt
    and from where, what was redacted or simplified, and the weights.

A screen recording instead of a scene (when the real feel is the point: a live voice, streaming AI
output): `references/recording.md` and `scripts/clip.mjs`, with the same checks.

## What UV asked for (2026-11-04)

UV turned down the first four covers: "not smooth", "extremely empty", "the background can't be
white", too much data on the triage screen, a jerky onboarding. Every cover since holds to this:

- **A grey ground,** flat `#f4f4f3` (glass: orbs over it). Never white, never a white glow.
- **A full frame.** One hero, at least two thirds of the stage, running off the right or bottom;
  one satellite straddling its edge with a job in the story. Never a lone phone on a big field or a
  whole window with even gutters (Stageshow's "boxed"). A phone and a web page together take the
  device pair: the window pinned top-left, the phone over its right edge, a third outside, over the
  page's empty margin, never over its words.
- **One screen, kit motion.** The story happens on one screen; what changes arrives through
  `Expand`, `Fly`, `Collapse`, `Roll`, `Count`, `Popover`, `Camera`. No scrolling, no page swaps,
  no crossfades between screens, no launch dissolves. The one fade allowed is an app put away on a
  phone, as the reference site's Tandem and Hearth phones do (0.45 s to what was under it).
- **Smooth:** recorded at 60 fps (`record.mjs` default). A block gliding across the screen uses
  Stageshow's travel curve (soft start, soft landing); a long glide on an ease-out starts so fast
  that film reports it as a jump.
- **Focus:** one thing moves at a time; 3–7 real strings; the rest bars. When several cards share a
  screen, the one in the story comes forward and the others step back to about 40%, as the kit's
  `Window receded` does.
- **One cursor language:** Stageshow's illustrated arrow (`cursor.style: 'arrow'`) on desktop
  windows, a touch dot on phones. In a device pair, the phone's taps are press feedback with no
  finger (Tandem's notification presses to 0.97), so one stage never shows two pointers. The arrow
  rests off the stage at the seam (frame 0 equals the poster) and leaves without crossing words.
- **The five Stageshow demos are the bar** (glass checkout, Tandem's two screens, the subscriptions hero,
  the inbox snooze card, Linear's lean): `references/the-bar.md`.

## A scene, in outline

```tsx
import { Stage, Phone, Bar, type Act } from '../../kit'
import './scene.css'

type S = { open: boolean }
const START: S = { open: false }
const REST = { x: 640, y: 560 }

// A finger shows only where it touches, so the trip to the next target is a short, unseen hop.
const tap = async (a: Act<S>, at: string, x = 0.5, y = 0.5) => {
  await a.move({ at, x, y }, { duration: 160 })
  await a.click()
}

const script = async (a: Act<S>) => {
  a.mark('start')                 // the recorder starts the loop here
  await a.wait(900)               // the poster holds
  await tap(a, 'card', 0.7)
  await a.set({ open: true })
  await a.wait(1800)              // the payoff holds
  await tap(a, 'close', 0.5)
  await a.set({ open: false })    // the product's own way back
  await a.move(REST, { duration: 160 })
  await a.wait(600)
}

export default function Cover() {
  return (
    <Stage<S> width={960} height={600} initial={START} poster={START} script={script} cursor={{ at: REST, style: 'touch' }} className="x">
      {(s) => <Phone width={360} className="x-phone">{/* the product, in true points */}</Phone>}
    </Stage>
  )
}
```

Scope all CSS under the Stage's class (`.x .ss-stage { overflow: hidden; background: … }`).

## Motion values

| Role | Value | From |
| --- | --- | --- |
| A page, card or row arriving or settling | 500 ms, 8 px rise, `cubic-bezier(0.22, 1, 0.36, 1)` | DESIGN.md `--appear`, `--ease-out` |
| Rows in a list | 50 ms apart, at most eight | DESIGN.md `.appear` |
| A page leaving; fading in place | 200 ms `ease` to leave; 600 ms `ease` to arrive | DESIGN.md `--arrive` |
| A page thrown by a finger | `--ease-out` over 700–900 ms after a short drag | DESIGN.md |
| Moving across the stage | `cubic-bezier(0.8, 0, 0.2, 1)`, 400–700 ms | DESIGN.md's rolling-text curve |
| A block gliding to make room (a column moving over) | `cubic-bezier(0.45, 0, 0.1, 1)`, 600–700 ms | Stageshow's travel curve, the kit's own |
| The product's own feedback (select, press, open) | the product's values, e.g. 150–200 ms `cubic-bezier(0.4, 0, 0.2, 1)` | the real UI |
| Cursor travel, presses, rolls, flights | the kit's own | Stageshow |

Holds and the loop's length are storyboard choices. A value DESIGN.md doesn't have is a proposal
for the main session, not something to invent in a scene.

## Accessibility: what the site does, what the clip must do

`LoopingVideo` plays muted and inline, only while a quarter of it is on screen, never under reduced
motion (the poster shows), always with a pause button (WCAG 2.2.2), with a 1× / 0.5× switch in
figures, and labels the video with its `alt`. So the clip must: start on a poster that tells the
story; carry no audio track; stay under 10 s; never flash; hold anything that must be read for at
least a second.

## Never ship

| Never | Instead |
| --- | --- |
| A gate line cleared by hiding or `data-crop` | Fix its cause and film again |
| A white or glowing ground | Flat `#f4f4f3`; orbs over it for glass |
| A lone phone or a whole window floating on the ground | A hero off an edge and one satellite straddling it |
| A scroll, a page swap or a crossfade between screens | One screen; the kit's moves |
| A product screen shrunk from full size | The screen redesigned at 1:1, 11–15 px UI text |
| Two pointers on one stage | The arrow on the window; press feedback on the phone |
| A loop that plays the story backwards to restart | The product's own way back, or a reset under a cover |
| A loop that starts on a frame other than its poster | `poster` = `initial`, or start the script on the poster's state |
| Client names, people, real phone numbers or IDs | Bars, a neutral mark, a fictional 555-01xx number, another first name |
| Words, numbers or features the product doesn't have | Its real copy and numbers, or bars |
| A hand-drawn phone, window, status bar or bubble | The kit's `Phone`, `Window`, `Thread` |
| A field colour, type or curve from outside DESIGN.md | The tokens; propose new ones to the main session |
| An audio track, a cover over 600 KB, untagged colour | `record.mjs` and `clip.mjs` defaults |

## Files

- `scripts/record.mjs`: scene → clip, poster, checks and sheets, on Stageshow's virtual clock.
- `scripts/still.mjs`: scenes → 3× still PNGs (their poster state).
- `scripts/capture.mjs`, `scripts/figma-place.js`: scenes → editable layers in their cards on UV's
  Figma board (with the studio's `src/capture-prep.ts`).
- `scripts/rehearse.mjs`: Stageshow's `film.mjs` against a studio scene.
- `scripts/clip.mjs`: screen recording → loop (trim, solid redaction boxes, crop, fit, cross-faded seam).
- `scripts/lib.mjs`, `scripts/chrome.mjs`: encoding and checks; headless Chrome and a static server.
- `references/figma-review.md`: stills on UV's Figma board before anything moves.
- `references/studio.md`: the studio, a scene's anatomy, the recorder, and the traps found so far.
- `references/the-bar.md`: what the two reference sites' previews do, measured.
- `references/storyboard.md`: the beat table, seams, timing, poster and alt text; the portal cover as a worked example.
- `references/recording.md`: recording a clean screen and turning it into a loop.
- `references/export.md`: sizes, codecs, weights, colour, and the hand-off to the site.
- `evals/`: test cases for this skill (skill-creator's format).

When UV corrects an animation, add the note here or to the reference it belongs to, the way
Stageshow grew: every animation after it gets the fix for free.
