# Writing the agent skills

Skills are read by Framer's agent, which may know nothing about the template. Write them like an onboarding note for a capable designer:
- concrete names and numbers
- a reason where a rule could look arbitrary
- no vague taste words

Use the project's exact names everywhere (style paths, component names, variant names, template name), then run `scripts/lint-skills.js`.

**Description:** one or two sentences that start with when to use the skill ("Use whenever you add or change a page or section in this template.") and end with what it guarantees. The name is lowercase-with-hyphens; it becomes the command.

**Marketplace description** (a different text, for the submission form's Skills list): one sentence of 100 to 160 characters for buyers. It starts with what the skill does and names the template's parts, for example "Builds new pages and sections from the template's layout, color and text styles, components and spacing, so they match the original pages." See SKILL.md, "Marketplace Agent form".

## Design system skill (always): structure

Fill every bracket from the audit, `layout-values.js` and the design system page. Delete lines that don't apply.

```
You are building inside the [brand] template. Reuse what exists. Never invent new colors, text styles or one-off buttons. The reference for everything below is the Design System page at /design-system.

PAGES
- Every new page uses the layout template "[template name]". It already holds [nav, footer, closing CTA], so never add those to a page.
- Give every page [n] breakpoints: [Desktop 1200, Tablet 810, Phone 390].
- Build the page as full-width sections stacked vertically: htmlTag section, width 100%, vertical stack centered, gap [48 to 56]px.
- Section padding: Desktop [112px 40px], Tablet [96px 24px], Phone [64px 16px]. [First section under a fixed nav: extra top padding.]
- Content sits in one inner frame, width 100%, max width [1280]px.
- Backgrounds: [alternation rule, page-top wash].
- Set a page title "[<Page> · brand]" and a one-sentence meta description.

COLORS (color styles only, never hex)
- Backgrounds: [style for sections and cards], [alternate], [soft highlight].
- Text: [primary], [secondary for intros], [tertiary for meta]; on dark: [inverse styles].
- Borders: [default], [divider].
- Accent: [accent style] is the only accent. Use it for one thing per view: [examples]. [What never to make accent-colored.]
- [Special folders such as Chat/* or Overlay/*: where they may be used.]

TYPOGRAPHY (text styles only; never set font, size or weight inline)
- [Style]: [role]. Cover every style, grouped by headings, body, special (buttons, CMS rich text, mockups).
- [Wrap rules, two-tone heading rule.]

COMPONENTS (reuse, never rebuild)
- [Component]: [when to use]; variants [list] and when each applies. Limits (max two buttons side by side, label style).
- Copy the example sections on the design system page: ["<Pattern> example" layer names with their recipe in one line each].
- Icons: [icon set] as icon layers, never emoji or text symbols.

SHAPE AND MOTION
- Radius: [scale with uses]. Spacing: [scale with uses].
- Hover: [values]. Scroll reveal: [values]. Name every new layer descriptively.

WHAT TO KEEP
- Do not change existing color styles, text styles, components or the layout template; add pages and sections instead.
- Copy tone: [voice in three adjectives, sentence rules, banned words, brand capitalisation, punctuation rules].
- [Localization: new text needs the [locale] version (run /translate-xx).]
```

### Worked example (Ivo, abbreviated)

```
PAGES
- Every new page uses the layout template "Main Layout". It already holds the Navigation and the closing CTA plus footer.
- Section padding: Desktop 112px 40px, Tablet 96px 24px, Phone 64px 16px. Content max width 1280px.
COLORS
- Accent: Accent/Purple is the only accent. Use it for one thing per view: a highlighted word in a heading (Accent/Heading Purple), an icon tile, or a link.
- Chat/* colors are only for chat and product mockups.
TYPOGRAPHY
- Heading/H1: hero headline, one per page. Heading/H2: section titles. Body/Large: hero subtitles and section intros (max width 640px).
COMPONENTS
- Button: Primary for the main action, Secondary next to it, Primary Small and Secondary Small inside cards and the nav, On Dark on gradient bands.
- Copy "Section Header example", "Feature Cards example" and "CTA Band example" from the design system page.
WHAT TO KEEP
- Copy tone: plain, confident, specific. Never use em dashes. The product name is always lowercase "ivo".
```

## Optional skills (only for repeated buyer tasks)

**CMS writer** (one per collection that buyers fill, such as `blog-post`):
- every field with its rule: title length, slug format, allowed categories or options, date default, image style, summary length, read-time formula
- body structure: opening paragraph, number of H2 sections, H3 use, length
- voice rules, and no fabricated customers or statistics
- after writing: check the listing page and detail page render, then run translation if locales exist

**Translator** (one per locale, such as `translate-es`):
- what to translate: visible text, component label controls, form labels, alt text, page title and description, new CMS items
- what stays: slugs, product and app names
- tone (formality), number and date formats
- a glossary of terms already used in the project's translations, and the layout check per breakpoint for longer languages

**SEO check** (before publishing):
- every page has its own title and description, with lengths stated
- one H1 per page
- images have alt text
- CMS detail pages use field variables in their metadata
- no links to "#" or missing pages

## Test requests to hand the user

Write five, tailored to the template:
1. `/design-system Build a Careers page with a hero, three perks, open roles and an application form`
2. `/design-system Add a Changelog page with dated release cards`
3. `/design-system Add a new hero variation to the <main page> using <signature component>`
4. one per optional skill (`/blog-post Write an article about …`, `/translate-es Translate the new Careers page`)

For each result, check that it reuses components, uses only styles, sits on the layout template and looks right at every breakpoint.
