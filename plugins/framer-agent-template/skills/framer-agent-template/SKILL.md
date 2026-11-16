---
name: framer-agent-template
description: Turn an existing Framer template into a Framer Marketplace Agent Template, following Framer's "How to create an agent template" guide. Audits the project, swaps hardcoded colors and inline type for styles, names styles and layers by role, builds or completes a /design-system page, writes and installs agent skills (SkillNodes like /design-system), makes a 30 to 40 second demo video with an ElevenLabs voiceover, then hands over test prompts, the video script, a submission checklist and paste-ready answers for the Marketplace Agent form. Use this whenever the user wants a Framer template made "agent-ready" or converted into an Agent Template, wants a design system skill or page added to a Framer project, is preparing an Agent Template submission, asks what to fill in the Marketplace Agent tab or how to describe a template's skills, wants a demo video for an Agent Template, or mentions Framer agent skills, even if they only say "do what we did for Ivo" or paste the Framer agent-template article link.
---

# Framer template → Agent Template

An Agent Template is a Marketplace template that Framer's in-editor agent can extend. Buyers type a command such as `/design-system` in the agent chat and ask for new pages; the agent follows the template's skills and reuses its styles, components and layout. Your job is to make an existing template ready for that, end to end, using the Framer agent CLI.

Read `references/agent-template-guide.md` once at the start. It summarises Framer's guide (seven steps and the submission checklist) and is the spec this workflow implements. If the user links the live article, skim it for changes since the summary was written.

## Before touching anything

1. Load the `framer` skill and follow its setup (`npx @framer/agent@latest setup`), so the canvas DSL docs for this project exist.
2. Open a session: `npx @framer/agent@latest session new <projectId or URL>`. Sessions expire between conversations; open a new one rather than retrying a dead id.
3. Verify the binding with `framer.getProjectInfo()` and say the project name back to the user. Sessions can point at a different project than expected, and every later step edits the project in place.
4. Mention Framer's version history as the undo path. Suggest a duplicate if the template is already on sale.

Run scripts like this, putting a config line in front of the script:

```bash
(echo 'const CONFIG = {"dryRun": true};'; cat scripts/audit.js) | npx @framer/agent@latest exec -s <session>
```

Every script reads `CONFIG`; when a script takes none, pass `{}`.

## The workflow

Work through the steps in order and keep the user posted with one line per milestone. Pause for a yes before destructive or outward-facing actions. That means deleting styles, components or pages, and publishing. Large reversible changes (tokenizing colors, renaming layers) get a dry run first so the user sees the counts.

### Keep it focused

The guide favors a small, well-built template over many pages. Framer's example ships one home page, a design system page and a `/design-system` skill, and buyers generate everything else. So:
- Don't add pages to "complete" the template.
- Put the effort into consistent sections, complete component variants and clear skills.
- If the template has pages that only repeat patterns found elsewhere, mention that buyers could generate them instead. Leave the cut to the user.

### 1. Audit (`scripts/audit.js`)

The audit reports what the guide cares about:
- color styles and text styles with their folder paths, and which are unused
- components and their variants
- layout templates, and pages without one
- breakpoints per page
- the top hardcoded colors
- generic layer names
- existing skills, CMS collections and locales

Summarise it for the user as "already fine" and "needs work". Also run `scripts/layout-values.js` to read the real section padding, content max width and section gaps per breakpoint from the home page. The skill you write later must state these real numbers, not guesses.

### 2. Foundations

- **Hardcoded colors → color styles (`scripts/tokenize.js`).** Run it with `dryRun: true` first. It maps every exact match to an existing style; for text color it prefers styles in a Text folder, and for fills it avoids them. It then lists the unmatched values by count. Values that recur, such as mockup greys or brand glows, deserve new styles: pass them as `newStyles: {"<value as listed>": "Folder/Name"}` and run again with `dryRun: false`.
- **Leave some colors inline:** gradients, translucent overlays at many different alphas, and one-off illustration colors. A style per alpha step clutters the picker without helping the agent. Tell the user what you left and why.
- **Inline text styling → text styles.** The audit lists text layers with no text style, and text or runs that set their own font, size, weight, line height or letter spacing.
  - Bind each one to the matching existing text style (`textStylePreset="<full path>"`).
  - Where a role has no style yet, create one with a role name rather than leaving one-offs.
  - Logo wordmarks, decorative tickers and chat or product mockups may keep custom type on purpose. Say which ones you left and why.
