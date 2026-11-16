# Working docs

The three files every project of mine starts with, so AI agents build it the way I would and
remember what we decided:

- **AGENTS.md**: the rules. What to read first, what's off-limits, what needs my go-ahead
  (pushing, deploying, DNS), and what "done" means, as a command that can be run.
- **DESIGN.md**: the look as built. Dated decisions in my own words, the references and what each
  gives, and every value: colour, type, spacing, components, motion. Agents take values from it and
  never invent new ones.
- **CONTEXT.md**: where the project stands. Goal, phase, decisions, what's next, known issues, and a
  dated entry after every change, so the next session starts where the last one stopped.

**See it live:** three sites built this way: [yuvrajsingh.work](https://yuvrajsingh.work),
[meetuv.com](https://meetuv.com) and [openfile.pro](https://openfile.pro).

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install working-docs@design-skills
```

Then say "set this project up for Claude", or "the agent keeps getting the design wrong".

## Inside

- [`SKILL.md`](skills/working-docs/SKILL.md): how to set the three up, templates for AGENTS.md and
  CONTEXT.md, what goes in DESIGN.md, and how to keep them true.
- Real examples from my portfolio: [`workflow/AGENTS.md`](../../workflow/AGENTS.md) and
  [`workflow/DESIGN.md`](../../workflow/DESIGN.md).
