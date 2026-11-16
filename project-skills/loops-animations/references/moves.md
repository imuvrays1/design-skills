# Moves: the Loops motion vocabulary

Every move on the site, as engine code. `t` is the build API, `T = t.T`. Reuse one of these before inventing a new one; a new move needs a reason the point cannot be made with these. Each lists where it ships, so you can watch it.

Two rules shape all of them. A beat is two keyframes of opacity and/or transform, ending in the element's shipped state (`fill: backwards`). And the CSS sets every element at its END state: the move only describes where it comes from.

Contents: Arrivals · Reading and grading · Progress and status · Figures and charts · Flags and findings · Spatial moves · The point lands · Hero-scale moves

---

## Arrivals

**Rise** (everything that arrives). Fade up from 16px.
```js
t.rise(node, at);              // --travel-sm, rows and labels
t.rise(chip, at, 'travel');    // 28px, a chip or a card
```

**Fade** (a layer, a mark, a light). Opacity only, `--dur-base`, `--ease-standard`.
```js
t.fade(node, at);
t.fade(node, at, T.ENTER);     // a wash, slower
```

**Drop in** (an event onto a grid or calendar; Industry Graphic, week). From above, slightly small.
```js
t.add(ev, [{ opacity: 0, transform: 'translate3d(0,calc(' + t.tok('travel-sm') + ' * -1),0) scale(0.96)' },
           { opacity: 1, transform: 'translate3d(0,0,0)' }], at, T.ENTER, T.EASE);
```

**Slide in from the side** (a card that something just became; Step Stage 1).
```js
t.add(card, [{ opacity: 0, transform: 'translate3d(calc(' + t.tok('travel-sm') + ' * -1),0,0)' },
             { opacity: 1, transform: 'translate3d(0,0,0)' }], at, T.ENTER);
```

## Reading and grading

**Queued, then read** (Industry Cycle; the stage starter). Rows wait dimmed and come up to full as they are reached, so the eye reads in order without anything moving.
```js
t.add(row.querySelector('.nm'), [{ opacity: 0.32 }, { opacity: 1 }], at, T.ENTER, T.STD);
```

**Verdict lands** (Step Stage 2, Industry Cycle). The pill arrives from 8px to its right as its row is reached.
```js
t.add(pill, [{ opacity: 0, transform: 'translate3d(' + t.tok('space-8') + ',0,0)' },
             { opacity: 1, transform: 'translate3d(0,0,0)' }], at, T.BASE, T.STD);
```

**Selection follows** (Step Stage 2). A row-high `--inset` band slides from row to row, then leaves; it stretches by `scaleY` when the rows differ in height. Needs `<span class="sel" aria-hidden="true">` first inside a `position: relative` rows box.
```js
var times = rows.map(function (r, i) { return t0 + i * T.ENTER + T.ENTER - T.BASE; });
t.select(rows, times, end);
```

**Scan line steps** (Step Stage 1). A 2px accent line steps down a page to each line it reads.
```js
var y = lines.map(function (l) { return l.offsetTop + l.offsetHeight / 2 - 1; });
t.add(scan, [{ opacity: 0, transform: 'translate3d(0,' + y[0] + 'px,0)' }, { opacity: 1, transform: 'translate3d(0,' + y[0] + 'px,0)' }], t0 - T.BASE, T.BASE, T.STD, 'both');
lines.forEach(function (l, i) {
  if (i) t.add(scan, [{ opacity: 1, transform: 'translate3d(0,' + y[i - 1] + 'px,0)' }, { opacity: 1, transform: 'translate3d(0,' + y[i] + 'px,0)' }], at(i) - T.ENTER, T.ENTER, T.STD, 'forwards');
});
t.add(scan, [{ opacity: 1, transform: 'translate3d(0,' + y[y.length - 1] + 'px,0)' }, { opacity: 0, transform: 'translate3d(0,' + y[y.length - 1] + 'px,0)' }], lastAt, T.BASE, T.EXIT, 'forwards');
```
CSS: `.scan{position:absolute;left:0;right:0;top:0;height:var(--space-2);background:var(--accent);opacity:0}` (it rests hidden; it exists only while reading).

