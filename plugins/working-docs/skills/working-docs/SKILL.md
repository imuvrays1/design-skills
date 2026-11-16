---
name: working-docs
description: Set up and keep the working documents that let AI coding agents build a design project the way its designer would - AGENTS.md (the rules), DESIGN.md (the look as built - tokens, components, motion and the designer's dated decisions) and CONTEXT.md (goal, phase, decisions, what's next, known issues). Use when starting a site or app with an agent, when an agent keeps inventing colours or spacing, forgets decisions between sessions or redoes settled work, or when someone asks for an AGENTS.md, CLAUDE.md, DESIGN.md, CONTEXT.md or handoff doc, even if they only say "set this project up for Claude" or "the agent keeps getting the design wrong".
---

# Working docs

Three short files that every agent reads before it changes anything, and updates after. They are
how a designer's taste, decisions and rules survive from one session to the next, and from one
agent to another. Every project of UV's runs on them: yuvrajsingh.work, meetuv.com and openfile.pro.

| File | Holds | Changes |
| --- | --- | --- |
| `AGENTS.md` | The rules: what to read, what's off-limits, what needs the owner's go-ahead, what "done" means. | Rarely: when something goes wrong and becomes a rule. |
| `DESIGN.md` | The look as built: direction, colour, type, layout, components, motion. | In the same commit as any token, component or motion change. |
| `CONTEXT.md` | Where the project is: goal, phase, decisions, files, what's next, known issues, and a dated entry per change. | After every change. |

`CLAUDE.md` holds one line, `@AGENTS.md`, plus a sentence on what the project is, so Claude Code,
Codex and any other agent read the same rules.

## Setting up a new project

1. **Collect what only the owner knows**: who owns it and what to call them, what it is and who it's
   for, the references, the stack and where it ships, and what needs their approval. Ask for what's
   missing instead of filling it in.
2. **Write AGENTS.md** from the template below. Keep it under about 50 lines: it's read every
   session.
3. **Write DESIGN.md.** If there's a design (Figma, a live site, references), measure the values and
   write them down. If there isn't one yet, write the Direction and leave the other sections as
   "To come". Never invent tokens to fill a section.
4. **Write CONTEXT.md** with Goal, Phase, Decisions, Next and Known issues.
5. **Commit the three before any code**, so the first build already follows them.

## AGENTS.md

Four sections, in this order:

```markdown
# Working on <project>

Instructions for coding agents (Claude Code, Codex and others). The owner is <name>; call them <name>.

## Before you change anything

1. Read [CONTEXT.md](CONTEXT.md): goal, phase, decisions, the plan agreed with <name>, what's next.
2. Read [DESIGN.md](DESIGN.md) before touching anything visual.

## Rules

- Never invent content. Whatever <name> hasn't supplied stays a visible "To come…" placeholder;
  anything drafted from <name>'s notes is marked unconfirmed until they approve it.
- Check pages in the runtime that ships (<command>), not only the dev server.
- Pushing, deploying and anything touching DNS need <name>'s go-ahead. Don't delete or overwrite
  existing work without approval.
- Take colours, type, spacing and motion values from DESIGN.md; don't invent new ones.
- Accessible from the start: one h1 per page, keyboard access, visible focus, alt text, reduced
  motion respected, WCAG AA contrast.
- Avoid new dependencies unless they clearly pay for themselves; say why in CONTEXT.md.

## Before you call a change done

- <typecheck command> passes, and the changed pages look and work right in <preview command>.

## After you change something

- Update CONTEXT.md (what changed, which files, what is next, new known issues), and DESIGN.md when
  tokens, components or motion change. Keep both true to the code as it is, not as planned.
```

Then add the project's own rules, each one learned from something that went wrong, with its reason
in the same line. A version pin says why ("on 16.3.x the work pages 404 in the Worker"); a banned
approach says what broke. A rule without a reason gets argued with or dropped.

"Done" is something that can be run: a type check, a build that fails when a house rule breaks, a
visual comparison against the live site, a performance budget. Name the command.

## DESIGN.md

- **First line:** "The look, as built. Take values from here and `<token file>`; don't invent new
  ones."
- **Direction:** dated decisions with the owner's own words quoted, and a table of references and
  what this project takes from each. Quotes keep the reasons; a paraphrase loses them.
- **Colour, Type, Layout and spacing, Components, Motion:** the values, measured or set, one size per
  role (page title, section heading, button height, hairline). Motion lists its durations and
  curves, and what happens under reduced motion.
- **Rules from reviews**, dated: what an audit found and the rule that came out of it.
- **Tokens live in one file in code** (Openfile's `src/design/tokens.ts` holds every literal value,
  and no stylesheet or component contains a colour). DESIGN.md says which file. For a product with
  many engineers, put the tokens in YAML front matter at the top of DESIGN.md and generate the CSS
  variables from it, so the document and the code can't drift.

## CONTEXT.md

```markdown
# Context

Working notes: where the project is, what was decided, what's next. Keep it true to the code.

## Goal
Who it's for, what they should come away with, and what it must do.

## Phase
Dated lines: where things stand.

## Decisions
Dated, with who decided and their words when the words matter.

## Files
Where things live.

## Next

## Known issues
```

After every change, a dated entry: what changed, which files, where it stands ("local, for UV's
review", "committed, not deployed", "deployed"), and what's next. Say plainly what wasn't done or
wasn't checked.

When one file gets long, split it the way Openfile does: `PROJECT.md` for what it is, the stack and
the decisions that shape the code; `HANDOFF.md` for the session record (where things stand as a
table: branch, routes, build, verify, Lighthouse; where the facts come from; visible placeholders;
things to check with the owner; traps that each cost real time; next).

## Keeping them true

- Read the three at the start of every session, even a short one.
- When the code and a document disagree, fix one of them in the same change. Documents describe the
  code as it is, never as planned.
- Record every decision with its date and who made it. Next week's session won't remember why.
- Keep a list of traps: each thing that cost real time, and how to avoid it.
- Placeholders stay visible and tagged ("To come…", "Placeholder", "Sample"), so nothing invented can
  pass for real.

## Examples

The `workflow/` folder of this repository has the real AGENTS.md and DESIGN.md from UV's portfolio
(yuvrajsingh.work).
