# Building the design system page

The page is the agent's visual reference and the buyer's manual. Every part is shown under its exact project name, with a one-line "Use for:" note. Build it from live project data (style paths, variant names) so the labels can't drift from the real names.

## Anatomy (top to bottom)

1. **Intro.** Eyebrow "Design system", H1 "The <brand> design system", one sentence, and count pills (color styles, text styles, components, breakpoints, languages).
2. **Colors.**
   - One group per color folder (Background, Text, Accent, Border, then specialised folders).
   - Each group: folder title, a "When to use:" line, then a 4-column grid of swatch cards (3 on tablet, 2 on phone).
   - Each card: an 88px chip filled with the style, the full path (`Text/Primary`) and the value (`#1A182B`, or `#FFFFFF · 75%` for alphas).
   - White or translucent-white styles go on a small dark gradient inside the chip so they stay visible.
   - Add the template's signature gradients as plain cards (they are not styles).
3. **Type.**
   - One card per typeface showing "Aa" in that font. Unbind the preset first (`textStylePreset="null"`) to set the font.
   - Then a type scale with one row per text style, divided by 1px Border/Default frames. Left column: exact style name, specs (`Urbanist 700 · 48/53 · 44 tablet · 34 phone`) and "Use for: …". Right column: a sample sentence in that style.
   - On phone, rows stack vertically.
4. **Components.**
   - A 2-column grid (1 on tablet and phone) with `gridRowHeightType="fit"`, so rows size to their content.
   - One card per component: title, a "Use for: … Variants: …" note, then instances of every variant.
   - Large components (navigation, hero demos, tabbed sections) get full-width cards below the grid. Give them sensible per-breakpoint sizes, and hide desktop-only variants on phone.
5. **Example sections.**
   - Two to four real compositions named `<Pattern> example` (for example "Section Header example"), each preceded by its name and a "Use for:" line with the exact styles and components used.
   - Never use `/` in a layer name. Framer reads it as a folder path and keeps only the last segment, so `Example/Section Header` is saved as "Section Header" and the skill's reference breaks.
   - Good defaults are a section header pattern, a card grid and a CTA band. Better still, copy the template's own most reused sections.
   - These names are what the design system skill points to.
6. **Spacing and shape.** Corner radius scale (tiles with one rounded corner), spacing scale (bars) and elevation (flat, raised, hover lift), all with the template's real values.
7. **Motion.** Three or four cards stating the easing, durations, press feedback and scroll reveals the template actually uses.

## Creating the page

```
+WebPageNode pgDS name="Design System" path="/design-system";
+FrameNode pgDSD parent="pgDS" name="Desktop" width="1200px" height="1000px";
```

Then, with `pagePath:'/design-system'`:
1. `SET <page> layoutTemplate="<template id>" metadata.title="Design system · <brand>" metadata.description="…";`
2. Create the two smaller breakpoints:
   ```
   CREATE_VARIANT bpXT from="<desktop>"; SET bpXT name="Tablet" width="810px" left="1300px" top="0px";
   CREATE_VARIANT bpXP from="<desktop>"; SET bpXP name="Phone" width="390px" left="2210px" top="0px";
   ```
   Use the template's real breakpoint widths. A "Ground nodes overlap" lint warning right after this is transient.
3. `SET <desktop> height="auto";`

Sections take the template's real values from `scripts/layout-values.js`:
- `htmlTag="section"`, vertical stack centered, `width="100%"`
- padding per breakpoint
- an inner frame with `maxWidth` equal to the content width
- alternating backgrounds the way the site does

Set responsive values on replicas with compound ids: `SET <breakpointId><nodeId> padding="…"`. Structural edits (`+Node`, `MOVE`) always target primary ids.

## Helper patterns (canvas DSL)

```js
const vstack = (gap, extra='') => `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="${gap}px" ${extra}`;
const hstack = (gap, extra='') => `layout="stack" stackDirection="horizontal" stackDistribution="start" stackAlignment="center" gap="${gap}px" ${extra}`;
// text: create, then set the preset by its FULL path (check getTextStyles().path, e.g. "Text Styles/Body/Small")
const txt = (id, parent, text, preset, color) =>
  `+RichTextNode ${id} parent="${parent}" text="${text}" width="auto" height="auto";\nSET ${id} textStylePreset="${preset}"${color ? ` textColor="${color}"` : ''};\n`;
// a color style as a value
const T = styleId => `var(--token-${styleId})`;
// an instance of a component variant
`+ComponentInstanceNode ${id} parent="${p}" component="${componentId}" $control__variant="Primary" $control__label="Start for free" width="auto" height="auto";`
```

- **Fresh temp-id prefixes for every run.** For example `ds7a`, `ds7b`. Temp ids live for the whole session, so a rerun reusing ids fails with "requested id already exists". A failed batch can also leave orphan mappings behind.
- **No gap with space-between.** `gap` together with `stackDistribution="space-between"` is rejected.
- **`height="1fr"` on grid children often fails.** Use `height="auto"` and `gridRowHeightType="fit"`.
- **No per-side borders.** Use 1px divider frames instead.

## Verify

- Screenshot each section (`readProject([{type:'screenshot', id}], {pagePath})`) on desktop, and the type and component sections on phone.
- The fixed nav from the layout template covers captures. Set its wrapper to `visible="false"` first and restore it afterwards.
- Check that the labels match the project names exactly, that nothing overflows on phone, and that dark-surface text is readable.
