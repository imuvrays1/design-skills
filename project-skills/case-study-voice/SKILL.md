---
name: case-study-voice
description: Write, rewrite or review UV's portfolio case studies in their house voice, which is warm, plain, first person and quietly funny, after the tone of a designer's essay on the values behind their product, laid on a reference portfolio's case-study storyline. Use this whenever you draft or edit case-study copy for this portfolio (section text, headings, captions, margin notes, summaries, taglines, the "In short" panel) in research/site/*.json, the drafts in research/ or src/content, and whenever UV says copy feels flat, long, stiff, corporate or "AI-written", or asks for more personality, humour, warmth or the reference site's tone, even if they don't name this skill.
---

# Case-study voice

UV wants their case studies to read the way a designer's essay on the values behind their product
does: sincere about the craft, plainly written, generous with credit, and funny in small doses, in
the margins. The storyline and length come from the reference portfolio's case studies
(`research/case-study-flow.md`). This skill describes how that voice works so you can write as UV,
not as the essay's author: borrow the moves, never the sentences, analogies or phrases.

## Facts come first

The portfolio's first rule is that nothing is invented (`AGENTS.md`). Voice is where invention
creeps in, because a joke or a scene "sounds right". So:

- Humour and colour come only from true details: what actually happened, what UV actually said,
  what the work actually cost. If a line needs a fact you don't have, cut it, or put the gap on
  the page as an open question block (`research/site/README.md`).
- No invented anecdotes, quotes, team banter, numbers or "one day, a user…" scenes.
- Every number keeps its scope: who, which period, what it counts (`research/numbers.md`).
- NDA: no client names (where a client is described, say the name was changed), except the ones UV
  cleared by name for a single case study. No colleague names anywhere: the header's Team row lists
  teams only ("Engineering", "QA auditors"), never people (UV, 2026-11-13).
- Laugh at the work, the process, the tools or UV, never at the people the products serve. Rifa's
  users were people paying off debts; Coozy's were worried new parents. Never at clients or
  colleagues either.
- UV's own words beat any style. Each case-study session's research file has a dated "UV's
  answers" section; lift UV's phrasing from there whenever it fits.
- Keep versions apart. A prototype, a first version and a redesign each have their own dates,
  builders and numbers; a line about one never borrows another's ("built in a week" belongs to
  whichever version the sources say took a week).
- A rewrite keeps every fact of what it rewrites: each channel, each "often", each "or". Dropping
  one, or adding a judgement no source makes, breaks this rule however good the sentence sounds.

When rules pull against each other: facts beat voice; honest credit beats UV's phrasing (keep
UV's words and add who else did what, as in "I built its front end, with the CEO on the back
end"); and keeping a passage's facts and figures beats the reference portfolio's 20-word beat (let the beat run
longer, and cut repetition, not facts).

## The voice in one breath

Earnest body copy that explains real design decisions in plain words. The personality lives at the
edges: a short aside, a margin note, a pun in a title, an honest admission. Mostly sincere,
occasionally funny, never sarcastic.

## How it sounds

### Who's talking

- "I" for UV's own calls, beliefs and quirks ("my rule was", "I'd", a pet peeve). "We" for what
  the team decided or built. Keeping the two apart is what makes the credit honest, and
  interviewers notice.
- Credit people and the work that inspired a decision, specifically (by role until names are
  cleared).
- Speak to the reader now and then, as across a table: once or twice a case study, no more.

### Sentences

- Plain words over impressive ones: "show", not "surface"; "use", not "leverage".
- One idea per sentence, mostly 8 to 20 words. After two longer sentences, let a short one land
  the point.
- A one-line paragraph is the strongest emphasis there is. Once a section at most.
- Contractions are welcome. The register is a smart friend explaining their work, not a press
  release.

### Explaining a decision: rule, reason, example

This is the move to use most:

