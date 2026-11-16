# Framer canvas API gotchas (learned the hard way)

## Sessions and safety
- **`framer.publish()` deploys to production.** That includes the custom domain; there is no preview mode unless the project has staging enabled. Only call it when the user asks in the current conversation.
- **Sessions expire between conversations.** If you see `Session N is invalid or has expired`, run `npx @framer/agent@latest session new <projectId>`. In-memory `state` and session temp ids do not survive.
- **Confirm the project** with `framer.getProjectInfo()` before editing.
- **Fresh sessions can under-report.** Serialize can omit `#hash` parts of cross-page links, and `framer.getNode()` can return null for nodes on other pages. Confirm against the published HTML before "fixing" things.

## Ids
- **Temp ids last for the whole session.** Reusing a temp id from a failed batch gives "requested id already exists", or attaches children to an orphan. Use a new prefix per run.
- **Replica ids are compound:** `<breakpointId><nodeId>`. Set responsive overrides on them. Structural edits must target primary ids; a child created with a replica as its parent lands hidden in the primary.
- **`framer.agent.getNode({id:'<tempId>'})`** resolves a temp id to its real id.
- **No `/` in layer names.** It is treated as a folder path and only the last segment is kept (`Example/CTA Band` becomes "CTA Band"). Style and component names do use `/` for folders on purpose.

## Styles
- **Text style names in the DSL** use the full path the project reports, which can include a top folder: `textStylePreset="Text Styles/Heading/H1"`. Read `getTextStyles()` paths first.
- **`SET text="…"` can drop the text style.** Re-specify `textStylePreset` and `textColor` in the same command.
- **Fonts and sizes are locked while a preset is bound.** Set `textStylePreset="null"` first, then `fontName`, `fontWeight` and `fontSize`.
- **Rename color styles** with `setAttributes({name: "Folder/Name"})`. It sets `path` (a leading slash plus folders); `.name` then shows only the last segment.
- **Color values in the DSL:** `var(--token-<styleId>)`.

## Layout
- **No gap with space-between.** `gap` is rejected when `stackDistribution` is space-between, space-around or space-evenly.
- **Fractional heights.** `height="1fr"` only works for relative children of stacks and grids, and is often refused on grid items. Prefer `height="auto"` with `gridRowHeightType="fit"`. The default `auto` gives every row the height of the tallest.
- **Absolute pins reject `calc()`.** Use px.
- **No per-side borders.** Use 1px frames as dividers.

## Effects
- **Hover and loop defaults are not neutral.** `hoverEffect.*` defaults to scale 1.1, so set `hoverEffect.scale="1"`. `loopEffect.*` defaults to rotate 360, so set `rotate`, `rotateX` and `rotateY` to 0.
- **`appearEffect.enter.blur` is not supported.** Use opacity, y and scale.
- **Appear effects inside variants** replay when a layer becomes visible on a variant change.

## Links and overlays
- **Cross-page anchors depend on `pagePath`.** A link to `/page#section` keeps its hash only when `applyChanges` runs with `pagePath` set to the target page. Group link edits by target page.
- **Hover dropdowns inside a linked trigger hijack clicks.** A RelativeOverlay inside a linked frame sends every menu click to the trigger's link. Remove the trigger's link (`SET <trigger> link="null"`).
- **Oversized decorations can cover links.** Big wordmarks and tickers can sit on top of nearby links. Raise the link rows with `zIndex="2"`.
- **Test clicks on the live site,** not just serialized hrefs. Use `document.elementFromPoint` to see what actually receives the click.

## Pages and metadata
- **Page SEO:** `SET <page> metadata.title="…" metadata.description="…"` with that page's `pagePath`. CMS detail pages use `{{FieldName}}`.
- **New page recipe:** `+WebPageNode` plus a Desktop frame, then `SET page layoutTemplate=…`, then `CREATE_VARIANT` Tablet and Phone, then `SET desktop height="auto"`.
- **Localization:**
  - `getLocalizationGroups()` and `setLocalizationData({valuesBySource:{[sourceId]:{[localeId]:{action:'set', value}}}})`.
  - Formatted text values are HTML, so keep the original tag.
  - Renaming English text leaves the old translation attached, so re-set it.

## Screenshots
- **Hide the fixed nav for captures:** set the template's nav wrapper `visible="false"` while capturing, then restore it.
- **Component internals can't be captured with nav hidden.** Screenshot the variant root instead.
- **Screenshots don't show motion.** Verify animations through serialized effects and tell the user to check Preview.
