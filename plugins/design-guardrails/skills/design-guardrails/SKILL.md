---
name: design-guardrails
description: Turn a project's design rules (DESIGN.md, a style guide, the designer's "never" list) into checks that fail the build or the verify run, so neither a person nor an agent can ship off-system work - no literal colours outside the token file, banned copy, generic alt text, centring or uppercase where the system forbids it, contrast below AA, more than one h1, horizontal scroll, invisible focus. Use when an agent keeps drifting from the design system, when setting up a design-heavy site, when someone asks for a lint, a "verify" script, house rules, design QA in CI or "done means" checks, or says the same mistake keeps coming back.
---

# Design guardrails

A design rule that only lives in a document gets broken the first busy week. A rule that fails the
build doesn't. This skill turns a project's rules into three layers of checks. They come from
Openfile (openfile.pro), where `npm run build` fails on a broken house rule and `npm run verify` has to
pass before anything is pushed.

| Layer | Runs | Catches |
| --- | --- | --- |
| **Content gate** | When the content module loads, so inside `build` | Banned copy, generic alt text, incomplete or contradictory entries |
| **Source checks** | Over the source files, in `verify` | Literal colours outside the token file, banned CSS, a rule's one approved place being bypassed |
| **Rendered checks** | Against a running production build, in `verify` | Contrast, headings, structured data, overflow at every width, keyboard focus, plus screenshots for a person to look at |

## Steps

1. **Read the rules.** DESIGN.md (principles, "never" list, one-size-per-role rules), AGENTS.md, any
   copy or voice guide. List every rule.
2. **Sort them.** Each rule is checkable in data, in source, on the rendered page, or only by eye.
   Say which are eye-only; they stay in DESIGN.md and the review, not in a script.
3. **Write the checks** (patterns below), each failure message saying what broke, where, and what to
   do instead.
4. **Name every exception.** An allowlist entry carries a comment with the date and who approved it
   ("centred at the owner's ask, 3 Nov 2026"). An unexplained exception is a hole.
5. **Wire them in.** The content gate runs on import, so `build` fails. Source and rendered checks
   go in one `verify` command run against `build && start` (not the dev server).
6. **Make it the definition of done.** Add the command to AGENTS.md: "Before you call a change done,
   `npm run verify` passes."
7. **Run it on the current code** and fix, or allowlist with a reason, everything it finds before
   calling the guard done. A guard that starts red gets ignored.

When a rule changes, DESIGN.md, the check and its allowlist change in the same commit.

## Content gate

Validate every string in the content when the module loads, and throw, so a bad entry fails
`next build` instead of shipping:

```ts
const BANNED: [RegExp, string][] = [
  [/lorem|ipsum|\btodo\b|\btbd\b|placeholder/i, "placeholder text"],
  [/—/, "an em-dash"],
  [/!/, "an exclamation mark"],
];
const GENERIC_ALT = /^(template )?screenshot$|^image$|^thumbnail$/i;

// Walk the data, skipping keys that aren't copy (src, href, slug, ids), and push "<path>: <problem>".
if (errors.length) throw new Error(`Catalogue check failed:\n${errors.join("\n")}`);
```

Then the structural rules that keep entries honest. These are Openfile's; write the project's own:

- every slug unique, every category and cross-reference pointing at something that exists;
- a free item has a price of 0;
- a summary within its word range (40 to 60 words);
- every FAQ question ends in "?" and has an answer;
- every date is a real day in `YYYY-MM-DD`, and no changelog date is later than "last updated";
- optional fields may be absent, but present means complete: no empty list items, nothing listed
  twice.

**Translations** get the same banned-copy rules, and each one must keep the source's `{placeholders}`,
`[links]` and `**bold**`. A second check lists strings still identical to the English, so nothing
untranslated slips through.

## Source checks

Scan `src` for what the system forbids. Strip comments first so a note about a colour doesn't fail:

```ts
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
if (!file.endsWith("design/tokens.ts")) {
  if (/#[0-9a-fA-F]{3,8}\b/.test(code)) fail(`raw hex in ${file}`);
  if (/\brgba?\(/.test(code)) fail(`raw rgb() in ${file}`);
}
if (/text-transform\s*:\s*uppercase|textTransform:\s*["']uppercase/.test(code)) fail(`uppercase in ${file}`);
if (!CENTRE_OK.test(file) && /text-align\s*:\s*center|textAlign:\s*["']center/.test(code)) fail(`centring in ${file}`);
```

- **Tokens in one file.** Every literal value (colour, size, radius, duration) lives in one token
  file; nothing else may hold a colour.
- **The project's own bans**, from its DESIGN.md: uppercase, centring outside buttons, chips, cells
  and icon boxes, a monospace face, whatever the "never" list says.
- **One way to do a thing.** When a rule says something is always reached through one helper (a
  template is always pictured through its `preview`, never its raw `thumbnail`), fail any file that
  goes around it, so changing it in one place changes it everywhere.

## Rendered checks

Run against `build && start` on a fixed port, with a real browser (Puppeteer or Playwright):

- **Contrast of every token pair** that can meet: each text token on each surface, each control on
  its ground, at 4.5:1 for text and 3:1 for large text and controls. Include colours made at
  runtime (Openfile checks text on every template's sampled tint).
- **Headings:** one `h1` per page, and every page's `h1` different from every other.
- **Structured data** has the shape each page type needs, and every `@id` it references exists.
- **Banned copy** on the rendered page, not only in the data: em dashes, uppercase, centred text.
- **No horizontal scroll** at 375, 810, 1280, 1440 and 1800 px.
- **Grids end on a full row** where the design says so (mark them `data-full-rows`).
- **A keyboard pass.** Emulate reduced motion so scrolling is instant, then press Tab through the
  page, up to about 150 stops. Each stop must draw a focus ring someone can see, on screen, and not
  covered by a sticky bar. Step over third-party iframes.
- **The page's main jobs work:** every buy button opens its dialog, the feed lists what it should.
- **Screenshots** of every page at every width (`verify-shots/<page>-<width>.png`). The script is
  the floor; a person looking at the shots is the bar.

Print `ok` lines as checks pass and collect failures, then exit 1 with the full list, so one run
shows everything that's wrong.

## Pitfalls

- Point the browser at a production build. A dev server hides real fonts, real bundling and real
  timing.
- Hard-coded browser paths break on other machines: read the Chrome path from an environment
  variable, with a sensible default.
