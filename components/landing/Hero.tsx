'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const COLS = 60;
const ROWS = 32; // ~1.875 ratio: at 68rem wide the canvas is ~36rem tall, same as your original height
const ERASER = -1;
const MAX_HISTORY = 60;
const NAME = 'Jayson Baloyi';

// 0 and 1 follow your theme tokens, the rest are fixed accents (unchanged)
const SWATCHES = [
  { name: 'amber', css: 'var(--primary)' },
  { name: 'ink', css: 'var(--foreground)' },
  { name: 'sky', css: '#8FB8FF' },
  { name: 'rose', css: '#FF8FA3' },
  { name: 'mint', css: '#7ED492' },
] as const;

const GRID_LINES =
  'linear-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)';

const GRID_FADE = 'linear-gradient(to bottom, #000 45%, transparent 100%)';

type Tool = 'pencil' | 'eraser' | 'fill' | 'picker';
type Settings = { tool: Tool; color: number; size: number; mirror: boolean };
type Actions = { undo: () => void; redo: () => void; clear: () => void; reset: () => void; save: () => void };

/* ------------------------------------------------------------------ */
/* Icons (24px stroke set, inlined so there's no extra dependency)      */
/* ------------------------------------------------------------------ */
const ICONS = {
  pencil: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z'],
  eraser: [
    'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21',
    'M22 21H7',
    'm5 11 9 9',
  ],
  fill: [
    'm19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z',
    'm5 2 5 5',
    'M2 13h15',
    'M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z',
  ],
  picker: [
    'm2 22 1-1h3l9-9',
    'M3 21v-3l9-9',
    'm15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z',
  ],
  mirror: [
    'M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3',
    'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3',
    'M12 20v2',
    'M12 14v2',
    'M12 8v2',
    'M12 2v2',
  ],
  undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'],
  redo: ['M21 7v6h-6', 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13'],
  save: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  clear: [
    'M3 6h18',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  ],
  reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
} as const;
type IconName = keyof typeof ICONS;

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const TOOLS: { id: Tool; label: string; key: string; icon: IconName }[] = [
  { id: 'pencil', label: 'Pencil', key: 'B', icon: 'pencil' },
  { id: 'eraser', label: 'Eraser', key: 'E', icon: 'eraser' },
  { id: 'fill', label: 'Fill', key: 'F', icon: 'fill' },
  { id: 'picker', label: 'Pick colour', key: 'I', icon: 'picker' },
];

const SIZES = [
  { n: 1, dot: 'size-1' },
  { n: 2, dot: 'size-2' },
  { n: 3, dot: 'size-3' },
] as const;

/* ------------------------------------------------------------------ */
/* Starting picture: a simple sunset over hills.                        */
/* Every cell is painted, so the picture fills the whole canvas.        */
/* ------------------------------------------------------------------ */
function buildScene(): Int8Array {
  const g = new Int8Array(COLS * ROWS).fill(2); // sky everywhere
  const set = (c: number, r: number, v: number) => {
    c = Math.round(c);
    r = Math.round(r);
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) g[r * COLS + c] = v;
  };
  const bayer = [
    [0, 2],
    [3, 1],
  ];
  const checker = (c: number, r: number) => (c + r) % 2 === 0;
  const backTop = (c: number) => 21 + 1.6 * Math.sin(c * 0.2 + 3);
  const frontTop = (c: number) => 24.5 + 2 * Math.sin(c * 0.13 + 0.9);

  // sunset glow: rose dithers in from the sky, then goes solid at the horizon
  for (let r = 0; r < ROWS; r++) {
    const t = Math.min(Math.max((r - 11) / 8, 0), 1);
    for (let c = 0; c < COLS; c++) if (bayer[r % 2][c % 2] < t * 4) set(c, r, 3);
  }

  // sun
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) if ((c - 43) ** 2 + (r - 19) ** 2 <= 42) set(c, r, 0);

  // gulls
  for (const [c, r] of [
    [13, 6],
    [19, 4],
    [24, 8],
  ]) {
    set(c, r, 1);
    set(c + 1, r + 1, 1);
    set(c + 2, r, 1);
  }

  // distant hill (dithered), then the near hill
  for (let c = 0; c < COLS; c++)
    for (let r = Math.round(backTop(c)); r < ROWS; r++) if (checker(c, r)) set(c, r, 4);
  for (let c = 0; c < COLS; c++)
    for (let r = Math.round(frontTop(c)); r < ROWS; r++) set(c, r, 4);

  return g;
}

