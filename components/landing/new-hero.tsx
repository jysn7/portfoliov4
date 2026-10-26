'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/* A desert painted in pixels. Drag the sun (or the moon) to change     */
/* the time of day: night (blue), sunset (#601F1B red), midday (yellow). */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number];
type Phase = 'night' | 'sunset' | 'midday';

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* where each look sits on the sun's path (0 = deep night, 1 = high noon) */
const KEY_SET = 0.3; // sunset: the sun touches the horizon
const KEY_DAY = 0.8; // midday: full yellow
const START = 0.34; // where the page starts
const GRAB = 0.28; // below this you drag the moon, above it the sun

const PHASES: { id: Phase; label: string; fr: number }[] = [
  { id: 'night', label: 'night', fr: 0.03 },
  { id: 'sunset', label: 'sunset', fr: START },
  { id: 'midday', label: 'midday', fr: 0.92 },
];

const NAME = ['Jayson', 'Baloyi'];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------------- palettes: one per state, mixed by the sun's height ---------------- */
type Pal = {
  sky: RGB[]; // top to horizon
  sand: RGB[]; // horizon to foreground
  sun: RGB;
  glow: RGB;
  mesa: RGB;
  clSh: RGB;
  clLit: RGB;
  cactus: RGB;
  far: RGB;
  dark: RGB;
  weed: RGB;
};
const flat = (p: Pal): RGB[] => [
  ...p.sky, // 0-3
  ...p.sand, // 4-7
  p.sun, // 8
  p.glow, // 9
  p.mesa, // 10
  p.clSh, // 11
  p.clLit, // 12
  p.cactus, // 13
  p.far, // 14
  p.dark, // 15
  p.weed, // 16
];

const NIGHT = flat({
  sky: [[6, 10, 32], [12, 22, 62], [26, 46, 100], [58, 88, 148]],
  sand: [[78, 100, 158], [58, 76, 128], [40, 54, 100], [24, 34, 66]],
  sun: [150, 170, 230],
  glow: [70, 110, 200],
  mesa: [22, 32, 70],
  clSh: [16, 26, 62],
  clLit: [70, 96, 164],
  cactus: [12, 22, 40],
  far: [40, 56, 108],
  dark: [8, 12, 26],
  weed: [60, 56, 84],
});
const SUNSET = flat({
  sky: [[40, 14, 24], [96, 31, 27], [178, 62, 38], [238, 118, 58]], // [96,31,27] is #601F1B
  sand: [[182, 76, 46], [138, 52, 38], [100, 36, 32], [62, 24, 26]],
  sun: [255, 122, 56],
  glow: [240, 96, 52],
  mesa: [64, 22, 26],
  clSh: [80, 26, 32],
  clLit: [226, 96, 64],
  cactus: [34, 12, 16],
  far: [150, 56, 40],
  dark: [28, 10, 14],
  weed: [120, 56, 38],
});
const DAY = flat({
  sky: [[246, 196, 84], [250, 214, 116], [252, 228, 150], [255, 240, 190]],
  sand: [[244, 206, 126], [224, 176, 96], [198, 146, 72], [164, 114, 56]],
  sun: [255, 252, 226],
  glow: [255, 246, 200],
  mesa: [196, 128, 66],
  clSh: [238, 206, 136],
  clLit: [255, 252, 236],
  cactus: [72, 94, 46],
  far: [238, 204, 136],
  dark: [90, 52, 30],
  weed: [150, 102, 58],
});

const P: RGB[] = Array.from({ length: 17 }, (): RGB => [0, 0, 0]);
const skyS = P.slice(0, 4);
const sandS = P.slice(4, 8);

const mixPalette = (fr: number) => {
  let a: RGB[];
  let b: RGB[];
  let k: number;
  if (fr <= KEY_SET) {
    a = NIGHT;
    b = SUNSET;
    k = fr / KEY_SET;
  } else {
    a = SUNSET;
    b = DAY;
    k = clamp((fr - KEY_SET) / (KEY_DAY - KEY_SET), 0, 1);
  }
  k = k * k * (3 - 2 * k);
  for (let i = 0; i < P.length; i++) {
    P[i][0] = lerp(a[i][0], b[i][0], k);
    P[i][1] = lerp(a[i][1], b[i][1], k);
    P[i][2] = lerp(a[i][2], b[i][2], k);
  }
};

const PAPER: RGB = [247, 248, 244];
const DEEP: RGB = [52, 16, 14];
const STAR: RGB = [236, 242, 255];
const MOON: RGB = [236, 240, 252];
const LOG: RGB = [64, 38, 24];
const FLAME_Y: RGB = [255, 226, 120];
const FLAME_O: RGB = [255, 146, 50];
const FLAME_R: RGB = [214, 60, 36];
const FIRE_GLOW: RGB = [255, 150, 70];

const LEVELS = 7; // shades per ramp (dithered between)

