# From a real recording

Use a recording when the feel of the real thing is the point: an AI answer streaming in, a live
voice agent's waveform, real latency. Rebuild as faux UI when the screen can't be cleaned.

## Record it clean

- **Data:** a test account, test chats, sample numbers. Never a real client's records; never change
  a real verdict or setting to film it (cancel before saving).
- **Screen:** Do Not Disturb on; no other windows; browser zoom 100%; bookmarks bar, extensions and
  the cursor highlight off. Hide the pointer when it doesn't explain anything.
- **Size:** record at 2× (a Retina screen) at the size the cue asks: a phone page at 390 × 844 in
  the browser's device mode or the iOS Simulator (`xcrun simctl io booted recordVideo rec.mov`), a
  desktop at 1440 × 900. 60 fps if you can; it's cut to 30 later.
- **Take:** start and end on the same calm screen if the product allows; act slower than you would
  (the loop can be sped up, not slowed); leave a second of stillness at both ends.
- **Sound:** irrelevant: the clip is silent. A voice demo shows its waveform and transcript instead.

## Find the numbers

Take a still and measure on it (in the recording's own pixels):

```bash
ffmpeg -ss 3 -i rec.mov -frames:v 1 still.png
```

- The **trim**: the seconds where the story starts and ends.
- The **crop** (`w:h:x:y`): the panel the story happens in, not the whole desktop.
- The **covers** (`x:y:w:h:#colour`): every name, number or face that can't be shown. A solid box in
  the surface's own colour; a blur can be undone, a box can't. Check every frame on the contact
  sheet: things move, so a box that covers the name at second 2 may miss it at second 6.

## Turn it into a loop

```bash
node .claude/skills/preview-animation/scripts/clip.mjs rec.mov --out materials/visuals/<slug> --name cover \
  --from 2.4 --to 10.4 --crop 1200:750:120:80 --cover 40:30:300:44:#ffffff --seam 0.5 --poster 3.2
```

- `--seam 0.5` cross-fades the last half second into the first, so the loop point can't be seen.
  Use 0.3–0.6 s, over a moment of stillness if there is one (a cross-fade over moving text
  ghosts). Use `--seam 0` when the recording already ends on its first frame.
- `--speed 1.25` tightens a slow take; don't speed up typing or a voice past what's believable.
- `--size 1920x1200` (default) fits the cover's 16:10, padding with `--field` (DESIGN.md's
  `--surface`, `#f4f4f3`, by default) when the crop is another shape. A tall phone crop sits in the middle of the
  field.
- `--poster` is a time in the finished loop; choose a held frame (the report checks).
- Defaults: 30 fps, CRF 23 (recordings carry gradients and photos), budget 1 500 KB. Capture the
  screen at 60 fps and pass `--fps 60` when the motion has to look smooth (UV's ask for covers).

It writes the same files and report as `record.mjs`. If the loop is over budget: a tighter crop,
fewer seconds, `--crf 26`, then `--size 1600x1000`.