const SCENE = buildScene();

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const pad = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const settings = useRef<Settings>({ tool: 'pencil', color: 0, size: 1, mirror: false });
  const actions = useRef<Actions>({ undo() {}, redo() {}, clear() {}, reset() {}, save() {} });

  const [ui, setUi] = useState<Settings>(settings.current);
  const [hist, setHist] = useState({ undo: 0, redo: 0 });

  const update = useCallback((patch: Partial<Settings>) => {
    settings.current = { ...settings.current, ...patch };
    setUi(settings.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx2d = canvas?.getContext('2d');
    if (!root || !canvas || !wrap || !ctx2d) return;
    const ctx = ctx2d;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasRound = typeof ctx.roundRect === 'function';

    // ---------- state ----------
    const cells = SCENE.slice();
    const lift = new Float32Array(COLS * ROWS); // smoothed per-cell bump
    const tgt = { x: -99, y: -99 };
    const ptr = { x: -99, y: -99, on: false };
    const hover = { c: -1, r: -1 };
    const reveal = { r: reduced ? 80 : 0 };
    const scan = { x: -6 };
    const ripples: { c: number; r: number; t: number }[] = [];
    let down = false;
    let last: { c: number; r: number } | null = null;
    let visible = true;
    let inside = false;

    // ---------- history ----------
    const undoStack: Int8Array[] = [];
    const redoStack: Int8Array[] = [];
    let needSnap = false;
    let wipeTween: gsap.core.Tween | null = null;

    const syncHist = () => setHist({ undo: undoStack.length, redo: redoStack.length });
    const snapshot = () => {
      undoStack.push(cells.slice());
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0;
      syncHist();
    };

    // ---------- colours (follow the theme) ----------
    let colors: string[] = [];
    let dotColor = '#71717a';
    let inkColor = '#888';
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const tok = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
      colors = SWATCHES.map((s) =>
        s.css.startsWith('var(') ? tok(s.css.slice(4, -1), '#ffb800') : s.css
      );
      dotColor = tok('--muted-foreground', '#71717a');
      inkColor = tok('--foreground', '#888');
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ---------- sizing ----------
    let W = 0;
    let H = 0;
    let cell = 0;
    let dpr = 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cell = W / COLS;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // ---------- drawing primitives ----------
    const fillBox = (x: number, y: number, w: number, h: number, r: number) => {
      if (hasRound) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
      } else ctx.fillRect(x, y, w, h);
    };
    const strokeBox = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      if (hasRound) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
      ctx.stroke();
    };

    // ---------- editing ----------
    const updateCount = () => {
      let n = 0;
      for (const v of cells) if (v >= 0) n++;
      if (countRef.current) countRef.current.textContent = `${n} px`;
    };
    updateCount();

    /** every write goes through here so history + bounce stay consistent */
    const write = (i: number, v: number, bump = 0.9) => {
      if (cells[i] === v) return false;
      if (needSnap) {
        snapshot();
        needSnap = false;
      }
      cells[i] = v;
      lift[i] += bump;
      return true;
    };

    const stamp = (c: number, r: number) => {
      const s = settings.current;
      const v = s.tool === 'eraser' ? ERASER : s.color;
      const lo = -Math.floor(s.size / 2);
      for (let dr = lo; dr < lo + s.size; dr++) {
        for (let dc = lo; dc < lo + s.size; dc++) {
          const cc = c + dc;
          const rr = r + dr;
          if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS) continue;
          write(rr * COLS + cc, v);
          if (s.mirror) write(rr * COLS + (COLS - 1 - cc), v);
        }
      }
    };

    const paintLine = (c: number, r: number) => {
      if (last) {
        const n = Math.max(Math.abs(c - last.c), Math.abs(r - last.r));
        for (let k = 1; k <= n; k++) {
          stamp(Math.round(last.c + ((c - last.c) * k) / n), Math.round(last.r + ((r - last.r) * k) / n));
        }
      } else stamp(c, r);
      last = { c, r };
      updateCount();
    };

    const floodFill = (c: number, r: number) => {
      const target = settings.current.color;
      const from = cells[r * COLS + c];
      if (from === target) return;
      const seen = new Uint8Array(COLS * ROWS);
      const stack = [r * COLS + c];
      while (stack.length) {
        const i = stack.pop()!;
        if (seen[i] || cells[i] !== from) continue;
        seen[i] = 1;
        write(i, target, 0.5);
        const x = i % COLS;
        const y = (i / COLS) | 0;
        if (x > 0) stack.push(i - 1);
        if (x < COLS - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - COLS);
        if (y < ROWS - 1) stack.push(i + COLS);
      }
      updateCount();
    };

    /** left-to-right wipe to blank (clear) or back to the starting scene (reset) */
    const applyWipe = (upTo: number, target: Int8Array | null) => {
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c <= upTo && c < COLS; c++) {
          const i = r * COLS + c;
          write(i, target ? target[i] : ERASER, 0.6);
        }
      updateCount();
    };
    const wipe = (target: Int8Array | null) => {
      wipeTween?.kill();
      needSnap = true;
      if (reduced) return applyWipe(COLS, target);
      const w = { x: -1 };
      wipeTween = gsap.to(w, {
        x: COLS,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => applyWipe(w.x, target),
      });
    };

    const restore = (from: Int8Array[], to: Int8Array[]) => {
      const prev = from.pop();
      if (!prev) return;
      wipeTween?.kill();
      needSnap = false;
      to.push(cells.slice());
      for (let i = 0; i < cells.length; i++) if (cells[i] !== prev[i]) lift[i] += 0.7;
      cells.set(prev);
      syncHist();
      updateCount();
    };

    const save = () => {
      const scale = 20;
      const out = document.createElement('canvas');
      out.width = COLS * scale;
      out.height = ROWS * scale;
      const o = out.getContext('2d');
      if (!o) return;
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
      o.fillStyle = bg || '#ffffff';
      o.fillRect(0, 0, out.width, out.height);
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] < 0) continue;
        o.fillStyle = colors[cells[i]];
        o.fillRect((i % COLS) * scale, ((i / COLS) | 0) * scale, scale, scale);
      }
      out.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'untitled.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    actions.current = {
      undo: () => restore(undoStack, redoStack),
      redo: () => restore(redoStack, undoStack),
      clear: () => wipe(null),
      reset: () => wipe(SCENE),
      save,
    };

    // ---------- pointer ----------
    const locate = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const fx = ((e.clientX - rect.left) / rect.width) * COLS;
      const fy = ((e.clientY - rect.top) / rect.height) * ROWS;
      return {
        fx,
        fy,
        c: Math.min(COLS - 1, Math.max(0, Math.floor(fx))),
        r: Math.min(ROWS - 1, Math.max(0, Math.floor(fy))),
      };
    };

    const onEnter = (e: PointerEvent) => {
      const p = locate(e);
      ptr.x = tgt.x = p.fx - 0.5;
      ptr.y = tgt.y = p.fy - 0.5;
      ptr.on = true;
    };
    const onMove = (e: PointerEvent) => {
      const p = locate(e);
      if (!ptr.on) {
        ptr.x = p.fx - 0.5;
        ptr.y = p.fy - 0.5;
        ptr.on = true;
      }
      tgt.x = p.fx - 0.5;
      tgt.y = p.fy - 0.5;
      hover.c = p.c;
      hover.r = p.r;
      if (coordRef.current) coordRef.current.textContent = `x ${pad(p.c)}  y ${pad(p.r)}`;
      if (down) paintLine(p.c, p.r);
    };
    const onLeave = () => {
      ptr.on = false;
      ptr.x = ptr.y = tgt.x = tgt.y = -99;
      hover.c = hover.r = -1;
      if (coordRef.current) coordRef.current.textContent = 'x --  y --';
    };
    const onDown = (e: PointerEvent) => {
      const p = locate(e);
      const tool = settings.current.tool;
      if (!reduced) ripples.push({ c: p.c, r: p.r, t: performance.now() / 1000 });

      if (tool === 'picker') {
        const v = cells[p.r * COLS + p.c];
        if (v >= 0) update({ color: v, tool: 'pencil' });
        else update({ tool: 'eraser' });
        return;
      }
      if (tool === 'fill') {
        needSnap = true;
        floodFill(p.c, p.r);
        return;
      }
      down = true;
      last = null;
      needSnap = true;
      canvas.setPointerCapture(e.pointerId);
      paintLine(p.c, p.r);
    };
    const onUp = () => {
      down = false;
      last = null;
      needSnap = false;
    };

    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ---------- keyboard (only while the hero is hovered or focused) ----------
    const enter = () => (inside = true);
    const leave = () => (inside = false);
    root.addEventListener('mouseenter', enter);
    root.addEventListener('mouseleave', leave);

    const TOOL_KEYS: Record<string, Tool> = { b: 'pencil', e: 'eraser', f: 'fill', i: 'picker' };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!inside && !root.contains(document.activeElement)) return;

      const k = e.key.toLowerCase();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) actions.current.redo();
        else actions.current.undo();
        return;
      }
      if (mod && k === 'y') {
        e.preventDefault();
        actions.current.redo();
        return;
      }
      if (mod || e.altKey) return;

      if (TOOL_KEYS[k]) return update({ tool: TOOL_KEYS[k] });
      if (k >= '1' && k <= '5') {
        const cur = settings.current.tool;
        return update({ color: Number(k) - 1, tool: cur === 'eraser' || cur === 'picker' ? 'pencil' : cur });
      }
      if (k === '[') return update({ size: Math.max(1, settings.current.size - 1) });
      if (k === ']') return update({ size: Math.min(3, settings.current.size + 1) });
      if (k === 'm') return update({ mirror: !settings.current.mirror });
    };
    window.addEventListener('keydown', onKey);

    // ---------- render (driven by GSAP's ticker) ----------
    const render = () => {
      if (!visible || !cell) return;
      const now = performance.now() / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (ptr.on) {
        ptr.x += (tgt.x - ptr.x) * 0.25;
        ptr.y += (tgt.y - ptr.y) * 0.25;
      }
      while (ripples.length && now - ripples[0].t > 2.6) ripples.shift();

      const cx = COLS / 2 - 0.5;
      const cy = ROWS / 2 - 0.5;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;

          const appear = reveal.r - Math.hypot(col - cx, (row - cy) * 1.2);
          if (appear <= 0) continue;
          const pop = easeOutBack(Math.min(appear / 4, 1));

          let bump = 0;
          const dp = Math.hypot(col - ptr.x, row - ptr.y);
          if (dp < 3.6) {
            const k = 1 - dp / 3.6;
            bump += k * k * 0.9;
          }
          const ds = Math.abs(col - scan.x);
          if (ds < 2.5) bump += (1 - ds / 2.5) * 0.3;
          for (const rp of ripples) {
            const age = now - rp.t;
            const ph = age * 14 - Math.hypot(col - rp.c, row - rp.r);
            if (ph > 0 && ph < 4) bump += Math.sin((ph / 4) * Math.PI) * 0.7 * (1 - age / 2.6);
          }

          lift[i] += (bump - lift[i]) * 0.25;
          const b = lift[i];
          const v = cells[i];
          const px = (col + 0.5) * cell;
          const py = (row + 0.5) * cell;

          if (v >= 0) {
            // slightly oversized so neighbouring cells meet and the picture reads as one image
            const s = cell * 0.96 * (1 + b * 0.35) * pop;
            ctx.fillStyle = colors[v];
            fillBox(px - s / 2, py - b * cell * 0.1 - s / 2, s, s, s * 0.2);
          } else {
            const s = cell * (0.12 + b * 0.2) * pop;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = dotColor;
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
            ctx.globalAlpha = 1;
          }
        }
      }

      const st = settings.current;

      // symmetry guide
      if (st.mirror) {
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = inkColor;
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.restore();
      }

      // hovered footprint: outline + ghost of the current colour
      if (ptr.on && hover.c >= 0 && hover.r >= 0) {
        const brush = st.tool === 'pencil' || st.tool === 'eraser';
        const sz = brush ? st.size : 1;
        const lo = -Math.floor(sz / 2);
        const cols = [hover.c + lo];
        if (brush && st.mirror) cols.push(COLS - sz - hover.c - lo);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = inkColor;
        for (const c0 of cols) {
          const x = c0 * cell;
          const y = (hover.r + lo) * cell;
          const w = sz * cell;
          if (st.tool === 'pencil') {
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = colors[st.color];
            fillBox(x + cell * 0.08, y + cell * 0.08, w - cell * 0.16, w - cell * 0.16, cell * 0.18);
            ctx.globalAlpha = 1;
          }
          strokeBox(x + 0.75, y + 0.75, w - 1.5, w - 1.5, cell * 0.2);
        }
      }
    };
    gsap.ticker.add(render);

    // ---------- GSAP: one intro moment, glint, caret ----------
    const gsapCtx = gsap.context(() => {
      // blinking caret
      gsap
        .timeline({ repeat: -1 })
        .set(caretRef.current, { opacity: 0 }, 0.55)
        .set(caretRef.current, { opacity: 1 }, 1.1);

      if (reduced) return;

      // the name rises out of a mask, letter by letter
      gsap.fromTo('[data-char]', { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.03 });
      gsap.fromTo(
        '[data-in]',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.5 }
      );
      gsap.fromTo(
        windowRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.3 }
      );
      // pixels bloom outward from the centre
      gsap.to(reveal, { r: 44, duration: 2.4, ease: 'power2.out', delay: 0.6 });
      // the hint fades in, then its arrow draws itself
      gsap.fromTo('[data-hint]', { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.6 });
      gsap.fromTo(
        '[data-arrow]',
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.5, delay: 1.8 }
      );
      // a glint sweeps across every few seconds
      gsap.fromTo(
        scan,
        { x: -6 },
        { x: COLS + 6, duration: 2.6, ease: 'none', repeat: -1, repeatDelay: 5, delay: 3.8 }
      );
    }, root);

    return () => {
      gsap.ticker.remove(render);
      gsapCtx.revert();
      wipeTween?.kill();
      gsap.killTweensOf([reveal, scan]);
      themeObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [update]);

  // ---------- shared class strings ----------
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const toolBtn = `grid size-8 shrink-0 place-items-center rounded-lg border-[1.5px] border-transparent text-foreground transition-colors duration-150 hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background disabled:pointer-events-none disabled:opacity-30 ${focus}`;
  const barBtn =
    'grid size-7 place-items-center rounded-md text-primary-foreground transition-colors duration-150 hover:bg-primary-foreground/15 focus-visible:outline-2 focus-visible:outline-primary-foreground disabled:pointer-events-none disabled:opacity-40';
  const divider = 'mx-1 h-6 w-px bg-foreground/20';

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background px-6 pb-24 pt-24 sm:px-10 md:pt-28 lg:px-16"
    >
      {/* Grid lines: fade out toward the bottom of the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: GRID_LINES,
          backgroundSize: '36px 36px',
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
        }}
      />

      {/* 68rem: a touch wider than the original 64rem */}
      <div className="relative w-full" style={{ maxWidth: '68rem' }}>
        {/* Intro: name, then role, then blurb, all stacked */}
        <div className="mb-12 md:mb-14">
          <h1
            aria-label={NAME}
            className="font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground"
          >
            {NAME.split('').map((ch, i) => (
              <span key={i} aria-hidden className="-mb-3 inline-block overflow-hidden pb-3 pr-0.5 align-bottom">
                <span data-char className="inline-block">
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              </span>
            ))}
          </h1>
          <p data-in className="mt-3 font-display font-soft text-lg italic text-foreground md:text-xl">
            Software engineer
            <span
              ref={caretRef}
              aria-hidden
              className="ml-1 inline-block h-[0.8em] w-[0.42em] translate-y-[0.08em] rounded-xs bg-foreground"
            />
          </p>
          <p data-in className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            Founder of Monostudios, a web studio in South Africa. Computer science student at Eduvos.
          </p>
        </div>

        <div className="relative">
          {/* Hint: lives outside the window and points down at it */}
          <div
            data-hint
            aria-hidden
            className="pointer-events-none absolute -top-10 right-6 hidden items-end gap-1.5 text-muted-foreground sm:flex md:right-10"
          >
            <span className="pb-1 font-display text-base italic">click, drag, doodle</span>
            <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
              <path data-arrow pathLength={1} d="M3 5 C 20 1, 36 8, 38 29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path data-arrow pathLength={1} d="M31 22 L38 30 L43 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Paint window */}
          <div
            ref={windowRef}
            className="relative overflow-hidden rounded-xl border-[1.5px] border-foreground bg-card shadow-[6px_6px_0_var(--primary)]"
          >
            {/* Title bar */}
            <div className="flex h-10 items-center justify-between border-b-[1.5px] border-foreground bg-primary pl-3 pr-2 font-pixel text-sm text-primary-foreground">
              <span className="flex items-center gap-2.5">
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-2.5 rounded-sm border-[1.5px] border-primary-foreground" />
                  ))}
                </span>
                untitled.png
              </span>
              <span className="flex items-center gap-1">
                <span ref={countRef} className="mr-2">
                  0 px
                </span>
                <button type="button" title="Undo (Ctrl/Cmd Z)" aria-label="Undo" disabled={hist.undo === 0} onClick={() => actions.current.undo()} className={barBtn}>
                  <Icon name="undo" />
                </button>
                <button type="button" title="Redo (Ctrl/Cmd Shift Z)" aria-label="Redo" disabled={hist.redo === 0} onClick={() => actions.current.redo()} className={barBtn}>
                  <Icon name="redo" />
                </button>
                <button type="button" title="Save as PNG" aria-label="Save as PNG" onClick={() => actions.current.save()} className={barBtn}>
                  <Icon name="save" />
                </button>
              </span>
            </div>

            {/* Toolbar (horizontal, so the canvas height is always exactly its aspect ratio) */}
            <div
              role="toolbar"
              aria-label="Tools"
              className="flex flex-wrap items-center gap-1 border-b-[1.5px] border-foreground px-2 py-2"
            >
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={`${t.label} (${t.key})`}
                  aria-label={t.label}
                  aria-keyshortcuts={t.key}
                  aria-pressed={ui.tool === t.id}
                  onClick={() => update({ tool: t.id })}
                  className={toolBtn}
                >
                  <Icon name={t.icon} />
                </button>
              ))}

              <span className={divider} aria-hidden />

              {SIZES.map((s) => (
                <button
                  key={s.n}
                  type="button"
                  title={`Brush ${s.n}px ([ and ])`}
                  aria-label={`Brush size ${s.n}`}
                  aria-pressed={ui.size === s.n}
                  onClick={() => update({ size: s.n })}
                  className={toolBtn}
                >
                  <span className={`${s.dot} rounded-xs bg-current`} />
                </button>
              ))}

              <span className={divider} aria-hidden />

              <button
                type="button"
                title="Mirror (M)"
                aria-label="Mirror"
                aria-keyshortcuts="M"
                aria-pressed={ui.mirror}
                onClick={() => update({ mirror: !ui.mirror })}
                className={toolBtn}
              >
                <Icon name="mirror" />
              </button>

              <span className="flex-1" aria-hidden />

              <button type="button" title="Restore the original picture" aria-label="Reset picture" onClick={() => actions.current.reset()} className={toolBtn}>
                <Icon name="reset" />
              </button>
              <button type="button" title="Clear canvas" aria-label="Clear canvas" onClick={() => actions.current.clear()} className={toolBtn}>
                <Icon name="clear" />
              </button>
            </div>

            {/* Canvas: width is 100%, height comes purely from the grid ratio, so the picture always fills it */}
            <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: `${COLS} / ${ROWS}` }}>
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Interactive pixel canvas. Click and drag to draw, use the toolbar above to change brush."
                className="absolute inset-0 h-full w-full cursor-crosshair select-none"
                style={{ touchAction: 'pan-y' }}
              />
            </div>

            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-foreground px-3 py-2.5">
              <div className="flex items-center gap-2" role="group" aria-label="Colour">
                {SWATCHES.map((s, i) => {
                  const on = ui.color === i && ui.tool !== 'eraser';
                  return (
                    <button
                      key={s.name}
                      type="button"
                      title={`${s.name} (${i + 1})`}
                      aria-label={s.name}
                      aria-keyshortcuts={String(i + 1)}
                      aria-pressed={on}
                      onClick={() =>
                        update({ color: i, tool: ui.tool === 'eraser' || ui.tool === 'picker' ? 'pencil' : ui.tool })
                      }
                      className={`size-6 rounded-md border-[1.5px] border-foreground transition-transform duration-200 hover:-translate-y-0.5 ${focus} ${
                        on ? '-translate-y-0.5 shadow-[2px_2px_0_var(--foreground)]' : ''
                      }`}
                      style={{ background: s.css }}
                    />
                  );
                })}
              </div>

              <p className="flex items-center gap-4 font-pixel text-xs text-muted-foreground" aria-hidden>
                <span>
                  {ui.tool} {ui.tool === 'pencil' || ui.tool === 'eraser' ? `${ui.size}px` : ''}
                  {ui.mirror ? ' mirror' : ''}
                </span>
                <span ref={coordRef} className="tabular-nums">
                  x --  y --
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}