- **Layout template.** Every page should use one (nav and footer live there). Apply it to pages missing it after checking each page doesn't carry its own nav or footer.
- **Repeated elements → components.** Buttons, cards and badges built by hand on several pages should become components with variants. Do this only where the audit shows real repetition, and say what you converted.
- **Unused styles, components and pages.** List them and ask before deleting.

### 3. Naming

The agent finds things by name, so names must say what each thing is for.

- **Color styles: name by purpose, never by value.** The guide's examples put everything under one folder: `Color/Text Primary`, `Color/Border`. Role folders such as `Background/…`, `Text/…`, `Accent/…`, `Border/…`, plus `Chat/…` or `Overlay/…` for specialised sets, follow the same rule. Pick one scheme, and if the template already names colors by role, keep it rather than churning names. Rename with `colorStyle.setAttributes({name: "Folder/Name"})`, which sets the folder path.
- **Text styles: name by hierarchy.** The guide uses `Text/H1`, `Text/Body`, `Text/Button`. Folder-per-role names such as `Heading/H1`, `Body/Large` and `Button/Small` are equally clear. Keep good existing names.
- **Components and variants:** descriptive, for example `Button` with `Primary` and `Secondary`.
- **Generic layers** (`Frame 12`, `Text`, `Stack`): rename them with `scripts/rename-layers.js`. Dry run first.
- **Re-read the paths afterwards.** Text styles may sit under a top folder such as `Text Styles/`, and the canvas DSL then needs the full name (`Text Styles/Heading/H1`). Components may sit under `Components/` and templates under `Layout Templates/`. Use the names exactly as the project reports them.

### 4. Design system page

