---
name: design-system-audit
description: Audit a running product's UI against its design system (DESIGN.md or a token spec) with measured evidence, rank what's wrong as P0 and P1, find the one systemic cause behind most of it, then fix it as a system change (a new role or token) and sweep the codebase with a property-scoped mapping, an exceptions list and a before/after status record. Use when a product "feels off" or inconsistent, when type, colour or spacing has drifted from the system, before a design-system migration or cleanup, or when someone asks for a UI audit, a P0/P1 list, a design QA pass or a token sweep.
---

# Design system audit

How UV audited and cleaned up a B2B AI product's dashboard at Rifa: measure first, name the one
defect behind most of the symptoms, fix the system rather than the screens, then sweep the code with
a mapping everyone can check.

Two passes, kept apart: the **audit** changes no code; the **sweep** changes code only after the
owner has read the audit.

## 1. The audit (read-only)

**Header.** Every audit opens with:

- **Date.**
- **Workflow:** the exact path walked (for example: template gallery → duplicate → the new item's
  page → every tab), so someone else can repeat it.
- **Method:** computed styles measured on the running app, plus a trace to the source line.
- **Benchmark:** the design system (DESIGN.md), and the bar set by named products the audience
  already uses.
- The line **"Audit only. No code changes were made. Every number below is measured, not
  estimated."** If anything couldn't be checked in a browser, say so and flag it "Not visually
  verified".

**Executive summary.** Look for the one systemic defect behind most of what feels wrong, and state
it in a sentence. An example of the kind: semantic colour spent on *taxonomy* instead of *state*, so
a "locked by policy" badge renders in error red. The contrast is fine; the meaning is wrong, which is
why it survived review. Then say which findings it explains, what one change to the system fixes it,
and the count of P0s and P1s.

**Each finding:**

- `P0-n · <what's wrong, in plain words>`.
- **Evidence:** a table measured on the page (element, count, fill, text colour, contrast ratio,
  size and weight), and the source location.
- **The rule it breaks**, quoted from DESIGN.md.
- **Why it matters** for this product's users, in a sentence or two.
- **Fix**, preferring a system change: when no token expresses the role, the gap is the root cause,
  so propose the new role for DESIGN.md instead of a one-off value.

P0 is anything that misleads or blocks: colour that means the wrong thing, two primary actions
competing, navigation that isn't navigable, a screen with no type hierarchy. P1 is consistency and
polish: off-scale sizes, the wrong icon set, small text that fails AA, list rows at the wrong
density, a tab that's mostly empty.

**Close with** per-screen target specs, a navigation model if navigation is part of the problem,
sequencing (what to fix first and what depends on what), **what is already strong**, and open
questions for the owner.

### Inventory methods

- **Type:** extract every font-size (token references, inline styles, CSS declarations), resolve it
  to px and histogram it. Report the share that's off the scale entirely (fractional sizes are a
  tell), how weight is spread (when almost everything is semibold, nothing is emphasised), and
  whether line-height and tracking come with the size or only the size is used.
- **Colour:** count each text colour by role, and compute WCAG contrast for every text colour
  against each surface it sits on. A "tertiary" grey used for content is a common AA failure.
- **Spacing:** page gutters, card padding and gaps measured per page against the spacing scale.

## 2. The fix: system first

1. Add the missing role or token to DESIGN.md, and regenerate the tokens from it if the project
   generates them.
2. Write the **enforced rule** as a table of role to token:

   | Role | Token |
   | --- | --- |
   | Page, section and card titles, KPI values | `text-primary` |
   | Subtitles, descriptions, captions | `text-secondary` |
   | Placeholders, timestamps, quiet metadata | `text-tertiary` |
   | Disabled controls | `text-disabled` |
   | Text on dark or coloured surfaces | `text-inverse`, `text-on-brand` |

3. Standardise the big things once, in one place: one page title (`h1`, one size, on every page;
   anything else that was that size steps down so the title is always the largest text), one page
   gutter set in the layout component, one card padding.

## 3. The sweep

- **Property-scoped mapping.** Map raw ramp steps to semantic tokens by the CSS property they're
  used in, never globally: `color: neutral-950/900/800` → `text-primary`, `700/600` →
  `text-secondary`, `500/400/300` → `text-tertiary`, the lightest steps → `text-inverse`. Do
  surfaces as a separate sweep with their own map.
- **Inline styles** in components get the same mapping, file by file, in a table.
- **What doesn't fit the map** gets analysed one by one: snap it to an existing token, or add a new
  semantic one to DESIGN.md.
- **Intentional exceptions** are listed with file and line and why (a chart library's config, a
  data-driven status colour).
- **Look for regressions after every sweep.** A mechanical map can make white text on a white
  disabled state; say what was caught and how it was fixed.

## 4. The status record

Keep one file, updated as you go:

- A status table: phase, files touched, insertions and deletions, status (done and committed with
  the hash, done and uncommitted, pending the owner's approval).
- One section per phase with before and after tables per page.
- The cumulative file impact.

The final commit and push wait for the owner's go-ahead.
