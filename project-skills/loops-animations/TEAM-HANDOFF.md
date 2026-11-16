<!--
  The handoff I wrote for the Loops team on 3 November 2026, so anyone could make animations in the
  site's style without waiting on me. Published here as it was sent, with the private repo's address
  taken out.
-->

# Making Loops animations yourself

A handoff for anyone on the team who wants to make new animations in the
style of useloops.ai without waiting on Yuvraj. Read this once, set up once,
then ask Claude Code for what you need.

You can also give this file to Claude as context: everything in it is true
of the repo as of 3 November 2026.

---

## 1. What Loops is, and what the animations are for

Loops (useloops.ai) is QA and compliance audit software for AI voice agents.
A company writes an SOP (the rules its voice agent must follow on calls);
Loops turns the SOP into numbered rules, grades every call against them with
evidence, shows what each new release of the agent broke or earned, and
drafts the SOP fixes for a compliance lead to approve.

The animations on the site are not decoration. Each one is the product
working, drawn with the site's own components, so a visitor understands one
thing Loops does by watching it happen once:

| Where | Animation | What it shows |
|---|---|---|
| Homepage hero | **Hero Cycle** | 10,000 calls scanned, misses grouped by the rule they broke, the SOP rewritten and approved, and what fixing the top rule is worth. Cycles through Collections, Healthcare and Insurance. |
| Homepage, How it works | **Step Stage 1, `sop`** | Your SOP becomes numbered rules, each citing its source; your compliance lead approves them. |
| | **Step Stage 2, `call`** | One call graded rule by rule as the recording plays; the missed rule quotes the line it relied on. |
| | **Step Stage 3, `release`** | Rule 2.3 was missed on 0.3% of calls in v13 and 1.9% in v14: what the release broke. |
| | **Step Stage 4, `earned`** | v14 earned $18,400 more than v13 per 10,000 accounts, with its 95% range. |
| Collections and Insurance heroes | **Industry Cycle** | One sample call, graded line by line. |
| Industry page sections | **Industry Graphics** (`week`, `clock`, `rel`) | The Reg F 7-in-7 dial week, the claims clock, the release compare. |

They all share one look: warm paper, ink, 1px hairlines, square corners, and
almost no colour. The green (verdigris) accent only ever marks progress or
the one finding; red and amber only appear on verdict pills.

To see every one of them with notes, run the site locally (section 3) and
open http://localhost:8080/design/animations/showcase.

---

## 2. What you are getting

**The skill: `loops-animations`.** A Claude Code project skill that lives in
the repo at `.claude/skills/loops-animations/`. It is already on GitHub, on
`main` of the Loops website repo, so cloning the repo gives it to you.
A zip of the same folder is next to this file in case you want it on its own,
but it only works inside a clone of the repo (it links the site's stylesheets
and fonts and reads the design rules from the repo).

What the skill contains:

- `SKILL.md`: the style, the rules and the workflow Claude follows.
- `references/catalogue.md`: every animation on the site, beat by beat, with
  where its code lives.
- `references/moves.md`: the motion vocabulary as code (scan line, playhead,
  verdict landing, line chart drawing, range opening, and so on).
- `references/porting.md`: how to move a finished animation onto a real page.
- `assets/engine.js`, `assets/stage.html`, `assets/window.html`: the loop
  engine and the two starter templates.
- `scripts/new.mjs`, `scripts/check.mjs`, `scripts/record.mjs`: scaffold a new
  animation, check it against the design system, export it to video.

---

## 3. Setup, once per machine

You need: access to the Loops website repo on GitHub, Node 20
or later, Homebrew, and Claude Code.

```bash
git clone <the Loops website repo>
cd loops-website
npm install
npx playwright install chromium
brew install ffmpeg
```

`ffmpeg` is only needed to export MP4, WebM or GIF. Everything else works
without it.

To look at the site and your work in a browser:

```bash
npm run dev
```

Then open http://localhost:8080. Your animations will be at
`http://localhost:8080/design/animations/<slug>`.

---

## 4. Making an animation with Claude

Open Claude Code in the `loops-website` folder. The skill loads on its own
when you ask for anything animation-shaped; you do not need to name it. You
can also type `/loops-animations` to load it explicitly.

Things you can ask for:

- "Make an animation that shows how Loops catches a missed disclosure,
  like the How it works cards."
- "Make a square GIF of the call grading for the newsletter."
- "Show release compare as a window graphic for the insurance page."
- "Turn the `release` step stage into a 1080x1920 vertical video for social."
- "Review this animation and tell me if it is on-brand."

