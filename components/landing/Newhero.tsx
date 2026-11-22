"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { Inter_Tight } from "next/font/google";

/* -------------------------------------------------------------------------- */
/*  Font (free, Google Fonts via next/font, self-hosted at build time)        */
/* -------------------------------------------------------------------------- */

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const ROLES = [
  "Software Engineer",
  "CS Student",
  "Web Developer",
  "Screenwriter",
  "Data & AI Builder",
];

const FIRST = "Jayson";
const NAME = `${FIRST} Baloyi`;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&/<>_";
const AUTO_DELAY = 4;

type CmdId = "zerog" | "shatter" | "dissolve" | "glitch" | "warp" | "draw" | "lights";

type Command = { id: CmdId; label: string; hint: string; keys: string[]; reply: string };

const COMMANDS: Command[] = [
  { id: "zerog", label: "Zero gravity", hint: "Letters float and drift", keys: ["zero gravity", "zero g", "zero", "gravity", "float", "space", "drift", "weightless"], reply: "Weightless. Move through it." },
  { id: "shatter", label: "Shatter", hint: "The page cracks like glass", keys: ["shatter", "glass", "crack", "break", "smash"], reply: "Handle with care." },
  { id: "dissolve", label: "Dissolve", hint: "The name turns to particles", keys: ["dissolve", "disintegrate", "particle", "scatter", "dust"], reply: "Dissolving." },
  { id: "glitch", label: "Glitch", hint: "RGB split and scanlines", keys: ["glitch", "rgb", "static", "corrupt", "error"], reply: "Signal lost." },
  { id: "warp", label: "Warp", hint: "Jump to hyperspace", keys: ["warp", "hyperspace", "stars", "starfield", "speed"], reply: "Jumping to hyperspace." },
  { id: "draw", label: "Draw", hint: "Your cursor becomes ink", keys: ["draw", "paint", "brush", "ink", "sketch", "doodle"], reply: "Draw on the page." },
  { id: "lights", label: "Lights out", hint: "Find the name with a torch", keys: ["lights out", "lights", "dark", "torch", "flashlight", "light"], reply: "Find the light." },
];

const PLACEHOLDERS = [
  "Pick an effect…",
  "Try “warp”…",
  "Say “shatter”…",
  "Type “lights out”…",
  "Try “draw”…",
  "Ask for “glitch”…",
];

