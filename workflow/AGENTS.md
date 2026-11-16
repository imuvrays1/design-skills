<!--
  The AGENTS.md from my portfolio repo (yuvrajsingh.work), as an example of how I brief coding
  agents. Client names, the CMS project id and local paths are taken out; the rest is as I use it.
-->

# Working on UV UX portfolio

Instructions for coding agents (Claude Code, Codex and others). The owner is UV (Yuvraj Singh); call
them UV.

## Before you change anything

1. Read [CONTEXT.md](CONTEXT.md): goal, phase, decisions, the plan agreed with UV, what's next.
2. Read [DESIGN.md](DESIGN.md) before touching anything visual.

## Rules

- Never invent case-study content. Whatever UV hasn't supplied stays a "To come…" placeholder;
  anything drafted from UV's notes is marked unconfirmed until UV approves it.
- NDA: real screens and real numbers may be shown; client names are not cleared, except the ones
  UV has cleared by name for a single case study.
- UV's previous portfolio is a separate project and repository: read it for reference, never edit,
  commit or switch branches there. The CMS project is shared with it: this site uses only its own
  dataset; leave the other one alone.
- Check pages in the Worker (`npm run preview`), not only `next dev`: the Worker is what ships.
- Keep `next` at 16.4.1 or later; don't add Node middleware (`src/proxy.ts`).
- Pushing to GitHub, deploying the Worker or the Studio, and anything touching DNS need UV's
  go-ahead. Don't delete or overwrite existing work without approval.
- Take colours, type, spacing and motion values from DESIGN.md; don't invent new ones.
- Accessible from the start: one h1 per page, keyboard access, visible focus, alt text, reduced
  motion respected, WCAG AA contrast.
- Avoid new dependencies unless they clearly pay for themselves; say why in CONTEXT.md.

## Before you call a change done

- `npm run typecheck` passes, and the changed pages look and work right in `npm run preview`.

## After you change something

- Update CONTEXT.md (what changed, which files, what is next, new known issues), and DESIGN.md when
  tokens, components or motion change. Keep both true to the code as it is, not as planned.
