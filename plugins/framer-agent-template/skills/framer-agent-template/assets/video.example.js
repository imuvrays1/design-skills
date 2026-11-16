// Demo video config: the Simplest Ways video (39.5s). Copy to <work>/video.js and adapt.
// Loaded after raw/manifest.js (window.M, from capture-sections.js) and timing.js (window.T, from voiceover.mjs).
// Times hang off sentence starts (s[i]) and page positions off section names, so a re-timed voiceover
// or a re-captured page keeps the cuts in place. Page positions are 1x page pixels; the nav covers about 90px.
const s = T.sentences.map(x => x.vs);
const files = (tag) => M[tag].sections.map(x => 'raw/' + x.f);
const y = (tag, name, off = 0) => {
  let acc = 0;
  for (const x of M[tag].sections) { if (x.name === name) return acc + off; acc += x.h; }
  throw new Error(`no section "${name}" in ${tag}`);
};

window.V = {
  dur: T.dur,
  theme: {
    font: 'Google Sans Flex', fontUrl: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600&display=block',
    bg: '#F3F2EE',              // Surface/Subtle
    ink: '#1B1C1D', ink2: '#444748', accent: '#0857D0',
    inverse: '#172222', onInverse: '#E1E3E4', accentOnInverse: '#A9C2F5',
  },
  title: { eyebrow: 'Agent Template for Framer', name: 'Simplest Ways', sub: 'A homebuilder template with a design system page and two agent skills.', in: 0.15, out: s[0] + 1.65 },
  window: { in: s[0] + 1.85, pageWidth: 1200, nav: 'raw/tpl_d_00.png' },
  // pages[x].nonav = true hides the nav overlay while that page shows (use it for a canvas design page).
  pages: {
    home:  { files: files('home_d').slice(0, 4), addr: '/' },
    ds:    { files: files('design-system_d').slice(0, 5), addr: '/design-system' },
    about: { files: files('about_d').slice(0, 4), addr: '/about' },
    homes: { files: files('homes_d').slice(0, 5), addr: '/homes' },
  },
  // t0/t1: when the shot is on screen (0.28s dip through white at each change); keys: [time, scroll y]
  shots: [
    { pg: 'home',  t0: s[0] + 1.8,  t1: s[1] + 0.05, keys: [[s[0] + 1.8, 0], [s[0] + 3.1, 0], [s[1] + 0.35, 300]] },
    { pg: 'ds',    t0: s[1] + 0.05, t1: s[1] + 3.55, keys: [[s[1] - 0.25, 0], [s[1] + 1.0, 0], [s[1] + 2.35, y('design-system_d', 'Colors', -76)], [s[1] + 3.85, y('design-system_d', 'Colors', 16)]] },
    { pg: 'ds',    t0: s[1] + 3.55, t1: s[2] - 0.1,  keys: [[s[1] + 3.25, y('design-system_d', 'Typography', -142)], [s[2] + 0.2, y('design-system_d', 'Typography', 18)]] },
    { pg: 'ds',    t0: s[2] - 0.1,  t1: s[2] + 3.1,  keys: [[s[2] - 0.4, y('design-system_d', 'Components', -104)], [s[2] + 3.4, y('design-system_d', 'Components', 224)]] },
    { pg: 'ds',    t0: s[2] + 3.1,  t1: s[3] + 0.37, keys: [[s[2] + 2.8, y('design-system_d', 'Example Sections', -104)], [s[3] + 0.37, y('design-system_d', 'Example Sections', 286)]] },
    { pg: 'about', t0: s[4] - 0.99, t1: s[5] + 0.03, keys: [[s[4] - 0.59, 0], [s[4] + 1.51, 0], [s[5] + 0.33, 470]] },
    { pg: 'homes', t0: s[5] + 0.03, t1: s[6] + 0.66, keys: [[s[5] - 0.27, y('homes_d', 'Available now', -102)], [s[6] + 0.66, y('homes_d', 'Available now', 182)]] },
  ],
  phone: { t0: s[4] - 0.29, t1: s[5] + 0.03, pageWidth: 390, files: files('about_p').slice(0, 4), nav: 'raw/tpl_p_00.png',
           keys: [[s[4] - 0.29, 0], [s[4] + 1.71, 0], [s[5] + 0.28, 400]] },
  skill: {
    t0: s[3] - 0.08, t1: s[4] - 0.39, cmd: '/design-system',
    desc: 'Use whenever you add or change a page, section or element in this template. Keeps new work on the Main Layout template, the existing color and text styles, the existing components and the real spacing values.',
    hi: T.words, // { layout: t, spacing: t, styles: t, tone: t } from voiceover.mjs --words
    sections: [   // real lines from the installed skill, shortened only by cutting whole sentences
      { h: 'Pages', lines: [
        { g: 'layout',  text: 'Every new page uses the layout template "Main Layout". It already holds the Sub Nav and the footer, so never add a nav, menu or footer to a page.' },
        { g: 'spacing', text: 'Content section padding: Desktop 96px 24px, Tablet 80px 24px, Phone 64px 16px.' },
        { g: 'spacing', text: 'Inside each section put one frame named "Container": max width 1156px, gap 48px between the heading and the content.' } ] },
      { h: 'Colors (color styles only, never a hex value)', lines: [
        { g: 'styles', text: 'Text on light surfaces: Colors/Text/Primary for headings and body, Colors/Text/Secondary for intros and supporting lines.' },
        { g: 'styles', text: 'Colors/Accent/Link is the only accent. Use it for text links, eyebrows and small icons, one accent element per view.' } ] },
      { h: 'Typography (text styles only)', lines: [
        { g: 'styles', text: 'Text Styles/Heading 2: section titles. Text Styles/Display: page header titles and CTA titles, set to tag h1.' } ] },
      { h: 'Components (reuse, never rebuild)', lines: [
        { text: 'Button: Primary for the main action on light surfaces, Secondary beside it. At most two buttons side by side.' } ] },
      { h: 'What to keep', lines: [
        { g: 'tone', text: 'Copy tone: calm, plain and specific. Short sentences. Facts over adjectives. No exclamation marks and no hype words.' } ] },
    ],
  },
  captions: [
    [s[0] + 2.5,  s[1] - 0.25, "Simplest Ways: a homebuilder template, ready for Framer's agent"],
    [s[1] + 0.05, s[2] - 0.35, 'The /design-system page shows every color and text style, named by purpose'],
    [s[2] - 0.1,  s[3] - 0.33, 'Every component in each variant, plus example sections'],
    [s[3] + 0.17, s[4] - 0.44, 'The /design-system skill turns that page into rules for the agent'],
    [s[4] - 0.09, s[5] - 0.17, 'Pages reuse the same layout, styles and components'],
    [s[5] + 0.08, s[6] - 0.29, 'The /home-listing skill adds homes to the Homes collection'],
  ],
  // end: the agent panel types `cmd`; optional `desc` is the command-menu line (defaults to skill.desc)
  end: { t0: s[6] + 0.31, eyebrow: 'Agent Template for Framer', name: 'Simplest Ways', cmd: '/design-system',
         line: 'Remix it, then type /design-system in the agent chat to start.' },
};