1. Say what the design does, plainly.
2. Say why, in terms of what the person using it feels or understands.
3. Point at the figure that shows it.

Then, where it's true, say what it cost: what had to be rewritten, what slowed down, what was
tedious. Honesty about effort is what makes the confidence believable.

### Making ideas stick

- Name the two or three principles early, define each in one sentence, and come back to them by
  name.
- One everyday analogy per section at most (rooms, kitchens, queues, travel), tied straight back
  to the design. If an analogy needs explaining, it's the wrong one.
- Coin a short label for a behaviour when it helps, two to four words UV can reuse in interviews.
  Make it UV's own.
- Show the contrast: the first version or the version without the decision, beside what shipped.
  "Fine, just not as clear" convinces more than "transformative".

### Humour: where it goes, and how much

- **Margin notes first.** The `note` block (80 characters at most; it sits in the margin on wide
  screens) is where the model essay keeps nearly all its jokes: self-corrections, shout-outs,
  honest warnings before a rough diagram, small confessions. One or two per section at most. A
  note is a section block about the block just before it, so it can't go in the summary, the "In
  short" panel or a heading.
- **In the body:** at most one parenthetical aside per section, short and true.
- **Wordplay:** welcome in a title, a tagline or the last line, if it comes naturally from the
  product's name or idea. Don't force one.
- **Fits:** self-deprecation, understatement, an honest admission, a light tease of a common
  industry habit (unnamed), a callback to an earlier line.
- **Doesn't fit:** sarcasm, jokes at users, clients or named companies, memes, emoji, slang,
  exclamation marks in the body (one in a margin note is fine).
- If nothing true is funny, stay earnest. A case study with no jokes is fine; a case study with a
  made-up one is not.

### The highlighter and the bracket

The site draws two of the essay's devices for focus (DESIGN.md):

- `==sentence==` puts a hand-drawn yellow highlighter behind it. Save it for the one sentence that
  carries a passage, the line a reader should leave with: at most one per section, and none is
  fine. Highlighting a lot highlights nothing.
- A margin note after a block gets a hand-drawn bracket down that block's side on wide screens.
  When the note is about a single sentence or paragraph, give that paragraph its own text block, so
  the bracket hugs it. A highlight with a short, true note beside it is the strongest focus there
  is; use the pair once or twice in a whole case study.

### Openings and endings

- Open with what it is, in a sentence or two, and how long UV worked on it only when the sources
  give a span; milestones (live in early 2025, the next version in Sep-Oct 2025) are fine instead.
  Then why it matters, if the sources say; otherwise go straight on. If it helps, say what it
  isn't.
- End with the trade-offs and what UV believes, in a sentence or two, then a short last line that
  calls back to the title or the first idea.

## Length and shape (UV, 2026-11-13: approved on the portal)

This overrides older length advice below. The model is the reference portfolio's case-study length, and the
portal case study (`src/content/case-studies.json`, `rifa-portal`) is the worked example: read it
before rewriting any other.

- **Under 700 words** a case study, everything counted (openings, captions, titles, number labels).
  Not much under either: about 650-700, so the MVP substance stays (the reason for the key choice,
  what it cost, the numbers that prove it).
- **Header:** Role (`roleLine`), Timeline (`period`) and Team (`collaborators`, team names only). The
  page then shows cover, title, Collaborators · Timeline · Scope, and drops the summary and "In
  short" (keep `summary`, `role`, `team` etc. in the data: they feed the home page and metadata).
- **Section opening:** the `heading` field is the section's one opening paragraph, in body type: the
  point, then its reason, two lines (three at most, about 180 characters; never more than 250). The
  highlighter is rare: two or three lines in a whole case study, the ones a reader must leave with
  (the core problem, the key decision, the proving number). Most openings have none (UV, 2026-11-13). No separate headline-plus-paragraph, no
  serif, no `subhead`.