/* ---------------- sprites ---------------- */
const SAGUARO = [
  '....###....',
  '....###....',
  '....###....',
  '....###..##',
  '....###..##',
  '....###..##',
  '##..###..##',
  '##..###..##',
  '##..#######',
  '##..#######',
  '#######....',
  '#######....',
  '....###....',
  '....###....',
  '....###....',
  '....###....',
  '....###....',
  '....###....',
];
const SMALL = [
  '..###..',
  '..###..',
  '#.###.#',
  '#.###.#',
  '#######',
  '..###..',
  '..###..',
];
const BIRD_UP = ['#...#', '.#.#.', '..#..'];
const BIRD_DN = ['..#..', '.#.#.', '#...#'];
const SPRITES = [SAGUARO, SMALL];

/* far mesas on the horizon (centre, half-width, height as a share of the sky) */
const MESAS = [
  { c: 0.14, w: 0.05, h: 0.1 },
  { c: 0.4, w: 0.055, h: 0.15 },
  { c: 0.5, w: 0.09, h: 0.24 },
  { c: 0.62, w: 0.04, h: 0.13 },
  { c: 0.81, w: 0.085, h: 0.19 },
  { c: 0.94, w: 0.05, h: 0.11 },
];

/* dune ridges, far to near (offsets are shares of the ground height) */
const LAYERS = [
  { base: 0.07, amp: 0.025, f1: 7, p1: 0.6, a2: 0.012, f2: 19, p2: 2.0 },
  { base: 0.24, amp: 0.05, f1: 5, p1: 2.4, a2: 0.02, f2: 13, p2: 0.3 },
  { base: 0.5, amp: 0.07, f1: 4, p1: 4.1, a2: 0.025, f2: 11, p2: 1.7 },
  { base: 0.76, amp: 0.08, f1: 3, p1: 1.0, a2: 0.03, f2: 9, p2: 3.3 },
];

const CACTI = [
  { fx: 0.47, layer: 0, sprite: 1 },
  { fx: 0.57, layer: 1, sprite: 0 },
  { fx: 0.74, layer: 2, sprite: 1 },
  { fx: 0.9, layer: 3, sprite: 0 },
];

