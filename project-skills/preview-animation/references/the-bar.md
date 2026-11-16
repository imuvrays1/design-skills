# The bar: what the two reference sites' previews do, measured

From the audit of 2026-11-04 (the reference portfolio's home and one project page; the Stageshow site's home and
demo page). The full write-up, with how each piece was measured, is `research/animations.md` in
this project (kept out of git). Borrow technique and feel, never their assets or compositions:
"a reviewer who knows them should see a peer, not a copy" (DESIGN.md).

## The reference portfolio's home previews (the model for "soft, looped, draws attention")

Seven of her ten cards are silent MP4 loops; three are still PNGs.

| Card | Length | What happens | Loop |
| --- | --- | --- | --- |
| Figma | 5.1 s | Lavender field. A logo is hand-drawn stroke by stroke; it slides up and out as a voice-note pill rises from below; the timer counts; the send button presses; the pill drops out the bottom. | Empty → object → empty: seamless |
| Earth | 7.6 s | Sky-blue gradient. A button fades in, is pressed with a ring; member cards float in around it; a table slides in; three stat pills; the camera pushes into them as they fade. | Empty → story → empty: seamless |
| Notion | 5.6 s | "+ Create your agent" with a cursor; click; a prompt types itself, key words in blue; it becomes an agent card, then two finished agents on pale fields; back to the start. Each state changes the field colour. | Back to the opening screen: seamless |
| OpenAI x Hardware | 5.05 s | A soft gradient drifts behind a white title and returns. | Drift: seamless |
| 1Password | 1.0 s | A sign-in card; only the caret blinks. A still, as video. | Seamless |
| PokerGPT | 11 s | A prompt; the camera pushes in on the send button; a strategy table streams in. | Cut |
| Alexa+ | 3.6 s | A script wordmark lit by a glow unravels into a voice waveform over a transcript. | Cut |

What they share:

- One idea per card; one object moving at a time; the field tinted to the project.
- No device frames on the home page: UI floats as cards and pills on the field.
- Quick changes (0.2–0.7 s) with holds between; nothing frantic.
- A cursor or touch only where it explains (a press ring, a click).
- MP4 / H.264 only, no audio, 135 KB – 2.7 MB (Notion's 135 KB shows how small flat UI can be).

What she skips, and this site doesn't: a poster (her cards pulse in the project's colour until the
clip loads), a pause button on the home page, reduced motion (her clips play anyway), pausing off
screen.

How they arrive: the clip gets its source only within 200 px of the screen, then fades in from a
6 px blur over 500 ms. Hover is a 30% white wash over the card and a custom cursor label.

## The Stageshow demos (the model for craft and restraint)

No video: 45 live-code demos from his Stageshow kit. Each figure:

1. holds its space at its final aspect ratio before it loads;
2. fades in over 600 ms once its fonts are ready;
3. plays only while on screen and the tab is visible; leaving pauses it, stops rendering it, and
   resets it to its first state;
4. under reduced motion shows a chosen **poster** state as a still;
5. runs a script of beats: `wait`, `move`, `click`, `set`, with flights of 900 ms, waits of
   120–2 000 ms, the payoff held 1.2–2 s, and resets done while hidden (`snap`), never rewound in
   view; his tool warns when a loop doesn't end where it began.

Three loops, timed from their scripts: a subscription flying into a dashboard (13.5 s, two scenes,
the second hides the first's reset); an email snoozed on hover (4.5 s); a phone card opening into
its screen, a timer running, the screen folding back (13 s; poster: the open screen at 0:07).

The look: a light panel; one window cropped by two edges; one satellite card overlapping it; real
words only on the focal parts; grey bars elsewhere; one accent colour.

## The five demos UV chose as the bar (2026-11-04)

UV sent five frames from the Stageshow demo page with "check these references". Each one, where its
code lives (read it in the browser; never copy it into the repo), and what it teaches:

| Demo | Where | What it teaches |
| --- | --- | --- |
| **Glass checkout** (a bakery's invoice in a frosted browser) | The "Glass" section of the page; its stage is `.bwg-stage` | The glass window on soft orbs: `radial-gradient(60% 90% at 0 70%, #8b7cf6, transparent 70%)`, `radial-gradient(55% 90% at 100% 60%, #ff8a4c, transparent 70%)`, a violet one top-right, over `#f6f4fb`; the window inset 32px and run off the bottom. Ours puts the orbs over `#f4f4f3`. |
| **Tandem** (a meeting booked on the web, accepted on the phone) | The critique pair "A meeting across two screens": `/media/stageshow/pair-gtandem-with.html` | The device pair. Stage 760 × 480 on the well; the window at 32/32, 590 × 500, off the bottom; the phone 300 wide, top 64, right 32, over the window's filler. Beats: slot, email typed, Send → "Invite sent", the phone's notification drops in (0.5 s, a slight overshoot), pressed to 0.97 for 140 ms, `Expand` opens the app (640 ms), Accept pressed, hold 2.2 s, the app fades away (0.45 s), "Done" resets the form. No finger on the phone. |
| **Hearth** (a message on iPhone, tapped, answered) | The critique pair "A message on iPhone": `/media/stageshow/pair-ghearth-with.html` | A phone bottom-left over a sidebar window; touch cursor; the notification taps open into the app (`Expand`, 560 ms); a reply typed and sent; hold 2.4 s; the app fades; reset hidden. |
| **Subscriptions hero** (a plan's price flies into a billing dashboard) | `examples/subscriptions` in the skill | A system story: a chip flies into a row (`Fly`), MRR rolls (`Count`), a second scene hides the first's reset. |
| **Inbox snooze** (a feature card) | The card captioned "an email is snoozed until tomorrow"; stage `.hs-card` | A window inset 28px, off the bottom; hover reveals the row's actions; a menu from the action; the row leaves sideways (550 ms) and the list closes up; a toast confirms. 4.5 s. |
| **Linear** (assign an issue) | `examples/linear` | Real product chrome at 1:1; ⌘K, "assign", Assign to me; the `Camera` leans in as the avatar lands, then back out. |

Read together: every one is a single screen (or one screen per device), at 1:1 with 11–15 px UI
text, in a window that runs off an edge, on a grey or tinted ground, with a few real words and bars
for the rest, and every change arrives through one of the kit's moves.

## Take and leave

Take: one idea, one object, a calm field; loops that end where they began; short with holds; few
words; a poster that tells the story; load near the screen, pause off it; small files.

Leave: their clips, copy, compositions and tints; the reference portfolio's square cursor and typed labels; the reference site's
creature, pink and hand-drawn marks; autoplay under reduced motion; multi-megabyte previews; a
blur on arrival (the site's arrival is opacity only, unless DESIGN.md changes).
