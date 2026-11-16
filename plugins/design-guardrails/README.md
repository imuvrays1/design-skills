# Design guardrails

A design rule that only lives in a document gets broken the first busy week. This skill turns a
project's rules into checks that fail, so neither a person nor an agent can ship off-system work.

**See it live:** [openfile.pro](https://openfile.pro). Its build fails on a broken house rule, and
nothing is pushed until `npm run verify` passes.

## Three layers

- **Content gate, inside the build.** No placeholder text, em dashes or exclamation marks in any
  copy; no alt text that just says "image"; every reference points at something real, every date is
  a real day, every FAQ question is a question. Translations keep their placeholders, links and bold.
- **Source checks.** Every colour lives in one token file and nowhere else. The design's own bans
  (uppercase, centring outside buttons and chips) fail the run. Every exception is allowlisted with
  the date and who approved it.
- **Rendered checks, on a production build.** Contrast of every token pair, including text on
  colours made at runtime; one unique h1 per page; structured data; no horizontal scroll at five
  widths; a Tab pass that needs a visible focus ring at every stop; and a screenshot of every page
  at every width for a person to look at.

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install design-guardrails@design-skills
```

Then: "turn our DESIGN.md into checks" or "the agent keeps breaking the design system".

## Inside

[`SKILL.md`](skills/design-guardrails/SKILL.md): the steps, the patterns for each layer with code,
and the pitfalls.
