# Design

The site's look, as built. Take values from here and `src/app/globals.css`; don't invent new ones.

## Direction

- **2026-10-30:** A reference portfolio as the model for flow, case studies,
  previews and tone, in meetuv.com's flavour.
- **2026-11-03:** case studies read the way the reference site's project pages do (UV approved
  `research/aesthetics.md`).
- **2026-11-04:** UV: the reference site's look ("beautiful typography, white color, spacing, and negative
  space") with the reference portfolio's case-study storyline, length and soft looping previews, light mode
  only. Then, of the Stageshow demo page: "Use the exact same colors, type, layout, and spacing, and a
  left-indexed list like the reference site's case studies"; "based on where we are on case study, a left label
  is selected and shown"; "I like how he uses yellow highlighter paired with scribble for focus";
  "The grey neutral palette is too good too". The values below are measured from the reference site
  (2026-11-04) and built in our own code; the reference site's copy, assets and handwriting font aren't used.
- **2026-11-04, later:** UV: the H1 "should be styled like the reference portfolio's, using a serif font, similar
  to what we have used before"; the case study simpler and closer to the reference site's ("the spacings do not
  match"); "a better icon library ... that resembles the reference site's icons—elegant, nice, and simple"; the
  summary simplified "while ensuring there is enough breathing room". So: page titles in
  Newsreader at the reference portfolio's 36px; the summary and titled points as the reference site lists; the draft
  markers quieter; Phosphor icons.
- **2026-11-11:** UV, after a reference site (a research note): figures built in
  code where they show the point better (before/after slider, state switcher, diagrams that build
  on scroll-in), laid out as single cards or two side by side; the column 580px and no wider; the
  index numbered and smaller. Each case study is laid out in Figma first, editable, for UV to
  change, then built.
- **2026-11-04, the index:** UV, with a screenshot of the Stageshow demo page's index: "improve
  spacing like the reference image". So the index takes the reference site's own CSS and script: the title
  30px under "↩ Index" and 16px over the sections, marked while the reader is above the first
  section; up to 160px wide; a section current once its heading is 128px from the top.

The reference portfolio's flow against ours: `research/case-study-flow.md`. Both sites' animations, audited by the
`visuals` session: `research/animations.md`.

| Reference | What this site takes |
| --- | --- |
| The reference site | The page, ink and greys; Inter at one size with weight for hierarchy; the column (550px then, 580px since 2026-11-11); section labels with a hairline; the pinned left index that marks the section being read; figures that hold their place and fade in; clips with a 0.5× switch; margin notes with a hand-drawn bracket; the yellow highlighter. |
| The reference portfolio | The case-study storyline and length (`research/case-study-flow.md`), Currently / Previously, one large preview per project with "Title / status" under it, soft looping previews. |
| A short portfolio | Home kept short. (Its proof pills were dropped on 2026-11-04: the covers do the talking.) |
| A travel-themed portfolio | Planned: a passport card on About (needs UV's places and stamp art). |
| Three personal sites | Planned, optional: a Fun page. |
| meetuv.com | The brand orange (focus ring, draft labels, home placeholders), the rolling-text hover. |

## Colour

Light only: the site ignores the system's dark mode (`color-scheme: light`). Values measured on
the Stageshow demo page, except `--muted`: the reference site's secondary text is black at 40% (`#989897` on the
page, 2.8:1), below WCAG AA, so ours is the lightest grey that passes AA on both the page and the
panels. Contrast is the worst case, against `--bg` or `--surface`.

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `--bg` | `#fdfdfc` | Page | |
| `--surface` | `#f4f4f3` | Figure panels, the "In short" panel | |
| `--text` | `#111111` | Text, titles, the index's current section | 17.2 |
| `--muted` | `#6e6e6e` | Secondary text: dateline, index, captions, labels | 4.6 |
| `--ink` | `#4a4a4a` | Margin notes and their brackets | 8.1 |
| `--rule` | `#f2f2f2` | The hairline after each section label, the end rule | |
| `--divider` | `#eeeeed` | Between rows of a list ("In short", titled points, To gather): the reference site's 6% black | |
| `--line` | `#e3e3e3` | The quote rule, the header's rule | |
| `--underline` | `#d9d9d9` | Link underlines; `--muted` on hover, over 200ms | |
| `--highlight` | `#ffd43b` | The highlighter, behind `--text` (13.3); the rule beside an open question | |
| `--accent` | `#c93500` | The focus ring | 4.8 |
| `--brand` | `#ff4400` | Non-text marks only | 3.1 (non-text) |