**Playhead steps** (Step Stage 2). The played part of a waveform and its 2px `--ink` head move to each moment as a fraction `p` of the call. Two masks translated in opposite directions reveal the played copy without animating width.
```js
var tx = function (p) { return 'translateX(' + ((p - 1) * 100) + '%)'; }, ti = function (p) { return 'translateX(' + ((1 - p) * 100) + '%)'; };
t.add(head, [{ transform: tx(p0) }, { transform: tx(p1) }], at, T.ENTER, T.STD, i ? 'forwards' : 'both');
t.add(outer, [{ transform: tx(p0) }, { transform: tx(p1) }], at, T.ENTER, T.STD, i ? 'forwards' : 'both');
t.add(inner, [{ transform: ti(p0) }, { transform: ti(p1) }], at, T.ENTER, T.STD, i ? 'forwards' : 'both');
t.at(at + T.ENTER - T.BASE, function () { time.textContent = '00:18'; });
```

## Progress and status

**Progress line** (every stage, the Industry Cycle). A 1px `--rule` track carrying a 2px accent line that advances in steps, one per item.
```js
t.progress(rows.map(function (r, i) { return [at(i), (i + 1) / rows.length]; }));
```
Markup: `<span class="prog" data-body aria-hidden="true"><i data-prog></i></span>`.

**Busy status** (every stage). The header's status reads "Grading…" until the run ends, then its shipped text.
```js
t.busy(end);   // <span class="stat" data-stat data-busy="Grading">3 of 4 met</span>
```

**Live score** (Industry Cycle). A status that counts what has landed: one `t.at` per verdict.
```js
t.at(at + T.BASE, function () { stat.textContent = 'Grading… ' + (i + 1) + ' of ' + n; });
```

**Ring arcs light** (Window format, Industry Cycle). One arc per beat that lands.
```js
t.seg(i, at);
```

**Milestones light as passed** (Industry Graphic, clock). Each comes up from 0.25 when the playhead reaches its fraction `x` of the run.
```js
t.add(mark, [{ opacity: 0.25 }, { opacity: 1 }], t0 + run * x, T.BASE, T.STD);
```

## Figures and charts

**Figure counts** (Step Stages 3 and 4, the Hero Cycle). Once, over `--slow`, cubic ease out, in step with the move it describes. Tabular numerals keep the width.
```js
t.count(fig, 0.3, 1.9, at, function (v) { return v.toFixed(1) + '%'; });
t.count(fig, 0, 18400, at, function (v) { return '+$' + Math.round(v).toLocaleString('en-US'); });
```

**Bar grows** (charts, the share bars). `scaleX` from the left, never `width`; bars inside one card on `T.TIGHT`.
```js
t.add(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], at + i * T.TIGHT, T.ENTER, T.STD);
```
CSS: `transform-origin: 0 50%` on the bar.

**Point pops** (Step Stage 3). A chart point arrives from 0.4.
```js
t.add(pt, [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'scale(1)' }], at, T.BASE, T.STD);
```
CSS for SVG: `transform-box: fill-box; transform-origin: 50% 50%`.

**Segment grows** (Step Stage 3). A line segment draws from its start; the one that moved takes `--accent` and `T.LAND` on `T.EASE`.
```js
t.add(flat, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], t0, T.ENTER, T.STD);   // origin 0 50%
t.add(jump, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], rise, T.LAND, T.EASE);   // origin 0 100%: grows up and right
```

**Range opens from its estimate** (Step Stage 4, Industry Graphic release compare). An interval opens out from its estimate.
```js
t.fade(est, at);
t.add(band, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], at + T.STEP, T.LAND);
```
CSS: the band's `transform-origin` sits at the estimate (as a percentage of the band).

**Point slides from zero** (Industry Graphic release compare). Each rule's estimate travels out from the zero line to its change.
```js
var dx = (0.5 - x) * track.offsetWidth;   // x: the point's position, 0.5 is zero
t.add(pt, [{ transform: 'translateX(' + dx + 'px)' }, { transform: 'translateX(0)' }], at, T.LAND, T.EASE);
t.add(ci, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], at + T.LAND - T.BASE, T.ENTER, T.EASE);
```

## Flags and findings

**Flagged line: wash and rail** (Industry Cycle, the call chip, the Window starter). The one finding: the row takes its fill, its 2px accent rail draws down from the top.
```js
t.fade(row.querySelector('.hl'), at, T.ENTER);
t.add(row.querySelector('.rail'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], at, T.ENTER);
```
CSS: `.rail{position:absolute;left:0;top:0;bottom:0;width:var(--space-2);background:var(--accent);transform-origin:50% 0}`. The fill is `--inset` in a window's rows, `--accent-wash` on a transcript turn.

