// Paste into a use_figma call (figma-use) after capture.mjs and generate_figma_design's polls have
// finished. Fill MAP with each figure: [the capture's node id, the card frame it belongs in, the
// figure's stage width and height]. For each, it fixes the fonts (a family Figma lacks, such as the
// studio's "Portal Inter" or "Rifa Poppins", or SF Pro Text, becomes the installed family; a layer
// whose fonts can't be loaded is rebuilt with the same text and styles), sizes the card to the
// figure, moves the capture into it at 0,0, names it, and clears the card's placeholder. It returns
// what it did, and the ids, for the screenshot check that follows.

const MAP = {
  // "pt-example": ["1234:2", "4107:27", 550, 340],
};
const PAGE = "4101:10839";

const page = await figma.getNodeByIdAsync(PAGE);
await figma.setCurrentPageAsync(page);
const families = new Map();
for (const f of await figma.listAvailableFontsAsync()) {
  if (!families.has(f.fontName.family)) families.set(f.fontName.family, new Set());
  families.get(f.fontName.family).add(f.fontName.style);
}
const ok = (fn) => families.get(fn.family)?.has(fn.style);
// The capture tags fonts with variation axes (wght, wdth) that Figma's copy may not take, so a font
// is always set as a plain family and style. Style names differ between families: Inter's "Semi
// Bold" is SF Pro's "Semibold".
const STYLE = { "Semi Bold": "Semibold", "Extra Bold": "Heavy", "Extra Light": "Ultralight", Semibold: "Semi Bold", Heavy: "Extra Bold", Ultralight: "Extra Light" };
function target(fn) {
  let fam = fn.family.replace(/^(Portal|Rifa|Coozy|Reflect|Studio)\s+/i, "");
  // Figma can't lay out SF Pro (a layer in it measures 0 wide and is drawn with a stand-in), so the
  // iPhone's font comes in as Inter, which capture-prep.ts has already matched to SF's widths
  if (/^(SF Pro( Text| Display)?|-apple-system|system-ui|BlinkMacSystemFont|\.SF.*)$/i.test(fam)) fam = "Inter";
  if (!families.has(fam)) fam = "Inter";
  const styles = families.get(fam);
  const style = [fn.style, STYLE[fn.style]].find((x) => x && styles.has(x)) ?? (styles.has("Regular") ? "Regular" : [...styles][0]);
  return { family: fam, style };
}
const clean = (fn) => fn.family === target(fn).family && fn.style === target(fn).style && !fn.variationSettings;
async function fixText(t) {
  const segs = t.getStyledTextSegments(["fontName", "fontSize", "fills", "textDecoration", "letterSpacing", "lineHeight"]);
  if (segs.every((s) => ok(s.fontName) && clean(s.fontName))) return "ok";
  const fonts = segs.map((s) => target(s.fontName));
  for (const f of fonts) await figma.loadFontAsync(f);
  try {
    segs.forEach((s, i) => t.setRangeFontName(s.start, s.end, fonts[i]));
    return "mapped";
  } catch (e) {
    const n = figma.createText();
    n.fontName = fonts[0];
    n.characters = t.characters;
    segs.forEach((s, i) => {
      n.setRangeFontName(s.start, s.end, fonts[i]);
      n.setRangeFontSize(s.start, s.end, s.fontSize);
      n.setRangeFills(s.start, s.end, s.fills);
      n.setRangeTextDecoration(s.start, s.end, s.textDecoration);
      n.setRangeLetterSpacing(s.start, s.end, s.letterSpacing);
      n.setRangeLineHeight(s.start, s.end, s.lineHeight);
    });
    n.textAlignHorizontal = t.textAlignHorizontal;
    n.textAlignVertical = t.textAlignVertical;
    n.textAutoResize = t.textAutoResize;
    if (t.textAutoResize !== "WIDTH_AND_HEIGHT") n.resize(t.width, t.height);
    n.name = t.name;
    n.opacity = t.opacity;
    const parent = t.parent;
    parent.insertChild(parent.children.indexOf(t), n);
    n.x = t.x;
    n.y = t.y;
    if ("layoutPositioning" in t && t.layoutPositioning === "ABSOLUTE") n.layoutPositioning = "ABSOLUTE";
    t.remove();
    return "rebuilt";
  }
}