A case study without its looping cover yet (the website, 2026-11-04) shows a `--surface` panel on
Home with the project's name in `--muted` (`src/components/cover.module.css`); its text is
decorative.

## Type

- **Inter** (variable, normal and italic, `next/font/google`, self-hosted at build): all text.
  **15px on a 22px line** (`--text-base`, `--leading`; UV, 2026-11-15, was 14 on 20), weight **460**
  (`--w-body`); page titles **500** (`--w-title`); section labels, headings and `strong` **600**
  (`--w-strong`). Case-study section headings **17px** (was 16). Tracking from Inter's own curve:
  **-0.0088em** at 15px, **-0.003em** at 13px.
- **13px** (`--text-xs`): labels, tags, draft notes. Captions and the index are 13px too
  (`--text-caption`, was 12px; captions on a 1.5 line). One small size for all secondary text.
- **Newsreader** (`next/font/google`, normal and italic): every page's h1 (`.title-serif`), as
  the reference portfolio sets its titles: **36px** (`--text-title`, 28px on phones), weight 400, line 1.15,
  tracking -0.02em. Its italic also sets `em`, at 1.07em, as the reference site sets emphasis.
- **Nothing You Could Do** (`next/font/google`, not preloaded): margin notes, 22px
  (`--text-hand`) on 0.95. A free stand-in for the reference site's own script, which is its author's and isn't
  available; UV's handwriting as a font would be better later.
- The h1 is the only large type: everything else, metric values included, is at text size.
- **Icons: Phosphor** (`@phosphor-icons/react`, MIT, imported from `/ssr`, only the icons used
  ship), regular weight at 12-14px for roughly 1px rounded strokes, like the reference site's hand-made
  icons; `fill` for the clip's play and pause. In use: `ArrowUDownLeft` (↩ Index), `Play` /
  `Pause`, `Image` / `FilmStrip` / `Sparkle` / `FlowArrow` (the four cue kinds), `Question`.
- Hyphenated words in headlines never split (`keepHyphenated`, `src/lib/text.tsx`).

## Layout and spacing

- **Column:** `--measure` **580px** (UV, 2026-11-11: "580 pixel and not more than that"), centred on the page. Figures are the column's width
  (`--wide` is the same). Side gutter `--gutter` 24px on phones, up to 48px.
- **Case-study page** (`src/app/work/[slug]`): no header. Above 1080px (`67.5rem`) the index is
  pinned 80px from the top and left, as wide as its longest line up to 160px (the reference site's), and the
  column starts 80px down. From 960px to
  1080px the index shrinks to "↩ Index" above the column (80px down, the column at 140px); below
  960px "↩ Index" sits 32px down and the column at 92px.
- **Rhythm:** paragraphs 16px apart; a section label 56px below the text before it and about 35px
  above the text after; figures 40px below the text before and 48px above the text after;
  captions 24px under their figure.
- **404** (2026-11-15): same column and top margin as Home, About and Contact. The one decorative
  large type besides the h1: "404" in Inter 400 with the slashed zero (`font-feature-settings: "zero"`),
  `clamp(6rem, 24vw, 11rem)`, `--line` colour, `aria-hidden`; then the serif h1, `--muted` text
  (28rem wide), one small dark button (as Send on Contact, with an `ArrowLeft`), then the wave and the
  Email / LinkedIn cards as on About. Air: 56px under "404", 16px under the title, 32px under the text, which wraps balanced.
- **Home and About** keep their own page width (`--page` 60rem) with the header; the text is at the
  same size as everywhere else.

## Components

- **Index** (`case-index.tsx`), measured on the Stageshow demo page: "↩ Index" (14px, `--muted`, the
  arrow 4px from the word) back to Home; 30px below it the case study's title (13px on 1.2, at
  most two lines), which keeps its place but shows only once the page title has scrolled away;
  16px below the title the sections and "To gather", numbered "01", "02"… (UV, 2026-11-11, after
  a reference site) in a 20px column of their own so wrapped labels line up, all at 12px on 1.2,
  8px apart, `--muted`. The title is 12px too. The place
  being read is in `--text`, number included, with `aria-current`: the title until the first section begins, then
  the last section whose heading is within 128px of the top of the window, or the last section
  once the page is within 24px of its end.
- **Case-study header:** the serif title, 12px of air, then the dateline (client · year) and, on a
  draft, one plain line pointing to To gather, both `--muted`; the summary 24px below as the first
  paragraph. Then the cover, 40px down.
