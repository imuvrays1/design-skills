# Stills in Figma first

UV, 2026-11-04: "before we animate these covers or anything in the future … I would love to see the
content and the card design before we animate them, because I might have some visual fixes and
updates to make." So every cover and figure goes to UV's Figma as a still first. Only after UV
approves the layout and content does it get a script of beats, by UV's direction.

## Where

UV's Figma file ("personal-files"), page **UX portfolio images** (`4101:10839`).
One Section per case study, holding a board: a header, then the case study's sections in order,
each a wrapping row of cards. A card is a meta line (the figure's id, still or clip or diagram,
gallery size), the image frame or frames at the size the site shows them, the site caption, and the
alt text. Other sessions add their case studies to the same page: find free space to the right of
what is there before you add a Section, and never move or edit another case study's Section.

The portal's board, frame ids included: `materials/visuals/rifa-portal/figures-figma.json`.

## The figures

- **The list** comes from the case study's cues (`src/content/case-studies.json`): every `media`,
  `gallery` and `mediaRow` block and the cover. Keep it as a manifest beside the studio
  (`research/prototype/previews/<slug>-figures.json`: id, stage size, the cue).
- **Sizes:** a figure in the column is a 550 px wide stage; a gallery item 360 px wide (the site
  shows it at 271 px in twos, 178 px in threes on a desktop, full width on a phone); a cover 960 ×
  600. Draw at that size, 11–15 px UI text, as for any scene.
- **A still is a scene with no script:** `initial` = `poster` = the state shown, so the same scene is
  animated later by adding a script, not rebuilt.
- **One look per case study:** the portal's figures share `scenes/_portal/look.css` (Inter, the
  portal's tokens, the grey ground); give a new case study the same kind of shared file.
- **Process artefacts stay real:** UV's own earlier screens (a shipped v1, Figma explorations) are
  shown as their real exports, names masked, in a kit frame on the grey, not redrawn.
- **Check, then render:** `rehearse.mjs <id> -- --still --gate --width <w> --pad 0` until clean, then
  `still.mjs <id> [<id> …] --out materials/visuals/<slug>/figures` (3× PNGs and `stills.json`).

## Placing them: editable layers, not pictures

UV, the same day: "make sure that all these visuals are editable in Figma. Don't just add images;
add UI screens and editable layers." So a figure goes in as layers, through Figma's html-to-design
capture of its scene: frames, text and vectors, not a PNG. Only UV's own earlier screens (a shipped
v1, Figma explorations) stay images, inside an editable frame.

1. `create_session` on the **figma-desktop** server with the file key; load `figma:figma-use` (and
   `figma:figma-generate-design`) before any `use_figma`.