Follow `references/design-system-page.md`. If the template already has a design system or style guide page, complete it instead of building a second one. The page must show:
- every color style and text style under its exact name
- every component with all its variants
- a short "Use for:" note on each part
- two to four named example sections ("Section Header example", "Feature Cards example", "CTA Band example", or the template's own patterns) that combine the parts the intended way. Never put `/` in a layer name: Framer treats it as a folder separator and keeps only the last part

Give it all three breakpoints, the layout template, and its own SEO title. Verify it with screenshots: hide the fixed nav for captures, then restore it.

### 5. Skills

Write the skills with `references/skill-templates.md`:

- **Always write a design system skill named `design-system`.** It covers pages (template, breakpoints, section padding and width), colors by role and how sparingly to use the accent, which text style fits each role, which components to reuse, shape and motion values, and what to keep unchanged, including copy tone.
- **Add other skills only for repeated buyer tasks** the template supports. Typical ones are writing items in a CMS collection, translating into an existing locale, and an SEO check before publishing. One task per skill.
- **Framer's own resources.** The guide links a "Best practices for writing skills" article and a design system demo project to remix. If the user can share either, or the live article links are reachable, read them and align the skill's structure.
- **Install** each skill with `scripts/install-skill.js`, which creates or updates a SkillNode with `trigger: "on-demand"`. The name becomes the command (`/design-system`). The description starts with when to use it.
- **Check the names** with `scripts/lint-skills.js`. Every style, component, template and collection a skill names must exist. Fix the skill or the project until nothing is missing. It reads style paths with any number of folders (`Colors/Text/On Dark Muted`) and short forms (`Accent/Link`). Pass `text` to lint a draft before installing it, `ignore` for slash phrases that aren't names (`Desktop/Tablet`), and `extraNames` for component and template names, which it can't pick out of prose.

### 6. Testing

The real test is Framer's in-editor agent in a remix of the template, and the CLI cannot drive it. Be upfront about that.

Do what you can:
- the name lint
- a check that every page sits on the layout template
- optionally, building one requested page yourself by following only the skill text, as a proxy, then deleting it

Then give the user five concrete test requests for the agent chat. Include pages the template lacks, such as pricing, a new hero, or a careers page with a form. Also give what to check in each result:
- it reuses components rather than rebuilding them
- it uses only color and text styles, with no hex values or inline fonts
- it sits on the layout template
- it looks right at every breakpoint
- next to the template's original pages, it looks like it belongs

When a result surprises, fix the skill by adding a clearer rule, a default or an example. Repeat until common requests come out shippable.

### 7. Demo video

The Marketplace form asks for a demo video link, so make one. Follow `references/demo-video.md`: a 30 to 40 second video built from 2x section captures, a seven-sentence script, an ElevenLabs voiceover in one take, and an animated stage rendered at 1080p and 60fps. The kit is in `scripts/demo/` and `assets/`; `assets/video.example.js` is a complete working config.
- **Show the user the script before generating audio.** Check the ElevenLabs characters left, and say so if the plan is free (no commercial licence).
- **Be honest:** real pages and real skill text only. Don't present a page as agent output without a recording of the agent making it.
- **Check stills before the full render, then frames from the finished mp4.**
- **Deliver the listing copy with the video, unasked:** run `scripts/demo/listing-copy.js` and paste the skill details, the YouTube title and description, and the Agent form answers in the same message (details in `references/demo-video.md`, step 7).
- **The user uploads it to YouTube.** The form takes a YouTube link, not a file.

### 8. Handover

Write the handover to the user's listing doc or a doc of their choice:
- **What changed:** counts per step.
- **The skills:** each command, its description, and what it controls.
- **The five test requests.**
- **The demo video:** file, voice, and the script as a table (time, shows, says). Optionally, a two-minute walkthrough script for a longer recording that runs a real agent request.
- **The Marketplace Agent form answers**, ready to paste (below).
- **The submission checklist** from the guide.

### Marketplace Agent form

The Agent Template option lives in the Creator Dashboard: open the template, choose Edit Template, then the **Agent** tab (next to Details, Description, Media and Post). Its fields:
- **Agent Template** (toggle): on.
- **Design System** (Yes or No): Yes once the design system page from step 4 is complete. If it isn't, finish the page rather than answering No.
- **Demo** (a YouTube link): the step 7 video, uploaded by the user.
- **Skills** (one row per skill; New adds a row): `skill-name` is the SkillNode name exactly, with no slash. The description is written for buyers.

Run `scripts/marketplace-form.js` to collect the facts: the design system page and its sections, and each skill's name and agent-facing description. Then write each buyer-facing description:
- **One sentence under 100 characters.** The form's skill description field caps at 100 characters. Count each one with code before handing it over; aim for 55 to 85.
- **Start with what it does:** "Builds…", "Adds…", "Writes…".
- **Name the template's own parts:** its layout template, collection or pages.
- **Say what stays consistent.**
- **Rewrite rather than copy the SkillNode description.** That one starts with when the agent should use it ("Use whenever…"), which reads wrong to a buyer.
- **No hype words and no em dashes.**

Give the answers in this shape, in the handover and in chat:

```
Agent Template: On
Design System: Yes (/design-system)
Demo: <YouTube link for <file>.mp4>  (upload pending)
Skills:
  design-system    Builds new pages and sections from the template's layout, color and text styles, components and spacing, so they match the original pages.
  <name>           <one sentence>
```

**Shortcut.** When the template is already converted and the user only wants the form, for example by sharing a screenshot of the Agent tab, skip to this section. Run the script, write the answers, and name any field that still needs the user (usually the YouTube link). If there's no demo video yet, offer step 7.

**Publishing** goes straight to the live domain, since `framer.publish()` has no staging unless the project enables it. Only publish when the user asks in this conversation. After publishing, click-test the nav and footer on the live site.

## Quality bar while editing

`references/gotchas.md` lists the canvas API traps that cost the most time: temp-id collisions, preset folder names, grid sizing, replica ids, hidden nav in screenshots, cross-page anchor links, and clicks swallowed by overlays. Read it before the first edit.

Two site-level problems hurt agent templates in particular. Check for both while you are in the project:
- **Nav menus that don't navigate.** A hover menu nested inside a linked trigger sends every click to the trigger's page. Fix it by removing the trigger's link.
- **Footer links covered by an oversized element**, such as a big ticker or wordmark. Fix it with `zIndex` on the link rows.

Also look at loose canvas items, meaning layers that sit next to a page's breakpoints rather than inside them. They ship with every remix. Flag any personal details (emails, handles), scratch copies and leftovers to the user before submission, but never delete canvas items without a yes: they may be thumbnails or notes the user wants.

House rules for any copy you write: no em dashes, and no unicode symbols used as icons (use the project's icon set).

## Final report to the user

End with a short report:
- what each step changed, as numbers
- what was left alone and why
- the Marketplace Agent form answers, ready to paste
- the three things only the user can do: run the agent tests in a remix, upload the demo video to YouTube, and submit with the Agent Template toggle on
- whether anything is published