- **Paragraphs:** two lines, three at most. Text blocks between figures: one or two sentences.
- **Rows of three:** any three parallel points go in a `columns` block, side by side. Each title fits
  one line (under about 24 characters); each text is 10-12 words, so the three end level. Two
  points can be a `columns` block too.
- **Captions on every figure** (media and gallery): one plain line saying what the reader is
  looking at.
- **Margin notes:** short and factual ("About a week for the prototype."); no "two of us".
- **Trade-offs:** one line, only where it says something real; cut the soft ones.
- **Reflection:** the opening paragraph, then two bold-led points as two short text blocks
  ("**Design the no, not only the yes.** …").
- **Keep every figure.** Shortening never drops a figure or adds a fact; dropped detail stays in git.

## Inside the reference portfolio's storyline

Structure, length and the takeaway come from CONTEXT.md, "Case-study structure" (agreed with UV on
2026-11-09 from a portfolio-review reel): a story told on purpose, not a log. Seven
parts: cover; In short; context (why it exists, why it matters); what UV shipped, shown before any
process; 3-4 design moments (problem, options shown, the choice and why, its cost); designing for
model limits in AI work; impact (metrics, or why it matters); reflection (specific lessons). Each
case study carries one **key takeaway about UV**, listed there; pick the moments that prove it and
let the opening and reflection say it again. Length: see "Length and shape" above (under 700
words); the header row replaces "In short". Sentence headings still move the story (the question, the problem, "Why this
direction?", "How do we…?"). The voice lives inside that arc:

- Headings stay plain and specific; no jokes in headings, except a natural pun in the title.
- The beats between figures carry rule, reason, example.
- The margins carry the smile.

## Words that flatten the voice

Avoid: leverage, utilize, seamless, robust, frictionless, delightful (as a claim about your own
work), elevate, empower, unlock, game-changer, cutting-edge, delve, tapestry, landscape, "journey"
for a product, "in today's fast-paced world", "it's not just X, it's Y", and triplets that only
pad. Avoid hedge stacks ("may potentially help to"). Match the case study's existing spelling and
don't switch halfway.

## Process

1. Find the case study's takeaway about UV (CONTEXT.md, "Case-study structure"); every beat should
   serve it.
2. Read the facts first: the case study's `research/site/<slug>.json`, its session's research file
   (with UV's answers), and `research/numbers.md`. Note what's known and what isn't.
3. Find the true, human details worth a smile: what broke, what was tedious, what UV said, the
   scrappy first version, a constraint that forced a clever fix.
4. Write the beats at the reference portfolio's length, rule-reason-example, plainly.
5. Add humour last, in the margins, sparingly.
6. Read it aloud, or picture UV reading it to a design lead. Cut whatever sounds like a brochure.
7. Run the checklist. The copy stays a draft (`draft: true`) until UV approves it in their own
   voice.

## Checklist

- The case study proves its takeaway about UV, and follows the seven parts.
- Every claim, number and anecdote has a source; nothing is invented.
- "I" and "we" are honest; credit is given.
- Each decision has its rule, reason and example, and its cost where true.
- Under 700 words; each paragraph two lines, three at most; each section opens with one paragraph;
  two or three highlights in the whole case study, no more.
- Three parallel points sit in a row with one-line titles and 10-12-word texts; every figure has a
  caption; the reflection is two bold-led points.
- Header: role, timeline, team (teams, no names).
- Per section, at most: one one-line paragraph, one parenthetical aside, two margin notes.
- Humour lands on the work, the process or UV, never on users, clients or colleagues.
- Nothing from the "flatten" list; no exclamation marks in the body.
- The last line calls back to the start.

## References

- `references/voice-notes.md`: a closer reading of the model essay's techniques, with what to
  borrow and what to leave. Read it before writing a whole case study, or when the voice isn't
  landing.
- `references/examples.md`: before/after rewrites of real paragraphs from UV's case studies, and
  margin notes that fit. Read it for calibration before your first rewrite in a session.
