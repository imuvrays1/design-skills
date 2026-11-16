# Demo video (30 to 40 seconds)

The Marketplace form's Demo field (Edit Template › Agent) takes a YouTube link to "a walkthrough video showing how to use your template". You make the mp4; the user uploads it to YouTube and pastes the link.

## Rules

- Easy pace, subtle motion: slow ease-in-out scrolls, soft fades, no zoom punches, no bouncy easing, no fast cuts.
- Honest: show only real pages and the real skill text. Never present a page as agent output unless the user gives you a recording of the agent making it. Word the voice and captions as "pages reuse the same parts", not "the agent built this".
- Don't use Framer's logo, and don't invent URLs: the address bar shows only the page path (or "Design System page" for a canvas design page).
- The end scene shows a neutral dark agent chat panel (tabs Agent and Style, a chat selector, the skill's slash-command menu, a composer typing the command), modelled on the agent panel on framer.com/ai. It only shows the command being typed. Never fill it with a made-up agent conversation or result.
- House copy rules: no em dashes, no unicode symbols as icons, sentence case.
- Don't change or publish the Framer project.

## The kit

| File | Job |
|---|---|
| `scripts/demo/capture-sections.js` | Framer exec script. 2x PNG of every section of the pages you list, plus the layout template's children (nav, footer), and `raw/manifest.json` / `manifest.js` with section names and 1x heights. |
| `scripts/demo/voiceover.mjs` | ElevenLabs, one take with character timestamps, played unbroken with a lead-in and tail. Writes `vo_timed.wav` and `timing.json` / `timing.js` (sentence times, keyword times). Reuses the last take unless `--regen`. |
| `assets/demo-stage.html` | The stage. Copy to `<work>/stage.html`. Builds every scene from `video.js` and is driven only by `seek(t)`. |
| `scripts/demo/listing-copy.js` | Framer exec script. Prints the skill details, the YouTube title and description (with chapters) and the Marketplace Agent form answers, and counts the form descriptions against the 100 character cap. Run it at delivery, every time. |
| `assets/video.example.js` | A full config (the Simplest Ways video). Copy to `<work>/video.js` and adapt. Times hang off sentence starts and scroll positions off section names. |
| `scripts/demo/render.mjs` | Headless Chromium frame capture piped into ffmpeg. `stills` mode for checks, `video` mode for the mp4. |

Work in a scratchpad folder (`<work>`), never in the project folder: `raw/`, `vo.txt`, `timing.js`, `video.js`, `stage.html`, `stills/`, `node_modules/`.

## Steps

1. **Capture.**
   ```bash
   (echo 'const CONFIG = {"out":"<work>/raw","shots":[["/","Desktop"],["/design-system","Desktop"],["/about","Desktop"],["/homes","Desktop"],["/about","Phone"]]};'; cat <skill>/scripts/demo/capture-sections.js) | npx @framer/agent@latest exec -s <session>
   ```
   Pick the home page, the design system page, one inner page (desktop and phone) and the page each extra skill affects. The log prints each section's name and y offset.

2. **Script.** Seven sentences, about 85 to 90 words, for about 34s of speech:
   1. what the template is ("<Name> is a <kind> template, ready for Framer's agent.")
   2. the design system page: colors and text styles
   3. components and example sections
   4. what the /design-system skill controls, naming 3 or 4 rule areas ("layout, spacing, styles and tone"); these words get highlighted
   5. new pages built from the same parts
   6. each extra skill in one sentence (merge if there are several)
   7. "Remix it, then type slash design system to start."

   Write "slash design system" in the voice text and "/design-system" on screen. Save as `<work>/vo.txt`. Show the user the script before generating audio.

3. **Voice.**
   ```bash
   node <skill>/scripts/demo/voiceover.mjs --dir <work> --env <file with ELEVENLABS_API_KEY> --words layout,spacing,styles,tone
   ```
   - The key comes from `ELEVENLABS_API_KEY` or the `--env` file and is never printed. If it isn't set, ask the user.
   - The script prints the plan and characters left before spending anything. On the free plan, tell the user it has no commercial licence and asks for attribution.
   - Default voice is Sarah (`EXAVITQu4vr4xnSDxMaL`, calm, reassuring) at speed 0.94. Alternatives: River `SAz9YHcvj6GT2YYXdXww` (relaxed, neutral), Alice `Xb7hH8MSUJpSbSDYk0k2` (clear, British), Eric `cjVigY5qzO86Huf0OWal` (smooth). Pass `--voice <id> --regen` to change.
   - One take keeps the tone even. Don't generate sentence by sentence.
   - **Never cut the take.** Splitting at sentence pauses, inserting gaps or speeding up pieces made the voice audibly break at every scene transition on Ivo. The script now plays the take unbroken, so the scenes follow the voice's own pauses (sentence times are in `timing.js`). `--split` still exists, but don't use it for delivery.
   - Aim for 38 to 40s in total: the take plus the 0.8s lead-in and 1.6s tail. If it runs over 40s, shorten the script and pass `--regen`, rather than cutting or speeding up the voice. The default speed of 0.94 gave about 37s of speech for 86 words.

4. **Config.** Copy `assets/demo-stage.html` to `<work>/stage.html` and `assets/video.example.js` to `<work>/video.js`, then adapt `video.js`:
   - **theme:**
     - `bg`: the template's subtle surface color
     - `ink`, `ink2`: primary and secondary text colors
     - `accent`: the link accent
     - `inverse`: the dark surface, for the skill panel
     - `onInverse`: text on that dark surface
     - `accentOnInverse`: a light tint of the accent, for the panel's headings
     - `font`, `fontUrl`: the template's typeface from Google Fonts. If it isn't there, use the closest family and say so.
   - **title** and **end:** the template name, the "Agent Template for Framer" eyebrow, and the remix line.
   - **pages:** `files('<tag>')` from the manifest. Usually the first 4 or 5 sections are enough.
   - **window.nav / phone.nav:** `raw/tpl_d_00.png` and `raw/tpl_p_00.png` when the template's first child is the nav. Each page's first section already shows the nav, so an overlay at top 0 lines up with it.
   - **shots:** one per screen of the story. Position them by section name: `y(tag, 'Colors', -90)` puts the section heading just below a roughly 90px nav. Drift at most about 250px per shot, and keep headings below the nav.
   - **skill:** 8 to 10 real lines from the installed skill under its own section headings. Shorten only by cutting whole sentences. Tag lines with `g:` matching the `--words` so they light up as they're spoken.
   - **phone:** the inner page's Phone breakpoint. While it shows, the window shifts left and shrinks to the phone's height (768px), so the browser and the phone sit side by side with the same top and bottom edges and equal side margins. Don't change the stage numbers without checking a still at that moment.
   - **A canvas design page** (a Design Page node, not a web page, so it has no nav): capture its board sections into the manifest as another tag, set `nonav: true` on its entry in `pages` so the nav overlay fades out while it shows, and scale `y()` by 1200 / the board width, since the stage shows it 1200 wide. `addr` can read "Design System page".
   - **captions:** one per scene except the title and end cards. Say what the voice says, in fewer words.
   - **end:** `cmd` is the slash command typed into the agent panel and `desc` (optional) is the line shown in its command menu; it defaults to the skill's description.

   Scenes and timing in the example:

   | Sentence | Scene |
   |---|---|
   | 1 | Title card, then the home page rises in a browser window |
   | 2 | /design-system: intro scrolling into colors, then text styles |
   | 3 | Components, then example sections |
   | 4 | Window fades; dark skill panel with rules lighting up word by word |
   | 5 | Inner page, desktop window shifted left plus a phone frame |
   | 6 | The page the extra skill affects (CMS listing) |
   | 7 | End card: prompt pill typing /design-system |

5. **Stills, then the video.**
   ```bash
   cd <work> && npm init -y && npm i playwright-core
   node <skill>/scripts/demo/render.mjs --dir <work> stills
   node <skill>/scripts/demo/render.mjs --dir <work> video demo.mp4
   ```
   - Stills mode renders 16 evenly spaced frames, or pass times such as `stills 3.2,8.4,23.8`.
   - Read the stills and fix anything that is cut off, overlapping, unreadable or sitting under the nav.
   - Run the full render in the background: about 100s for 40s of video at 60fps. The output is 1920x1080 H.264 with AAC audio, about 20 MB.
   - The renderer uses the cached Playwright headless shell in `~/Library/Caches/ms-playwright`. If none is there, run `npx playwright install chromium-headless-shell`.

6. **Check the mp4 itself:**
   - `ffprobe` for the duration and both streams
   - a contact sheet of frames from the file: `ffmpeg -i demo.mp4 -vf "select='eq(n\,600)+eq(n\,1200)+...',scale=640:-1,tile=3x2" -frames:v 1 sheet.jpg`
   - `volumedetect` for the audio level (about -20 dB mean)
   - **listen at every scene transition.** The contact sheet can't show a voice break; play the transitions or check that the audio has no cuts in it (it shouldn't, with the default continuous take).

