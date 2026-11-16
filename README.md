# Design skills by UV

I'm UV, a product designer who ships in code. These are the skills I've written so AI agents
(Claude Code mostly, Codex too) design and build the way I would. Each one comes from real work,
and where that work is live, it's linked.

Portfolio: [yuvrajsingh.work](https://yuvrajsingh.work) · Shop: [openfile.pro](https://openfile.pro) ·
Previous site: [meetuv.com](https://meetuv.com)

## Install

Everything in one install (Claude Code 2.1.275 or later):

```
/plugin install all-design-skills --marketplace imuvrays1/design-skills
```

Or add the collection once and install only the skills you want:

```
/plugin marketplace add imuvrays1/design-skills
/plugin install openfile-principle@design-skills
```

Or copy any `plugins/<name>/skills/<name>` folder into `~/.claude/skills/`.

## The collection

| Skill | What it does | See it live |
| --- | --- | --- |
| [Openfile Principle](plugins/openfile-principle/) | Critiques a screenshot, site, Figma frame or code through 16 design principles: what's off, why, one question and one experiment for the next version. | [openfile.pro](https://openfile.pro) |
| [Cursor build intro](plugins/cursor-build-intro/) | Labelled multiplayer cursors draw the page as frames with live W × H badges, then hand over to the real page. One React component. | [meetuv.com](https://meetuv.com) |
| [Working docs](plugins/working-docs/) | AGENTS.md, DESIGN.md and CONTEXT.md: the three files that let agents build a project my way and remember what we decided. | [yuvrajsingh.work](https://yuvrajsingh.work), [openfile.pro](https://openfile.pro) |
| [Design guardrails](plugins/design-guardrails/) | Turns design rules into checks that fail the build: tokens only, banned copy, contrast, one h1, no overflow, a visible focus ring at every Tab stop. | [openfile.pro](https://openfile.pro) |
| [Design system audit](plugins/design-system-audit/) | A measured P0/P1 audit against the design system, a system-first fix, and a property-scoped sweep of the code. | Method only (private product) |
| [Performance pass](plugins/perf-pass/) | A phone budget, a measured before and after, a cause for every symptom, and rules that keep it fast. | [rifa.ai](https://rifa.ai), [openfile.pro](https://openfile.pro) |
| [Framer Agent Template](plugins/framer-agent-template/) | Turns a Framer template into a Marketplace Agent Template: styles, layer names, a design system page, agent skills, a demo video. | [framer.com/@yuvi](https://www.framer.com/@yuvi/) |

## Written for one project

These run inside the repo they were written for, so they don't install elsewhere. They're here to
show how I turn a style into a system other people, and their agents, can follow.

| Skill | What it does | See it live |
| --- | --- | --- |
| [Loops animations](project-skills/loops-animations/) | The system behind every moving graphic on useloops.ai, the hero included: a beat sheet, a starter, a loop engine, a check that fails off-system motion, and frame-exact export. | [useloops.ai](https://useloops.ai) |
| [Preview animation](project-skills/preview-animation/) | The covers and animated figures for my case studies: stills reviewed in Figma first, then storyboarded, built with Stageshow, rehearsed and recorded as seamless loops. | [yuvrajsingh.work](https://yuvrajsingh.work) |
| [Case study voice](project-skills/case-study-voice/) | My writing voice as rules and before/after examples: warm, plain, first person, no invented facts. | [yuvrajsingh.work](https://yuvrajsingh.work) |

## Also

- [Voice orb](https://github.com/imuvrays1/voice-orb): an audio-reactive WebGL2 orb for voice
  interfaces, with its own Claude plugin. MIT. [Demo](https://imuvrays1.github.io/voice-orb/).
- [`workflow/`](workflow/): the real AGENTS.md and DESIGN.md from my portfolio, with client names and
  private paths taken out.

Several skills come with evals (a prompt and graders per case) so I can check a skill still does its
job after I change it, with `claude plugin eval`.

## Licence

MIT, see [LICENSE](LICENSE). Preview animation needs Stageshow, which isn't
included. Framer Agent Template's voiceover needs your own ElevenLabs key.