**Flag on a timeline** (Step Stage 2). A 2px accent mark appears at the moment it happened.
```js
t.fade(flag, at);   // .flag{left:calc(var(--x) * 100%)} with --x the moment as a fraction
```

**Strike and rewrite** (Hero Cycle, Improve). The old line is struck, the new one rises under it in the accent frame. Draw the strike as a 1px line, not `text-decoration`:
```js
t.add(strike, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], at, T.ENTER, T.STD);   // origin 0 50%
t.rise(newLine, at + T.STEP * 2);
```

## Spatial moves

**Ghost bar flight** (Step Stage 1). Something becomes something else: a bar lifts off its source, flies to its destination and stretches to its width, then the real element takes over. Measure before any first frame is applied (first thing in the build), and make the ghost with `t.temp` so it is removed after.
```js
var box = group.getBoundingClientRect();
var from = src.map(function (s) { var r = s.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top, w: r.width }; });
var to = dst.map(function (d) { var r = d.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top + r.height / 2 - 2, w: r.width }; });
src.forEach(function (s, i) {
  var g = t.temp(document.createElement('i')), f = from[i], d = to[i];
  g.className = 'ghost'; g.setAttribute('aria-hidden', 'true'); g.style.width = f.w + 'px'; g.style.opacity = '0';
  group.appendChild(g);
  var a0 = 'translate3d(' + f.x + 'px,' + f.y + 'px,0) scaleX(1)', a1 = 'translate3d(' + d.x + 'px,' + d.y + 'px,0) scaleX(' + (d.w / f.w) + ')';
  t.add(g, [{ opacity: 0, transform: a0 }, { opacity: 1, transform: a0 }], at(i), T.BASE, T.STD, 'both');
  t.add(g, [{ opacity: 1, transform: a0 }, { opacity: 1, transform: a1 }], at(i) + T.BASE, T.ENTER, T.EASE, 'forwards');
  t.add(g, [{ opacity: 1, transform: a1 }, { opacity: 0, transform: a1 }], at(i) + T.BASE + T.ENTER, T.BASE, T.EXIT, 'forwards');
});
```
CSS: `.ghost{position:absolute;left:0;top:0;height:var(--space-4);background:var(--accent);transform-origin:0 50%;pointer-events:none}`.

**Dots fly home (FLIP)** (Hero Cycle). Many small marks travel together to where they now belong: on a `--step-dot` (30ms) stagger capped at 12, `LAND` on `EASE`. With the engine, give each dot its offset from where it rests and animate the offset away:
```js
dots.forEach(function (d, k) {
  var dx = startX[k] - restX[k], dy = startY[k] - restY[k];   // measured first
  t.add(d, [{ transform: 'translate3d(' + dx + 'px,' + dy + 'px,0)' }, { transform: 'translate3d(0,0,0)' }], at + T.DOT * Math.min(k, 12), T.LAND, T.EASE);
});
```

## The point lands

**Chip arrives, window settles** (every stage). The window, centred until now, slides up to make room; the chip rises into the space; its own detail follows.
```js
t.settle(end);
t.rise(chip, end + T.STEP, 'travel');
t.add(chip.querySelector('.rail'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], end + T.STEP * 3, T.ENTER);
return end + T.STEP * 3 + T.ENTER;
```

**Approval lands** (Step Stage 1). The chip with the approver's initials on an `--ink` square and an accent check: the chip rises; nothing else is needed.

## Hero-scale moves

Only inside a hero surface (ask first):

- **Land**: `opacity 0` and `scale(1.06)` plus a `--travel-sm` rise to rest, `--dur-land` on `--ease-enter`, origin 50% 40%. The figure's clock starts on the land's `finished`.
- **Beam sweep**: a surface veil slides across on `translate3d` with a 1.5px accent edge and a flat `--accent-wash` trail; marks appear as it passes them, each with a one-shot ring (a CSS keyframe, so it never reverses).
- **Collapse**: a field scales on Y from its top to 0.34 while its texture counter-scales by 1/0.34, and everything below rides up on one `translate3d`.
- **The frame takes the state**: a 1px accent layer over the frame's stroke fades in by opacity (none, a third, full) as the story reaches its outcome. Never a `border-color` transition.
- **Screens**: a screen not showing is `visibility: hidden` after its fade, so it is never read aloud or measured.
