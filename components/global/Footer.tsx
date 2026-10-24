'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const navItems = [
  { name: 'Works', href: '/works' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

const socials = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/jayson-baloyi-2a01512b0' },
  { name: 'GitHub', href: 'https://github.com/jysn7' },
  { name: 'Instagram', href: 'https://instagram.com/amant.dur' },
];

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Pixel painting: a harbour at sunrise, after Monet's "Impression, Sunrise".  */
/* Everything is computed per pixel on a small grid and scaled up crisp.        */
/* ------------------------------------------------------------------ */
type RGB = [number, number, number];

const SKY_DAWN: RGB[] = [[34, 46, 74], [72, 86, 122], [150, 126, 140], [238, 152, 112]];
const SKY_DAY: RGB[] = [[66, 112, 170], [108, 154, 206], [168, 198, 228], [228, 228, 214]];
const WATER_DAWN: RGB[] = [[158, 138, 146], [94, 106, 138], [46, 62, 98], [24, 34, 62]];
const WATER_DAY: RGB[] = [[200, 216, 226], [116, 158, 198], [58, 100, 148], [30, 58, 102]];

const SUN_DAWN: RGB = [255, 118, 46];
const SUN_DAY: RGB = [255, 243, 206];
const GLOW_DAWN: RGB = [255, 150, 80];
const GLOW_DAY: RGB = [255, 236, 190];
const CLOUD_SH_DAWN: RGB = [112, 100, 126];
const CLOUD_SH_DAY: RGB = [170, 188, 214];
const CLOUD_LIT_DAWN: RGB = [255, 176, 140];
const CLOUD_LIT_DAY: RGB = [255, 255, 250];
const SHORE_DAWN: RGB = [40, 50, 78];
const SHORE_DAY: RGB = [88, 118, 158];
const BOAT_DAWN: RGB = [20, 26, 44];
const BOAT_DAY: RGB = [40, 52, 80];
const SPLASH: RGB = [236, 242, 248];

const LEVELS = 7; // shades per ramp (dithered between)