2. The board, once (one `use_figma` call): a Section, a vertical auto-layout board, rows with
   `layoutWrap = "WRAP"`, a card per figure with a frame per image at its stage size, grey,
   `placeholder = true`. Keep every frame id (the portal's: `materials/visuals/rifa-portal/figures-figma.json`).
3. Per figure, `generate_figma_design` (figma-desktop) with the file key and the card frame as
   `nodeId`: a single-use capture id. Its reply is long; ask for all the ids first.
4. `node scripts/capture.mjs <scene>=<id> …`: builds the studio, opens each scene edge to edge in its
   poster state with Figma's capture script, and sends the stage. Before the capture fires, the
   studio runs `src/capture-prep.ts` on its own:
   - **iPhone text becomes Inter, at SF's widths.** Figma can't lay out SF Pro (a layer in it
     measures 0 wide through the API and is drawn with a stand-in), so phone text arrived too wide
     and closed up its spaces. Each element with text gets the letter-spacing that keeps its words
     exactly as wide as they were in SF; lines break where they did. The shipped stills and clips
     keep SF.
   - **Lines are cut where Figma can't follow them.** A text layer can't start halfway along a line,
     so a sentence with an inline box in it (a redaction bar, a chip, a link) arrived with the words
     after the box on top of the words before it. Paragraphs that hold an inline box, and all phone
     text, are cut into single-line pieces, with the spaces kept outside the pieces.
   - **The page's text widths ride along** in a marker layer (`CAPTURE-WIDTHS:` and JSON).
5. Poll each id with `generate_figma_design` (file key + capture id) until it reports the design
   added; the node id is in its URL.
6. Paste `scripts/figma-place.js` into `use_figma` with `MAP` filled (`"pt-x": [capture node, card
   frame, width, height]`). It maps fonts Figma lacks (the studio's "Portal Inter", "Rifa Poppins",
   any SF) to installed ones, rebuilding a layer whose font can't be loaded; gives each text layer
   the letter-spacing that matches its width in the page, from the marker, and deletes the marker;
   sizes the card; moves the capture in at 0,0; clears the placeholder. An earlier capture in the
   same card is removed, so a figure can be captured again after a fix.
7. Screenshot each card and compare it with the PNG. A difference is fixed in the scene, never by
   hand in Figma, so the code and the layers stay one design.

Traps met building the portal's board:

- **`resize()` fixes both axes.** An auto-layout board resized to set its width stopped hugging its
  height and clipped everything under the header; set `primaryAxisSizingMode = "AUTO"` after it.
- **A Section doesn't hug.** Size it to the board (`resizeWithoutConstraints`) in a later call, once
  auto-layout has settled; read in the same call, the board still reports its old height.
- **`figma.createAutoLayout()` frames come with a white fill;** clear it on layout-only frames.
- **Wrapping text** needs `textAutoResize = "HEIGHT"` after a `resize()` to its width.
- **The capture lands on the page,** not under the `nodeId` given; move it into the card.
- **A font's name reaches Figma as written:** "Portal Inter" arrives as a missing font. Give a
  shipped font its real name too (`_portal/look.css` declares Inter under both).
- **Fonts arrive with variation axes** (`wght`, `wdth`); set a remapped font as a plain family and
  style, or `setRangeFontName` refuses it. Inter's "Semi Bold" is SF Pro's "Semibold".
- **Figma screenshots of SF Pro text lie:** the remote and desktop renderers both draw it with a
  stand-in, so don't tune SF text against them. That's why phone text goes in as Inter.
- **Check that the preparation doesn't move the page:** the studio's `?prep=1` runs it without
  capturing, so a still with and without it can be compared.
- **The capture drops CSS `mask-image`:** a window fading out at its foot arrives cut hard. Draw a
  fade as a gradient layer over the content instead, which arrives as a layer.
- **Scaled pages drift a pixel or three:** a product drawn at 0.6 or 0.72 gets fractional line
  heights, Figma rounds each auto-height text box up to a whole pixel, and auto-layout stacks add
  the rounding up. A fixed text height puts it back but stops the box growing when UV edits it, so
  leave it, and draw a figure at 1:1 where the text matters.
- **Compare each card with its PNG pixel by pixel** (a 3× screenshot against the still): drift too
  small to see by eye shows up there.
- **Three to five screenshots per `use_figma` call;** one call returned five of six.
- **Keep shared scene modules' exports stable:** changing a shared window's props mid-run broke
  another group's figure that imported it.
- **A phone's screen loses its rounded corners:** the capture keeps the bezel's outer radius but
  drops the screen's clip-path, so the screen's square corners poke past the bezel (UV: "all the
  phone screens are getting cut in the corners"). `figma-place.js` rounds each screen to the bezel's
  radius less its inset, with corner smoothing.
- **More the capture drops:** `clip-path: path()`, inset box-shadows of spread only (use a border),
  and an image's colour profile (Figma shows the raw values; convert a screenshot to sRGB first).
- **A box sized by `top` and `bottom` arrives hugging its content;** fill the height with padding.
- **Phone text rides up 1–3 px in capture:** Chrome gives Inter a taller line box than SF at phone
  sizes. Untested fix: give the capture's Inter `@font-face` SF's metrics (`ascent-override` ~95.2%,
  `descent-override` ~24.1%, `line-gap-override: 0%`).
