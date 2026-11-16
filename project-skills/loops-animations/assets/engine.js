/* LOOPS ENGINE START (skill: loops-animations, assets/engine.js; edit there, not in a copy)

   One clock per figure. Every beat is a Web Animation, or a text change read off
   that same clock, so a pause freezes all of it, a recording can seek to any
   frame, and no beat is skipped or fires twice.

   The figure ships its END state in markup and CSS. That is what shows without
   script, under reduced motion, in print and while off screen. A run rewinds to
   the first frame, plays the build's beats, holds the end for --dur-breathe,
   fades the contents out on --ease-exit, rebuilds and fades back in on the same
   --dur-base beat. The window frame never moves, except to make room for the
   chip (settle).

   The build API matches the Step Stage Loop in site.js (add, rise, fade, at,
   count, busy, progress, select, temp, settle), so a build function ports to
   the site unchanged. Rules for builds: no setTimeout, setInterval,
   requestAnimationFrame or onfinish; use t.at() for anything that is not an
   animation, so pause and recording hold it too. */
(function () {
  var css = getComputedStyle(document.documentElement);
  function tok(n) { return css.getPropertyValue('--' + n).trim(); }
  function ms(n) { return parseFloat(tok(n)) || 0; }
  var T = {
    STEP: ms('step'), TIGHT: ms('step-tight'), DOT: ms('step-dot'),
    FAST: ms('dur-fast'), BASE: ms('dur-base'), ENTER: ms('dur-enter'), LAND: ms('dur-land'),
    SLOW: ms('slow'), HOLD: ms('dur-breathe'),
    EASE: tok('ease-enter'), STD: tok('ease-standard'), EXIT: tok('ease-exit')
  };
  var Y = function (v) { return 'translate3d(0,' + v + 'px,0)'; };
  var params = new URLSearchParams(location.search);
  var RECORD = params.has('record');
  /* ?hold=<ms> lengthens the end hold for review or an export that needs more
     reading time (social); the site always holds for --dur-breathe */
  if (parseFloat(params.get('hold')) > T.HOLD) T.HOLD = parseFloat(params.get('hold'));
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Loop(fig, build) {
    var body = [].slice.call(fig.querySelectorAll('[data-body], [data-chip]'));
    var win = fig.querySelector('[data-main]'), chipEl = fig.querySelector('[data-chip]');
    var stat = fig.querySelector('[data-stat]'), statEnd = stat ? stat.textContent : '';
    var ring = fig.querySelector('[data-toggle]'), segs = [].slice.call(fig.querySelectorAll('[data-seg]'));
    var list = [], beats = [], counts = [], temps = [], counted = [];
    /* every text the markup ships, so a run stopped part way (scrolled off,
       printed) always rests on the finished frame, whatever t.at() changed */
    var texts = [], walk = document.createTreeWalker(fig, NodeFilter.SHOW_TEXT);
    for (var tn; (tn = walk.nextNode());) texts.push([tn, tn.nodeValue]);
    var clock = null, raf = 0, on = false, held = false, runs = 0, total = 0, endT = 0, t0 = 0;

    function now() { return clock && clock.currentTime != null ? clock.currentTime : 0; }
    /* the window starts centred on its own; when the chip arrives it slides up to
       make room, and slides back down as the contents leave */
    function off() {
      return chipEl && win ? Math.max(0, chipEl.offsetHeight - (win.offsetTop + win.offsetHeight - chipEl.offsetTop)) / 2 : 0;
    }

    var api = {
      T: T, tok: tok, fig: fig,
      /* fill 'backwards' holds the first frame through the delay; when the beat
         ends the element is back in its shipped (end) state */
      add: function (node, frames, at, dur, ease, fill) {
        if (!node) return null;
        var a = node.animate(frames, { delay: at, duration: dur, easing: ease || T.EASE, fill: fill || 'backwards' });
        list.push(a);
        if (held) a.pause();
        return a;
      },
      rise: function (node, at, travel) {
        return api.add(node, [
          { opacity: 0, transform: 'translate3d(0,' + tok(travel || 'travel-sm') + ',0)' },
          { opacity: 1, transform: 'translate3d(0,0,0)' }
        ], at, T.ENTER);
      },
      fade: function (node, at, dur) {
        return api.add(node, [{ opacity: 0 }, { opacity: 1 }], at, dur || T.BASE, T.STD);
      },
      /* anything that is not an animation (a status, a timestamp, a class) at
         time t on the clock */
      at: function (t, fn) { beats.push({ t: t, fn: fn, done: false }); },
      /* a figure counting from a to b over --slow, cubic ease out, then exactly
         its shipped text; tabular numerals keep its width */
      count: function (node, a, b, at, fmt) {
        if (!node) return;
        if (node._final == null) node._final = node.textContent;
        counted.push(node);
        counts.push({ node: node, a: a, b: b, at: at, fmt: fmt, last: null });
        node.textContent = fmt(a);
      },
      /* the header's status reads busy ("Grading…") until the run ends */
      busy: function (end) {
        if (!stat) return;
        stat.textContent = (stat.dataset.busy || 'Working') + '…';
        api.at(end, function () { stat.textContent = statEnd; });
      },
      /* the 2px accent progress line, advanced in steps: [[at, fraction], ...] */
      progress: function (marks) {
        var bar = fig.querySelector('[data-prog]');
        if (!bar) return;
        marks.forEach(function (m, i) {
          var from = i ? marks[i - 1][1] : 0;
          api.add(bar, [{ transform: 'scaleX(' + from + ')' }, { transform: 'scaleX(' + m[1] + ')' }], m[0], T.ENTER, T.STD, i ? 'forwards' : 'both');
        });
      },
      /* the selection: a row-high --inset band that slides from row to row
         (and stretches by scaleY when the rows differ in height) */
      select: function (rows, times, endAt) {
        var sel = fig.querySelector('.sel');
        if (!sel || !rows.length) return;
        var h0 = rows[0].offsetHeight;
        var at = rows.map(function (r) { return 'translate3d(0,' + r.offsetTop + 'px,0) scaleY(' + (r.offsetHeight / h0) + ')'; });
        sel.style.height = h0 + 'px';
        sel.style.transformOrigin = '50% 0';
        api.add(sel, [{ opacity: 0, transform: at[0] }, { opacity: 1, transform: at[0] }], times[0], T.BASE, T.STD, 'both');
        times.forEach(function (t, i) {
          if (i) api.add(sel, [{ opacity: 1, transform: at[i - 1] }, { opacity: 1, transform: at[i] }], t, T.BASE, T.STD, 'forwards');
        });
        api.add(sel, [{ opacity: 1, transform: at[at.length - 1] }, { opacity: 0, transform: at[at.length - 1] }], endAt, T.BASE, T.EXIT, 'forwards');
      },
      /* one segment of the ring lights (Window format) */
      seg: function (i, at) { if (segs[i]) api.fade(segs[i], at); },
      /* an element that exists only for the run, removed when it ends */
      temp: function (n) { temps.push(n); return n; },
      /* the window slides up to make room for the chip */
      settle: function (at) {
        var d = off();
        if (!d || !win) return;
        api.add(win, [{ transform: Y(d) }, { transform: Y(0) }], at, T.ENTER, T.EASE);
      }
    };

    function apply(t) {
      for (var i = 0; i < beats.length; i++) {
        var b = beats[i];
        if (!b.done && t >= b.t) { b.done = true; b.fn(); }
      }
      counts.forEach(function (c) {
        var p = Math.max(0, Math.min(1, (t - c.at) / T.SLOW));
        var s = p >= 1 ? c.node._final : c.fmt(c.a + (c.b - c.a) * (1 - Math.pow(1 - p, 3)));
        if (s !== c.last) { c.node.textContent = s; c.last = s; }
      });
    }
    function frame() {
      raf = 0;
      if (!clock) return;
      apply(now());
      if (on) raf = requestAnimationFrame(frame);
    }

    function clear() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      list.forEach(function (a) { a.cancel(); });
      list = []; beats = []; counts = [];
      temps.forEach(function (n) { n.remove(); }); temps = [];
      counted.forEach(function (n) { n.textContent = n._final; }); counted = [];
      if (stat) stat.textContent = statEnd;
      texts.forEach(function (x) { if (x[0].nodeValue !== x[1]) x[0].nodeValue = x[1]; });
      clock = null;
    }

    function run() {
      clear();
      var end = build(api, fig);
      if (typeof end !== 'number') {
        end = list.reduce(function (m, a) { return Math.max(m, a.effect.getComputedTiming().endTime); }, 0);
      }
      /* every run after the first, and every recorded run, fades the contents in
         on the beat they left, so a loop never jumps */
      if (runs > 0 || RECORD) body.forEach(function (n) { if (!n.hasAttribute('data-chip')) api.fade(n, 0); });
      runs++;
      endT = end;
      /* hold the end state for a breath, then the contents leave */
      var outAt = end + T.HOLD, d = off();
      body.forEach(function (n) { api.add(n, [{ opacity: 1 }, { opacity: 0 }], outAt, T.BASE, T.EXIT, 'forwards'); });
      if (d && win) api.add(win, [{ transform: Y(0) }, { transform: Y(d) }], outAt, T.ENTER, T.EASE, 'forwards');
      total = outAt + (d ? T.ENTER : T.BASE);
      beats.sort(function (x, y) { return x.t - y.t; });

      clock = new Animation(new KeyframeEffect(null, null, { duration: total }), document.timeline);
      list.push(clock);
      t0 = performance.now();
      clock.onfinish = function () {
        /* finished early (print, or a tool fast-forwarding every animation):
           rest on the shipped end state instead of looping */
        if (!on || performance.now() - t0 < total - 50) { clear(); return; }
        run();
      };
      if (RECORD) {
        list.forEach(function (a) { a.pause(); a.currentTime = 0; });
        apply(0);
        return;
      }
      clock.play();
      if (held) list.forEach(function (a) { a.pause(); });
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function setHeld(v) {
      held = v;
      fig.classList.toggle('is-held', v);
      if (ring) {
        ring.classList.toggle('is-held', v);
        ring.setAttribute('aria-pressed', String(v));
        ring.setAttribute('aria-label', (v ? 'Play' : 'Pause') + ' the figure');
      }
      list.forEach(function (a) { if (v) a.pause(); else if (a.playState === 'paused') a.play(); });
    }
    if (ring && !REDUCE) {
      ring.hidden = false;
      ring.setAttribute('aria-label', 'Pause the figure');
      ring.addEventListener('click', function () { if (on) setHeld(!held); });
      if (RECORD) [].forEach.call(ring.querySelectorAll('.glyph'), function (g) { g.style.display = 'none'; });
    }

    return {
      fig: fig,
      start: function () { if (on) return; on = true; run(); },
      stop: function () { on = false; clear(); if (held) setHeld(false); },
      toggle: function () { if (on) setHeld(!held); },
      /* recording: build one run, paused at 0; returns its length in ms */
      prepare: function () { on = false; runs = 0; run(); return total; },
      /* recording: move the whole run to time t (forward only, after prepare) */
      seek: function (t) {
        list.forEach(function (a) { a.currentTime = t; });
        apply(t);
      },
      total: function () { return total; },
      /* when the last beat ends; the end state holds from here for --dur-breathe */
      end: function () { return endT; }
    };
  }

  /* builds: { slug: function (t, fig) { ...; return end; } } keyed by data-demo */
  function mount(builds) {
    var loops = new Map();
    [].forEach.call(document.querySelectorAll('[data-demo]'), function (fig) {
      var b = builds[fig.getAttribute('data-demo')];
      if (b) loops.set(fig, Loop(fig, b));
    });
    if (!loops.size || !document.getAnimations || !('IntersectionObserver' in window)) return loops;
    if (REDUCE && !RECORD) return loops;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      if (RECORD) {
        var want = params.get('record'), pick = null;
        loops.forEach(function (l, f) { if (!pick && (!want || f.getAttribute('data-demo') === want)) pick = l; });
        if (!pick) return;
        document.documentElement.classList.add('is-rec');
        window.__loop = pick;
        return;
      }
      var inView = new Set();
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var l = loops.get(e.target);
          if (e.isIntersecting) { inView.add(e.target); if (!document.hidden) l.start(); }
          else { inView.delete(e.target); l.stop(); }
        });
      }, { threshold: 0.3 });
      loops.forEach(function (l, f) { io.observe(f); });
      document.addEventListener('visibilitychange', function () {
        loops.forEach(function (l, f) { if (document.hidden) l.stop(); else if (inView.has(f)) l.start(); });
      });
      window.addEventListener('beforeprint', function () { loops.forEach(function (l) { l.stop(); }); });
    });
    return loops;
  }

  window.LoopsLoop = { mount: mount, Loop: Loop, T: T, tok: tok };
})();
/* LOOPS ENGINE END */
