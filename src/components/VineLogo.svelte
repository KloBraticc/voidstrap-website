<script>
  import defaults from "../data/vine.js";

  let { config = {} } = $props();

  const merge = (c) => ({
    ...defaults,
    ...c,
    words: c.text ? [c.text] : c.words ?? defaults.words,
    loop: c.text ? (c.loop ?? false) : (c.loop ?? defaults.loop),
    colors: { ...defaults.colors, ...(c.colors ?? {}) },
    timing: { ...defaults.timing, ...(c.timing ?? {}) },
    growth: { ...defaults.growth, ...(c.growth ?? {}) }
  });

  const hash = (f) => {
    const t = Math.sin(f) * 43758.5453;
    return t - Math.floor(t);
  };

  const spring = (f, t = 7, e = 16) => (f <= 0 ? 0 : 1 - Math.exp(-f * t) * Math.cos(f * e));

  const easeOut = (f) => (f <= 0 ? 0 : f >= 1 ? 1 : 1 - Math.pow(1 - f, 3));

  const petals = [
    [0, -0.36, 0.56, 0.54, 0, 0, 0],
    [-0.5, -0.06, 0.6, 0.6, -0.35, 0, 0],
    [0.52, -0.06, 0.6, 0.6, 0.35, 0, 0],
    [-0.42, 0.3, 0.62, 0.48, 0.2, 0.12, 1],
    [0.47, 0.3, 0.62, 0.48, -0.2, 0.12, 1],
    [0.05, 0.42, 0.56, 0.38, 0, 0.14, 0]
  ];

  const petalAngles = Array.from({ length: 26 }, (_, k) => (k / 26) * Math.PI * 2);
  const petalLineAngles = Array.from({ length: 15 }, (_, k) => Math.PI * (1.18 + (0.64 * k) / 14));

  const prng = (f) => {
    let t = f | 0;
    return () => {
      t = (t + 1831565813) | 0;
      let e = Math.imul(t ^ (t >>> 15), 1 | t);
      e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e;
      return ((e ^ (e >>> 14)) >>> 0) / 4294967296;
    };
  };

  const bezier = (f, t, e, s, n) => {
    const i = [];
    for (let a = 0; a <= n; a++) {
      const o = a / n;
      const c = 1 - o;
      i.push([
        c * c * c * f[0] + 3 * c * c * o * t[0] + 3 * c * o * o * e[0] + o * o * o * s[0],
        c * c * c * f[1] + 3 * c * c * o * t[1] + 3 * c * o * o * e[1] + o * o * o * s[1]
      ]);
    }
    return i;
  };

  const sample = (f, t) => {
    const e = f.length;
    const s = Math.min(e - 2, Math.max(1, Math.round(t * (e - 1))));
    return [f[s], Math.atan2(f[s + 1][1] - f[s - 1][1], f[s + 1][0] - f[s - 1][0])];
  };

  const jitter = (f, t, e) =>
    e
      ? [
          (hash(f * 1.37 + t * 7.13) * 2 - 1) * e,
          (hash(f * 2.71 + t * 3.11) * 2 - 1) * e,
          (hash(f * 5.3 + t * 1.7) * 2 - 1) * 0.035
        ]
      : [0, 0, 0];

  const waveStem = (f, t, e, s, n, i, a, o = 40) => {
    const c = [[f[0], f[1]]];
    const l = e / o;
    let h = f[0];
    let r = f[1];
    for (let d = 1; d <= o; d++) {
      const u = d / o;
      const p = t + a * u + s * Math.sin(u * Math.PI * n + i) * Math.min(1, u * 3);
      h += Math.cos(p) * l;
      r += Math.sin(p) * l;
      c.push([h, r]);
    }
    return c;
  };

  const curlTip = (f, t, e) => {
    const s = f.length;
    const n = f[s - 1];
    const i = Math.atan2(n[1] - f[s - 2][1], n[0] - f[s - 2][0]);
    const a = [n[0] - Math.sin(i) * t * e, n[1] + Math.cos(i) * t * e];
    const o = Math.atan2(n[1] - a[1], n[0] - a[0]);
    for (let c = 1; c <= 14; c++) {
      const l = c / 14;
      const h = o + t * l * Math.PI * 1.6;
      const r = e * (1 - 0.5 * l);
      f.push([a[0] + Math.cos(h) * r, a[1] + Math.sin(h) * r]);
    }
    return f;
  };

  const splitLayers = (f, t) => {
    const e = [];
    const s = 1 + Math.floor(f() * 3);
    for (let o = 0; o < s; o++) e.push(0.15 + f() * 0.7);
    e.sort((o, c) => o - c);
    const n = [];
    let i = 0;
    let a = t;
    for (const o of e) {
      if (o <= i) continue;
      n.push({ u0: i, u1: o, layer: a });
      i = f() < 0.3 ? Math.min(0.98, o + 0.02 + f() * 0.03) : o;
      a = 1 - a;
    }
    n.push({ u0: i, u1: 1, layer: a });
    return n;
  };

  const layerAt = (f, t) => {
    for (const e of f) if (t >= e.u0 && t <= e.u1) return e.layer;
    return f[f.length - 1].layer;
  };

  const wordStyle = (f, g) => {
    const t = prng(f * 7 + 13);
    return {
      roseP: g.roseProbBase + t() * g.roseProbRange,
      leafy: g.leafyBase + t() * g.leafyRange,
      dens: 1,
      lean: (t() - 0.5) * g.leanSpread,
      big: g.bigBase + t() * g.bigRange,
      curvy: g.curvyBase + t() * g.curvyRange,
      bridgeP: Math.min(0.95, g.bridgeProbBase + t() * g.bridgeProbRange),
      w: 0.5
    };
  };

  const parseWord = (l) =>
    l.split(/(\[\/?fast\])/).reduce(
      (h, r) => {
        if (r === "[fast]") h.fast = true;
        else if (r === "[/fast]") h.fast = false;
        else for (const d of r) h.out.push({ ch: d, fast: h.fast });
        return h;
      },
      { fast: false, out: [] }
    ).out;

  class VineEngine {
    constructor(cv, cfg) {
      this.cv = cv;
      this.cfg = cfg;
      this.g = cv.getContext("2d");
      this.letters = [];
      this.uid = 1;
      this.cache = {};
      this.W = 0;
      this.H = 0;
      this.dpr = 1;
      this.Sd = 0;
      this.St = 0;
      this.cx = 0;
      this.cy = 0;
      this.ctx_ = 0;
      this.cty = 0;
      this.t0 = performance.now();
      this.lastKey = 0;
      this.lt = 0;
      this.raf = 0;
      this.now = 0;
      this.mx = null;
      this.my = 0;
      this.rx = 0;
      this.ry = 0;
      this.vis = true;
      this.fa = {};
      this.boil = cfg.boil;
      this.drawn = 0;
      this.C = this.colors();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(cv);
      this.ro.observe(cv.parentElement);
      this.io = new IntersectionObserver(([e]) => {
        this.vis = e.isIntersecting;
        this.syncRun();
      });
      this.io.observe(cv);
      window.addEventListener("scroll", this.onScroll, { passive: true });
      document.addEventListener("visibilitychange", this.syncRun);
      if (cfg.interactive) {
        window.addEventListener("pointermove", this.onMove, { passive: true });
        window.addEventListener("pointerdown", this.onMove, { passive: true });
        window.addEventListener("touchstart", this.onTouch, { passive: true });
        window.addEventListener("touchmove", this.onTouch, { passive: true });
        document.addEventListener("pointerleave", this.onLeave);
      }
      document.fonts?.load(`700 100px ${cfg.fontFamily}`).then(() => {
        this.cache = {};
        this.layout();
      }).catch(() => {});
      this.resize();
      this.syncRun();
    }

    loop = () => {
      if (!this.vis || document.hidden) {
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(this.loop);
      const now = performance.now();
      if (now - this.drawn < 30) return;
      this.drawn = now;
      this.frame();
    };

    syncRun = () => {
      if (this.vis && !document.hidden) {
        if (!this.raf) {
          this.lt = performance.now();
          this.raf = requestAnimationFrame(this.loop);
        }
      } else if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    };

    destroy() {
      cancelAnimationFrame(this.raf);
      this.ro.disconnect();
      this.io.disconnect();
      window.removeEventListener("scroll", this.onScroll);
      document.removeEventListener("visibilitychange", this.syncRun);
      window.removeEventListener("pointermove", this.onMove);
      window.removeEventListener("pointerdown", this.onMove);
      window.removeEventListener("touchstart", this.onTouch);
      window.removeEventListener("touchmove", this.onTouch);
      document.removeEventListener("pointerleave", this.onLeave);
    }

    onScroll = () => {
      if (!this.vis) return;
      const e = this.cv.parentElement.getBoundingClientRect();
      this.rx = e.left;
      this.ry = e.top;
    };

    onMove = (t) => {
      if (!this.vis) return;
      this.mx = t.clientX - this.rx;
      this.my = t.clientY - this.ry;
    };

    onTouch = (t) => {
      if (!this.vis) return;
      const touch = t.touches?.[0];
      if (!touch) return;
      this.mx = touch.clientX - this.rx;
      this.my = touch.clientY - this.ry;
    };

    onLeave = () => {
      this.mx = null;
    };

    type(t) {
      const e = performance.now();
      const s = this.live();
      const n = s[s.length - 1];
      this.lastKey = e;
      if (t === " ") {
        if (n && n.ch !== " ") {
          n.cut = e;
          this.genEnd(n, e - n.birth);
        }
        this.letters.push({ ch: " ", id: this.uid++, birth: e, els: [] });
        this.layout();
        return;
      }
      const i = n && n.ch !== " " ? n : null;
      const a = {
        ch: t,
        id: this.uid++,
        birth: e,
        tb: e,
        ws: i ? i.ws : Math.floor(Math.random() * 1e9),
        wi: i ? i.wi + 1 : 0,
        prev: i
      };
      this.gen(a);
      this.letters.push(a);
      this.layout();
    }

    back() {
      const t = performance.now();
      const e = this.live();
      const s = e[e.length - 1];
      this.lastKey = t;
      if (!s) return;
      s.dead = t;
      const n = e[e.length - 2];
      if (n && n.ch !== " ") {
        n.cut = null;
        n.endEls = null;
        n.tb = t;
      }
      this.layout();
    }

    live() {
      return this.letters.filter((t) => !t.dead);
    }

    resize() {
      const t = this.cv.parentElement.getBoundingClientRect();
      const bounds = this.cv.getBoundingClientRect();
      const e = Math.min(2, window.devicePixelRatio || 1);
      this.rx = t.left;
      this.ry = t.top;
      if (t.width) {
        this.W = t.width;
        this.H = t.height;
        this.surfaceWidth = bounds.width;
        this.offset = t.left - bounds.left;
        this.dpr = e;
        this.cv.width = Math.round(bounds.width * e);
        this.cv.height = Math.round(t.height * e);
        this.layout(true);
      }
    }

    mw(t) {
      if (this.cache[t] != null) return this.cache[t];
      this.g.font = `700 100px ${this.cfg.fontFamily}`;
      let e = this.g.measureText(t).width / 100;
      if (t === " ") e *= 1.4;
      return (this.cache[t] = e);
    }

    layout(t = false) {
      if (!this.W) return;
      const e = this.live();
      const s = e.map((r) => this.mw(r.ch));
      let n = e.length;
      while (n > 0 && e[n - 1].ch === " ") n--;
      const i = s.slice(0, n).reduce((r, d) => r + d, 0);
      const a = this.H * this.cfg.fontScale;
      const minS = this.surfaceWidth <= 640 ? 0 : this.H * (this.cfg.minFontScale || 0.16);
      const o = i > 0 ? Math.max(minS, Math.min(a, (this.W * this.cfg.maxWidthRatio) / i)) : a;
      let c = this.W / 2 - (i * o) / 2;
      const l = this.H / 2 + 0.33 * o;
      e.forEach((r, d) => {
        const u = s[d] * o;
        r.tx = c + u / 2;
        r.ty = l;
        r.tw = u;
        c += u;
        if (r.x == null) {
          r.x = r.tx;
          r.y = r.ty;
        }
      });
      const h = e[e.length - 1];
      this.St = o;
      this.ctx_ = h ? h.tx + h.tw / 2 + 0.07 * o : this.W / 2;
      this.cty = h ? h.ty - 0.33 * o : this.H / 2;
      if (t || !this.Sd) {
        this.Sd = o;
        this.cx = this.ctx_;
        this.cy = this.cty;
        e.forEach((r) => {
          r.x = r.tx;
          r.y = r.ty;
        });
      }
    }

    grow(t, e, s, n, i) {
      const a = i.tip || (t() < n.roseP ? "rose" : t() < 0.45 ? "fan" : t() < 0.6 ? "leaf" : "curl");
      let o =
        i.pts ||
        waveStem(
          i.base,
          i.dir,
          i.len,
          (0.35 + t() * 0.45) * n.curvy,
          1 + t() * 1.6,
          t() * 6.28,
          (t() - 0.5) * 1.2,
          40
        );
      if (a === "curl") o = curlTip(o, t() < 0.5 ? -1 : 1, 0.05 + t() * 0.05);
      const c = splitLayers(t, i.layer0 != null ? i.layer0 : t() < 0.5 ? 0 : 1);
      const l = Math.max(320, (i.len || 0.8) * 620);
      const h = [];
      const r = Math.floor(t() * 2.5);
      for (let M = 0; M < r; M++) h.push({ u: 0.15 + t() * 0.65, s: t() < 0.5 ? -1 : 1 });
      e.push({ t: "stem", id: s(), pts: o, segs: c, d0: i.d0, dur: l, w: i.depth ? 0.82 : 1, thorns: h });
      const d = Math.floor(t() * 2.8 * n.leafy);
      let u = t() < 0.5 ? -1 : 1;
      for (let M = 0; M < d; M++) {
        const y = 0.25 + t() * 0.6;
        const [x, v] = sample(o, y);
        u = -u;
        e.push({
          t: "leaf",
          id: s(),
          x: x[0],
          y: x[1],
          a: v + u * (0.55 + t() * 0.5),
          L: (0.14 + t() * 0.2) * (i.depth ? 0.8 : 1),
          bend: (t() - 0.5) * 1.2,
          layer: layerAt(c, y),
          d0: i.d0 + l * y
        });
      }
      const [p, w] = sample(o, 1);
      const g = i.d0 + l * 0.8;
      const m = layerAt(c, 1);
      if (a === "rose") {
        const M = (0.13 + t() * 0.15) * n.big * (i.depth ? 0.75 : 1);
        const x = p[1] > -0.78 && p[1] < 0.05 && Math.abs(p[0]) < n.w * 0.5 ? (t() < 0.22 ? 1 : 0) : t() < 0.6 ? 1 : m;
        e.push({
          t: "rose",
          id: s(),
          x: p[0],
          y: p[1],
          R: M,
          rot: (t() - 0.5) * 1,
          ph1: t() * 6.28,
          ph2: t() * 6.28,
          turns: 1.8 + t() * 1,
          layer: x,
          d0: g
        });
        if (t() < 0.2) {
          const v = w + (t() < 0.5 ? 1 : -1) * 1.3;
          e.push({
            t: "rose",
            id: s(),
            x: p[0] + Math.cos(v) * M * 1.4,
            y: p[1] + Math.sin(v) * M * 1.4,
            R: M * (0.6 + t() * 0.3),
            rot: (t() - 0.5) * 1.2,
            ph1: t() * 6.28,
            ph2: t() * 6.28,
            turns: 1.8 + t(),
            layer: x,
            d0: g + 120
          });
        }
      } else if (a === "fan") {
        const M = 0.6 + t() * 0.3;
        for (let y = 0; y < 2; y++) {
          e.push({
            t: "leaf",
            id: s(),
            x: p[0],
            y: p[1],
            a: w + (y - 0.5) * M,
            L: 0.2 + t() * 0.2,
            bend: (y - 0.5) * 0.8,
            layer: m,
            d0: g + y * 60
          });
        }
      } else if (a === "leaf") {
        e.push({
          t: "leaf",
          id: s(),
          x: p[0],
          y: p[1],
          a: w + (t() - 0.5) * 0.3,
          L: 0.16 + t() * 0.16,
          bend: t() - 0.5,
          layer: m,
          d0: g
        });
      }
      if (!i.depth && t() < 0.3) {
        const M = 0.35 + t() * 0.35;
        const [y, x] = sample(o, M);
        this.grow(t, e, s, n, {
          base: y,
          dir: x + (t() < 0.5 ? -1 : 1) * (0.7 + t() * 0.4),
          len: (i.len || 0.8) * (0.35 + t() * 0.2),
          d0: i.d0 + l * M,
          depth: 1,
          layer0: layerAt(c, M)
        });
      }
      return o;
    }

    gen(t) {
      const e = prng((t.ws ^ Math.imul(t.wi + 1, 2654435761)) + Math.floor(Math.random() * 1e6));
      const s = wordStyle(t.ws, this.cfg.growth);
      const n = [];
      let i = 0;
      const a = () => t.id * 100 + i++;
      const o = this.mw(t.ch);
      const c = () => (e() - 0.5) * o * 0.7;
      s.w = o;
      const l = 1 + (e() < 0.45 ? 1 : 0);
      for (let d = 0; d < l; d++) {
        this.grow(e, n, a, s, {
          base: [c(), -e() * 0.3],
          dir: -Math.PI / 2 + s.lean * 0.5 + (e() - 0.5) * 0.7,
          len: 0.6 + e() * 0.5,
          d0: 40 + d * 130,
          tip: t.wi === 0 && d === 0 ? "rose" : null
        });
      }
      if (e() < 0.4) {
        this.grow(e, n, a, s, {
          base: [c(), -0.1 - e() * 0.35],
          dir: Math.PI / 2 + (e() - 0.5) * 0.8,
          len: 0.35 + e() * 0.35,
          d0: 160
        });
      }
      if (t.prev && e() < s.bridgeP) {
        const d = -(this.mw(t.prev.ch) + o) / 2;
        const u = [c(), -0.05 - e() * 0.55];
        const p = [d + (e() - 0.5) * 0.25, -0.05 - e() * 0.55];
        const w = (e() < 0.55 ? -1 : 1) * (0.4 + e() * 0.4);
        const g = p[0] - u[0];
        let m = bezier(u, [u[0] + g * 0.15, u[1] + w], [p[0] - g * 0.15, p[1] + w * 0.9], p, 40);
        if (e() < 0.45) m = m.slice(0, Math.floor(m.length * (0.7 + e() * 0.2)));
        this.grow(e, n, a, s, {
          pts: m,
          len: Math.abs(g) + Math.abs(w),
          d0: 90,
          tip: e() < 0.5 ? "curl" : e() < 0.5 ? "leaf" : "rose"
        });
      }
      if (t.wi === 0) {
        this.grow(e, n, a, s, {
          base: [-o * 0.3, -0.15 - e() * 0.4],
          dir: Math.PI + (e() - 0.5) * 1.2,
          len: 0.45 + e() * 0.3,
          d0: 120,
          tip: "curl"
        });
      }
      t.els = n;
      t.endEls = null;
      const h = [];
      const r = prng(t.id * 977 + Math.floor(Math.random() * 1e6));
      this.grow(r, h, () => t.id * 100 + 90 + h.length, s, {
        base: [o * 0.25, -0.1 - r() * 0.45],
        dir: (r() - 0.5) * 1.4,
        len: 0.45 + r() * 0.25,
        d0: 0,
        tip: "curl",
        depth: 1
      });
      t.tend = h.filter((d) => d.t === "stem").slice(0, 1);
    }

    genEnd(t, e) {
      const s = prng(t.ws + t.wi * 31 + Math.floor(Math.random() * 1e6));
      const n = wordStyle(t.ws, this.cfg.growth);
      const i = [];
      let a = 50;
      const o = () => t.id * 100 + a++;
      const c = this.mw(t.ch);
      const l = 1 + Math.floor(s() * 2.5);
      n.w = c;
      for (let h = 0; h < l; h++) {
        const r = -Math.PI / 2 + 0.6 + (h - (l - 1) / 2) * 0.9 + (s() - 0.5) * 0.4;
        this.grow(s, i, o, n, {
          base: [(s() - 0.2) * c * 0.6, -s() * 0.5],
          dir: r,
          len: 0.4 + s() * 0.45,
          d0: e + 40 + h * 90,
          depth: 1,
          tip: h === 0 || s() < 0.5 ? "rose" : "fan"
        });
      }
      t.endEls = i;
    }

    path(t, e) {
      const s = this.g;
      const n = t.length;
      if (n < 2) return;
      const i = (a, o) => [(a[0] + o[0]) / 2, (a[1] + o[1]) / 2];
      s.beginPath();
      if (e) {
        const a = i(t[n - 1], t[0]);
        s.moveTo(a[0], a[1]);
        for (let o = 0; o < n; o++) {
          const c = i(t[o], t[(o + 1) % n]);
          s.quadraticCurveTo(t[o][0], t[o][1], c[0], c[1]);
        }
        s.closePath();
      } else {
        s.moveTo(t[0][0], t[0][1]);
        for (let a = 1; a < n - 1; a++) {
          const o = i(t[a], t[a + 1]);
          s.quadraticCurveTo(t[a][0], t[a][1], o[0], o[1]);
        }
        s.lineTo(t[n - 1][0], t[n - 1][1]);
      }
    }

    fill(t, e) {
      this.path(t, true);
      this.g.fillStyle = e;
      this.g.fill();
    }

    stroke(t, e, s) {
      const n = this.g;
      this.path(t, false);
      n.strokeStyle = e;
      n.lineWidth = s;
      n.lineCap = "round";
      n.lineJoin = "round";
      n.stroke();
    }

    strokeRange(t, e, s, n, i) {
      const a = t.length - 1;
      const o = e * a;
      const c = s * a;
      const l = (r) => {
        const d = Math.min(a - 1, Math.floor(r));
        const u = r - d;
        return [t[d][0] + (t[d + 1][0] - t[d][0]) * u, t[d][1] + (t[d + 1][1] - t[d][1]) * u];
      };
      const h = [l(o)];
      for (let r = Math.floor(o) + 1; r < c; r++) h.push(t[r]);
      h.push(l(c));
      if (h.length >= 2) this.stroke(h, n, i);
    }

    thorn(t, e, s, n) {
      const [i, a] = sample(t, e);
      const o = a + s * 2.3;
      const c = n * 0.045;
      this.stroke([i, [i[0] + Math.cos(o) * c, i[1] + Math.sin(o) * c]], this.C.blue, n * 0.022);
    }

    leaf(t, e, s, n, i) {
      if (n < 0.5) return;
      const a = Math.cos(s);
      const o = Math.sin(s);
      const c = -o;
      const l = a;
      const h = (m) => {
        const M = Math.sin(Math.PI * m) * i * 0.15 * n;
        return [t + a * m * n + c * M, e + o * m * n + l * M];
      };
      const r = (m) => n * 0.18 * Math.sin(Math.PI * Math.pow(m, 0.8));
      const d = 12;
      const u = [];
      const p = [];
      for (let m = 0; m <= d; m++) {
        const M = m / d;
        const y = h(M);
        const x = r(M);
        u.push([y[0] + c * x, y[1] + l * x]);
        p.push([y[0] - c * x, y[1] - l * x]);
      }
      const w = h(1);
      const g = h(0);
      this.fill([g, ...u.slice(1, d), w, w, ...p.slice(1, d).reverse(), g], this.C.leaf);
      if (n > 1.5) {
        const m = [];
        for (let M = 0; M <= 8; M++) m.push(h(0.08 + (0.72 * M) / 8));
        this.stroke(m, this.C.vein, Math.max(0.45, n * 0.03));
      }
    }

    rose(t, e, s, n, i, a, o) {
      const c = Math.cos(n);
      const l = Math.sin(n);
      const h = o ? Math.hypot(o[0], o[1]) : 0;
      const r = h ? o[0] / h : 0;
      const d = h ? o[1] / h : 0;
      const u = -0.28 * h;
      const p = (v, S, q = 0) => {
        let b = v * c - S * l;
        let _ = v * l + S * c;
        if (h) {
          const C = (b * r + _ * d) * u;
          b += C * r + o[0] * s * q;
          _ += C * d + o[1] * s * q;
        }
        return [t + b, e + _];
      };
      const w = petals;
      const shapes = i.petals ??= w.map((v, S) => {
        const points = (angles) => angles.map((k) => {
          const T = 1 + 0.08 * Math.sin(3 * k + i.ph1 + S) + 0.04 * Math.sin(5 * k + i.ph2);
          return [Math.cos(k) * v[2] * T, Math.sin(k) * v[3] * T];
        });
        return [points(petalAngles), v[6] ? points(petalLineAngles) : []];
      });
      const g = 0;
      const m = 0.5;
      const M = Math.max(0.45, s * 0.045);
      const y = 85;
      w.forEach((v, S) => {
        const q = spring((a - S * y) / 1e3, 8, 14);
        if (q <= 0.001) return;
        const b = (1 - Math.min(1, q)) * (v[0] < 0 ? 0.5 : -0.5);
        const _ = v[4] + b;
        const C = Math.cos(_);
        const z = Math.sin(_);
        const X = ([Y, D]) => {
          const ft = v[0] + Y * C - D * z;
          const dt = v[1] + Y * z + D * C;
          return p((g + (ft - g) * q) * s, (m + (dt - m) * q) * s, v[5]);
        };
        const J = shapes[S][0].map(X);
        this.fill(J, this.C.red);
        if (v[6] && s >= 1.5 && q > 0.4) {
          const k = shapes[S][1].map(X);
          this.strokeRange(k, 0, Math.min(1, (q - 0.4) / 0.5), this.C.line, M * 0.8);
        }
      });
      const x = easeOut((a - w.length * y - 80) / 520);
      if (x > 0 && s > 1) {
        const v = [];
        const S = [];
        const q = i.turns;
        for (let b = 0; b <= 70; b++) {
          const _ = b / 70;
          const C = i.ph1 + _ * q * Math.PI * 2;
          const z = s * (0.08 + 0.57 * _);
          v.push(p(Math.cos(C) * z * 1.05, Math.sin(C) * z * 0.72 - 0.12 * s, 0.34 - 0.24 * _));
        }
        this.strokeRange(v, 0, x, this.C.line, M);
        if (s >= 1.5) {
          for (let b = 0; b <= 36; b++) {
            const _ = b / 36;
            S.push(p((-0.72 + 1.5 * _) * s, 0.36 * s + 0.16 * s * Math.abs(Math.sin(_ * Math.PI * 3)), 0.18));
          }
          this.strokeRange(S, 0, x, this.C.line, M);
        }
      }
    }

    faceTurn(t, e, s) {
      let n = 0;
      let i = 0;
      if (this.mx != null) {
        const o = this.mx - e;
        const c = this.my - s;
        const l = Math.hypot(o, c);
        const h = 300;
        if (l < h && l > 0.001) {
          const r = 1 - l / h;
          const d = r * r * (3 - 2 * r) * Math.min(1, l / 40);
          n = (o / l) * d;
          i = (c / l) * d;
        }
      }
      const a = this.fa[t.id] || [0, 0];
      a[0] += (n - a[0]) * 0.09;
      a[1] += (i - a[1]) * 0.09;
      return (this.fa[t.id] = a);
    }

    wpt(t, e, s) {
      const n = this.Sd;
      const i = (this.now - t.birth) / 1e3;
      if (i > 0 && i < 2.5) {
        const a = Math.max(0, (t.y - s) / n);
        const o = Math.exp(-i * 3.2);
        const c = t.id % 2 ? 1 : -1;
        e += n * 0.07 * a * o * Math.sin(i * 11) * c;
        s += n * 0.035 * a * o * Math.sin(i * 11 + 1.2);
      }
      if (t.lean) {
        const a = Math.min(2.5, Math.max(0, (t.y - s) / n));
        const o = a * a * 0.5 + a * 0.5;
        e += t.lean[0] * n * 0.1 * o;
        s += t.lean[1] * n * 0.05 * o;
      }
      return [e, s];
    }

    drawStem(t, e, s, n, i, a, o, c) {
      const l = this.Sd;
      const h = c ?? easeOut((s - t.d0) / t.dur) * n;
      if (h <= 0) return;
      if (t.screenTime !== this.now) {
        const r = jitter(t.id, i, a);
        t.screenPoints = t.pts.map((u) => this.wpt(e, e.x + u[0] * l + r[0], e.y + u[1] * l + r[1]));
        t.screenTime = this.now;
      }
      const d = t.screenPoints;
      for (const u of t.segs) {
        if (u.layer !== o) continue;
        const p = Math.min(u.u1, h);
        if (p > u.u0) this.strokeRange(d, u.u0, p, this.C.blue, l * 0.022 * (t.w || 1));
      }
      for (const u of t.thorns) {
        if (h > u.u && layerAt(t.segs, u.u) === o) this.thorn(d, u.u, u.s, l);
      }
    }

    drawEl(t, e, s, n, i, a) {
      const o = this.Sd;
      const c = jitter(t.id, i, a);
      const l = (h, r) => this.wpt(e, e.x + h * o + c[0], e.y + r * o + c[1]);
      if (t.t === "leaf") {
        const h = spring((s - t.d0) / 1e3, 7, 15) * n;
        if (h <= 0) return;
        const r = l(t.x, t.y);
        this.leaf(r[0], r[1], t.a + c[2], t.L * o * h, t.bend);
      } else {
        const h = s - t.d0;
        if (h < 0 || n <= 0.001) return;
        const r = l(t.x, t.y);
        const d = this.faceTurn(t, r[0], r[1]);
        this.rose(r[0], r[1], t.R * o * n, t.rot + c[2] + d[0] * 0.22, t, h, d);
      }
    }

    render(t) {
      const e = this.Sd;
      const s = this.letters;
      const n = this.live();
      this.now = t;
      for (const h of s) {
        let r = 0;
        let d = 0;
        if (!h.dead && h.ch !== " " && this.mx != null) {
          const p = this.mx - h.x;
          const w = this.my - (h.y - e * 0.6);
          const g = Math.hypot(p, w);
          const m = Math.max(260, e * 3.2);
          if (g < m && g > 1) {
            const M = 1 - g / m;
            const y = M * M * (3 - 2 * M);
            r = (p / g) * y;
            d = (w / g) * y;
          }
        }
        const u = h.lean || (h.lean = [0, 0]);
        u[0] += (r - u[0]) * 0.07;
        u[1] += (d - u[1]) * 0.07;
      }
      const i = this.boil ? Math.floor(t / 120) : 0;
      const a = this.boil ? e * 0.01 : 0;
      const fadeDur = this.cfg.timing.fadeDuration;
      const o = (h) => (h.dead ? 1 - easeOut((t - h.dead) / fadeDur) : 1);
      const c = (h) => {
        for (const r of s) {
          if (r.ch === " " || !r.els) continue;
          const d = t - r.birth;
          const u = o(r);
          const p = (m) => {
            if (m.t === "stem") this.drawStem(m, r, d, u, i, a, h);
            else if (m.layer === h) this.drawEl(m, r, d, u, i, a);
          };
          r.els.forEach(p);
          if (r.endEls) r.endEls.forEach(p);
          const w = n.indexOf(r);
          const g = w >= 0 ? n[w + 1] : null;
          if (r.tend && (r.dead || !g || g.ch === " ")) {
            let m = easeOut((t - r.tb - 150) / 450);
            if (r.cut != null) m *= 1 - easeOut((t - r.cut) / 150) * Math.min(0.85, 20 / (0.6 * e));
            for (const M of r.tend) this.drawStem(M, r, d, u, i, a, h, m * u);
          }
        }
      };
      c(0);
      const l = this.g;
      l.font = `700 ${e}px ${this.cfg.fontFamily}`;
      l.textAlign = "center";
      l.textBaseline = "alphabetic";
      l.fillStyle = this.C.text;
      for (const h of s) {
        if (h.ch !== " " && !h.dead) l.fillText(h.ch, h.x, h.y);
      }
      c(1);
    }

    colors() {
      const c = this.cfg.colors;
      return {
        red: c.rose,
        blue: c.stem,
        leaf: c.leaf || "#a77bff",
        line: c.line,
        text: c.text,
        vein: c.vein
      };
    }

    frame() {
      const t = performance.now();
      const e = Math.min(64, t - (this.lt || t));
      this.lt = t;
      const s = 1 - Math.exp(-e / 80);
      this.Sd += (this.St - this.Sd) * s;
      this.cx += (this.ctx_ - this.cx) * s;
      this.cy += (this.cty - this.cy) * s;
      for (const c of this.letters) {
        if (!c.dead && c.tx != null) {
          c.x += (c.tx - c.x) * s;
          c.y += (c.ty - c.y) * s;
        }
      }
      this.letters = this.letters.filter((c) => !(c.dead && t - c.dead > 300));
      const n = this.g;
      n.setTransform(this.dpr, 0, 0, this.dpr, this.offset * this.dpr, 0);
      n.clearRect(-this.offset, 0, this.surfaceWidth, this.H);
      this.render(t);
      const i = this.Sd;
      const a = t - this.lastKey < 500 || Math.floor(t / 530) % 2 === 0;
      const o = easeOut((t - this.t0) / 600);
      if (this.cfg.cursor !== false && a && o > 0) {
        const c = 0.8 * i * o;
        const l = Math.max(2, i * 0.03);
        n.fillStyle = this.C.text;
        n.fillRect(this.cx - l / 2, this.cy - c / 2, l, c);
      }
    }
  }

  let canvasEl = $state();

  $effect(() => {
    if (!canvasEl) return;
    const cfg = merge(config);
    const engine = new VineEngine(canvasEl, cfg);
    let alive = true;
    const wait = async (ms) => {
      await new Promise((r) => setTimeout(r, ms));
      while (alive && (!engine.vis || document.hidden)) {
        await new Promise((r) => setTimeout(r, 200));
      }
    };
    const words = cfg.words;
    const tm = cfg.timing;

    (async () => {
      await wait(tm.initialDelay);
      const gap = Math.min(cfg.minRepeatGap ?? 2, Math.max(0, words.length - 1));
      const recent = [];
      const pickNext = () => {
        const pool = [];
        for (let i = 0; i < words.length; i++) {
          if (!recent.includes(i)) pool.push(i);
        }
        return pool[Math.floor(Math.random() * pool.length)];
      };
      let idx = cfg.startWithFirst ? 0 : Math.floor(Math.random() * words.length);
      while (alive) {
        recent.push(idx);
        if (recent.length > gap) recent.shift();
        const parsed = parseWord(words[idx]);
        for (const { ch, fast } of parsed) {
          if (!alive) return;
          engine.type(ch);
          await wait(fast ? tm.fastMin + Math.random() * tm.fastJitter : tm.typeMin + Math.random() * tm.typeJitter);
        }
        if (!cfg.loop || words.length <= 1) return;
        await wait(tm.holdDelay);
        for (const _ of parsed) {
          if (!alive) return;
          engine.back();
          await wait(tm.backDelay);
        }
        await wait(tm.betweenDelay);
        idx = pickNext();
      }
    })();

    return () => {
      alive = false;
      engine.destroy();
    };
  });
</script>

<canvas bind:this={canvasEl} class="vine-canvas" aria-hidden="true"></canvas>

<style>
  .vine-canvas {
    display: block;
    position: relative;
    left: 50%;
    width: 100vw;
    height: 100%;
    transform: translateX(-50%);
  }
</style>
