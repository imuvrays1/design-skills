# Framer agent template guide: what it asks for

Summary of Framer's help article "How to create an agent template"
(https://www.framer.com/help/articles/how-to-create-an-agent-template/), re-checked November 10, 2026.
Check the live article for changes.

## What an Agent Template is

A Marketplace template built for Framer's agent. It ships three things:
- **Skills.** Saved instructions the agent follows when invoked, at least a `/design-system` skill.
- **A design system page.** It shows the color styles, text styles, components and example sections.
- **A walkthrough video.** It shows how the template, the design system page and the skills fit together.

Buyers ask the agent for new pages or sections, and the agent builds them from the template's skills, styles and components. Converting an existing template follows the same steps as building one from scratch.

## Guiding idea

Focus beats page count. Invest in reusable parts: consistent sections, complete components, and skills that explain how to combine them. Buyers generate the pages they need, so strong building blocks and clear rules matter more than many pages. Framer's own example is a template with one home page, a design system page and a `/design-system` skill, from which buyers generate careers, blog and pricing pages.

## The seven steps

1. **Foundations.** The agent reuses color styles, text styles, components and layout templates.
   - Swap hardcoded colors for color styles.
   - Move inline text formatting into text styles.
   - Turn repeated elements (buttons, cards, badges) into components with variants.
   - Put the nav and footer in a layout template used by every page.
   - Delete unused styles, components and pages.
2. **Names.** Skills refer to things by name, so names should describe their role.
   - Color styles by purpose, not by value. The guide's examples: `Color/Text Primary`, `Color/Border`.
   - Text styles by hierarchy. The guide's examples: `Text/H1`, `Text/Body`, `Text/Button`.
   - Components and variants descriptively, for example Button with Primary and Secondary.
   - Rename generic layers like "Frame 12" in sections a skill points to.
3. **Design system page.**
   - Show each color and text style with its name.
   - Show every component with all variants.
   - Add example sections that combine the parts as intended.
   - Add a short note on when to use each part.
   - Keep the page current whenever styles or components change.
4. **Skills.** Created in Settings › Skills, each with a short name, a description saying when to use it, and the instructions in a Content field. Buyers run one by typing its command, such as `/design-system`.
   - **Start with a design system skill** covering:
     - pages: which layout template, section width and max content width
     - colors: which styles for backgrounds, headings, body, borders and accents, and how often to use the accent
     - typography: which text style for each role from hero heading to button label, and no inline type styles
     - components: which to reuse for buttons, cards and other repeated parts
     - what to keep: spacing, copy tone and anything else the agent must leave as is
   - **Resources the guide links:** a "Best practices for writing skills" article, and a design system demo project to remix.
   - **Add more skills only for repeated buyer tasks**, such as writing CMS content in the template's voice or checking SEO before publishing. One task per skill.
5. **Test with real requests.**
   - Remix the template and use it like a buyer: invoke the skills and ask for pages it lacks (pricing, a new hero, a careers page with a form).
   - Compare the results with the template's original pages.
   - Check that the agent reuses components and applies the styles and layout template.
   - Where results go wrong, add a clearer rule, default or example to the skill, and repeat until common requests come out shippable.
6. **Walkthrough video.** Short, and linked from YouTube in the submission form. Tour the design system page, open a skill and explain what it controls, then show one or two agent requests and their results.
7. **Submit.** Confirm the six checks below, then submit to the Marketplace as an Agent Template.

## Submission checklist

1. Color styles, text styles and components cover the whole template.
2. Every page uses the layout template.
3. The design system page is complete and current.
4. Each skill has a clear name, description and command.
5. The skills were tested with real agent requests.
6. The walkthrough video is recorded.

## Where the Agent Template option lives

The general article "How to submit a template" doesn't mention it. It lives in the Creator Dashboard: open the template, choose Edit Template, then the **Agent** tab. That tab sits next to Details, Description, Media and Post. Seen in the dashboard on November 10, 2026:
- **Agent Template** toggle: "This template is optimized for agents, with a built-in design system, skills and a demo video."
- **Design System:** Yes or No. "This template includes a page that shows its color styles, text styles, components, and example sections in one place."
- **Demo:** a YouTube URL. "A walkthrough video showing how to use your template."
- **Skills:** "List the skills included in your template." Each row has a skill name and a description. New adds a row.

See SKILL.md, "Marketplace Agent form", for how to fill it.