// Ranked fuzzy match: exact > starts with > contains > the text contains a keyword.
const search = (text: string): Command[] => {
  const t = text.trim().toLowerCase();
  if (!t) return [];
  return COMMANDS.map((c) => {
    let s = 0;
    for (const k of [...c.keys, c.label.toLowerCase()]) {
      if (k === t) s = Math.max(s, 4);
      else if (k.startsWith(t)) s = Math.max(s, 3);
      else if (t.length >= 3 && k.includes(t)) s = Math.max(s, 2);
      else if (k.length >= 3 && t.includes(k)) s = Math.max(s, 1);
    }
    return { c, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Any CSS colour (hex, rgb, oklch...) -> #rrggbb.
const toHex = (css: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return "#888888";
  x.fillStyle = css;
  x.fillRect(0, 0, 1, 1);
  const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
};

// An effect: ttl = seconds before it ends itself, stop = animated exit, dispose = hard cleanup.
type Mode = { ttl: number; stop: (done: () => void) => void; dispose: () => void };

type Api = {
  run: (id: CmdId) => void;
  unknown: (text: string) => void;
  pause: (paused: boolean) => void;
  end: () => void;
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyRef = useRef<HTMLParagraphElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null); // above the content (draw, lights, glitch...)
  const bgRef = useRef<HTMLCanvasElement>(null); // behind the content (warp)
  const popRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const blurTimer = useRef<number | undefined>(undefined);
  const navigated = useRef(false);
  const apiRef = useRef<Api | null>(null);

  const [value, setValue] = useState("");
  const [idx, setIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const [up, setUp] = useState(false);
  const [mode, setMode] = useState<CmdId | null>(null);

  // empty box = the full list, so first-time visitors see what's available
  const matches = useMemo(() => (value.trim() ? search(value) : COMMANDS), [value]);
  const open = focused;
  const active = Math.min(idx, Math.max(matches.length - 1, 0));

  const trigger = (cmd?: Command, raw?: string) => {
    setValue("");
    setIdx(0);
    navigated.current = false;
    inputRef.current?.blur();
    if (cmd) apiRef.current?.run(cmd.id);
    else if (raw) apiRef.current?.unknown(raw);
  };

  const submit = () => {
    const t = value.trim();
    if (!t && !navigated.current) return;
    trigger(matches[active], t);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }
    if (!matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      navigated.current = true;
      setIdx((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigated.current = true;
      setIdx((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Tab" && value.trim()) {
      e.preventDefault();
      setValue(matches[active].label.toLowerCase());
    }
  };

  /* ---------- suggestion popup entrance ---------- */
  useEffect(() => {
    const el = popRef.current;
    if (!open || !el) return;
    const a = gsap.fromTo(
      el,
      { y: up ? 6 : -6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
    );
    return () => {
      a.kill();
    };
  }, [open, up]);

  /* ---------- reset pill entrance ---------- */
  useEffect(() => {
    const pill = pillRef.current;
    if (!mode || !pill) return;
    const a = gsap.fromTo(pill, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    return () => {
      a.kill();
    };
  }, [mode]);

  /* ---------- everything else ---------- */
  useEffect(() => {
    const root = rootRef.current;
    const drift = driftRef.current;
    const h1 = nameRef.current;
    const titleEl = titleRef.current;
    const sub = subRef.current;
    const promptEl = promptRef.current;
    const input = inputRef.current;
    const reply = replyRef.current;
    const fx = fxRef.current;
    const bg = bgRef.current;
    if (!root || !drift || !h1 || !titleEl || !sub || !promptEl || !input || !reply || !fx || !bg) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dead = false;

    // shards are clones of the content: drop the expensive blur on them
    const shardStyle = document.createElement("style");
    shardStyle.textContent = "[data-shard] *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}";
    document.head.appendChild(shardStyle);

    const ctx = gsap.context(() => {
      const masks = gsap.utils.toArray<HTMLElement>("[data-mask]", root);
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root);
      const letters = masks.filter((m) => m.textContent?.trim());

      let fontPx = parseFloat(getComputedStyle(h1).fontSize) || 64;
      let current = 0;
      let busy = false;
      let held = false;
      let ready = reduced;
      let cycle: gsap.core.Tween | null = null;
      let titleTween: gsap.core.Tween | null = null;
      let replyTween: gsap.core.Tween | null = null;
      let phTween: gsap.core.Tween | null = null;
      let phCall: gsap.core.Tween | null = null;
      const ptr = { x: -9999, y: -9999 };

      let active: Mode | null = null;
      let working = false;
      let autoEnd: gsap.core.Tween | null = null;

      const fg = () => toHex(getComputedStyle(root).color);

      // size + clear a canvas to the hero, returns its 2d context
      const prep = (cv: HTMLCanvasElement) => {
        const r = root.getBoundingClientRect();
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        gsap.set(cv, { opacity: 1 });
        const c = cv.getContext("2d");
        if (!c) throw new Error("canvas unavailable");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { c, w: r.width, h: r.height };
      };
      const wipe = (cv: HTMLCanvasElement) => {
        cv.width = 0;
      };

      const restoreLetters = (done: () => void) => {
        gsap.to(masks, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 1.2,
          ease: "expo.inOut",
          stagger: { each: 0.03, from: "random" },
          onComplete: done,
        });
      };

      /* ---------- character scramble (title, reply, placeholder) ---------- */
      const scramble = (
        get: () => string,
        set: (s: string) => void,
        to: string,
        duration: number,
        lag = 6
      ) => {
        const from = get();
        const len = Math.max(from.length, to.length);
        const state = { p: 0 };
        return gsap.to(state, {
          p: len + lag,
          duration: reduced ? 0.01 : duration,
          ease: "none",
          onUpdate: () => {
            let out = "";
            for (let i = 0; i < len; i++) {
              const target = to[i] ?? "";
              if (state.p >= i + lag) out += target;
              else if (state.p >= i)
                out +=
                  target === " " || target === ""
                    ? target
                    : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              else out += from[i] ?? "";
            }
            set(out);
          },
          onComplete: () => set(to),
        });
      };

      const say = (text: string) => {
        replyTween?.kill();
        replyTween = scramble(
          () => reply.textContent ?? "",
          (s) => {
            reply.textContent = s;
          },
          text,
          0.8,
          5
        );
      };

      /* ---------- role cycle ---------- */
      const go = (next: number) => {
        if (busy) return;
        busy = true;
        titleTween?.kill();
        titleTween = scramble(
          () => titleEl.textContent ?? "",
          (s) => {
            titleEl.textContent = s;
          },
          ROLES[next],
          1.2
        );
        current = next;
        gsap.delayedCall(1.2, () => {
          busy = false;
        });
      };

      const restart = () => {
        cycle?.kill();
        if (reduced) return;
        cycle = gsap.delayedCall(AUTO_DELAY, () => {
          go((current + 1) % ROLES.length);
          restart();
        });
        if (held) cycle.pause();
      };

      const step = (dir: 1 | -1) => {
        if (busy) return;
        go((current + dir + ROLES.length) % ROLES.length);
        restart();
      };

      /* ====================================================================== */
      /*  ZERO GRAVITY                                                          */
      /*  Letters detach and drift, spinning slowly. The cursor repels them,    */
      /*  walls bounce them, and they glide back into the name at the end.      */
      /* ====================================================================== */
      const zerog = (): Mode => {
        const rr = root.getBoundingClientRect();
        const w = rr.width;
        const h = rr.height;
        gsap.set(masks, { overflow: "visible" });
        gsap.set(chars, { y: 0, yPercent: 0 });

        const items = letters.map((el) => {
          const r = el.getBoundingClientRect();
          const a = rand(0, Math.PI * 2);
          const s = rand(0.4, 1.1);
          return {
            el,
            hw: r.width / 2,
            hh: r.height / 2,
            cx: r.left - rr.left + r.width / 2,
            cy: r.top - rr.top + r.height / 2,
            x: 0,
            y: 0,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            rot: 0,
            vr: rand(-0.9, 0.9),
          };
        });
        const R = Math.max(130, fontPx * 1.5);

        const tick = (_: number, dt: number) => {
          const f = Math.min(dt / 16.67, 2.5);
          const r = root.getBoundingClientRect();
          const mx = ptr.x - r.left;
          const my = ptr.y - r.top;
          for (const it of items) {
            const dx = it.cx + it.x - mx;
            const dy = it.cy + it.y - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const s = 1 - d / R;
              const F = s * s * 1.7 * f;
              it.vx += (dx / d) * F;
              it.vy += (dy / d) * F;
              it.vr += (dx > 0 ? 1 : -1) * s * 0.08 * f;
            }
            const damp = Math.pow(0.992, f);
            it.vx *= damp;
            it.vy *= damp;
            it.vr *= Math.pow(0.996, f);

            // keep drifting: never come to rest
            const sp = Math.hypot(it.vx, it.vy);
            if (sp < 0.22) {
              const a = sp > 0.001 ? Math.atan2(it.vy, it.vx) : rand(0, Math.PI * 2);
              it.vx = Math.cos(a) * 0.22;
              it.vy = Math.sin(a) * 0.22;
            }

            it.x += it.vx * f;
            it.y += it.vy * f;
            it.rot += it.vr * f;

            const ax = it.cx + it.x;
            const ay = it.cy + it.y;
            if (ax < it.hw) {
              it.x = it.hw - it.cx;
              it.vx = Math.abs(it.vx) * 0.8;
            } else if (ax > w - it.hw) {
              it.x = w - it.hw - it.cx;
              it.vx = -Math.abs(it.vx) * 0.8;
            }
            if (ay < it.hh) {
              it.y = it.hh - it.cy;
              it.vy = Math.abs(it.vy) * 0.8;
            } else if (ay > h - it.hh) {
              it.y = h - it.hh - it.cy;
              it.vy = -Math.abs(it.vy) * 0.8;
            }
            gsap.set(it.el, { x: it.x, y: it.y, rotation: it.rot });
          }
        };
        gsap.ticker.add(tick);

        let gone = false;
        return {
          ttl: 7,
          stop: (done) => {
            gsap.ticker.remove(tick);
            restoreLetters(done);
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            gsap.ticker.remove(tick);
            gsap.set(masks, { x: 0, y: 0, rotation: 0 });
          },
        };
      };

      /* ====================================================================== */
      /*  SHATTER                                                               */
      /*  Cracks spread from the send button, the page splits into shards,      */
      /*  they tilt and fall, then fly back together.                           */
      /* ====================================================================== */
      const shatter = (): Mode => {
        const { c, w, h } = prep(fx);
        const rr = root.getBoundingClientRect();
        const color = fg();
        const anchor =
          (promptEl.querySelector("button[type='submit']") as HTMLElement | null) ?? promptEl;
        const ar = anchor.getBoundingClientRect();
        const P = { x: ar.left - rr.left + ar.width / 2, y: ar.top - rr.top + ar.height / 2 };
        const maxD = Math.max(
          Math.hypot(P.x, P.y),
          Math.hypot(w - P.x, P.y),
          Math.hypot(P.x, h - P.y),
          Math.hypot(w - P.x, h - P.y)
        );

        // radial + ring vertex grid with jitter -> glass-like cells
        const S = 12;
        const RINGS = [0, 0.1, 0.24, 0.45, 0.78, 1.45];
        const V = RINGS.map((k, ki) =>
          Array.from({ length: S }, (_, j) => {
            if (ki === 0) return { x: P.x, y: P.y };
            const th = ((j + (Math.random() - 0.5) * 0.55) / S) * Math.PI * 2 + 0.2;
            const rad = k * maxD * (1 + (Math.random() - 0.5) * 0.22);
            return { x: P.x + Math.cos(th) * rad, y: P.y + Math.sin(th) * rad };
          })
        );

        type Pt = { x: number; y: number };
        const polys: Pt[][] = [];
        const edges: { x1: number; y1: number; x2: number; y2: number; d: number }[] = [];
        const addEdge = (a: Pt, b: Pt) =>
          edges.push({
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y,
            d: Math.min(Math.hypot(a.x - P.x, a.y - P.y), Math.hypot(b.x - P.x, b.y - P.y)),
          });
        for (let k = 0; k < RINGS.length - 1; k++) {
          for (let j = 0; j < S; j++) {
            const j2 = (j + 1) % S;
            const a = V[k][j];
            const b = V[k][j2];
            const cc = V[k + 1][j2];
            const d = V[k + 1][j];
            polys.push(k === 0 ? [a, cc, d] : [a, b, cc, d]);
            addEdge(a, d);
            if (k >= 1) addEdge(a, b);
          }
        }

        const holder = document.createElement("div");
        holder.setAttribute("aria-hidden", "true");
        Object.assign(holder.style, {
          position: "absolute",
          inset: "0",
          zIndex: "20",
          pointerEvents: "none",
          overflow: "hidden",
        });
        const paper = getComputedStyle(root).backgroundColor;

        const shards = polys.map((poly) => {
          const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
          const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
          const dist = Math.hypot(cx - P.x, cy - P.y) || 1;
          const outer = document.createElement("div");
          outer.setAttribute("data-shard", "");
          Object.assign(outer.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            filter: "drop-shadow(0 0 0.6px currentColor)",
            willChange: "transform",
            transformOrigin: `${cx}px ${cy}px`,
          });
          const inner = document.createElement("div");
          Object.assign(inner.style, {
            position: "absolute",
            inset: "0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: paper,
            clipPath: `polygon(${poly.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",")})`,
          });
          inner.appendChild(drift.cloneNode(true));
          outer.appendChild(inner);
          holder.appendChild(outer);
          return { outer, d: dist / maxD, ax: (cx - P.x) / dist, ay: (cy - P.y) / dist };
        });
        root.appendChild(holder);
        gsap.set(drift, { visibility: "hidden" });

        const els = shards.map((s) => s.outer);
        gsap.set(els, { transformPerspective: 1100 });
        const tl = gsap.timeline();
        shards.forEach((s) => {
          const t0 = 0.3 + s.d * 0.45;
          tl.to(
            s.outer,
            {
              x: s.ax * 8,
              y: s.ay * 8,
              rotationX: rand(-12, 12),
              rotationY: rand(-12, 12),
              rotationZ: rand(-2.5, 2.5),
              duration: 0.3,
              ease: "power2.out",
            },
            t0
          );
          tl.to(
            s.outer,
            {
              x: s.ax * rand(20, 90) + rand(-25, 25),
              y: rand(0.25, 0.6) * h,
              rotationX: rand(-75, 75),
              rotationY: rand(-75, 75),
              rotationZ: rand(-40, 40),
              duration: rand(1, 1.5),
              ease: "power2.in",
            },
            t0 + 0.3
          );
        });

        // cracks spreading from the impact point
        const crack = { r: 0 };
        const crackTw = gsap.to(crack, {
          r: maxD * 1.1,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            c.clearRect(0, 0, w, h);
            c.strokeStyle = color;
            c.lineWidth = 1.25;
            c.lineCap = "round";
            c.beginPath();
            for (const e of edges) {
              if (e.d <= crack.r) {
                c.moveTo(e.x1, e.y1);
                c.lineTo(e.x2, e.y2);
              }
            }
            c.stroke();
          },
        });
        const fadeTw = gsap.to(fx, { opacity: 0, duration: 0.35, delay: 0.4 });

        let gone = false;
        return {
          ttl: 2.9,
          stop: (done) => {
            tl.kill();
            gsap.to(els, {
              x: 0,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 1.1,
              ease: "expo.inOut",
              stagger: { each: 0.008, from: "end" },
              onComplete: done,
            });
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            tl.kill();
            crackTw.kill();
            fadeTw.kill();
            gsap.killTweensOf(els);
            holder.remove();
            gsap.set(drift, { clearProps: "visibility" });
            wipe(fx);
          },
        };
      };

      /* ====================================================================== */
      /*  DISSOLVE (canvas particles sampled from the real glyphs)              */
      /* ====================================================================== */
      const dissolve = (): Mode => {
        const rr = root.getBoundingClientRect();
        const w = rr.width;
        const h = rr.height;
        fx.width = Math.round(w * dpr);
        fx.height = Math.round(h * dpr);
        gsap.set(fx, { opacity: 1 });
        const c = fx.getContext("2d");
        const off = document.createElement("canvas");
        off.width = fx.width;
        off.height = fx.height;
        const o = off.getContext("2d", { willReadFrequently: true });
        if (!c || !o) throw new Error("canvas unavailable");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        o.scale(dpr, dpr);

        // sample each glyph with its own computed font (upright first name, italic surname)
        o.fillStyle = "#000";
        o.textAlign = "center";
        o.textBaseline = "alphabetic";
        chars.forEach((el) => {
          const ch = el.textContent;
          if (!ch?.trim()) return;
          const cs = getComputedStyle(el);
          o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const r = el.getBoundingClientRect();
          const m = o.measureText(ch);
          const asc = m.fontBoundingBoxAscent ?? fontPx * 0.8;
          const desc = m.fontBoundingBoxDescent ?? fontPx * 0.2;
          const lh = parseFloat(cs.lineHeight) || r.height || fontPx;
          const baseline = r.top - rr.top + (lh - (asc + desc)) / 2 + asc;
          o.fillText(ch, r.left - rr.left + r.width / 2, baseline);
        });

        const data = o.getImageData(0, 0, off.width, off.height).data;
        const stepPx = Math.max(2, Math.round(fontPx / 38));
        const sp = Math.max(1, Math.round(stepPx * dpr));
        const k = fontPx / 90;
        type P = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; s: number; d: number };
        const ps: P[] = [];
        for (let y = 0; y < off.height; y += sp) {
          for (let x = 0; x < off.width; x += sp) {
            if (data[(y * off.width + x) * 4 + 3] > 128) {
              const hx = x / dpr;
              const hy = y / dpr;
              const a = rand(0, Math.PI * 2);
              const v = rand(0.3, 3.4) * k;
              ps.push({
                x: hx,
                y: hy,
                hx,
                hy,
                vx: Math.cos(a) * v + 0.6 * k,
                vy: Math.sin(a) * v - rand(0, 1) * k,
                s: rand(0.9, 1.9) * Math.max(1, k * 0.9),
                d: hx / w,
              });
            }
          }
        }

        const color = fg();
        gsap.set(chars, { opacity: 0 });

        const SCATTER = 2.4;
        let t = 0;
        const R = Math.max(70, fontPx * 1.1);

        const tick = (_: number, dt: number) => {
          const f = Math.min(dt / 16.67, 2.5);
          t += dt / 1000;
          const r = root.getBoundingClientRect();
          const mx = ptr.x - r.left;
          const my = ptr.y - r.top;

          c.clearRect(0, 0, w, h);
          c.fillStyle = color;

          for (const p of ps) {
            if (t < SCATTER) {
              p.vx += Math.sin(p.y * 0.018 + t * 1.4) * 0.03 * f * k;
              p.vy += Math.cos(p.x * 0.018 + t * 1.1) * 0.03 * f * k - 0.004 * f * k;
              const d = Math.pow(0.985, f);
              p.vx *= d;
              p.vy *= d;
            } else {
              const m = clamp(t - SCATTER - p.d * 0.9, 0, 1);
              if (m > 0) {
                p.vx += (p.hx - p.x) * 0.008 * m * f;
                p.vy += (p.hy - p.y) * 0.008 * m * f;
              }
              const d = Math.pow(0.97 - 0.09 * m, f);
              p.vx *= d;
              p.vy *= d;
            }

            const dx = p.x - mx;
            const dy = p.y - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const s = 1 - d / R;
              const F = s * s * 0.7 * k * f;
              p.vx += (dx / d) * F;
              p.vy += (dy / d) * F;
            }

            p.x += p.vx * f;
            p.y += p.vy * f;
            c.fillRect(p.x, p.y, p.s, p.s);
          }
        };
        gsap.ticker.add(tick);

        let gone = false;
        return {
          ttl: 5.4,
          stop: (done) => {
            gsap.to(chars, { opacity: 1, duration: 0.5, ease: "power2.out" });
            gsap.to(fx, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: done });
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            gsap.ticker.remove(tick);
            gsap.set(chars, { opacity: 1 });
            wipe(fx);
          },
        };
      };

      /* ====================================================================== */
      /*  GLITCH                                                                */
      /*  A short, violent burst: RGB split, torn letters, scanlines, bars.     */
      /* ====================================================================== */
      const glitch = (): Mode => {
        const { c, w, h } = prep(fx);
        const color = fg();
        const originals = chars.map((ch) => ch.textContent ?? "");
        const DURATION = 0.95;
        let t = 0;
        let acc = 0;

        const clean = () => {
          drift.style.filter = "";
          gsap.set(drift, { x: 0, skewX: 0 });
          chars.forEach((ch, i) => {
            ch.textContent = originals[i];
          });
          gsap.set(chars, { x: 0, skewX: 0, scaleY: 1 });
          c.clearRect(0, 0, w, h);
        };

        const tick = (_: number, dt: number) => {
          t += dt / 1000;
          acc += dt;
          if (acc < 38) return;
          acc = 0;

          const e = t >= DURATION ? 0 : Math.pow(1 - t / DURATION, 0.6);
          if (e <= 0 || Math.random() > 0.35 + 0.65 * e) {
            clean(); // stutter: some frames are perfectly clean
            return;
          }

          const dx = rand(-1, 1) * 20 * e;
          drift.style.filter = `drop-shadow(${dx}px 0 0 rgba(255,0,70,0.9)) drop-shadow(${-dx}px 0 0 rgba(0,225,255,0.9))`;
          gsap.set(drift, {
            x: Math.random() < 0.5 ? rand(-1, 1) * 26 * e : 0,
            skewX: Math.random() < 0.35 ? rand(-10, 10) * e : 0,
          });
          chars.forEach((ch, i) => {
            if (Math.random() < 0.5 * e) {
              gsap.set(ch, { x: rand(-1, 1) * fontPx * 0.25 * e, skewX: rand(-25, 25) * e, scaleY: rand(0.6, 1.4) });
            } else {
              gsap.set(ch, { x: 0, skewX: 0, scaleY: 1 });
            }
            ch.textContent =
              originals[i].trim() && Math.random() < 0.12 * e
                ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                : originals[i];
          });

          c.clearRect(0, 0, w, h);
          c.fillStyle = color;
          c.globalAlpha = 0.05 + 0.1 * e;
          for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
          const palette = [color, "rgba(255,0,70,1)", "rgba(0,225,255,1)"];
          const bars = Math.floor(2 + Math.random() * 6 * e);
          for (let i = 0; i < bars; i++) {
            c.globalAlpha = rand(0.35, 0.95);
            c.fillStyle = palette[Math.floor(Math.random() * palette.length)];
            c.fillRect(rand(0, w * 0.5), rand(0, h), rand(w * 0.2, w), rand(2, 36 * e + 4));
          }
          if (Math.random() < 0.06 * e) {
            c.globalAlpha = 0.9;
            c.fillStyle = color;
            c.fillRect(0, 0, w, h);
          }
          c.globalAlpha = 1;
        };
        gsap.ticker.add(tick);

        let gone = false;
        const dispose = () => {
          if (gone) return;
          gone = true;
          gsap.ticker.remove(tick);
          clean();
          wipe(fx);
        };
        return {
          ttl: 1,
          stop: (done) => {
            dispose();
            done();
          },
          dispose,
        };
      };

      /* ====================================================================== */
      /*  WARP                                                                  */
      /*  A starfield streaks past behind the name, which stays perfectly still.*/
      /* ====================================================================== */
      const warp = (): Mode => {
        const { c, w, h } = prep(bg);
        const color = fg();
        const cx = w / 2;
        const cy = h / 2;
        const sc = Math.max(w, h) * 0.5;
        const N = Math.round(clamp((w * h) / 2600, 220, 560));
        type Star = { a: number; r: number; z: number };
        const make = (z = rand(0.05, 1)): Star => ({ a: rand(0, Math.PI * 2), r: rand(0.03, 1), z });
        const stars = Array.from({ length: N }, () => make());
        const st = { v: 0.15, fade: 0 };
        const t1 = gsap.to(st, { v: 2.1, duration: 1.2, ease: "power3.in" });
        const t2 = gsap.to(st, { fade: 1, duration: 0.5 });

        const tick = (_: number, dt: number) => {
          const dz = st.v * (dt / 1000) * 0.9;
          c.clearRect(0, 0, w, h);
          c.strokeStyle = color;
          c.lineCap = "round";
          for (const s of stars) {
            s.z -= dz;
            if (s.z <= 0.02) Object.assign(s, make(1));
            const k = (1 / s.z) * sc * s.r;
            const x1 = cx + Math.cos(s.a) * k;
            const y1 = cy + Math.sin(s.a) * k;
            if (x1 < -60 || x1 > w + 60 || y1 < -60 || y1 > h + 60) {
              Object.assign(s, make(1));
              continue;
            }
            const zt = Math.min(s.z + 0.015 + st.v * 0.09, 1.6);
            const k0 = (1 / zt) * sc * s.r;
            c.globalAlpha = clamp((1 - s.z) * 1.2, 0.1, 1) * st.fade;
            c.lineWidth = 0.6 + (1 - s.z) * 1.8;
            c.beginPath();
            c.moveTo(cx + Math.cos(s.a) * k0, cy + Math.sin(s.a) * k0);
            c.lineTo(x1, y1);
            c.stroke();
          }
          c.globalAlpha = 1;
        };
        gsap.ticker.add(tick);

        let gone = false;
        return {
          ttl: 4.2,
          stop: (done) => {
            t1.kill();
            gsap.to(st, { v: 0.05, duration: 0.7, ease: "power2.out" });
            gsap.to(bg, { opacity: 0, duration: 0.6, delay: 0.2, onComplete: done });
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            t1.kill();
            t2.kill();
            gsap.ticker.remove(tick);
            wipe(bg);
          },
        };
      };

      /* ====================================================================== */
      /*  DRAW                                                                  */
      /*  A liquid ink brush.                                                   */
      /*  - Lazy brush: the nib eases toward the cursor every frame, so the     */
      /*    line is sampled at a steady rate and never steps with mouse events. */
      /*  - Ink is drawn OPAQUE and faded by greyscale value on a canvas that   */
      /*    uses mix-blend-mode: difference. No translucent overlaps, so no     */
      /*    beading, and the fade is perfectly smooth. Over the name the ink    */
      /*    inverts, so you can see it.                                         */
      /* ====================================================================== */
      const draw = (): Mode => {
        const { c, w, h } = prep(fx);
        fx.style.mixBlendMode = "difference";

        type Pt = { x: number; y: number; w: number; t: number };
        type Q = { x: number; y: number; w: number; age: number };
        const strokes: Pt[][] = [];
        let cur: Pt[] | null = null;
        const base = clamp(fontPx * 0.13, 9, 22);
        const LIFE = 2600;
        const brush = { x: 0, y: 0, w: base * 0.4, v: 0, on: false };

        root.style.touchAction = "none";
        root.style.cursor = "crosshair";

        const mid = (a: Q, b: Q) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

        const tick = (_: number, dt: number) => {
          const f = Math.min(dt / 16.67, 3);
          const now = performance.now();
          const r = root.getBoundingClientRect();

          /* --- move the nib --- */
          if (ptr.x > -1000) {
            const tx = ptr.x - r.left;
            const ty = ptr.y - r.top;
            if (!brush.on) {
              brush.on = true;
              brush.x = tx;
              brush.y = ty;
              brush.v = 0;
              brush.w = base * 0.4;
              cur = [];
              strokes.push(cur);
            }
            const px = brush.x;
            const py = brush.y;
            const k = 1 - Math.pow(0.55, f); // frame-rate independent easing
            brush.x += (tx - brush.x) * k;
            brush.y += (ty - brush.y) * k;
            const moved = Math.hypot(brush.x - px, brush.y - py) / f;
            brush.v += (moved - brush.v) * 0.2;
            const target = clamp(base * (1.2 - brush.v * 0.05), base * 0.35, base * 1.2);
            brush.w += (target - brush.w) * (1 - Math.pow(0.88, f));
            const last = cur?.[cur.length - 1];
            if (cur && (!last || Math.hypot(brush.x - last.x, brush.y - last.y) >= 1.2)) {
              cur.push({ x: brush.x, y: brush.y, w: brush.w, t: now });
            }
          } else {
            brush.on = false;
            cur = null;
          }

          /* --- render --- */
          c.clearRect(0, 0, w, h);
          c.lineCap = "round";
          c.lineJoin = "round";

          for (let si = 0; si < strokes.length; si++) {
            const s = strokes[si];
            while (s.length && now - s[0].t > LIFE) s.shift();
          }
          for (let si = strokes.length - 1; si >= 0; si--) {
            if (!strokes[si].length && strokes[si] !== cur) strokes.splice(si, 1);
          }

          for (const s of strokes) {
            const n = s.length;
            if (n < 2) continue;
            // deterministic liquid sag: older ink slowly runs downward and thins out
            const q: Q[] = s.map((p) => {
              const age = clamp((now - p.t) / LIFE, 0, 1);
              return { x: p.x, y: p.y + age * age * 22, w: p.w * (1 - age * 0.55), age };
            });
            for (let i = 1; i < n; i++) {
              const a = q[i - 1];
              const b = q[i];
              const v = Math.round(255 * Math.pow(1 - a.age, 1.4));
              c.strokeStyle = `rgb(${v},${v},${v})`;
              c.lineWidth = a.w;
              const m0 = i >= 2 ? mid(q[i - 2], a) : a;
              const m1 = mid(a, b);
              c.beginPath();
              c.moveTo(m0.x, m0.y);
              c.quadraticCurveTo(a.x, a.y, m1.x, m1.y);
              c.stroke();
              if (i === n - 1) {
                const bv = Math.round(255 * Math.pow(1 - b.age, 1.4));
                c.strokeStyle = `rgb(${bv},${bv},${bv})`;
                c.lineWidth = b.w;
                c.beginPath();
                c.moveTo(m1.x, m1.y);
                c.lineTo(b.x, b.y);
                c.stroke();
              }
            }
          }

          // ink bead at the nib
          if (brush.on) {
            c.fillStyle = "rgb(255,255,255)";
            c.beginPath();
            c.arc(brush.x, brush.y, brush.w * 0.5, 0, Math.PI * 2);
            c.fill();
          }
        };
        gsap.ticker.add(tick);

        let gone = false;
        const detach = () => {
          root.style.touchAction = "pan-y";
          root.style.cursor = "";
        };
        return {
          ttl: 8,
          stop: (done) => {
            detach();
            gsap.to(fx, { opacity: 0, duration: 0.7, ease: "power2.out", onComplete: done });
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            detach();
            gsap.ticker.remove(tick);
            fx.style.mixBlendMode = "";
            wipe(fx);
          },
        };
      };

      /* ====================================================================== */
      /*  LIGHTS OUT                                                            */
      /*  The page goes black; the cursor is a flickering torch.                */
      /* ====================================================================== */
      const lights = (): Mode => {
        const { c, w, h } = prep(fx);
        const color = fg();
        const st = { dark: 0 };
        const darken = gsap.to(st, { dark: 1, duration: 0.5, ease: "power2.out" });
        const torch = { x: w / 2, y: h / 2 };
        const R = clamp(fontPx * 1.7, 150, 300);
        let t = 0;

        const tick = (_: number, dt: number) => {
          const f = Math.min(dt / 16.67, 2.5);
          t += dt / 1000;
          const r = root.getBoundingClientRect();
          let tx: number;
          let ty: number;
          if (ptr.x > -1000) {
            tx = ptr.x - r.left;
            ty = ptr.y - r.top;
          } else {
            // no cursor (touch / idle): sweep slowly across the name
            tx = w / 2 + Math.sin(t * 0.9) * w * 0.28;
            ty = h / 2 + Math.sin(t * 1.7) * fontPx * 0.5;
          }
          torch.x += (tx - torch.x) * Math.min(1, 0.14 * f);
          torch.y += (ty - torch.y) * Math.min(1, 0.14 * f);
          const flick = 1 + Math.sin(t * 23) * 0.012 + Math.sin(t * 7.3) * 0.02;
          const rad = R * flick;

          c.globalCompositeOperation = "source-over";
          c.clearRect(0, 0, w, h);
          c.globalAlpha = st.dark;
          c.fillStyle = color;
          c.fillRect(0, 0, w, h);
          c.globalAlpha = 1;
          c.globalCompositeOperation = "destination-out";
          const g = c.createRadialGradient(torch.x, torch.y, 0, torch.x, torch.y, rad);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(0.5, "rgba(0,0,0,0.92)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = g;
          c.fillRect(torch.x - rad, torch.y - rad, rad * 2, rad * 2);
          c.globalCompositeOperation = "source-over";
        };
        gsap.ticker.add(tick);

        let gone = false;
        return {
          ttl: 9,
          stop: (done) => {
            darken.kill();
            gsap.to(st, { dark: 0, duration: 0.6, ease: "power2.out", onComplete: done });
          },
          dispose: () => {
            if (gone) return;
            gone = true;
            darken.kill();
            gsap.ticker.remove(tick);
            wipe(fx);
          },
        };
      };

      /* ---------- mode controller: one effect at a time ---------- */
      const factories: Record<CmdId, () => Promise<Mode> | Mode> = {
        zerog,
        shatter,
        dissolve,
        glitch,
        warp,
        draw,
        lights,
      };

      const end = () => {
        if (!active || working) return;
        const m = active;
        working = true;
        autoEnd?.kill();
        setMode(null);
        m.stop(() => {
          m.dispose();
          active = null;
          working = false;
          if (!dead) say("");
        });
      };

      const run = async (id: CmdId) => {
        const cmd = COMMANDS.find((c) => c.id === id);
        if (!cmd) return;
        if (reduced) {
          say("Reduced motion is on, so effects are switched off.");
          return;
        }
        if (!ready) {
          say("One moment.");
          return;
        }
        if (active || working) {
          say("One at a time. Press Esc to reset.");
          return;
        }
        working = true;
        say(cmd.reply);
        gsap.to(chars, { y: 0, duration: 0.3, overwrite: "auto" });
        let m: Mode | null = null;
        try {
          m = await factories[id]();
        } catch {
          m = null;
        }
        if (dead) {
          m?.dispose();
          return;
        }
        working = false;
        if (!m) {
          say("That one isn't available right now.");
          return;
        }
        active = m;
        setMode(id);
        autoEnd = gsap.delayedCall(m.ttl, end);
      };

      apiRef.current = {
        run,
        end,
        unknown: (text) => {
          const short = text.length > 18 ? `${text.slice(0, 18)}…` : text;
          say(`No command for “${short}”. Click the box to see what's available.`);
          gsap.fromTo(promptEl, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.35)" });
        },
        pause: (paused) => {
          held = paused;
          if (paused) cycle?.pause();
          else cycle?.play();
        },
      };

      /* ---------- keyboard ---------- */
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const tag = (e.target as HTMLElement | null)?.tagName;
        const typing = tag === "INPUT" || tag === "TEXTAREA";
        if (e.key === "Escape") end();
        if (typing) return;
        if (e.key === "/") {
          e.preventDefault();
          input.focus();
        }
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      };
      window.addEventListener("keydown", onKey);

      /* ---------- name wave ---------- */
      const charY = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.5, ease: "power3" }));
      const onMove = (e: PointerEvent) => {
        ptr.x = e.clientX;
        ptr.y = e.clientY;
        if (reduced || active || working) return;
        const s = fontPx * 1.1;
        chars.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const k = Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
          charY[i](-fontPx * 0.1 * k);
        });
      };
      const onLeave = () => {
        ptr.x = ptr.y = -9999;
        gsap.to(chars, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);

      /* ---------- resize: refresh metrics, end any effect on width change ---------- */
      let lastW = root.clientWidth;
      const onResize = () => {
        fontPx = parseFloat(getComputedStyle(h1).fontSize) || 64;
        if (root.clientWidth !== lastW) {
          lastW = root.clientWidth;
          end();
        }
      };
      window.addEventListener("resize", onResize);

      /* ---------- placeholder cycles through example prompts ---------- */
      let ph = 0;
      const phLoop = () => {
        phCall = gsap.delayedCall(3.4, () => {
          if (document.activeElement !== input && !input.value) {
            ph = (ph + 1) % PLACEHOLDERS.length;
            phTween?.kill();
            phTween = scramble(
              () => input.placeholder,
              (s) => {
                input.placeholder = s;
              },
              PLACEHOLDERS[ph],
              0.7,
              4
            );
          }
          phLoop();
        });
      };

      /* ---------- scroll drift: the hero eases up and fades as you leave it ---------- */
      const driftY = gsap.quickTo(drift, "y", { duration: 0.5, ease: "power3" });
      const driftO = gsap.quickTo(drift, "opacity", { duration: 0.5, ease: "power3" });
      const onScroll = () => {
        const r = root.getBoundingClientRect();
        const s = clamp(-r.top, 0, r.height);
        driftY(s * 0.18);
        driftO(clamp(1 - s / (r.height * 0.7), 0, 1));
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      /* ---------- entrance ---------- */
      if (reduced) {
        gsap.set(masks, { overflow: "visible" });
      } else {
        gsap.set(chars, { yPercent: 115 });
        gsap.set("[data-fade]", { y: 14, opacity: 0 });
      }

      const intro = () => {
        if (reduced) return;
        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            onComplete: () => {
              gsap.set(masks, { overflow: "visible" }); // let the wave lift letters freely
              ready = true;
              restart();
              phLoop();
            },
          })
          .to(chars, { yPercent: 0, duration: 1.3, stagger: 0.045 })
          .to("[data-fade]", { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, "-=0.8");
      };
      document.fonts.ready.then(() => {
        if (!dead) ctx.add(intro);
      });

      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        autoEnd?.kill();
        active?.dispose();
        cycle?.kill();
        phCall?.kill();
        titleTween?.kill();
        replyTween?.kill();
        phTween?.kill();
        apiRef.current = null;
      };
    }, root);

    return () => {
      dead = true;
      shardStyle.remove();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground antialiased"
      style={{ touchAction: "pan-y" }}
    >
      {/* Warp starfield (behind the words) */}
      <canvas
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 size-full"
      />

      {/* Content */}
      <div
        ref={driftRef}
        className="pointer-events-none relative z-10 flex w-full flex-col items-center px-5"
      >
        <h1
          ref={nameRef}
          aria-label={NAME}
          className="select-none whitespace-nowrap font-normal leading-none"
          style={{
            fontFamily: display.style.fontFamily,
            fontSize: "clamp(2.75rem, 11vw, 9rem)",
            fontWeight: 500,
            letterSpacing: "-0.055em",
          }}
        >
          {NAME.split("").map((char, i) => (
            <span
              key={i}
              data-mask
              aria-hidden="true"
              className={`-mx-[0.05em] -mb-[0.2em] -mt-[0.1em] inline-block overflow-hidden px-[0.05em] pb-[0.2em] pt-[0.1em] align-bottom ${
                i < FIRST.length ? "text-foreground" : "text-foreground/80"
              }`}
            >
              <span data-char className="inline-block will-change-transform">
                {char === " " ? "\u00A0" : char}
              </span>
            </span>
          ))}
        </h1>

        <p
          ref={subRef}
          data-fade
          className="mt-5 whitespace-pre text-sm text-muted-foreground md:mt-6 md:text-base"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span ref={titleRef}>{ROLES[0]}</span>
        </p>

        {/* Prompt */}
        <div
          ref={promptRef}
          data-fade
          data-ui
          className="pointer-events-auto relative mt-10 w-full max-w-lg md:mt-12"
          style={{ fontFamily: "var(--font-body)" }}
          onFocus={() => apiRef.current?.pause(true)}
          onBlur={() => apiRef.current?.pause(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 py-2 pl-4 pr-2 backdrop-blur-md transition-colors focus-within:border-foreground/40"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setIdx(0);
                navigated.current = false;
              }}
              onKeyDown={onKeyDown}
              onFocus={() => {
                window.clearTimeout(blurTimer.current);
                navigated.current = false;
                // open upward if there isn't room below the prompt
                const r = promptRef.current?.getBoundingClientRect();
                if (r) {
                  const below = window.innerHeight - r.bottom;
                  setUp(below < 320 && r.top > below);
                }
                setFocused(true);
              }}
              onBlur={() => {
                blurTimer.current = window.setTimeout(() => setFocused(false), 120);
              }}
              placeholder="Pick an effect…"
              aria-label="Type or pick a command"
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground md:text-base"
            />
            <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:block">
              /
            </kbd>
            <button
              type="submit"
              aria-label="Run"
              className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-primary text-background transition-opacity ${
                value.trim() ? "opacity-100" : "opacity-40"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>

          {/* Options: shown as soon as the box is clicked, filtered as you type */}
          {open && (
            <div
              ref={popRef}
              role="listbox"
              aria-label="Effects"
              className={`absolute inset-x-0 z-10 rounded-2xl border border-border bg-background p-1.5 ${
                up ? "bottom-full mb-2" : "top-full mt-2"
              }`}
            >
              {!value.trim() && (
                <p className="px-3 pb-1 pt-1.5 text-xs text-muted-foreground">
                  Pick an effect, or type one
                </p>
              )}
              {matches.length ? (
                matches.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => trigger(c)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      i === active ? "bg-muted" : ""
                    }`}
                  >
                    <span className="text-foreground">{c.label}</span>
                    <span className="truncate text-xs text-muted-foreground">{c.hint}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No match. Clear the box to see every effect.
                </p>
              )}
            </div>
          )}
        </div>

        <p
          ref={replyRef}
          aria-live="polite"
          className="mt-4 min-h-5 w-full max-w-lg text-center text-xs text-muted-foreground md:text-sm"
          style={{ fontFamily: "var(--font-body)" }}
        />
      </div>

      {/* Overlay canvas (above the content): dissolve, glitch, draw, lights out, cracks */}
      <canvas
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 size-full"
      />

      {/* Reset pill (only while an effect is running) */}
      {mode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center md:bottom-8">
          <button
            ref={pillRef}
            data-ui
            type="button"
            onClick={() => apiRef.current?.end()}
            className="pointer-events-auto cursor-pointer rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-md"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reset <span className="ml-2 text-muted-foreground">Esc</span>
          </button>
        </div>
      )}
    </section>
  );
}