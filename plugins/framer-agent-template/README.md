# Framer Agent Template

Turns an existing Framer template into a Framer Marketplace Agent Template: one that Framer's
in-editor agent can extend, so buyers type `/design-system` and ask for new pages that look like
they came with the template.

**See my templates:** [framer.com/@yuvi](https://www.framer.com/@yuvi/) and
[openfile.pro](https://openfile.pro).

## What it does, in order

1. **Audit.** Colour and text styles (and which are unused), components and variants, layout
   templates, breakpoints, the most common hardcoded colours, generic layer names, existing skills.
   Reported as "already fine" and "needs work".
2. **Foundations.** Hardcoded colours become colour styles (dry run first), inline type becomes text
   styles, every page sits on a layout template, and repeated hand-built parts become components.
3. **Naming.** Styles named by role, never by value; layers like `Frame 12` get real names. The agent
   finds things by name, so this matters more than it looks.
4. **Design system page.** Every style and component under its exact name, with "Use for" notes and
   a few example sections showing how the parts combine.
5. **Skills.** A `/design-system` skill written from the project's real numbers (section padding,
   widths, which text style fits each role), installed in the project, then linted so every style
   and component it names actually exists.
6. **Testing.** Five test requests for the agent and what to check in each result.
7. **Demo video.** 30 to 40 seconds from real captures, a seven-sentence script and a voiceover in
   one take.
8. **Handover.** What changed, the skills, the tests, the video script and the Marketplace form
   answers ready to paste.

It pauses for a yes before deleting anything or publishing, and it never presents a page as agent
output without a recording of the agent making it.

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install framer-agent-template@design-skills
```

Needs Framer's agent CLI (`npx @framer/agent@latest setup`) and, for the voiceover, your own
ElevenLabs key.

## Inside

- [`SKILL.md`](skills/framer-agent-template/SKILL.md): the workflow.
- `scripts/`: audit, tokenize, rename layers, layout values, install and lint skills, the
  Marketplace form, and the demo video pipeline.
- `references/`: a summary of Framer's guide, the design system page, skill templates, the video,
  and the gotchas.
- `evals/`: three test cases with graders (a read-only audit, writing a design system skill, the
  full conversion), run with `claude plugin eval`.
