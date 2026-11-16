# Storyboard

Most of the quality is decided here, before any code. Write the table, read it aloud with a
stopwatch, then build.

## The sentence

"In this loop, <who> <does what> and <what happens>." One sentence, at most two "and then"s.

- Portal: "A person who owes money sees an offer, picks a plan in two taps, and gets a schedule."
- Not: "The person opens the link, signs in, reads the notice, sees the offer, compares the two
  options, opens the plan, …": that's the case study, not the cover.

## Choose the seam first

| Seam | How | Good for | Watch out |
| --- | --- | --- | --- |
| Return | The product's own way back: a Back link, a sheet closing, a card folding into its list | Flows in an app | It must be a real action of the product, never the story played backwards |
| Empty → object → empty | The field is the anchor; things arrive, act and leave | A single object or gesture (the reference portfolio's Figma and Earth cards) | The empty frame is the poster's enemy: pick the poster mid-story |
| Cover and cut | A page change or a full-screen element hides the reset | Multi-screen stories | Reset everything the story changed while it's hidden |
| Drift | Continuous ambient motion that returns to its start | Atmosphere covers with a title | Not for product stories |

An app-launch story (the app opening into its home) has no honest cause for opening again: either
show the cause (the phone goes home and the icon is tapped, which costs a beat and a home screen you
must not invent), or accept a quiet dissolve and say so in the hand-off. The Coozy cover does the
second, for UV to judge.

Whatever the seam, everything the story changed must be back at its first state before the loop
point, and the change must happen out of sight. The template warns about visible tracks that don't
end where they started.

## The beat table

| ms | On screen | What moves | Curve, duration |
| --- | --- | --- | --- |
| 0 | The opening frame, complete (often the poster) | Nothing | — |
| … | … | … | … |
| L | Same as 0 | — | — |

Rules of thumb (from the two reference sites' loops, and the portal cover):

- **Length:** 4–6 s for one gesture; 8–10 s for a three-step flow. Over 10 s, cut a step.
- **Open** on a calm, complete frame and hold it about a second before the first touch.
- **One thing moves at a time.** A response may overlap its cause by 100–200 ms (a chosen card
  turns mint while the finger is still on it).
- **Hold each result about 0.7 s** before the next touch, so it can be read. Three touches inside
  1.5 s reads as busy.
- **The payoff holds 1.5–2 s.** It's the frame people remember.
- **The exit ends 0.4 s or more before the loop point,** so the first frame holds on both sides.
- **Nothing is still for more than 3 s,** counting the hold at the end plus the hold at the start.
- **A touch** (phone) appears on contact and lifts away; it doesn't glide between targets. Lead
  each tap by about 0.3 s. A **cursor** (desktop) travels between targets and rests on empty space
  (see `stageshow`'s motion reference).
- **Scrolling** is a short drag the content follows exactly, then the page runs on (`out`,
  700–900 ms). Never scroll without a finger or a cause.
- **Text** that matters holds at least a second. A value that changes rolls (the old one up and out,
  the new one up and in, 250–300 ms) rather than swapping.

## The poster

The frame people see most: on a slow connection, under reduced motion, in a screenshot. It must tell
the story with no motion, and it must be a held frame (the report checks ±100 ms around it).

- Prefer the payoff (the result on screen) unless the cue names another frame.
- Never a frame mid-change: a half-faded page or a value mid-roll reads as a glitch when still.
- For an empty → object → empty loop, the poster is mid-story, never the empty field.

## The alt text

One sentence that says what happens, starting from the poster: "On a phone, a text from the agency
links to the payment portal and opens its sign-in; on a laptop, the same portal's 40%-off offer
opens a payment plan beside it and six payments of $185.00 are chosen." It goes in the media
entry's `alt`, which `LoopingVideo` uses as the video's label.

## Worked example: the portal cover (rifa-portal, 9.65 s)

UV's brief, after the first version: "for the portal you use the second reference, which includes a
mobile phone and a web page, because the user can do it on the phone or on the web … the agency's
text could exist like a message, and the user clicks, and the portal opens on the phone … in the
background, as you suggested, things can happen." So: Stageshow's device pair, modelled on the reference site's
Tandem. Seam: a return, with a seen cause on each device (the phone puts the portal away; the
laptop's back arrow). The scene is `research/prototype/previews/studio/scenes/rifa-portal/`.

| Script beat | On screen | What moves |
| --- | --- | --- |
| `mark('text')`, wait 800 | The poster: the agency's text in Messages; the laptop on the offer | Nothing |
| set `pressed`, wait 150 | The link in the text | It darkens under the finger (no pointer on the phone) |
| set `app`, `open`, wait 750 | The portal's sign-in | `Expand` grows the portal out of the link (640 ms) |
| `mark('offer')`, move 750, click, set `plan`, wait 750 | The 40% offer, then the plan beside it | The arrow comes in from below; the offer turns mint (200 ms) and glides left on the travel curve (650 ms); the plan rises in once the offer has cleared its place (500 ms, after 300 ms) |
| click `select`, set `menu`, wait 380 | The payments menu, 1 to 6 | The kit's `Popover`, from the select's edge |
| move to `row-6`, put `active`, click, set | "6 Payments – $185.00 each" | The row highlights; the menu closes; the value rolls (`Roll`) |
| `mark('plan')`, move to the page, wait 1 260 | Both screens, holding | The arrow moves off the button onto the empty page |
| set `app` false, wait 450, snap `open` (scoped to the phone) | Messages again | The portal fades away to the text (0.45 s) |
| click `back`, set `plan` false, wait 360, snap `count` (scoped) | The offer alone | The plan leaves (200 ms); the offer glides back to the middle |
| move off the stage, wait 100 | The poster again | The arrow leaves below the page's empty margin |
