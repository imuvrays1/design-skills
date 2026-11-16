# The studio, the recorder, and the traps

## The studio

`research/prototype/previews/studio/` is a small Vite + React 18 app that holds every scene:

```
studio/
  kit/                  Stageshow's kit, copied from ~/.claude/skills/stageshow/kit (MIT). Don't edit; refresh.
  scenes/<name>/        one animation each: index.tsx (default export: the Stage) + its CSS
  src/main.tsx          picks the mode from the URL; installs the virtual clock for recordings
  src/preview.tsx       mounts one scene (or lists them)
  src/page.css          the page around a scene
```

Open it while you work: `npm run dev` in the studio, then `http://127.0.0.1:5199/` lists the scenes.

| URL | What it shows |
| --- | --- |
| `?scene=<name>` | The scene playing on the browser's own clocks: watch it, film it |
| `?scene=<name>&still=1` | Its poster, as reduced motion shows it |
| `?scene=<name>&bare` | Edge to edge: the viewport is the stage |
| `?scene=<name>&record&fps=30` | Bare, on Stageshow's virtual clock: time moves only when stepped |

## How the recorder works

`scripts/record.mjs <name>`:

1. Builds the studio into a temporary folder and serves it (so runs in parallel don't collide).
2. Loads `?still=1&bare` at the stage's own size, 2× device pixels: the poster.
3. Loads it again under emulated reduced motion: it must show the same poster and stay still.
4. Loads `?record&fps=30`. The studio installs `installVirtualClock()` from the kit before React or
   the scene loads, exactly as Stageshow's playground does. Each frame the recorder flushes pending
   layout work (the kit measures targets in layout frames, which move no time), steps the clock by
   one frame (timers due fire in order, one animation frame runs, every CSS transition and animation
   moves to the new time), flushes layout again, and screenshots the stage.
5. Starts at the frame where the script's first `a.mark()` appears and stops when that mark comes
   round again: exactly one loop, whatever its length.
6. Encodes, finds the poster's frame in the loop, checks, writes the report and sheets.

Because every frame is stepped, a recording is identical on every run and nothing drops or doubles,
however slow the machine.

## Traps found so far

- **A target object needs both `x` and `y`.** `{ at: 'select', x: 0.8 }` makes the kit compute `NaN`
  for y; the cursor's tween never ends and the script stalls with no error. Write
  `{ at: 'select', x: 0.8, y: 0.5 }`.
- **No top-level `await` in the studio's entry.** Scenes import the kit's clock from the entry chunk;
  an entry that awaits the scene deadlocks with it (blank page, no error).
- **A finger's travel is dead air.** With `cursor.style: 'touch'` nothing shows between taps, so
  `a.click(target)`'s hand-paced travel adds 0.3–0.6 s of nothing per tap. Hop there with
  `a.move(target, { duration: 160 })`, then `a.click()`.
- **Text and a link side by side in a grid cell become two rows.** `display: grid` makes each text
  run and element its own item: wrap the line in one `<span>`.
- **Rehearse on the dev server, record from a build.** `film.mjs` tells the kit's CSS from yours by
  the file a rule comes from; a production bundle merges them and every phone part reads as "kit
  override". `rehearse.mjs` runs the dev server for this reason.
- **Give the stage `overflow: hidden`** so the crop is yours (film flags an unclipped phone).
- **Moving text needs a lasting layer.** A page scrolled by a parent's transform, or rows rising in,
  hop a fraction of a pixel when they land: `will-change: transform` on the moving element.
- **A page that scrolls under a status bar fades there** (a 14 px mask at the top of the viewport)
  rather than being sliced by a hard edge.
- **Mark a scrolling page `data-crop`.** It runs past the screen on purpose; film's padding and layout
  checks otherwise read it as overflow. (This is the one place `data-crop` belongs: never to clear a
  line `rehearse.md` calls never intentional.)
- **Identical chrome on two pages doesn't rise.** When a page swap shows the same strip and header on
  both sides, crossfade without the 8 px rise, or the shared chrome visibly hops.
- **One card per box.** A container holding a card and a band under it reads as one unevenly padded
  card; draw them as two boxes.

- **A wide desktop screen on a 960 × 600 cover:** lay the product out at its true width and draw the
  screen at one scale inside the `Window` (as `Phone` draws its screen in points), so the scene's CSS
  stays in the product's own pixels (the Agent Studio cover: 1,084 px drawn at 0.834).
- **Crop where the gate allows it.** A window may run off the right and bottom, not the left: when
  the focal thing is on the product's right, scale the screen to fit and bleed only the bottom.
- **A pointer resting on a control at the seam** must look the same in the poster and frame 0: set
  `cursor.kind` (the still otherwise draws the default arrow), `idle: false` (the kit fades a pointer
  that hasn't moved for 1.2 s on the first loop), and keep the hover in scene state (`data-hover` is
  cleared on the first frame but set on the last).
- **Fonts the product uses** must be on the machine that records (the Agent Studio cover takes
  Poppins from this Mac) or shipped in the scene folder with their licence (its JetBrains Mono).
- **A desktop cursor rests off the stage** (`cursor.at` past an edge), enters for the first beat and
  leaves after the payoff: the still poster hides the cursor, so a cursor resting in frame makes
  frame 0 differ from the poster.
- **Product fonts live in the scene folder** with their licence and `@font-face` (`font-display:
  block`); loading them from Google at record time is fragile.
- **Film's own traps:** menu rows need `role="menu"` / `menuitem` (or `listbox` / `option`), or they
  read as lopsided; bars on a pane under a popover read as "touching" unless the pane has its own
  background; a hand-built text field needs `data-typing` on its placeholder and typed text (the
  kit's `Field` is exempt); draw hairlines as inset shadows, not 0.5 px borders.
- **On a busy machine** live coverage reads "inconclusive" (sampling gaps); then the gate line is
  the bar, and the recording's own frames (contact sheet, seam strip) are the motion check.
- **Figma through MCP:** screenshots of single frames and `get_design_context` on small nodes work;
  `get_metadata` on a whole section can return hundreds of thousands of characters, or fail.
- **Figma motion:** `get_motion_context` can return nothing; a prototype's timing lives in each
  frame's reactions (springs, durations, delays). Take the product's own timing from there.
- **Phone-width sheets** (`film.mjs --width 390`) apply fixed pixel tolerances that can fail a
  correct layout; judge those by eye, and don't bend a correct layout to satisfy them.
- **Several scenes at once:** the dev server reloads when another scene's file is saved; film notices
  and films again. It costs time, not correctness.
- **`a.snap()` with no scope stops every transition on the stage** for two frames: anything mid-move
  (a column gliding back, a card fading) jumps to its end, and film reports a jump. Scope it to what
  it resets: `a.snap(patch, '<target>')`, with `data-target` on that part (a `Phone` takes one).
- **Launch from the thing tapped, and keep it small.** `Expand` with `face` grows the app out of
  `from`: from a link or a notification it reads as a launch; from a big rect (a whole message
  bubble) the window is nearly full size at once and reads as a white wash.
- **A menu over a button covers it whole or stops well short.** A popover ending 2px above the
  button's bottom leaves a green sliver that reads as a border (the portal's payments menu).
- **What arrives beside something still moving waits for it to clear.** The portal's plan card
  fades in only once the offer has glided out of its place (300 ms delay), or a half-seen card
  overlaps another (Stageshow: nothing translucent overlaps).
- **A long glide on an ease-out reads as a jump:** its first frames cover 10–15 px each. Glides use
  Stageshow's travel curve, `cubic-bezier(0.45, 0, 0.1, 1)`.
- **Name a part the kit draws** (the browser's back arrow) by setting `data-target` on it in a layout
  effect; the kit measures targets after each commit.
- **Read the motion from the recording, not from a sheet.** A film sheet samples real time on a busy
  machine; `record.mjs --keep-frames` keeps every frame on the virtual clock. Tile a beat with
  ffmpeg (`-start_number 150 -i %05d.png -vf "select='not(mod(n\,3))',crop=…,scale=300:-1,tile=8x2"`),
  or measure an edge frame by frame with a few lines of Python, before calling something a jump.
- **`film.mjs --at <first mark>` can match before filming starts** (the stage plays on load), so a
  beat right after it is already over. Use `--delay` from the stage's start, or the kept frames.
- **WebM at 60 fps came out larger than the MP4** (portal: 824 KB against 522 KB). The MP4 is the
  file to ship; the WebM is optional.
- **Film's "near aligned"** catches unrelated edges a few pixels apart (the address bar's text and
  the page's first line): line them up exactly or part them clearly.
- **One object travels itself.** A card moving between two places in one layer (Agent Studio's
  finding, out of "Triage 1 →" and back) moves by its own transform on `Fly`'s curves; a `Fly`
  flyer swapped with a real copy reads to film as a pop unless the two have identical markup.
- **Hide it outright before you put it back.** Fade the moving wrapper, then `visibility: hidden`
  once the trip ends, before snapping it home: film judges each element by its own opacity, so a
  clear child inside an opaque wrapper still counts as a pop or a hop.
- **Grow from the corner that stays put.** A card growing from its top-left on `Fly`'s slower x
  curve swept past its final right edge mid-flight; anchor it at the corner that doesn't move.
- **Count the stillness across the seam.** An opening hold plus a closing rest added up to 2.4 s
  of nothing; keep the two together near a second.
- **`a.rect(name, { layout: true })` ignores ancestors' transforms:** a target inside a translated
  track measures off by the translation. For a `Camera` focus, measure the on-screen rect just
  before the camera moves.
- **Film counts a satellite only when it is itself `position: absolute` with a shadow.** A card in a
  `Collapse` in an absolute slot reads as off-centre framing and uneven gutters; keep the card's
  centre over the hero's edge and its outer edge on the one gutter.
- **`Roll` measures its word when it mounts.** With a scene font on `font-display: block` it measures
  the fallback and film reports "spills its slot"; remount it once `document.fonts.ready` resolves.
- **A popover inside a flex item counts toward its slot.** Place the menu from `rect()` as a sibling,
  as the reference site's snooze card does.
- **A sideways conveyor** (Reflect's next chat sliding in): feather the window body's side edges
  while it moves (a registered custom property, as `Camera` does), and set the pane that has left the
  window to `visibility: hidden`, or film reports it clipped.
- **Film can't sample `--every 70` on a busy machine;** film a fast beat with `--slow 6`.
- **"Uneven gutters" lets a card off** only when its centre sits over another surface; otherwise it
  must bleed off an edge (the Coozy cover's next-leap card runs off the right).
- **Never scale `Expand`'s parent** (a press on the card's wrapper, say): it lands about 1 px off.
  Press the card and the face instead.
- **`Expand` over a busy screen needs an opaque background,** or the screen under it ghosts through
  as it opens.
- **Folding back, fade the body first,** or film reads content passing the crop as "cut by the crop".
- **A lone phone on a 16:10 cover leaves a field.** Draw it at 1.1× or more, pinned from the top and
  cropped hard, with a satellite that has a job; if the frame still reads empty, a row of phones is
  the other layout (it loses the tap).

## Refreshing the kit

When Stageshow updates (`npx skills add <stageshow's repo> --skill stageshow`), copy its `kit/` over
the studio's, record every scene again, and compare the reports.