const SURFACE = { r: 0.957, g: 0.957, b: 0.953 };
const report = {};
const mutatedNodeIds = [];
for (const [id, [capId, cardId, w, h]] of Object.entries(MAP)) {
  const cap = await figma.getNodeByIdAsync(capId);
  const card = await figma.getNodeByIdAsync(cardId);
  if (!cap || !card) { report[id] = "missing node"; continue; }
  const tally = {};
  for (const t of cap.findAllWithCriteria({ types: ["TEXT"] })) {
    const r = await fixText(t);
    tally[r] = (tally[r] || 0) + 1;
  }
  // The page's own widths (capture-prep.ts recordWidths): each one-line text layer gets the
  // letter-spacing that makes it as wide here as it was there, and the marker goes
  const widths = [];
  const ox = cap.absoluteTransform[0][2], oy = cap.absoluteTransform[1][2];
  for (const t of cap.findAllWithCriteria({ types: ["TEXT"] })) {
    if (!t.characters.startsWith("CAPTURE-WIDTHS:")) continue;
    try { widths.push(...JSON.parse(t.characters.slice("CAPTURE-WIDTHS:".length))); } catch (e) {}
    let gone = t;
    while (gone.parent !== cap && gone.parent.children.length === 1) gone = gone.parent;
    gone.remove();
  }
  let matched = 0;
  for (const t of cap.findAllWithCriteria({ types: ["TEXT"] })) {
    const s = t.characters.trim();
    if (!s || t.characters.includes("\n")) continue;
    const x = t.absoluteTransform[0][2] - ox, y = t.absoluteTransform[1][2] - oy;
    let best = null, bd = Infinity;
    for (const e of widths) {
      if (e.t !== s) continue;
      const d = Math.abs(e.x - x) + Math.abs(e.y - y) / 3;
      if (d < bd) { bd = d; best = e; }
    }
    if (!best || bd > 8) continue;
    const diff = best.w - t.width;
    if (Math.abs(diff) < 0.6) continue;
    const n = t.characters.length;
    const ls = t.getRangeLetterSpacing(0, n);
    const size = t.getRangeFontSize(0, n);
    if (ls === figma.mixed || size === figma.mixed) continue;
    for (const f of t.getRangeAllFontNames(0, n)) await figma.loadFontAsync({ family: f.family, style: f.style });
    const current = ls.unit === "PIXELS" ? ls.value : (ls.value * size) / 100;
    t.setRangeLetterSpacing(0, n, { unit: "PIXELS", value: current + diff / n });
    matched++;
  }
  tally.widthsMatched = matched;
  // The capture keeps a phone's outer corner but loses its screen's clip shape (a CSS clip-path),
  // so the screen's square corners poke past the bezel: round each screen to the bezel, less its inset
  let screens = 0;
  for (const o of cap.findAll((n) => n.type === "FRAME" && typeof n.cornerRadius === "number" && n.cornerRadius >= 30 && n.width >= 150)) {
    for (const s of o.findAll((n) => n.type === "FRAME" && n.clipsContent && n.cornerRadius === 0 && n.width >= o.width * 0.85 && n.width < o.width && n.height > n.width)) {
      const inset = s.absoluteTransform[0][2] - o.absoluteTransform[0][2];
      if (inset <= 0 || inset > 30) continue;
      s.cornerRadius = o.cornerRadius - inset;
      s.cornerSmoothing = 0.6;
      screens++;
    }
  }
  tally.phoneScreensRounded = screens;
  // An earlier capture of the same figure, if any, goes: the card holds one
  for (const old of card.children.filter((c) => c.name.endsWith("(editable layers)"))) old.remove();
  if (Math.round(card.width) !== w || Math.round(card.height) !== h) card.resize(w, h);
  card.appendChild(cap);
  cap.x = 0;
  cap.y = 0;
  cap.name = `${id} (editable layers)`;
  card.placeholder = false;
  card.fills = [{ type: "SOLID", color: SURFACE }];
  mutatedNodeIds.push(cap.id, card.id);
  const missing = new Set();
  for (const t of cap.findAllWithCriteria({ types: ["TEXT"] })) for (const s of t.getStyledTextSegments(["fontName"])) if (!ok(s.fontName)) missing.add(`${s.fontName.family}/${s.fontName.style}`);
  report[id] = { tally, size: [Math.round(cap.width), Math.round(cap.height)], card: [Math.round(card.width), Math.round(card.height)], images: cap.findAll((n) => Array.isArray(n.fills) && n.fills.some((f) => f.type === "IMAGE")).length, missing: [...missing] };
}
return { mutatedNodeIds, report };
