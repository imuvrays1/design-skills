# Cover rules: one hue, one object, readable at thumbnail size

UV, 2026-11-04, on the first fifteen cover options: "so many foundational issues … the colour
contrast issues, green, red, black doesn't look good together … in Coozy, you had put a black
colour over an orange background." Then: covers with "better context about the projects", that
follow "contrast, balance, and should look like a thumbnail", after the reference portfolio's previews and
the Stageshow demo images, plus a plain fourth option on the grey.

What the two reference sites' images actually do (looked at again the same day):

- **The reference portfolio:** every card is one hue. A lavender field with a white pill and a violet button; a
  navy field with a white sign-in card and a blue button; a pale grey field with a white card ringed
  in blue; a sky gradient with white cards and a blue button. Field and accent are the same colour,
  light and dark. The object is white, sits in the middle with a lot of room around it, and is
  small enough to be one thing.
- **The Stageshow demos:** white product UI with near-black text and grey bars, one blue accent (a Pay button, a
  selected row). The colour lives only behind the window (soft orbs, a pale blue gradient), and the
  window runs off one edge.

## The rules

1. **One hue per cover.** The field and the one accent are the same hue: a pale tint, a deep shade,
   and the saturated middle used once, inside the UI. No second saturated hue anywhere. No
   red-and-green status pairs: show a state by weight, a strike-through, a check, or the accent.
   If a failure has to read as a failure, one small muted chip at most, never a red field.
2. **The field is pale or deep, never mid.** Pale: the hue at 92–97% lightness, a soft gradient or
   one soft orb of the same hue. Deep: the hue at 12–25% lightness, with white type. A mid-
   saturation field (orange, green, rose at full strength) is never a background: that's how black
   landed on orange.
