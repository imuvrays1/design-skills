# Design system audit

How I audit a product's UI against its design system: measure everything, find the one defect
behind most of what feels wrong, fix the system rather than the screens, then sweep the code.

**Where it comes from:** a cleanup of a B2B AI product's dashboard at Rifa. The product is
private, so there's no live link; this is the method. One sweep moved about 1,160 raw colour values
onto semantic tokens and added six new tokens to the design system.

## How it works

1. **Audit, read-only.** Walk a real workflow on the running app and measure computed styles:
   sizes, weights, colours, contrast, counts. Every number is measured, not estimated; anything not
   checked in a browser is flagged.
2. **Name the systemic defect.** For example: colour spent on *what kind* of thing something is
   instead of *what state* it's in, so a "locked by policy" badge shows in error red. The contrast
   passes, so it survives review, but the meaning is wrong.
3. **Rank P0 and P1**, each with an evidence table, the source line, the design-system rule it
   breaks and why it matters.
4. **Fix the system first.** When no token expresses a role, add the role to DESIGN.md instead of a
   one-off value, and write the enforced rule as a table of role to token.
5. **Sweep, property by property.** Raw ramp steps map to semantic tokens by the CSS property
   they're used in, exceptions are listed one by one, and every sweep is checked for regressions.
6. **Keep a status record**: phases, files touched, before and after per page, and what's waiting for
   approval.

## Install

```
/plugin marketplace add imuvrays1/design-skills
/plugin install design-system-audit@design-skills
```

Then: "audit this app against DESIGN.md" or "give me a P0/P1 list for this screen".

## Inside

[`SKILL.md`](skills/design-system-audit/SKILL.md): the audit's shape, the inventory methods for
type, colour and spacing, the system-first fix, the sweep and the status record.