- **In short:** a section like the others (label and hairline), holding one of the reference site's lists:
  a row per fact (Role, Team, Timeline, Skills when given, Problem, Outcome, Key decisions), the term `--muted` in a
  120px column, 12px of padding and a `--divider` under each row, no box. Outcomes are lines: the
  figure in 600, what it counts after it in `--muted`. Decisions are "01" lines, the number `--muted`.
- **Section:** the label (14px, 600) and a 1px `--rule` hairline running to the column's edge; the
  section's point as its first paragraph; then the blocks. No numbers.
- **Titled points** (block `columns`): side by side from 640px, as the reference portfolio sets its threes (UV,
  2026-11-13), 24px apart, each title in 600 over one or two short lines; on phones they stack with a
  `--divider` between.
- **Portfolio-style header** (when a study sets `collaborators`): the cover first, then the serif title,
  then Collaborators · Timeline · Scope in three columns, the term in `--muted` over its values; no
  summary paragraph and no "In short" panel. Only the portal uses it so far.
- **Section opening:** one paragraph in body type, the point and its reason together, the key phrase
  under the highlighter (`==…==`); Newsreader stays on the h1 only (UV, 2026-11-13). Titles in a row of
  three stay on one line, their texts about the same length (10–12 words). Paragraphs run to three
  lines at most, mostly two. Every figure has a caption.
- **Section separators** (studies with `collaborators`): a full-width 1px `--rule` above each
  section, 56px of air either side; the label then drops its own hairline.
**Steps** (block `mediaRow`): the figure in its frame, then its few
  words under it.
- **Figure:** every case-study figure sits in one **frame** (`Frame`, `blocks.tsx`): a 16:10 panel
  in `--surface`, radius **12px** (`--radius-figure`), at the column's width, that holds its space
  from the start; the screens are fitted inside it whole (`object-fit: contain`) and fade in as
  they load (`ArrivingImage`). Caption 12px, centred, `--muted`, 24px under the figure. A draft's cue
  keeps its own height (at least 16:10).