7. **Deliver.**
   - Copy the mp4 and `vo_timed.wav` into the template's folder.
   - Add the script as a table (time, shows, says) to the handover.
   - Send the file to the user.
   - **Always give the listing copy in the same message, without being asked:** run `scripts/demo/listing-copy.js` (pass `chapters` from the sentence start times in `timing.json`, and `formDescriptions` with the buyer-facing lines under 100 characters), save its output as `listing-copy.md` next to the mp4, and paste the YouTube title, the YouTube description and the skill details (command, agent description, form description) into the reply. Also paste the Agent form block.
   - Uploading to YouTube is the user's job; the form needs the link.

## Gotchas

- **Time scenes from the voice, never the other way round.** Hang every scene start and highlight off `T.sentences[i].vs` and `T.words`. If you change the voice after the scenes are built, regenerate `timing.js` and re-render; don't re-time the audio to fit old scene times.
- The ElevenLabs free plan has no commercial licence and requires attribution. Say so at delivery and offer to regenerate the same script on a paid plan; with a continuous take, the new audio drops in by re-running `voiceover.mjs --regen` and the renderer.

- `framer.screenshot` rejects odd scales such as 0.05; 0.5, 1 and 2 work. A whole page over 16384px at 2x fails, and `clip` doesn't help, so capture section by section.
- Cross-dissolving two busy pages looks muddy. The stage dips through white between shots (0.28s), which reads as a page change, while the nav overlay stays in place.
- Highlights only land if the `--words` exist in the voice text exactly. Check the `words` line in the voiceover output.
- If a template's desktop breakpoint isn't 1200 wide, set `window.pageWidth` to it. The window stays 1520px and the scale follows.