3. **The object is white (or frosted white) UI**, near-black text (`#111` to `#1f1f1f`, or the
   product's own ink), grey bars for words that don't matter, a soft long shadow, no hard border.
   On a deep field, the object may also be white type on its own.
4. **Contrast, measured:** every text ≥ 4.5 : 1 against what's directly behind it; display type
   (≥ 32 px on the 960 stage) ≥ 3 : 1; the object stands off the field by tone and shadow. Write
   the ratio of each text pair in the option's notes.
5. **Balance:** one object (two at most, one clearly leading), on the centre line or deliberately
   cropped by one edge, the reference site's way. At least 64 px of air on every side that isn't cropped. The
   object takes 35–65% of the width. Nothing parked alone at one side (Coozy's card on the right).
6. **Thumbnail test:** the cover shows at 271–453 px wide on Home. Shrink it to 300 px: the idea
   still reads, the focal text is ≥ 36 px on the 960 stage, and at most about eight words are
   readable. Everything else is bars.
7. **Context:** the object is the moment that is the project (the thing a reviewer should
   remember), from the case study's own evidence, real words and numbers only. Never invent copy.
8. **The grey option:** the same discipline on `#f4f4f3` (the site's `--surface`), no tint and no
   orbs: white UI, near-black text, the hue appears once as the accent inside the UI. It must still
   read at 300 px.

## The five hues

One per case study, so Home reads as a set and no two neighbours match. Each comes from the
product's own colours.

| Case study | Hue | Pale field | Deep field | Accent (once) | Ink |
| --- | --- | --- | --- | --- | --- |
| Self-serve debt portal | Portal green | `#effdf6` → `#d3efe2` | `#06352a` → `#0b4a3a` | `#00896d` | `#0f172a` |
| Agent Studio | Rifa violet | `#f1f0ff` → `#dcd8ff` | `#120e4a` → `#221a8a` | `#4a3aff` | `#1a1b20` |
| Reflect | Calm blue | `#eef4fc` → `#d3e3f7` | `#0b2140` → `#14386a` | `#2f6fde` | `#111827` |
| rifa.ai website | Night indigo | `#eeedfa` → `#d2cfff` | `#080064` → `#1d1696` | `#4a3aff` | `#111111` |
| Coozy | Warm peach | `#fff5ef` → `#fde3d2` | `#3a2116` → `#5a3020` | `#f38449` (marks only, never under text) | `#34302d` |

Coozy's orange fails as a text background with either black or white (2.4 : 1 with white), so it
is a mark colour only: a dot, a ring, a progress fill, an icon.

## Checking

Before capture, run the still at 300 px wide and look at it; list each text pair's ratio in the
notes; check rule by rule. After capture, screenshot the card in Figma at the same size.

## Round 3: motion and composition (UV, 2026-11-10)

UV on the live covers: no breathing room ("everything is so close to its boundaries"), no
hierarchy ("everything looks randomly placed"), the important card given "an extremely small amount
of visual real estate", a whole dashboard where a teaser belongs, and text-heavy (the website's
"version 1, 2, 3"). What UV wants instead: "a P1 card or something that is most important … shown
visually up front in the center", animated "move up, move down, scale up", "a very smoothly done
poppy animation which follows curvy Bezier curves", the way the reference portfolio "doesn't show everything,
just … a teaser with the most important detail".

UV's reference clips are in `Reference Videos/` at the project root (12-frame contact sheets of
each were studied). What they do:

- **One object, centred, small against a lot of air.** A Polaroid, a stack of health cards, a
  Dynamic Island: 35–55% of the frame's width, never touching an edge unless cropped on purpose.
- **The object changes shape instead of the scene changing.** A pill grows into a card (Teamble's
  input becomes its score card; Sportio's island opens into a workout card and closes again); a
  card collapses back into a pill. One continuous object, morphing.
- **A vertical stack in focus.** The health clip keeps one big card in the centre with its
  neighbours as small, faded pills above and below; the stack slides up and the next card grows
  into focus.
- **Numbers roll** digit by digit with a slight blur ("Total money 306.53 → 330.72").
- **The camera leans in** on the one detail (together.ai's tilted push onto the model name,
  Teamble's card tipping back in perspective), then eases out.
- **Few words, big:** a headline or a number is the hero; everything else is a bar or gone.

### Composition

- Stage 960 × 600. Margins: at least 96 px left and right, 72 px top and bottom, around the focal
  object at its largest moment. A phone or window may run off the bottom edge only, centred.
- The P1 object takes 40–60% of the width at rest. Secondary elements are smaller (≤ 60% of its
  size), lighter (opacity 0.4–0.7 or a slight blur) and never compete for the centre.
- Balance on the vertical centre line; nothing parked alone at one side.

### Motion

- **Arrivals and pops:** a spring with a little overshoot (scale 0.94 → 1.015 → 1, 500–650 ms), or
  `cubic-bezier(0.22, 1, 0.36, 1)`. **Travel and morphs:** `cubic-bezier(0.65, 0, 0.35, 1)`,
  550–800 ms. **Exits:** quicker, 300–400 ms, ease-in.
- **Hierarchy in time:** the P1 object moves first; supporting elements follow 80–140 ms apart.
  One thing moves at a time; hold each state 1.2–2 s.
- **Life while holding:** a slow camera push (scale 1 → 1.04 over the hold) or a drift of the orbs,
  never both at full strength.
- **Loop:** 6–10 s, ends exactly where it began (the start state is the poster's neighbour), at
  60 fps, reduced motion shows the poster.

### The five covers, round 3 (one each)

| Case study | P1 object | The loop |
| --- | --- | --- |
| Portal (green) | One white card: the balance | "$1,850.00" holds; a "40% off" pill pops in; the number rolls down to "$1,110.00"; the card grows to show the plan ("Monthly", "6 payments · $185.00 each"); a press on "Continue to Payment"; the card closes to a check, "Payment successful!"; it opens back to the balance. |
| Reflect (blue) | A vertical stack of four cards, one in focus | The case study's four questions as its four objects: the rule (Library spec), the test run, the call's checked tool call, the verdict "Audit: Passed". The stack slides up one card at a time; the focused card is big and white, its neighbours small faded pills. Real strings only. |
| Agent Studio (violet) | One agent, built | A node canvas drawing itself in the middle: a start node, the agent, its branches, connectors drawing on a Bezier, each node popping in; or the co-pilot's one fix (a finding card whose diff line appears, confidence filling). Whichever UV's Figma has real names for. |
| rifa.ai website (indigo) | The v3 hero, big | One browser window, 60–70% wide, centred, running off the bottom: the headline "Outperforms your best agent." large; its last line's word changes as the live site's does; "Book a demo" pressed; then a soft scroll to "Don't read about it. Hear it." with the orb pulsing; back up. No version labels. |
| Coozy (peach) | The phone, centred and close | The home screen with the child's real name and age from UV's Figma (placeholders, cleared by UV); the "Things feel a little stormy" leap card lifts out of the phone, scales up towards the viewer with its Leap 8 tile, holds, settles back. No side card. |