- **Figure images are made at the frame's shape** (UV, 2026-11-10), so the image's ground is the
  frame and nothing ends mid-grey. Why 16:10: it's a laptop screen's shape, so a desktop screen
  fills it, and two or three phones stand side by side at full height. The spec, in Figma: a
  **1600×1000** frame, flat `--surface` (#f4f4f3), no radius (the page rounds it), no stroke; the
  content inside a centred **1280×680 safe area** (a **160px** margin all round), shadows ending
  inside the margin. A screen taller than the safe area keeps its top margin and runs cleanly off
  the frame's bottom edge; anything shorter sits whole, centred. Phones that belong together are
  one image (one frame), never separate images side by side. Exported at 1× (1600×1000) for the
  page and 2× (3200×2000) for the full-size view, as JPEG (quality 85) to
  `public/figures/<slug>/16x10/<name>.jpg` and `<name>@2x.jpg`, with `srcSet` "1600w, 3200w".
- **Phone figures, uniform kit (proposed 2026-11-12, awaiting UV's review; Coozy's figures, in
  Figma only, personal-files page "Case study · Coozy (layout)", section `4554:18497`).** Same
  1600×1000, `#f4f4f3` frame, but every phone is the **same size in every figure**: a 340×750
  screen (the source's 412×~910 scaled to fit, cropped from the top, or from a named offset for a
  bottom sheet) in a 6px `#1c1c1e` bezel, radius 46 (screen 40), no shadow (the shadow rendered a
  hard edge under the phone). Phones sit on **one row, tops aligned**, 120px apart, with a label
  pill above each (white, 1.5px `#e3e3e0` stroke, Inter Medium 28, 28px gap), the whole group
  centred, so the margins are about 80px top and bottom, not 160. Screens are shown whole where
  they fit; a longer one shows its first viewport. Banner cards are scaled uniformly (one scale per
  figure) and centred, with their labels to the left or above. Why: the old figures scaled each
  phone to a different size and staggered them. Not yet in the site's `16x10` exports.
- **Build notes (2026-11-12, from the figures playbook):** each figure in review has an orange chip above it, "Build note (not on site) · Static / Animated: … / Interactive: …", outside the 1600×1000 frame so it is never exported. UV edits the chips; they are the build order. Chip: fill #ffedd5, 1.5px stroke #fb923c, Inter Medium 22, text #9a3412, radius 10. A Direction card may end with an **OPEN QUESTION** block (same heading and body styles as the two prompts) for something only UV can answer, such as a rejected image's reason or whether to mask names; it becomes a question block on the page.
- **Phone figures v5, bleed and satellite (2026-11-12, replaces the uniform kit's whole phones; Figma only, awaiting UV's review; `research/site/figure-composition-notes.md` has the research).** Phones are never whole and floating: pinned from the top and **cropped by the bottom edge** (a reference site, Stageshow, the portal). Landscape 1600×1000: pair = two phones 500 wide, 64 apart, tops 156 down, label pills in the top gutter; trio = 420 wide, side gutters 88; a 160px fade in the stage ground colour over the foot. Square 1000×1000 (rows): one phone 500 wide at the 88 gutter, plus a **satellite** (a crop of the real other screen, 360 wide, white, radius 28, hairline, one soft shadow `0 10 28 .14`) straddling its right edge by about 48px and sitting a gutter from the bottom. Banner grids scale to fill the stage with the 88 gutter on every side. Rows in the layout are 300×300. Gutter 88 at 1600 (about 32px shown).
- **Phone figures v6, Stageshow stills (2026-11-12, supersedes v5's grey grounds; Figma only, awaiting UV's review).** Same bleed-and-satellite composition, now with: **the platform's own status bar on every phone**, drawn once from Stageshow's real geometry and replacing each screen's baked bar (iOS: 402pt screen, 62pt bar, time centred in the first 138.5, island 95×37 at y 14, glyphs from x 285.25, the iOS 27 paths; Android: 412pt, 48pt bar, 26pt side padding, punch hole 24 at y 14, Material wifi, signal and battery at 18, all centred on y 26); screen corners 0.159 of the width (iOS) and 0.092 (Android); **tinted fields** from Coozy's palette, one per chapter (peach `#FDE8DA` onboarding, AI, memories and Premium; sand `#F6EBDD` milestones, activities, feedback; blue `#DCEBFA` leaps; grey `#F4F4F3` audits and data); a **touch dot** (44 dot, 76 ring, white 3px, no label under it) where the story has a tap; one **close-up satellite** (1.7×) and a **leader annotation** (2px ink line ending in a 7px dot) where a detail needs naming; the brand as paper (two posters, small opposite angles). The middle phone of a trio takes the hero shadow `0 24 48 .16`. Each figure carries a Build note chip and a Direction card (its static and motion prompts, `research/site/coozy-figure-prompts.md`), both outside the 1600 or 1000 frame.
- **Figure labels and satellites (2026-11-12, UV's review of v6; Figma only).** Labels around a figure are **plain text in the site's own type** (Inter Medium, 13px at the shown size = 36 at the 1600 stage, `#333` on the tinted fields), never a white pill: a white pill beside a white app screen competes with it. The text inside an app screen stays the app's own. A **satellite or cell crop starts and ends on whole components with the app's own padding** (the source's 16–24pt insets), never through a card, a caption or a tab row; where a source has no clean boundary the window is moved until it does. Matrices are split so each cell is at least 350 wide at the stage (two figures of two rows). Real screens are reused wherever they exist: the Free vs Premium figure is the app's own locked-leap screen and Upgrade Now sheet, not a redrawn table.
- **Coozy figures in code (2026-11-12, local review).** The Figma stills are built as code: exported vector SVGs of the real screens (never redrawn), the kit's Phone for chrome, plain labels in Inter at the shown 13px, red handwritten scribbles (the site's handwriting face, `#d8453b`, 2.2px hand-drawn loops and arrows) for annotation, the dark selected pill and the ring drawn in code where a tap or hold answers. A satellite is one exact crop with the one soft shadow; sheets rise (0.9s, `cubic-bezier(.25,.8,.25,1)`), satellites slide 70px, banners and cells arrive 26px up with 0.6s fades, a phone out of focus drops to 50%. Stage fields are the Coozy tints (peach `#FDE8DA`, sand `#F6EBDD`, blue `#DCEBFA`, grey `#F4F4F3`). See `src/components/figures/coozy/cz.css`.
- **Coozy figures revamp (2026-11-12, replaces the halved Figma stages).** Stages at 1:1: landscape 580 × 362 with a compact design at 358 (taller, the same phone size), square 300 × 300. One big phone per figure (screen about 250 to 300px, iPhone body type about 10.5 to 11px, Android about 9 to 10px), cropped by the stage like the cover; a second object either straddles from frame one or the change happens inside the phone. Motion: the kit touch cursor (`style: "touch"`, never `still`), UIKit responses `cubic-bezier(0.3, 0.75, 0.1, 1)` about 0.5s, pushes slide the new screen in from the right while the old shifts left about 25%, sheets rise from the visible foot of the crop over a `rgba(0,0,0,.35)` scrim (the baked scrim in UV's frames), a flick runs the finger 1:1 then throws the page on with `cubic-bezier(0.25, 1, 0.5, 1)`; resets happen under a cover or by a seen cause, never a blank stage. No shadows beyond the phone's and a hairline; the stage no longer rounds its own corner. Typing dots (`.cz-dots`) for an answer about to stream; exported art fades in over 0.4s. Recipe and rules: `research/site/coozy-revamp-brief.md`; reference figure `f12.tsx`. Rounds 2 and 3: phones open on their top then pan and zoom on `cubic-bezier(0.45, 0, 0.1, 1)`; a zoom never takes the phone's side edges within 12px of the card; sheets use `SheetShell` (12px top radius, grey grabber, below the status bar); an animated pop uses a soft overshoot `cubic-bezier(0.34, 1.45, 0.5, 1)` about 0.35s on grey placeholder tiles that stay, so the canvas is never blank. Placeholder tiles are barely darker than their card, with no outline, and some are filled from frame one. A phone card in a gallery gets its own caption zone (topic, step marker, one line) so cards differ at a glance.
- **Coozy brand board on phones (2026-11-15):** cz-n14's compact layout keeps an 8% side margin (15% wide) and sets its hex codes at 7px (10.5px wide), so the swatches lead.
- **Coozy figures v7 (2026-11-12, six more in code).** Two more stage fields: cream `#FCF8F2` (n09, UV's edit) and the page tone `#FDFDFC` (n08). **n08** is the portal's options card laid out three across (the layout of UV's reference; type is the site's own): a `#F4F4F3` panel (radius 12 at the shown size) with the store image centred, a verdict tag (Inter 500, grey `#EBEBEA`/`#555` for Rejected, green `#DCEFE3`/`#1D5C3C` with a check for Approved), a title (Inter 600), and a grey line (`#6E6E6E`). **No loop starts from an empty canvas** (UV, on n10: if everything appears in place "the remaining canvas will look empty"): the art is on screen from the first frame and the motion is emphasis, a focus walk, a ripple of light or a pan; only words and states change. Icons carry their own shadow as a `drop-shadow` filter (tile 0 5 14 .10, hero 0 9 18 .16, the centre icon in n13 0 7 15 .16, lifting to 0 11 20 .22); posters likewise, so the shadow follows the art's own corners. Exported drawings fade in over 0.4s when they arrive (reduced motion: no fade).
- **Groups** (block `gallery`): desktop screens are never side by side: each gets its own frame,
  stacked 24px apart, with one caption under the group. Screens share one frame, side by side
  8px apart at its full height, only when they fit it (the sum of their width-to-height ratios is
  1.8 or less: two or three phones).
- **Full size:** every case-study image is a button (`zoomable-image.tsx`, `zoom-in` cursor,
  "Enlarge: <alt>") that opens it in the browser's modal dialog on `--bg`, as large as the window
  allows less the gutter, with a round close button (32px, `--surface`) top right. Esc, the button
  or a click anywhere closes it and focus returns to the figure; the page doesn't scroll behind it.
  It fades in over `--appear` with `--ease-out`, only without reduced motion.
- **Highlighter** (`==text==` in a case study's Markdown, `annotations.tsx`): a hand-drawn
  `--highlight` stroke behind the words, line by line (Rough Notation, `highlight`, two passes).
  For the one sentence that carries a passage: at most one per section.
- **Margin note** (a `note` block after the block it's about): in the hand face and `--ink`. Above
  1080px it sits in the right margin, 32px from the column, 256px wide (narrower where the margin
  is shorter, so it never runs off the page), centred on its block, with
  a hand-drawn bracket (Rough Notation, `bracket`, 1px) down the block's right edge. Below that
  it's centred under the block, without a bracket. A note with no block before it stands alone,
  centred.
- **Looping video:** muted loop that plays only on screen, never under reduced motion, with a pause
  button (WCAG 2.2.2). In case-study figures it also has a **1× / 0.5×** switch (`speeds`).
- **Covers:** each case study's looping preview, made by the `visuals` session with Stageshow:
  `public/covers/<slug>.mp4` (1920 × 1200, 60 fps, H.264, no audio, 7-10 s) with `<slug>.png`, its
  first frame, as the poster. The Worker serves them as static files, in byte ranges, which Safari
  needs to play video. Shown on Home and under a case study's summary, without the speed switch.
- **Header** (Home and About only): Work and About on the left, "Get in touch" on the right; links
  `--muted`, the current page `--text`; labels roll on hover (meetuv.com's 400ms
  `cubic-bezier(0.8, 0, 0.2, 1)`).
- **Preview (Home):** two to a row from 1024px only; tablets and phones stack them (UV, 2026-11-13; was 640px (48px between columns), one on phones (UV,
  2026-11-04). 16:10 cover, radius 8 (`--radius`), then one line, "Title / status", and nothing else: the
  cover does the talking; the tagline and numbers live in the case study (UV, 2026-11-04).
  The whole preview is one link; focus rings the whole preview; hover zooms the cover's picture
  1.5%. The zoom moves the image or clip itself, never the clip's wrapper: a transformed wrapper
  would put the clip's pause button under the link, so pressing pause would open the case study.
- **Dark buttons and cards** that are links (the 404 and CV buttons, the call banner, the next-case card) set their text white on hover themselves: the global `a:hover` turns link text `--text`, which is black on the dark fill. Any new dark link needs `color: #fff` in its own hover rule.
- **Links:** text colour with a 1px `--underline` that darkens to `--muted` on hover.

Draft-only pieces (2026-11-04, UV's request for cues and open questions on version one): they mark
what a draft still needs, and go away as UV fills them in.

- **Cue** (a `media` slot holding `{ kind: "cue" }`: format, brief, source, notes): an empty
  figure panel (`--surface`, radius 12px), at least 16:10 of its figure's width (`62.5cqi`: figures
  and cue panels are size containers), taller when the text needs it; in a gallery, cues match in
  height. Centred in it: the kind's icon and label ("Image to capture", "Clip to record",
  "Animation to make", "Diagram to make", 13px `--muted`), the brief at text size in `--text`, and
  where it comes from (12px `--muted`). How to take it (`notes`) is in To gather. Long keys and
  paths wrap anywhere. On Home a cue cover shows the placeholder.
- **Open question** (block `question`): where its answer belongs, set off by a 2px `--highlight`
  rule on its left; above it the `Question` icon, "Open question" in `--text` 500 · who can answer
  ("Ask the team", "Find in the documents", "Pull the numbers", "Yours to answer"), 13px `--muted`.
- **To gather:** the last section of a draft with cues or questions. "Figures to capture" then
  "Open questions", grouped by who can answer; each a list row with a `--divider`: the brief or
  question (a link to its place), then in 12px `--muted` its kind and section, where it comes from
  and how to take it. The draft line and the index link to it.

### Diagrams (Rifa case studies)

Reflect's and Agent Studio's diagrams share one look, Stageshow's Hookline diagram in Rifa's indigo:
`src/components/figures/reflect/scenes/rf-loop/diagram.css` (the `rfdg` classes). It has a #4a3aff
field with a 12px grid at 8% white, and windows with a 1px edge at 32% white, a 30px title bar
(three open lights) and a solid body. Rows and pills are quiet outlines. Connectors are 1px dashed
lines with small open heads. White is for the one top-level line; white at 80% (4.6:1) is the second
voice. One element per figure is picked out with a 1.5px white edge and a solid connector.
Landscape diagrams are authored at 580 × 362.5; square ones, for a mediaRow, at 300 × 300
(`.asdg-sq`). The Agent Studio diagrams use the shared parts in
`src/components/figures/agent-studio/diagram.tsx`. Where a window is too narrow for a centred title,
the title starts just after the lights (`as-overrides`).

### Figure rules (from the 2026-11-15 audit)

- **Never an empty stage.** A loop resets by dimming, draining or undrawing what's there, never by
  clearing it; the art stays on screen through the seam.
- **Muted text passes AA on its own ground:** `--muted` #6e6e6e on the page and light greys, #5f6672
  on the website figures' grey, #555 on Coozy's tinted fields, Rifa's #5f6170 on Agent Studio cards.
  Never dim text by opacity.
- **One state at a time.** Swaps fade out, then in (out ~160–200 ms, in from ~140 ms); never a
  crossfade where both states can be read.
- **Crops and pushes rest on whole components:** no sliver of a sidebar, no letter or line cut by an
  edge, a phone or a sheet.
- **The cursor never rests on UI.** After its last click it leaves the stage; where a cursor is
  shown it's the kit's arrow at a readable size, not the grey dot.
- **Modal scrims** cover the app window only, clipped to its corners, never the figure's ground.
- **Before/after:** plain labels (13px, no pills); a slider rests where one side is whole.

### Next case study card

It's a dark card. The next case study's cover sits on the left 48%, with a 2rem top margin, running
off the card's left and bottom edges. The label and serif title are on the right, at the same 2rem
gap (`--next-gap`). The round arrow is white at 12% at rest and the brand colour on hover or focus.
The cover plays only while the card is hovered or focused (`data-ss-hover-host`), and phones hide
the cover.

## Motion

- `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)`: meetuv.com's no-bounce spring as a curve.
- `.appear`: a page settles in once, rising 8px and fading in over **500ms** (`--appear`),
  staggered **50ms** by `--i`, at most eight steps.
- After that text stays still: there is no scroll-tied motion on text.
- Pictures arrive: an image not yet loaded at hydration fades in over **600ms** `ease`
  (`--arrive`) when it loads; `loading="lazy"` makes that happen as it nears the screen.
- Hand-drawn marks draw in the first time they're on screen: the highlighter and the bracket over
  **800ms** in all, ease-out, stroke by stroke (Rough Notation's default). Under reduced motion they
  appear already drawn.
- The index's current place changes colour over 100ms; its title fades in over 200ms.
- Clips play only on screen; the home preview's picture zooms 1.5% on hover.
- All motion is inside `prefers-reduced-motion: no-preference`. One motion library, Rough Notation
  (MIT, ~4 KB), for the hand-drawn marks; everything else is CSS.

- **Footer (2026-11-13, after the reference portfolio):** one quiet row with no rule above it: the freelance line on the left, Email · LinkedIn · Résumé on the right, all `--muted`, 24px apart, text colour on hover. It wraps on narrow phones rather than overflowing. The top bar was already the reference portfolio's: links left, "Get in touch" right, a rule under it at every size.
- **Top bar → sidebar (2026-11-13, after the reference portfolio):** below 1440px the top bar is unchanged. From 1440px (`90rem`, where the 960px page leaves room in the margin) the name sits fixed in the top-left corner (28px down, 24px in) and Work, About and Get in touch stack down the left edge from 240px, 24px in, with no rule. Case studies keep their own index there.
- **Selected mark:** the current page's link stays in `--text`, with a 5px square of `--brand` (#ff4400, meetuv.com's orange) 10px in front of it, in the top bar and the sidebar. It's the only use of colour in the chrome; everything else stays neutral.
- **Cover finish:** every cover frame carries a faint white veil (6%) and a 1px inner outline at 6% black, so light covers keep a soft edge on the page.
- **Home card caption:** "Title / Status" (Shipped 2025), then the tagline as one `--muted` line; 16px between cover and title. Rows sit 48px apart on desktop (40–56px when stacked).
- **Rail:** `--rail` 40px is the left edge on wide screens for the home sidebar, the name and the case-study index, all the same (and the right edge for the scroll ticks). Past 1600px it grows with the extra width, `max(2.5rem, (100vw - 100rem) / 2 + 2.5rem)`, so on big monitors everything stays as it sits at 1600px, centred.
- **View project cursor:** over a home card, a black pill (`--text`, white 13px text) with a 5px `--brand` square follows the pointer 14px off, fading in over 150ms; mouse only.

## Envelope intro (trial, 2026-11-14)

On Home only, desktop and tablet (not phones), a hard load: UV's envelope from the Framer site, kept as it was tuned,
in the site's own colours and type (UV, 2026-11-14). Ground: `#efe8dc` under the page's grain
(`html::before`) and a second, denser one (`html::after`), a touch warmer than `--bg`, so the sheet (`--bg`, with the paper texture at 0.6)
reads as lighter paper. Headline: Geist Mono 400, the one typewriter face, `clamp(14px, 2.292vw, 22px)`
on a 1.5em line (the Framer size; the site's 14px was too small), `--text`. Pointer over the sheet: an orange (`--brand`) dot and, beside it, the site's cursor pill
(`view-cursor.module.css`) with a white mail icon whose flap loops open and shut (2.8s), shut for good on press; "Click for sound" is the same. Close icon: Lucide minimize-2 16px in `--muted` (`--text` on hover), in a 40px button fixed
12px to the right of "Contact", level with it, below 1440px (a narrow window's header makes room for it); from 1440px in the window's top-right corner (`right: --rail - 12px`, `top: 18px`, level with the name). Motion: sheet tilt -4°, hover lift 40px; open and
expand 0.6s on `cubic-bezier(0.32, 0.72, 0, 1)`; fold-back 0.7s shrink, 0.42s settle, 0.18s fade;
headline rise 0.9s on `cubic-bezier(0.65, 0, 0.35, 1)`; hover spring 0.45s, bounce 0.18; sounds 0.38
(keys) and 0.2 (effects). The rest is in `src/components/envelope/envelope-intro.tsx`. A click, Enter or a downward scroll (wheel 30px, swipe up, ArrowDown, PageDown, Space) opens the letter; a scroll during the typing only skips it. The paper in flight shows only figures the page has already loaded, mounted before it moves; nothing mounts while it moves. Switch off
with `envelopeIntro` in `src/site.ts`.

## Craft details dialog (2026-11-15)

After a reference site's side-project dialog (`src/components/craft-dialog.module.css`). Scrim `rgba(15,15,15,.42)` with a 3px backdrop blur. Card `--bg`, radius 20, `0 0 0 1px rgba(17,17,17,.06), 0 24px 60px -20px rgba(0,0,0,.4)`, as wide as its stage plus a 22rem text column. Left: a `--surface` stage, radius 14, 8px inside the card, that hugs the piece: a fixed height (34rem at most, less on short or narrow windows) and a width from the piece's ratio, so a 9:16 reel makes a narrow card and a square a wide one; the piece fills it 24px in, radius 8, the one soft shadow `0 10 28 .14` and the covers' hairline. Right, set at the bottom (padding 64/36/36/28) in three groups, 12px apart inside a group: the Newsreader name 32px (28px on phones) and the summary in `--text`; the site's wave (`--line`, 10px tall, 28px above and below); the tags and the paragraph in `--muted` (150 characters at most, about four lines); then the 404's dark button with an up-right arrow 32px below, across the column's full width. A piece with no outside link ends on Close in the same place: transparent, `--text`, a `--line` hairline, `--surface` on hover. The kind (`label`) is no longer shown: the summary says it. Tags are Home's grey proof tags; a feature by someone else ("Featured on lenis.dev") is the same tag in gold: `linear-gradient(#fff7dc, #fbeab3)`, a `rgba(176,128,0,.22)` hairline, text `#6b4e00` 500, a filled Phosphor SealCheck in `#c08a12`. Close: a white 32px circle, `0 0 0 1px rgba(36,32,32,.08), 0 2px 8px rgba(0,0,0,.12)`, 16px from the top right. Below 720px a bottom sheet (radius 20 on top, 92dvh at most): the stage fills the sheet's width, its height fits the piece (at most 48dvh), and the piece sits centred in it. Motion (no-preference only): scrim fades 220ms, card rises 10px from 0.98 over 300ms `--ease-out` (the sheet slides up from below), and leaves the same way.

- **Dark button height (2026-11-15):** Send, the CV button, the 404 button and the Craft dialog's button share `--button-h`: 44px, 48px below 720px, text centred.
- **Voice Orb tile (2026-11-15):** the orb (52% of the tile) with its state pill under it, stacked, sized in container units so the tile and the dialog match. The pill is quiet: `rgba(17,17,17,.05)` with `--ink` text (red read as an error). While connecting, listening or talking, three dots pulse after the word (1.2s, 0.15s apart; still under reduced motion).
- **Craft wide piece (2026-11-15):** a piece marked `wide` (The shelf) heads the grid, as wide as two columns and their gap (full width below 960px); the first two columns stack under it and the third stands beside. In the dialog a landscape stage is capped so the 22rem text column always fits.
- **Figure text on phones (2026-11-15):** where a figure carries site text (the Coozy story cards' name, steps and line), its compact layout uses the phone type scale (17 / 13 / 15 on 22), divided by the stage's `--ss-scale` so it renders true to size.
- **Sofa on phones (2026-11-15):** Home's sofa photo runs past the gutters to the screen's edges below 640px.
- **Phone buttons (2026-11-15):** every call-to-action button fills the column below 720px (404, Send, CV, Craft dialog).
- **Problem panel (2026-11-15):** the case-study problem panel's monospace text is 14px (was 13).
- **Figures on phones (2026-11-16):** below 640px a figure with a phone still (`phone-stills.json`) holds its phone shape from the first paint and shows the still, except the few kept animated (`PHONE_LIVE` in code-figure.tsx: the Coozy cover and story cards) and interactive figures. Stills are shot from the phone layout, settled, at 2×.
