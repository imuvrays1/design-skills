# Export and hand-off

## Size

| Where it shows | Shown at (CSS px) | Render at |
| --- | --- | --- |
| Home cover (16:10) | up to 960 × 600 | 1920 × 1200 (stage 960 × 600 at 2×) |
| The same cover atop the case study | 550 wide (the column, `--measure`; `--wide` is the same since 2026-11-04) | the Home file, shown at 0.57: product text under ~14 px gets hard to read there |
| A figure in the case-study column | up to 550 wide | stage at 550 wide (its own shape), `--scale 3` |

A cover is designed for Home (1:1 at 960). If it must also read at full size in the column, make
Stageshow's `compact` design at 550 and record it as a second file (`--name cover-column`), for the
main session to serve with a media query; otherwise the poster or the Home file is enough.

Keep 16:10 for covers: `Cover` crops to 16:10 with `object-fit: cover`, so another shape loses its
edges on the home page.

## Encoding

`record.mjs` and `clip.mjs` do all of this; this is why.

- **MP4 / H.264** (every browser): `libx264 -preset slow -tune animation -profile:v high`,
  `yuv420p`, `-movflags +faststart` (the index at the front, so it starts before it's all loaded),
  `-an` (no audio track at all).
- **CRF:** 27 for scenes at 2× (`record.mjs`), 23 for recordings (`clip.mjs`). Measured on the
  portal cover (9.8 s at 1920 × 1200): CRF 23 641 KB, 25 547 KB, 27 465 KB, and 1600 × 1000 at
  CRF 23 523 KB, softer and no smaller. For flat UI, lower resolution isn't the saving; CRF is.
- **WebM / VP9** (`-crf 36 -b:v 0`): written alongside (`--no-webm` skips it); see the WebM note
  below.
- **Colour:** convert with the BT.709 matrix and tag the stream BT.709. Left to its default,
  ffmpeg converts with BT.601 and the browser decodes with BT.709: the portal's green came back
  `#007a6e` instead of `#00896d` (an average shift of 2.7 of 255); the report fails anything over
  1.5.
- **Frame rate:** 60 (`record.mjs` default since UV asked for smooth motion, 2026-11-04). The
  portal cover at 60 fps is 522 KB for 9.65 s, inside the budget: flat UI that holds still between
  beats costs little per extra frame.
- **A camera move or glass at 60 fps costs more:** the Reflect cover (glass over colour, a 1.3×
  lean) came to 627–638 KB at CRF 27, so it was recorded at `--crf 28` (586 KB). Raise the CRF a
  step before cutting seconds.
- **WebM:** optional. At 60 fps it came out larger than the MP4 (824 KB against 522 KB); ship the
  MP4 until the site takes several sources.

## Weight

Budget: 600 KB for a cover from faux UI, 1 500 KB for a recording, never over 2 MB. Five covers on
the home page load as you scroll; together they should weigh less than one of the reference portfolio's larger
previews (2.7 MB).

## The poster

`cover-poster.png` (lossless, at the clip's size) is the one to upload: the site makes the
responsive versions. `cover-poster.jpg` is for a quick look. It must be the frame the clip shows at
the poster time, so the poster and the first frame of playback don't jump.

## Hand-off to the site

The main session owns `src/`. Give it:

```json
{
  "kind": "video",
  "src": "<cover.mp4, uploaded>",
  "poster": "<cover-poster.png, uploaded as an image>",
  "alt": "One sentence: what happens in the loop."
}
```

and a short note: the files and weights, what's rebuilt from where, what was redacted, what was
simplified, and anything for UV to confirm.

What `LoopingVideo` (`src/components/looping-video.tsx`) already does for every clip: muted,
`loop`, `playsInline`, plays only while 25% of it is on screen, never under reduced motion (the
poster shows), a pause button always, a 1× / 0.5× switch in case-study figures, `aria-label` from
the `alt`. What it doesn't do yet (proposals for the main session, in `research/animations.md`): set
the source only near the screen, fade the poster in like images, take a WebM source too.

## Before you say it's done

- The report passes, and you've looked at the contact sheet, the seam strip and the page at 1×,
  0.5× and phone width.
- No name, number or face that the NDA doesn't clear, on any frame.
- The alt text describes the loop.
- The source page, the clip, the poster and the report are where the table in SKILL.md says.