What Claude will do, in order (you will see each step):

1. **Write a beat sheet** before any code: the one point, the product object,
   three beats with times, the one accent moment. Read it and push back here;
   it is the cheapest place to change your mind.
2. **Pick a format.** A **Stage** (one product window and one chip on the
   dotted green panel, like the four How it works cards) or a **Window** (a
   figure inside a section, like the industry graphics). A new hero animation
   is not something to make alone; ask Yuvraj first.
3. **Scaffold and build it** in `design/animations/<slug>.html`.
4. **Check it** with `check.mjs`, which fails on anything the design system
   forbids (wrong colours, durations, easing, shadows, rounded corners, text
   that clips, things left invisible) and writes review images.
5. **Compare it** with its siblings on the live site (`compare.png`), so it
   reads as one more of the same family.
6. **Export it** if it is leaving the site.

Look at the images it writes to `design/animations/out/<slug>/`:
`sheet-light.png` and `sheet-dark.png` show every beat, `compare.png` puts
yours beside the site's. If yours looks busier than the ones on the site, it
is wrong; say so and Claude will cut it back.

### Without Claude

The same scripts run by hand:

```bash
npm run anim:new -- <slug> --format stage
npm run anim:check -- <slug>
npm run anim:record -- <slug> --preset square
```

---

## 5. Exporting for social, email, decks

```bash
npm run anim:record -- <slug> --preset <preset>
```

| Preset | Output |
|---|---|
| `site` | 1920 x 1080 MP4 + WebM + poster |
| `card` | 1440 x 1080 |
| `square` | 1080 x 1080 |
| `vertical` | 1080 x 1920 |
| `email` | 800 x 800 GIF under 3MB |

Add `--theme dark` for a dark feed. Files land in
`design/animations/out/<slug>/`, which git ignores. Use the poster as the
thumbnail; a clip's first frame is the window still filling in. Anything that
leaves the site must show it is sample data (Claude adds a `Sample` pill).

For anything outside the codebase (a launch video, a deck still) also read
`design/DEMO-GUIDE.md`.

---

## 6. The rules that matter most

Claude and the check hold these for you, but know them so you can judge the
result:

- **One point per animation.** If it needs two sentences, make two animations.
- **It is the product, working.** Real Loops surfaces (rules, a graded call,
  a release chart). Never illustrations, icons, mock phones or dashboard
  collages.
- **Same sample world everywhere.** Maya, the agent for Quillfeather Services;
  Daniel Reyes; rules 1.1 to 6.2 from `tools/example-sop.md`; releases v13 and
  v14. Do not invent new rule numbers, figures, customers or product claims.
- **Calm motion.** Fade and slide only. No bounce, spin, 3D, blur or parallax,
  and nothing tied to scrolling.
- **Almost no colour.** The green accent marks progress and the one finding.
  Red and amber only on verdict pills. A pass is grey.
- **Square corners.** Only tags and pills are rounded (4px).
- **Copy:** sentence case, short product words, no hype ("seamless",
  "AI-powered", "unlock"), no exclamation marks, no emoji.

The full rules are in `SKILL.md`, `DESIGN.md` and `styles/tokens.css`. If a
new value (a colour, a duration) seems needed, that is a design-system
decision: ask, do not add it.

---

## 7. What is safe to do alone, and what is not

**Safe:** anything inside `design/animations/` and its exports. Nothing there
deploys, so make, check and export as much as you like.

**Ask Yuvraj first:**

- Putting a new animation on a live page. That is a design-system change:
  its spec goes into `DESIGN.md`, its accent use into `CLAUDE.md`, a line into
  `design/CHANGELOG.md`, and page copy needs approval.
- A new hero animation.
- Any change to the existing animations on the site (`site.js`, `ui.js`,
  `styles/`).

**Never:** push to `main` without running `npm run check` first and seeing
it pass. A push to `main` deploys production. Work on a branch and open a
PR instead.

---

## 8. If something goes wrong

- **`check.mjs` or `record.mjs` says Playwright or Chromium is missing:**
  run `npm install` and `npx playwright install chromium` again.
- **Export fails on MP4 or GIF:** `brew install ffmpeg`.
- **The animation shows unstyled or in the wrong font:** you opened the HTML
  file directly. Open it through `npm run dev` at localhost:8080.
- **Claude did not use the skill:** make sure Claude Code was started in the
  `loops-website` folder, then type `/loops-animations`.
- **It looks off but the check passes:** the check is the floor, not the bar.
  Ask Claude to compare it with the closest animation in
  `references/catalogue.md` and cut whatever the site's version does not have.