/* ---------------- noise ---------------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number) => BAYER[((y & 3) << 2) | (x & 3)];

const NOISE = (() => {
  const t = new Float32Array(256 * 256);
  let s = 4242;
  for (let i = 0; i < t.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    t[i] = s / 4294967296;
  }
  return t;
})();
const nz = (x: number, y: number) => NOISE[((y & 255) << 8) | (x & 255)];
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = nz(xi, yi);
  const b = nz(xi + 1, yi);
  const c = nz(xi, yi + 1);
  const d = nz(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

const ramp = (s: RGB[], t: number, o: number[]) => {
  const p = clamp(t, 0, 1) * (s.length - 1);
  const i = Math.min(Math.floor(p), s.length - 2);
  const f = p - i;
  o[0] = lerp(s[i][0], s[i + 1][0], f);
  o[1] = lerp(s[i][1], s[i + 1][1], f);
  o[2] = lerp(s[i][2], s[i + 1][2], f);
};

const tempAt = (fr: number) =>
  Math.round(fr <= KEY_SET ? lerp(9, 25, fr / KEY_SET) : lerp(25, 41, clamp((fr - KEY_SET) / (KEY_DAY - KEY_SET), 0, 1)));

type Dust = { x: number; y: number; vx: number; vy: number; t0: number; life: number };

const INK: CSSProperties = { color: 'rgb(var(--hero-ink))' };
const INK_SOFT: CSSProperties = { color: 'rgb(var(--hero-ink) / 0.8)' };
const VARS = { '--hero-ink': '247 248 244', '--hero-inv': '52 16 14' } as CSSProperties;

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--hero-ink))]';

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const api = useRef<{ go: (p: Phase) => void }>({ go() {} });

  const [phase, setPhase] = useState<Phase>('sunset');

  /* ---------------- intro: name rises, copy fades in ---------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      if (reduced()) return;
      gsap.from('[data-char]', { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.035, delay: 0.2 });
      gsap.from('[data-in]', { y: 16, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.6 });
      gsap.from('[data-hint]', { autoAlpha: 0, y: 8, duration: 0.9, ease: 'power3.out', delay: 1.6 });
      gsap.from(canvasRef.current, { opacity: 0, duration: 1.4, ease: 'power2.out' });
    }, root);
    return () => ctx.revert();
  }, []);

  /* ---------------- the painting ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const handle = handleRef.current;
    const hint = hintRef.current;
    const root = rootRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !wrap || !handle || !root || !ctx) return;
    const lo = document.createElement('canvas');
    const loCtx = lo.getContext('2d');
    if (!loCtx) return;
    const rm = reduced();

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cell = 6;
    let cols = 0;
    let rows = 0;
    let yh = 0; // horizon row
    let gh = 1; // ground height in rows
    let rs = 6; // sun radius (grid px)
    let yTop = 0;
    let yBelow = 0;
    let s0 = 2; // base sprite scale
    let img: ImageData | null = null;
    let land = new Int16Array(0);
    let R: Float32Array[] = [];
    let S: Float32Array[] = [];
    let stampBuf = new Uint32Array(0);
    let rowBuf = new Uint8ClampedArray(0);
    let frameId = 0;
    let fire = { x: 0, y: 0 };
    let cacti: { x: number; base: number; sc: number; spr: string[] }[] = [];
    let visible = true;
    let clock = 0;
    let prev = 0;
    let touched = false;
    let lastPhase: Phase = 'sunset';
    let lastTemp = -99;
    let lastInk = -1;
    let lastAria = -1;
    let intro: gsap.core.Tween | null = null;

    const sun = { fx: 0.68, fr: rm ? START : 0.1, tfx: 0.68, tfr: rm ? START : 0.1 };
    const dust: Dust[] = [];
    const lastDust = { x: -99, y: -99 };
    const o = [0, 0, 0];

    const setup = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      cell = clamp(Math.round(W / 230), 4, 9);
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      lo.width = cols;
      lo.height = rows;
      img = loCtx.createImageData(cols, rows);
      stampBuf = new Uint32Array(cols * rows);
      rowBuf = new Uint8ClampedArray(cols * 4);
      yh = Math.floor(rows * 0.62);
      gh = rows - yh;
      rs = Math.max(5, rows * 0.07);
      yTop = rs * 1.8;
      yBelow = (yh - KEY_SET * yTop) / (1 - KEY_SET); // puts the horizon exactly at the sunset key
      s0 = Math.max(1, Math.round(rows / 75));

      // mesas
      land = new Int16Array(cols);
      for (let x = 0; x < cols; x++) {
        const u = x / cols;
        let h = 0;
        for (const m of MESAS) {
          const d = Math.abs(u - m.c);
          const sl = 0.018;
          h = Math.max(h, m.h * yh * clamp((m.w + sl - d) / sl, 0, 1));
        }
        if (h > 0) h += nz(x, 3) * 1.2;
        land[x] = yh - Math.max(1, Math.round(h));
      }

      // dunes: ridge height and slope per column
      R = LAYERS.map((L) => {
        const a = new Float32Array(cols);
        for (let x = 0; x < cols; x++) {
          const u = x / cols;
          a[x] = yh + gh * (L.base + L.amp * Math.sin(u * L.f1 + L.p1) + L.a2 * Math.sin(u * L.f2 + L.p2));
        }
        return a;
      });
      S = R.map((a) => {
        const s = new Float32Array(cols);
        for (let x = 0; x < cols; x++) s[x] = (a[Math.min(cols - 1, x + 1)] - a[Math.max(0, x - 1)]) / 2;
        return s;
      });

      // cacti stand on their dune
      const scaleFor = (layer: number) => [Math.max(1, s0 - 1), s0, s0, s0 + 1][layer];
      cacti = CACTI.map((c) => {
        const x = Math.round(c.fx * cols);
        const sc = scaleFor(c.layer);
        return { x, base: Math.round(R[c.layer][x]) + sc + 1, sc, spr: SPRITES[c.sprite] };
      });

      const fx = Math.round(cols * 0.64);
      fire = { x: fx, y: Math.round(R[3][fx]) + s0 * 2 + 2 };

      const hs = Math.max(rs * (W / cols) * 2.6, 56);
      handle.style.width = `${hs}px`;
      handle.style.height = `${hs}px`;
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    /* ---------------- one frame ---------------- */
    const render = (time: number) => {
      if (!img || !cols) return;
      const data = img.data;
      const fr = sun.fr;
      mixPalette(fr);

      const sunx = sun.fx * cols;
      const suny = lerp(yBelow, yTop, fr);
      const h01 = (yh - suny) / (yh - yTop); // 0 at the horizon, 1 at the top, below 0 once set
      const sunLit = smooth(-0.1, 0.16, h01);
      const dayK = smooth(0.5, 0.92, fr);
      const starK = 1 - smooth(0.05, 0.3, fr);
      const moonA = 1 - smooth(0.2, 0.36, fr);
      const moonR = rs * 0.85;
      const moonR2 = moonR * moonR;
      const moonY = lerp(yTop + rs * 0.1, yh - rs * 0.4, smooth(0, 0.42, fr));
      const fireK = 1 - smooth(0.42, 0.8, fr);
      const birdA = smooth(0.2, 0.45, fr);
      const rs2 = rs * rs;
      const glowR2 = rs2 * 16;
      const bandAmt = 0.9 * (1 - dayK * 0.8) * smooth(-0.35, 0.05, h01);
      const lightK = Math.max(sunLit, moonA * 0.3);
      const flick = rm ? 1 : 0.86 + 0.14 * Math.sin(time * 13) * Math.sin(time * 7.3);
      const fireR2 = (rows * 0.28) * (rows * 0.28);

      const sunC = P[8];
      const glowC = P[9];

      const blend = (x: number, y: number, c: RGB, a: number) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows || a <= 0) return;
        const p = (y * cols + x) * 4;
        data[p] += (c[0] - data[p]) * a;
        data[p + 1] += (c[1] - data[p + 1]) * a;
        data[p + 2] += (c[2] - data[p + 2]) * a;
      };
      const setPx = (x: number, y: number, c: RGB) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        const p = (y * cols + x) * 4;
        data[p] = c[0];
        data[p + 1] = c[1];
        data[p + 2] = c[2];
        data[p + 3] = 255;
      };

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b = bay(x, y);
          let r: number;
          let g: number;
          let bl: number;

          if (y < yh) {
            /* ----- sky ----- */
            const ts = y / yh;
            ramp(skyS, Math.floor(ts * LEVELS + b) / LEVELS, o);
            r = o[0];
            g = o[1];
            bl = o[2];

            // stars
            if (starK > 0.02 && ts < 0.82) {
              const h = nz(x * 7 + 3, y * 13 + 5);
              if (h > 0.986) {
                const tw = 0.55 + 0.45 * Math.sin(time * (1.4 + h * 3) + h * 90);
                const a = starK * tw * (1 - ts * 0.55);
                if (a > 0.22) {
                  const k = Math.min(1, a * 1.5);
                  r += (STAR[0] - r) * k;
                  g += (STAR[1] - g) * k;
                  bl += (STAR[2] - bl) * k;
                }
              }
            }

            // thin desert clouds
            if (ts > 0.08 && ts < 0.85) {
              const cn =
                vnoise(x * 0.035 + time * 0.18, y * 0.2 + 3.1) * 0.65 +
                vnoise(x * 0.1 - time * 0.3, y * 0.36 + 9.7) * 0.35;
              const dens = smooth(0.54, 0.78, cn) * smooth(0.08, 0.22, ts) * (1 - smooth(0.62, 0.85, ts));
              const dq = Math.floor(dens * 3 + b) / 3;
              if (dq > 0) {
                const lit = clamp(1 - Math.hypot(x - sunx, (y - suny) * 1.4) / (cols * 0.6), 0, 1);
                const k = dq * 0.75;
                r += (lerp(P[11][0], P[12][0], lit) - r) * k;
                g += (lerp(P[11][1], P[12][1], lit) - g) * k;
                bl += (lerp(P[11][2], P[12][2], lit) - bl) * k;
              }
            }

            // warm band along the horizon
            if (bandAmt > 0.02) {
              const bq = Math.floor(Math.exp(-(yh - y) / (rows * 0.1)) * bandAmt * 4 + b) / 4;
              if (bq > 0) {
                const k = bq * 0.7;
                r += (glowC[0] - r) * k;
                g += (glowC[1] - g) * k;
                bl += (glowC[2] - bl) * k;
              }
            }

            // sun
            const dx = x - sunx;
            const dy = y - suny;
            const d2 = dx * dx + dy * dy;
            if (d2 <= rs2) {
              r = sunC[0];
              g = sunC[1];
              bl = sunC[2];
            } else {
              const gq = Math.floor(Math.exp(-d2 / glowR2) * 5 + b) / 5;
              if (gq > 0) {
                const k = gq * 0.7;
                r += (glowC[0] - r) * k;
                g += (glowC[1] - g) * k;
                bl += (glowC[2] - bl) * k;
              }
            }

            // moon (a crescent)
            if (moonA > 0.02) {
              const mx = x - sunx;
              const my = y - moonY;
              const md2 = mx * mx + my * my;
              if (md2 <= moonR2) {
                const ox = mx + moonR * 0.5;
                const oy = my - moonR * 0.18;
                if (ox * ox + oy * oy > moonR2 * 0.82) {
                  r += (MOON[0] - r) * moonA;
                  g += (MOON[1] - g) * moonA;
                  bl += (MOON[2] - bl) * moonA;
                }
              } else {
                const mq = (Math.floor(Math.exp(-md2 / (moonR2 * 14)) * 4 + b) / 4) * moonA;
                if (mq > 0) {
                  const k = mq * 0.4;
                  r += (glowC[0] - r) * k;
                  g += (glowC[1] - g) * k;
                  bl += (glowC[2] - bl) * k;
                }
              }
            }

            // mesas, layered like rock strata
            if (y >= land[x]) {
              const dep = y - land[x];
              const st = dep > 0 && dep % 6 === 0 ? 0.9 : 1;
              r += (P[10][0] * st - r) * 0.94;
              g += (P[10][1] * st - g) * 0.94;
              bl += (P[10][2] * st - bl) * 0.94;
            }
          } else {
            /* ----- ground: dunes ----- */
            const u = (y - yh) / gh;
            let k = -1;
            for (let j = LAYERS.length - 1; j >= 0; j--) {
              if (y >= R[j][x]) {
                k = j;
                break;
              }
            }
            const tt = clamp(u + (k + 1) * 0.05, 0, 1);
            ramp(sandS, Math.floor(tt * LEVELS + b) / LEVELS, o);
            r = o[0];
            g = o[1];
            bl = o[2];

            // distance haze on the far plain
            if (u < 0.12) {
              const hz = (1 - u / 0.12) * 0.7;
              r += (P[14][0] - r) * hz;
              g += (P[14][1] - g) * hz;
              bl += (P[14][2] - bl) * hz;
            }

            // light and shade: the side of each dune that faces the sun is lit
            if (k >= 0) {
              const sd = clamp((sunx - x) / (cols * 0.35), -1, 1);
              const L = clamp(0.5 + S[k][x] * sd * 2.4, 0, 1);
              const LL = lerp(0.5, L, lightK);
              const f = 0.6 + 0.5 * (Math.floor(LL * 3 + b) / 3);
              r *= f;
              g *= f;
              bl *= f;
              if (y - R[k][x] < 1.2) {
                const rim = lightK * 0.45 * (L > 0.5 ? 1 : 0.35);
                r += (glowC[0] - r) * rim;
                g += (glowC[1] - g) * rim;
                bl += (glowC[2] - bl) * rim;
              }
            }

            // sand speckle
            const sp = nz(x * 3, y * 3);
            if (sp > 0.965) {
              r *= 1.12;
              g *= 1.12;
              bl *= 1.12;
            } else if (sp < 0.03) {
              r *= 0.88;
              g *= 0.88;
              bl *= 0.88;
            }

            // midday mirage on the horizon
            if (dayK > 0.04 && y <= yh + 2 && x > cols * 0.42 && x < cols * 0.72) {
              const m = 0.55 * dayK * (0.5 + 0.5 * Math.sin(x * 0.5 + time * 2));
              r += (196 - r) * m;
              g += (228 - g) * m;
              bl += (236 - bl) * m;
            }

            // campfire light on the sand
            if (fireK > 0.04) {
              const fdx = x - fire.x;
              const fdy = (y - fire.y) * 1.7;
              const fd2 = fdx * fdx + fdy * fdy;
              if (fd2 < fireR2) {
                const q = 1 - fd2 / fireR2;
                const m = q * q * fireK * flick * 0.6;
                r += (FIRE_GLOW[0] - r) * m;
                g += (FIRE_GLOW[1] - g) * m;
                bl += (FIRE_GLOW[2] - bl) * m;
              }
            }
          }

          const p = (y * cols + x) * 4;
          data[p] = r;
          data[p + 1] = g;
          data[p + 2] = bl;
          data[p + 3] = 255;
        }
      }

      /* ----- midday: heat shimmer bends the rows near the horizon ----- */
      if (dayK > 0.08 && !rm) {
        const y0 = Math.max(1, yh - Math.round(rows * 0.08));
        const y1 = Math.min(rows - 1, yh + Math.round(rows * 0.07));
        const span = y1 - y0 + 1;
        for (let y = y0; y <= y1; y++) {
          const edge = 1 - Math.abs(y - (y0 + span / 2)) / (span / 2);
          const w = Math.round(Math.sin(y * 1.4 + time * 3.2) * 1.5 * dayK * edge);
          if (w === 0) continue;
          rowBuf.set(data.subarray(y * cols * 4, (y + 1) * cols * 4));
          for (let x = 0; x < cols; x++) {
            const sx = clamp(x - w, 0, cols - 1);
            const p = (y * cols + x) * 4;
            data[p] = rowBuf[sx * 4];
            data[p + 1] = rowBuf[sx * 4 + 1];
            data[p + 2] = rowBuf[sx * 4 + 2];
          }
        }
      }

      /* ----- cactus shadows: long and toward the viewer at sunset, tiny at noon ----- */
      const shadowAmt = clamp(sunLit + 0.3 * moonA * (1 - sunLit), 0, 1);
      if (shadowAmt > 0.04) {
        frameId++;
        const Lf = lerp(2.6, 0.22, smooth(0, 1, Math.max(0, h01)));
        for (const c of cacti) {
          const spr = c.spr;
          const sh = spr.length;
          const sw = spr[0].length;
          const s = c.sc;
          const dirx = clamp((c.x - sunx) / (cols * 0.5), -1.2, 1.2);
          const vx = dirx * 0.35 * Lf;
          const vy = 0.28 * Lf;
          const bx = c.x - Math.round((sw * s) / 2);
          for (let sy = 0; sy < sh; sy++) {
            for (let sx = 0; sx < sw; sx++) {
              if (spr[sy][sx] !== '#') continue;
              for (let py = 0; py < s; py++) {
                for (let px = 0; px < s; px++) {
                  const hgt = (sh - sy) * s - py;
                  const X = bx + sx * s + px + Math.round(hgt * vx);
                  const Y = c.base + Math.round(hgt * vy);
                  if (X < 0 || X >= cols || Y < yh || Y >= rows) continue;
                  const idx = Y * cols + X;
                  if (stampBuf[idx] === frameId) continue;
                  stampBuf[idx] = frameId;
                  const f = 1 - 0.46 * shadowAmt;
                  data[idx * 4] *= f;
                  data[idx * 4 + 1] *= f;
                  data[idx * 4 + 2] *= f;
                }
              }
            }
          }
        }
      }

      /* ----- cacti, rim-lit on the side facing the sun ----- */
      const cc = P[13];
      for (const c of cacti) {
        const spr = c.spr;
        const sh = spr.length;
        const sw = spr[0].length;
        const s = c.sc;
        const bx = c.x - Math.round((sw * s) / 2);
        const by = c.base - sh * s;
        const side = sunx >= c.x ? 1 : -1;
        for (let sy = 0; sy < sh; sy++) {
          for (let sx = 0; sx < sw; sx++) {
            if (spr[sy][sx] !== '#') continue;
            const edge = spr[sy][sx + side] !== '#';
            const k = edge ? 0.55 * sunLit + 0.12 * moonA : 0;
            const col: RGB = [lerp(cc[0], glowC[0], k), lerp(cc[1], glowC[1], k), lerp(cc[2], glowC[2], k)];
            for (let py = 0; py < s; py++) for (let px = 0; px < s; px++) setPx(bx + sx * s + px, by + sy * s + py, col);
          }
        }
      }

      /* ----- tumbleweed ----- */
      {
        const rad = Math.max(2, s0 + 1);
        const twx = rm ? cols * 0.3 : ((time * 5 + cols * 0.2) % (cols + 24)) - 12;
        const twy = Math.round(yh + gh * 0.58 - (rm ? 0 : Math.abs(Math.sin(time * 3)) * 4));
        const ang = twx * 0.35;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const d2 = dx * dx + dy * dy;
            if (d2 > rad * rad) continue;
            const rx = dx * ca - dy * sa;
            const ry = dx * sa + dy * ca;
            const v = nz(Math.round(rx * 2 + 64), Math.round(ry * 2 + 64));
            const ring = d2 >= (rad - 1) * (rad - 1);
            if ((ring && v > 0.25) || v > 0.78) setPx(Math.round(twx) + dx, twy + dy, P[16]);
          }
        }
      }

      /* ----- birds circle overhead in the light ----- */
      if (birdA > 0.05) {
        const bs = Math.max(1, s0 - 1);
        for (let i = 0; i < 3; i++) {
          const a = time * 0.12 * (i % 2 ? -1 : 1) + i * 2.1;
          const bx = Math.round(cols * (0.58 + 0.05 * i) + Math.cos(a) * cols * 0.1);
          const by = Math.round(yTop * 0.9 + i * rows * 0.05 + Math.sin(a * 1.3) * rows * 0.025);
          const spr = Math.sin(time * 5 + i * 2) > 0 ? BIRD_UP : BIRD_DN;
          for (let sy = 0; sy < spr.length; sy++)
            for (let sx = 0; sx < spr[sy].length; sx++) {
              if (spr[sy][sx] !== '#') continue;
              for (let py = 0; py < bs; py++)
                for (let px = 0; px < bs; px++) blend(bx + sx * bs + px, by + sy * bs + py, P[15], birdA);
            }
        }
      }

      /* ----- night: a shooting star now and then ----- */
      if (starK > 0.5 && !rm) {
        const cyc = time / 6.5;
        const idx = Math.floor(cyc);
        const ph = cyc - idx;
        if (ph < 0.1) {
          const q = ph / 0.1;
          const sx0 = cols * (0.45 + nz(idx, 5) * 0.5);
          const sy0 = yTop * 0.6 + nz(idx, 9) * yh * 0.25;
          const hx = sx0 - q * cols * 0.22;
          const hy = sy0 + q * rows * 0.12;
          for (let i = 0; i < 9; i++)
            blend(Math.round(hx + i * 1.6), Math.round(hy - i * 0.9), STAR, (1 - i / 9) * starK * (1 - q * 0.4));
        }
      }

      /* ----- campfire: logs always, flames and embers fade with the light ----- */
      {
        const fs = s0;
        for (let dx = -3 * fs; dx <= 3 * fs; dx++) {
          for (let py = 0; py < fs; py++) setPx(fire.x + dx, fire.y - py, LOG);
        }
        for (let dx = -2 * fs; dx <= 2 * fs; dx++) {
          for (let py = 0; py < fs; py++) setPx(fire.x + dx, fire.y - fs - py, LOG);
        }
        if (fireK > 0.05) {
          for (let dx = -3 * fs; dx <= 3 * fs; dx++) {
            const u = Math.abs(dx) / (3 * fs);
            const env = 1 - Math.pow(u, 1.5);
            const jit = 0.7 + 0.6 * nz(Math.abs(dx) + 10, rm ? 0 : Math.floor(time * 10));
            const hF = Math.round(env * 7 * fs * fireK * jit);
            for (let h = 0; h < hF; h++) {
              const t = h / Math.max(1, hF);
              setPx(fire.x + dx, fire.y - fs * 2 - h, t < 0.35 ? FLAME_Y : t < 0.7 ? FLAME_O : FLAME_R);
            }
          }
          if (!rm) {
            for (let i = 0; i < 6; i++) {
              const p = (time * 0.5 + i / 6) % 1;
              const ex = fire.x + Math.round(Math.sin(i * 2.7 + p * 7) * 1.5 * fs);
              const ey = fire.y - fs * 6 - Math.round(p * rows * 0.12);
              blend(ex, ey, FLAME_O, (1 - p) * fireK);
            }
          }
        }
      }

      /* ----- dust kicked up by clicks ----- */
      if (dust.length) {
        const dc = P[4];
        const dustC: RGB = [lerp(dc[0], 255, 0.3), lerp(dc[1], 255, 0.3), lerp(dc[2], 255, 0.3)];
        for (const d of dust) {
          const a = 1 - (clock - d.t0) / d.life;
          if (a > 0) blend(Math.round(d.x), Math.round(d.y), dustC, a * 0.9);
        }
      }

      loCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lo, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);

      /* ----- keep the drag handle and hint on the sun (or the moon at night) ----- */
      const c = W / cols;
      const hs = Math.max(rs * c * 2.6, 56);
      const hx = sunx * c;
      const hy = (fr < GRAB ? moonY : suny) * c;
      handle.style.transform = `translate3d(${hx - hs / 2}px, ${hy - hs / 2}px, 0)`;
      if (hint) {
        hint.style.transform = `translate3d(${clamp(hx, 90, W - 90)}px, ${hy + rs * c * 1.3 + 12}px, 0) translateX(-50%)`;
      }

      /* ----- text colour follows the sky behind it ----- */
      ramp(skyS, 0.3, o);
      const lum = (0.2126 * o[0] + 0.7152 * o[1] + 0.0722 * o[2]) / 255;
      const tk = Math.round(smooth(0.4, 0.52, lum) * 16);
      if (tk !== lastInk) {
        lastInk = tk;
        const t = tk / 16;
        const ink = PAPER.map((v, i) => Math.round(lerp(v, DEEP[i], t))).join(' ');
        const inv = DEEP.map((v, i) => Math.round(lerp(v, PAPER[i], t))).join(' ');
        root.style.setProperty('--hero-ink', ink);
        root.style.setProperty('--hero-inv', inv);
      }

      /* ----- state label, temperature, aria ----- */
      const ph: Phase = fr < 0.17 ? 'night' : fr < 0.58 ? 'sunset' : 'midday';
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
        handle.setAttribute('aria-valuetext', ph);
      }
      const temp = tempAt(fr);
      if (temp !== lastTemp && tempRef.current) {
        lastTemp = temp;
        tempRef.current.textContent = `${temp}°c`;
      }
      const aria = Math.round(fr * 100);
      if (aria !== lastAria) {
        lastAria = aria;
        handle.setAttribute('aria-valuenow', String(aria));
      }
    };

    const tick = (time: number) => {
      const dt = Math.min(0.05, time - prev);
      prev = time;
      clock = time;
      if (!visible) return;
      sun.fx += (sun.tfx - sun.fx) * 0.18;
      sun.fr += (sun.tfr - sun.fr) * 0.12;
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        if (clock - d.t0 > d.life) {
          dust.splice(i, 1);
          continue;
        }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 26 * dt;
        d.vx *= 0.985;
      }
      render(rm ? 0 : time);
    };
    gsap.ticker.add(tick);

    // the page opens on a dusk that settles into sunset
    if (!rm) intro = gsap.to(sun, { tfr: START, duration: 2.8, ease: 'power2.inOut', delay: 0.4 });

    /* ---------------- dust on click ---------------- */
    const spawnDust = (x: number, y: number, n: number, pw: number) => {
      for (let i = 0; i < n; i++) {
        dust.push({
          x,
          y,
          vx: (Math.random() - 0.5) * pw * 2,
          vy: -Math.random() * pw * 1.4 - 2,
          t0: clock,
          life: 0.7 + Math.random() * 0.8,
        });
      }
      if (dust.length > 120) dust.splice(0, dust.length - 120);
    };
    const toGrid = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * cols, y: ((e.clientY - r.top) / r.height) * rows };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || rm) return;
      const p = toGrid(e);
      if (p.y < yh) return;
      if (Math.hypot(p.x - lastDust.x, p.y - lastDust.y) > 9) {
        lastDust.x = p.x;
        lastDust.y = p.y;
        spawnDust(p.x, p.y, 3, 9);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (rm) return;
      const p = toGrid(e);
      if (p.y >= yh) spawnDust(p.x, p.y, 22, 20);
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);

    /* ---------------- drag the sun, or the moon at night ---------------- */
    const touch = () => {
      intro?.kill();
      if (touched) return;
      touched = true;
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.5 });
    };

    let drag: { mode: 'sun' | 'moon'; y0: number; fr0: number } | null = null;
    const hDown = (e: PointerEvent) => {
      touch();
      gsap.killTweensOf(sun);
      drag = { mode: sun.fr < GRAB ? 'moon' : 'sun', y0: e.clientY, fr0: sun.fr };
      sun.tfr = sun.fr;
      handle.setPointerCapture(e.pointerId);
    };
    const hMove = (e: PointerEvent) => {
      if (!drag) return;
      const r = wrap.getBoundingClientRect();
      sun.tfx = clamp((e.clientX - r.left) / r.width, 0.04, 0.96);
      const c = W / cols;
      const dy = e.clientY - drag.y0;
      if (drag.mode === 'sun') {
        sun.tfr = clamp(drag.fr0 - dy / ((yBelow - yTop) * c), 0, 1);
      } else {
        const travel = (yh - rs * 0.4 - (yTop + rs * 0.1)) * c; // the moon sinks as the sun comes up
        sun.tfr = clamp(drag.fr0 + (0.42 * dy) / travel, 0, 1);
      }
    };
    const hUp = () => {
      drag = null;
    };
    const hKey = (e: KeyboardEvent) => {
      const step = 0.04;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') sun.tfr = clamp(sun.tfr + step, 0, 1);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') sun.tfr = clamp(sun.tfr - step, 0, 1);
      else return;
      e.preventDefault();
      touch();
    };
    handle.addEventListener('pointerdown', hDown);
    handle.addEventListener('pointermove', hMove);
    handle.addEventListener('pointerup', hUp);
    handle.addEventListener('pointercancel', hUp);
    handle.addEventListener('keydown', hKey);

    /* the three buttons at the bottom glide the sun to a state */
    api.current.go = (p: Phase) => {
      const target = PHASES.find((x) => x.id === p)?.fr ?? START;
      touch();
      gsap.killTweensOf(sun);
      gsap.to(sun, { tfr: target, duration: rm ? 0 : 1.8, ease: 'power2.inOut' });
    };

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(sun);
      ro.disconnect();
      io.disconnect();
      if (hint) gsap.killTweensOf(hint);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      handle.removeEventListener('pointerdown', hDown);
      handle.removeEventListener('pointermove', hMove);
      handle.removeEventListener('pointerup', hUp);
      handle.removeEventListener('pointercancel', hUp);
      handle.removeEventListener('keydown', hKey);
    };
  }, []);

  const pill =
    'h-10 rounded-full border border-[rgb(var(--hero-ink))] px-5 font-pixel text-xs transition-colors duration-200 ' +
    focus;

  return (
    <section
      ref={rootRef}
      aria-label="Introduction"
      className="relative isolate flex min-h-[44rem] w-full flex-col justify-center overflow-hidden bg-[#601F1B] md:min-h-[clamp(40rem,100svh,62rem)]"
      style={VARS}
    >
      {/* The painting: edge to edge */}
      <div ref={wrapRef} className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pixel painting of a desert with mesas, dunes and cacti. Drag the sun to move between night, sunset and midday, or click the sand to kick up dust."
          className="absolute inset-0 h-full w-full cursor-crosshair select-none"
          style={{ touchAction: 'pan-y' }}
        />
      </div>

      {/* Left: name, subtext, call to action */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-360 px-5 pb-28 pt-32 sm:px-8 md:px-14 md:pb-24 md:pt-36">
        <div className="max-w-[36rem]">
          <p data-in className="font-pixel text-xs" style={INK_SOFT}>
            software engineer ·
          </p>

          <h1
    aria-label={`${NAME[0]} ${NAME[1]}`}
    className="mt-6 -mb-[0.1em] overflow-hidden pb-[0.1em] font-display font-soft text-[clamp(2.5rem,10.5vw,7.5rem)] font-normal leading-[0.95] tracking-[-0.055em] whitespace-nowrap"
    style={INK}
  >
    <span aria-hidden className="block">
      {NAME.join(' ')
        .split('')
        .map((ch, i) => (
          <span key={i} data-char className="inline-block">
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
    </span>
  </h1>

          <p data-in className="mt-6 max-w-[38ch] text-sm leading-relaxed md:text-base" style={INK_SOFT}>
            Founder of Monostudios, a web studio in South Africa. Computer science student at Eduvos. I build
            websites that move.
          </p>

          <div data-in className="pointer-events-auto mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/contact"
              className={`group flex items-center gap-5 rounded-lg bg-[rgb(var(--hero-ink))] py-3 px-6 font-pixel text-[rgb(var(--hero-inv))] transition-transform duration-300 active:scale-[0.98] ${focus}`}
            >
              say hello
            </Link>
            <Link
              href="/works"
              className={`font-pixel text-sm underline decoration-current/40 underline-offset-4 transition-colors duration-300 hover:decoration-current ${focus}`}
              style={INK}
            >
              see my work
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: state label and the three states */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-4 px-5 pb-6 sm:px-8 md:px-14 md:pb-8">
          <p className="font-pixel text-xs" style={INK_SOFT} aria-hidden>
            {PHASES.find((p) => p.id === phase)?.label} · <span ref={tempRef}>25°c</span>
          </p>

          <div role="group" aria-label="Time of day" className="pointer-events-auto flex flex-wrap gap-2">
            {PHASES.map((p) => {
              const on = phase === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => api.current.go(p.id)}
                  className={`${pill} ${
                    on
                      ? 'bg-[rgb(var(--hero-ink))] text-[rgb(var(--hero-inv))]'
                      : 'text-[rgb(var(--hero-ink))] hover:bg-[rgb(var(--hero-ink))] hover:text-[rgb(var(--hero-inv))]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drag handle that sits on the sun (the moon at night); also a keyboard slider */}
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label="Time of day. Drag the sun, or use the arrow keys."
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={34}
        aria-valuetext="sunset"
        className="absolute left-0 top-0 z-20 cursor-grab touch-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--hero-ink))] active:cursor-grabbing"
      />

      {/* Hint: follows the sun, disappears once you use it */}
      <p
        ref={hintRef}
        data-hint
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 flex flex-col items-center gap-1 font-display text-sm italic"
        style={INK}
      >
        <ArrowUp size={16} strokeWidth={1.5} />
        drag the sun
      </p>
    </section>
  );
}