const ROWBOAT = [
  '.....##.......',
  '.....##.......',
  '....####......',
  '....####......',
  '##############',
  '.############.',
  '..##########..',
];
const BOATS = [
  { fx: 0.27, dy: 0.2, ph: 0.4, sp: 0.5, big: 0 },
  { fx: 0.72, dy: 0.36, ph: 2.1, sp: 0.35, big: 1 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const pad2 = (n: number) => String(n).padStart(2, '0');

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number) => BAYER[((y & 3) << 2) | (x & 3)];

const NOISE = (() => {
  const t = new Float32Array(256 * 256);
  let s = 1337;
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
const mixStops = (out: RGB[], a: RGB[], b: RGB[], t: number) => {
  for (let i = 0; i < out.length; i++) {
    out[i][0] = lerp(a[i][0], b[i][0], t);
    out[i][1] = lerp(a[i][1], b[i][1], t);
    out[i][2] = lerp(a[i][2], b[i][2], t);
  }
};
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

const PAPER = 'text-[#F7F8F4]';

function LinkItem({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = `group inline-flex items-center gap-1.5 text-sm ${PAPER} underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:decoration-[#F7F8F4]/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7F8F4]`;
  const arrow = (
    <ArrowUpRight
      size={13}
      aria-hidden
      className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
    />
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
      {arrow}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  // Reveal on scroll
  useIsoLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.set('[data-foot]', { opacity: 0, y: 28 });
      ScrollTrigger.batch('[data-foot]', {
        start: 'top 92%',
        once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }),
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  // ---------------------------------------------------------------------------
  // The painting
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const handle = handleRef.current;
    const hint = hintRef.current;
    const footer = footerRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !wrap || !handle || !footer || !ctx) return;
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
    let rs = 6; // sun radius (grid px)
    let img: ImageData | null = null;
    let land = new Int16Array(0);
    let visible = true;
    let clock = 0;
    let touched = false;
    let lastLabel = '';
    let lastAria = -1;

    // sun is stored in fractions so it survives resizes
    const sun = { fx: 0.62, fr: 0.05, tfx: 0.62, tfr: 0.05 };
    if (rm) sun.fr = sun.tfr = 0.34;
    const ripples: { x: number; y: number; t0: number; amp: number }[] = [];
    const lastRip = { x: -99, y: -99 };

    const skyS: RGB[] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const waterS: RGB[] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
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
      yh = Math.floor(rows * 0.6);
      rs = Math.max(5, rows * 0.075);

      // far shore silhouette: low hills plus masts and chimneys
      const k = rows / 120;
      land = new Int16Array(cols);
      for (let x = 0; x < cols; x++) {
        let h = 2 + 2.4 * Math.sin(x * 0.035 + 0.8) + 1.5 * Math.sin(x * 0.09 + 2.1);
        h *= k;
        if (nz(x, 17) > 0.955) h += (4 + nz(x, 29) * 9) * k;
        land[x] = yh - Math.max(1, Math.round(h));
      }

      const hs = Math.max(rs * cell * 2.6, 48);
      handle.style.width = `${hs}px`;
      handle.style.height = `${hs}px`;
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // ---------- frame ----------
    const render = (time: number) => {
      if (!img || !cols) return;
      const data = img.data;
      const fr = sun.fr;
      const day = smooth(0.18, 0.85, fr);
      const yRef = yh + rs * 0.5;
      const yTop = rs * 1.6;
      const sunx = sun.fx * cols;
      const suny = lerp(yRef, yTop, fr);
      const rs2 = rs * rs;
      const glowR2 = rs2 * 16;

      mixStops(skyS, SKY_DAWN, SKY_DAY, day);
      mixStops(waterS, WATER_DAWN, WATER_DAY, day);
      const sunC = mixRGB(SUN_DAWN, SUN_DAY, day);
      const glowC = mixRGB(GLOW_DAWN, GLOW_DAY, day);
      const cloudSh = mixRGB(CLOUD_SH_DAWN, CLOUD_SH_DAY, day);
      const cloudLit = mixRGB(CLOUD_LIT_DAWN, CLOUD_LIT_DAY, day);
      const shoreC = mixRGB(SHORE_DAWN, SHORE_DAY, day);
      const boatC = mixRGB(BOAT_DAWN, BOAT_DAY, day);
      const reflC = mixRGB([255, 140, 60], [255, 240, 200], day);
      const shoreK = 0.82 - day * 0.12;
      const waterRows = rows - yh;
      const sunUp = smooth(0, 0.25, fr);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b = bay(x, y);
          let r: number;
          let g: number;
          let bl: number;

          if (y < yh) {
            // ----- sky -----
            const ts = y / yh;
            ramp(skyS, Math.floor(ts * LEVELS + b) / LEVELS, o);
            r = o[0];
            g = o[1];
            bl = o[2];

            if (ts > 0.06 && ts < 0.86) {
              const cn =
                vnoise(x * 0.05 + time * 0.3, y * 0.16 + 3.1) * 0.65 +
                vnoise(x * 0.12 - time * 0.45, y * 0.32 + 9.7) * 0.35;
              const dens = smooth(0.5, 0.76, cn) * smooth(0.05, 0.2, ts) * (1 - smooth(0.6, 0.86, ts));
              const dq = Math.floor(dens * 3 + b) / 3;
              if (dq > 0) {
                const lit = clamp(1 - Math.hypot(x - sunx, (y - suny) * 1.4) / (cols * 0.55), 0, 1);
                const k = dq * 0.8;
                r += (lerp(cloudSh[0], cloudLit[0], lit) - r) * k;
                g += (lerp(cloudSh[1], cloudLit[1], lit) - g) * k;
                bl += (lerp(cloudSh[2], cloudLit[2], lit) - bl) * k;
              }
            }

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
                const k = gq * 0.75;
                r += (glowC[0] - r) * k;
                g += (glowC[1] - g) * k;
                bl += (glowC[2] - bl) * k;
              }
            }

            if (y >= land[x]) {
              r += (shoreC[0] - r) * shoreK;
              g += (shoreC[1] - g) * shoreK;
              bl += (shoreC[2] - bl) * shoreK;
            }
          } else {
            // ----- water -----
            const u = (y - yh) / waterRows;
            const wv =
              Math.sin(y * 1.15 - time * 1.2 + 2.2 * Math.sin(x * 0.045 + time * 0.35)) * 0.5 +
              Math.sin(x * 0.32 + y * 0.85 + time * 0.8) * 0.5;
            ramp(waterS, Math.floor(clamp(u + wv * 0.05, 0, 1) * LEVELS + b) / LEVELS, o);
            r = o[0];
            g = o[1];
            bl = o[2];

            // sun reflection, broken into dashes
            if (sunUp > 0) {
              const dyw = y - yh;
              const sig = rs * 0.55 + dyw * 0.22;
              const wob = Math.sin(dyw * 0.75 - time * 1.5) * (1 + dyw * 0.05) + Math.sin(dyw * 0.27 + time * 0.8) * 2;
              const ddx = x - sunx - wob;
              let I = Math.exp(-(ddx * ddx) / (sig * sig)) * Math.exp(-dyw / (rows * 0.5)) * sunUp;
              if (I > 0.02) {
                const chop = 0.5 + 0.5 * Math.sin(x * 0.55 + dyw * 1.9 - time * 2 + nz(0, dyw) * 6.28);
                I *= smooth(0.2, 0.75, chop);
                const iq = Math.floor(I * 4 + b) / 4;
                if (iq > 0) {
                  const k = iq * 0.95;
                  r += (reflC[0] - r) * k;
                  g += (reflC[1] - g) * k;
                  bl += (reflC[2] - bl) * k;
                  if (I > 0.12 && nz(x, y + Math.floor(time * 6)) > 0.985) {
                    r = 255;
                    g = 250;
                    bl = 235;
                  }
                }
              }
            }

            // ripples from the pointer
            for (let i = 0; i < ripples.length; i++) {
              const rp = ripples[i];
              const age = time - rp.t0;
              const rad = age * 18;
              const ddx = x - rp.x;
              const ddy = (y - rp.y) * 2.4;
              const dd = Math.sqrt(ddx * ddx + ddy * ddy);
              const off = dd - rad;
              if (off > -4 && off < 4) {
                const wave = Math.exp(-(off * off) / 2.6) * rp.amp * Math.max(0, 1 - age / 2.4);
                const wq = Math.floor(wave * 4 + b) / 4;
                if (wq > 0) {
                  const k = wq * 0.7;
                  r += (SPLASH[0] - r) * k;
                  g += (SPLASH[1] - g) * k;
                  bl += (SPLASH[2] - bl) * k;
                }
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

      // ----- boats (with a soft reflection) -----
      const blend = (x: number, y: number, c: RGB, a: number) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        const p = (y * cols + x) * 4;
        data[p] += (c[0] - data[p]) * a;
        data[p + 1] += (c[1] - data[p + 1]) * a;
        data[p + 2] += (c[2] - data[p + 2]) * a;
      };
      const s0 = Math.max(1, Math.round(rows / 75));
      for (const bt of BOATS) {
        const s = s0 + bt.big;
        const bx = Math.round(bt.fx * cols + Math.sin(time * 0.08 * bt.sp + bt.ph) * 8 - (ROWBOAT[0].length * s) / 2);
        const by = Math.round(yh + rows * bt.dy + Math.sin(time * 1.1 + bt.ph) * 0.8);
        for (let sy = 0; sy < ROWBOAT.length; sy++) {
          for (let sx = 0; sx < ROWBOAT[sy].length; sx++) {
            if (ROWBOAT[sy][sx] !== '#') continue;
            for (let py = 0; py < s; py++) {
              for (let px = 0; px < s; px++) {
                const X = bx + sx * s + px;
                const Y = by + sy * s + py;
                blend(X, Y, boatC, 1);
                const wob = Math.round(Math.sin(Y * 0.9 + time * 2));
                blend(X + wob, by + (ROWBOAT.length * 2 - sy) * s - py + 1, boatC, 0.28);
              }
            }
          }
        }
      }

      loCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lo, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);

      // ----- keep the drag handle and hint on the sun -----
      const c = W / cols;
      const cssX = sunx * c;
      const cssY = suny * c;
      const hs = Math.max(rs * c * 2.6, 48);
      handle.style.transform = `translate3d(${cssX - hs / 2}px, ${cssY - hs / 2}px, 0)`;
      if (hint) {
        hint.style.transform = `translate3d(${clamp(cssX, 80, W - 80)}px, ${cssY + rs * c * 1.3 + 10}px, 0) translateX(-50%)`;
      }
      const aria = Math.round(fr * 100);
      if (aria !== lastAria) {
        lastAria = aria;
        handle.setAttribute('aria-valuenow', String(aria));
      }
      const mins = Math.round(lerp(5.5 * 60, 12 * 60, fr));
      const label = `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
      if (label !== lastLabel && timeRef.current) {
        lastLabel = label;
        timeRef.current.textContent = label;
      }
    };

    const tick = (time: number) => {
      clock = time;
      if (!visible) return;
      sun.fx += (sun.tfx - sun.fx) * 0.2;
      sun.fr += (sun.tfr - sun.fr) * 0.2;
      while (ripples.length && clock - ripples[0].t0 > 2.6) ripples.shift();
      render(rm ? 0 : time);
    };
    gsap.ticker.add(tick);

    // sun rises as the footer scrolls into view, until the visitor takes over
    const st = ScrollTrigger.create({
      trigger: footer,
      start: 'top 95%',
      end: 'top 25%',
      onUpdate: (self) => {
        if (!touched && !rm) sun.tfr = 0.05 + 0.33 * self.progress;
      },
    });

    // ---------- ripples ----------
    const addRipple = (x: number, y: number, amp: number) => {
      ripples.push({ x, y, t0: clock, amp });
      if (ripples.length > 10) ripples.shift();
    };
    const toGrid = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * cols, y: ((e.clientY - r.top) / r.height) * rows };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || rm) return;
      const p = toGrid(e);
      if (p.y < yh) return;
      if (Math.hypot(p.x - lastRip.x, p.y - lastRip.y) > 10) {
        lastRip.x = p.x;
        lastRip.y = p.y;
        addRipple(p.x, p.y, 0.45);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (rm) return;
      const p = toGrid(e);
      if (p.y >= yh) addRipple(p.x, p.y, 1);
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);

    // ---------- drag the sun ----------
    const touch = () => {
      if (touched) return;
      touched = true;
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.5 });
    };
    const fromPointer = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / cell;
      sun.tfx = clamp(px, 0.04, 0.96);
      sun.tfr = clamp((yh + rs * 0.5 - py) / (yh + rs * 0.5 - rs * 1.6), 0, 1);
    };
    let dragging = false;
    const hDown = (e: PointerEvent) => {
      dragging = true;
      touch();
      handle.setPointerCapture(e.pointerId);
      fromPointer(e);
    };
    const hMove = (e: PointerEvent) => dragging && fromPointer(e);
    const hUp = () => (dragging = false);
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

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
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

  const toTop = () => window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });

  return (
    <footer
      ref={footerRef}
      className="relative isolate flex min-h-[46rem] w-full flex-col justify-between overflow-hidden bg-[#1b2740] md:min-h-[clamp(38rem,94svh,60rem)]"
    >
      {/* The painting: edge to edge, no padding */}
      <div ref={wrapRef} className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pixel painting of a harbour at sunrise, after Monet. Drag the sun to change the time of day, or move over the water to make ripples."
          className="absolute inset-0 h-full w-full cursor-crosshair select-none"
          style={{ touchAction: 'pan-y' }}
        />
      </div>

      {/* keep the type readable on any time of day */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-1/2 bg-gradient-to-b from-black/25 to-transparent"
      />

      {/* Top: the call to action */}
      <div className="pointer-events-none relative z-10 px-5 pt-16 sm:px-8 md:px-14 md:pt-24">
        <div data-foot>
          <p className={`font-pixel text-sm ${PAPER}/80`}>web designer &amp; developer</p>
          <Link
            href="/contact"
            className={`group pointer-events-auto mt-4 inline-flex items-end gap-3 font-display font-soft text-[clamp(2.75rem,9vw,8rem)] font-normal leading-[0.9] tracking-[-0.045em] ${PAPER} [text-shadow:0_2px_24px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#F7F8F4]`}
          >
            say hello
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.25}
              className="mb-[0.2em] size-[0.5em] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45"
            />
          </Link>
          <p className={`mt-4 max-w-[34ch] text-sm leading-relaxed ${PAPER}/85`}>
            Have a project in mind? Tell me about it.
          </p>
        </div>
      </div>

      {/* Bottom: links on the water */}
      <div className="relative z-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[140%] bg-gradient-to-t from-[#0b1222]/85 via-[#0b1222]/45 to-transparent"
        />

        <div
          data-foot
          className="relative grid grid-cols-2 gap-x-6 gap-y-8 px-5 pb-10 pt-28 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr] md:px-14"
        >
          <div className="col-span-2 md:col-span-1">
            <h2 className={`font-display font-soft text-[clamp(1.75rem,3.2vw,2.5rem)] font-normal leading-none tracking-[-0.035em] ${PAPER}`}>
              Jayson Baloyi
            </h2>
            <p className={`mt-3 font-pixel text-xs ${PAPER}/70`}>Johannesburg, South Africa</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className={`font-pixel text-xs ${PAPER}/70`}>menu</p>
            <nav className="flex flex-col items-start gap-2.5" aria-label="Footer">
              {navItems.map((item) => (
                <LinkItem key={item.name} href={item.href}>
                  {item.name}
                </LinkItem>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <p className={`font-pixel text-xs ${PAPER}/70`}>connect</p>
            <div className="flex flex-col items-start gap-2.5">
              {socials.map((s) => (
                <LinkItem key={s.name} href={s.href} external>
                  {s.name}
                </LinkItem>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`relative flex flex-col items-start justify-between gap-3 border-t border-white/15 px-5 py-4 font-pixel text-xs ${PAPER}/80 sm:flex-row sm:items-center sm:px-8 md:px-14`}
        >
          <span>© {new Date().getFullYear()} Jayson Baloyi</span>
          <span aria-hidden>
            after Monet, impression, sunrise · <span ref={timeRef}>05:30</span>
          </span>
          <button
            type="button"
            onClick={toTop}
            className={`group inline-flex items-center gap-1.5 ${PAPER} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7F8F4]`}
          >
            back to top
            <ArrowUp size={13} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Drag handle that sits on the sun (also a keyboard slider) */}
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label="Time of day. Drag the sun, or use the arrow keys."
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="absolute left-0 top-0 z-20 cursor-grab touch-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F8F4] active:cursor-grabbing"
      />

      {/* Hint: follows the sun, disappears once you use it */}
      <p
        ref={hintRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 z-20 flex flex-col items-center gap-1 font-display text-sm italic ${PAPER}/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]`}
      >
        <ArrowUp size={16} strokeWidth={1.5} />
        drag the sun
      </p>
    </footer>
  );
}