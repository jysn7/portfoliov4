"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";

/* -------------------------------------------------------------------------- */
/*  SVG icons (self-contained, no dependencies)                               */
/* -------------------------------------------------------------------------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 48 48" className="size-full" aria-hidden="true">
    {children}
  </svg>
);

const Tile = ({
  bg,
  fg,
  label,
  size = 20,
  border,
}: {
  bg: string;
  fg: string;
  label: string;
  size?: number;
  border?: string;
}) => (
  <Svg>
    <rect
      x="2"
      y="2"
      width="44"
      height="44"
      rx="10"
      fill={bg}
      stroke={border ?? "none"}
      strokeWidth="2"
    />
    <text
      x="24"
      y={24 + size * 0.35}
      textAnchor="middle"
      fontSize={size}
      fontWeight="700"
      fill={fg}
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {label}
    </text>
  </Svg>
);

const Line = ({ children }: { children: ReactNode }) => (
  <Svg>
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  </Svg>
);

const Icons = {
  // Adobe + design
  Ps: <Tile bg="#001e36" fg="#31a8ff" border="#31a8ff" label="Ps" size={22} />,
  Id: <Tile bg="#49021f" fg="#ff3366" border="#ff3366" label="Id" size={22} />,
  Ai: <Tile bg="#330000" fg="#ff9a00" border="#ff9a00" label="Ai" size={22} />,
  Figma: (
    <Svg>
      <g transform="translate(10.7 4) scale(0.7)">
        <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1abcfe" />
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0acf83" />
        <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#ff7262" />
        <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#f24e1e" />
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#a259ff" />
      </g>
    </Svg>
  ),
  Blender: (
    <Svg>
      <path d="M4 26l16-7" stroke="#ea7600" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M8 34h13" stroke="#ea7600" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="30" cy="27" r="13" fill="none" stroke="#ea7600" strokeWidth="6" />
      <circle cx="30" cy="27" r="6" fill="#265787" />
      <circle cx="30" cy="27" r="2.5" fill="#ffffff" />
    </Svg>
  ),

  // Engineering
  Next: (
    <Svg>
      <circle cx="24" cy="24" r="20" className="fill-foreground" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        className="fill-background"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        N
      </text>
    </Svg>
  ),
  React: (
    <Svg>
      <g fill="none" stroke="#61dafb" strokeWidth="2.5">
        <ellipse cx="24" cy="24" rx="20" ry="7.5" />
        <ellipse cx="24" cy="24" rx="20" ry="7.5" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="20" ry="7.5" transform="rotate(120 24 24)" />
      </g>
      <circle cx="24" cy="24" r="3.6" fill="#61dafb" />
    </Svg>
  ),
  TypeScript: <Tile bg="#3178c6" fg="#ffffff" label="TS" size={20} />,
  Node: (
    <Svg>
      <polygon points="24,3 42,13.500 42,34.500 24,45 6,34.500 6,13.500" fill="#5fa04e" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#ffffff"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        JS
      </text>
    </Svg>
  ),
  Python: (
    <Svg>
      <path
        d="M24 5c-9 0-8.500 4-8.500 4v4.500H24V15H11S5 14.500 5 24s5.500 9 5.500 9H14v-4.500s-.3-5.500 5.500-5.500H29s5.500.1 5.500-5.300V10S35.500 5 24 5z"
        fill="#3776ab"
      />
      <circle cx="19" cy="10.500" r="1.600" fill="#ffffff" />
      <g transform="rotate(180 24 24)">
        <path
          d="M24 5c-9 0-8.500 4-8.500 4v4.500H24V15H11S5 14.500 5 24s5.500 9 5.500 9H14v-4.500s-.3-5.500 5.500-5.500H29s5.500.1 5.500-5.300V10S35.500 5 24 5z"
          fill="#ffd43b"
        />
        <circle cx="19" cy="10.500" r="1.600" fill="#ffffff" />
      </g>
    </Svg>
  ),

  // Web
  Gsap: <Tile bg="#0ae448" fg="#0e100f" label="GSAP" size={13} />,
  Tailwind: (
    <Svg>
      <g transform="translate(0 0) scale(2)">
        <path
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
          fill="#06b6d4"
        />
      </g>
    </Svg>
  ),
  JavaScript: <Tile bg="#f7df1e" fg="#000000" label="JS" size={20} />,
  Css: <Tile bg="#264de4" fg="#ffffff" label="CSS" size={15} />,
  Html: <Tile bg="#e34f26" fg="#ffffff" label="HTML" size={13} />,

  // Screenwriting
  Clapper: (
    <Line>
      <rect x="7" y="22" width="34" height="19" rx="3" />
      <path d="M7 22l-1.500-9 34-5.500 1.500 9" />
      <path d="M15 15.500l4.500 6M25 14l4.500 6M35 12.500l4 6" />
    </Line>
  ),
  Reel: (
    <Line>
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="3" />
      <circle cx="24" cy="12.500" r="3" />
      <circle cx="24" cy="35.500" r="3" />
      <circle cx="12.500" cy="24" r="3" />
      <circle cx="35.500" cy="24" r="3" />
    </Line>
  ),
  Script: (
    <Line>
      <rect x="11" y="5" width="26" height="38" rx="3" />
      <path d="M18 15h12M18 23h12M18 29h12M18 35h7" />
    </Line>
  ),
  Pen: (
    <Line>
      <path d="M8 41l4-12L32 9l7 7-20 20z" />
      <path d="M12 29l7 7M28 13l7 7" />
    </Line>
  ),
  Camera: (
    <Line>
      <rect x="5" y="14" width="27" height="21" rx="4" />
      <path d="M32 22l11-6v17l-11-6z" />
    </Line>
  ),

  // Data & AI
  PowerBi: (
    <Svg>
      <rect x="7" y="26" width="9" height="16" rx="2" fill="#f2c811" />
      <rect x="19.500" y="16" width="9" height="26" rx="2" fill="#e8a800" />
      <rect x="32" y="6" width="9" height="36" rx="2" fill="#f2c811" />
    </Svg>
  ),
  Sql: (
    <Svg>
      <g fill="none" stroke="#29a9d1" strokeWidth="3" strokeLinecap="round">
        <ellipse cx="24" cy="12" rx="15" ry="5.500" />
        <path d="M9 12v24c0 3 6.700 5.500 15 5.500S39 39 39 36V12" />
        <path d="M9 24c0 3 6.700 5.500 15 5.500S39 27 39 24" />
      </g>
    </Svg>
  ),
  Pandas: (
    <Svg>
      <rect x="9" y="6" width="7" height="14" rx="1.500" fill="#ffca00" />
      <rect x="9" y="23" width="7" height="19" rx="1.500" className="fill-foreground" />
      <rect x="20.500" y="12" width="7" height="30" rx="1.500" className="fill-foreground" />
      <rect x="20.500" y="6" width="7" height="3" rx="1.500" fill="#e70488" />
      <rect x="32" y="6" width="7" height="14" rx="1.500" fill="#e70488" />
      <rect x="32" y="23" width="7" height="19" rx="1.500" className="fill-foreground" />
    </Svg>
  ),
  Network: (
    <Svg>
      <g stroke="#ff6f00" strokeWidth="1.800" opacity="0.7">
        <path d="M10 15L24 10M10 15L24 24M10 15L24 38M10 33L24 10M10 33L24 24M10 33L24 38" />
        <path d="M24 10L38 24M24 24L38 24M24 38L38 24" />
      </g>
      <g fill="#ff6f00">
        <circle cx="10" cy="15" r="4" />
        <circle cx="10" cy="33" r="4" />
        <circle cx="24" cy="10" r="4" />
        <circle cx="24" cy="24" r="4" />
        <circle cx="24" cy="38" r="4" />
        <circle cx="38" cy="24" r="4.500" />
      </g>
    </Svg>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

type Mark = { accent: string; icon: ReactNode };
type Role = { title: string; marks: Mark[] };

const ROLES: Role[] = [
  {
    title: "Software Engineer",
    marks: [
      { accent: "#31a8ff", icon: Icons.Ps },
      { accent: "#ff3366", icon: Icons.Id },
      { accent: "#ff9a00", icon: Icons.Ai },
      { accent: "#a259ff", icon: Icons.Figma },
      { accent: "#ea7600", icon: Icons.Blender },
    ],
  },
  {
    title: "CS Student",
    marks: [
      { accent: "#888888", icon: Icons.Next },
      { accent: "#61dafb", icon: Icons.React },
      { accent: "#3178c6", icon: Icons.TypeScript },
      { accent: "#5fa04e", icon: Icons.Node },
      { accent: "#ffd43b", icon: Icons.Python },
    ],
  },
  {
    title: "Web Developer",
    marks: [
      { accent: "#0ae448", icon: Icons.Gsap },
      { accent: "#06b6d4", icon: Icons.Tailwind },
      { accent: "#f7df1e", icon: Icons.JavaScript },
      { accent: "#264de4", icon: Icons.Css },
      { accent: "#e34f26", icon: Icons.Html },
    ],
  },
  {
    title: "Screenwriter",
    marks: [
      { accent: "#f5c542", icon: Icons.Clapper },
      { accent: "#f97316", icon: Icons.Reel },
      { accent: "#a3a3a3", icon: Icons.Script },
      { accent: "#7c3aed", icon: Icons.Pen },
      { accent: "#ef4444", icon: Icons.Camera },
    ],
  },
  {
    title: "Data & AI Builder",
    marks: [
      { accent: "#f2c811", icon: Icons.PowerBi },
      { accent: "#3776ab", icon: Icons.Python },
      { accent: "#29a9d1", icon: Icons.Sql },
      { accent: "#e70488", icon: Icons.Pandas },
      { accent: "#ff6f00", icon: Icons.Network },
    ],
  },
];

const NAME = "Jayson Baloyi";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&/<>_";
const SLOT_COUNT = ROLES[0].marks.length;
const CENTER = Math.floor(SLOT_COUNT / 2);
const AUTO_DELAY = 4;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const hireRef = useRef<HTMLAnchorElement>(null);

  // content[slot][face] = which role's icon that face renders
  const [content, setContent] = useState<number[][]>(() =>
    Array.from({ length: SLOT_COUNT }, () => [0, 1])
  );

  useEffect(() => {
    const root = rootRef.current;
    const titleEl = titleRef.current;
    const row = rowRef.current;
    const layer = layerRef.current;
    const hire = hireRef.current;
    if (!root || !titleEl || !row || !layer || !hire) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", root);
      const inners = slots.map((s) => s.querySelector<HTMLElement>("[data-inner]")!);
      const faces = slots.map((s) => Array.from(s.querySelectorAll<HTMLElement>("[data-face]")));
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", root);
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root);
      const masks = gsap.utils.toArray<HTMLElement>("[data-mask]", root);

      // 3D setup
      slots.forEach((s) => gsap.set(s, { transformPerspective: 700, force3D: true }));
      inners.forEach((el) => gsap.set(el, { transformStyle: "preserve-3d", force3D: true }));
      faces.forEach(([front, back]) => {
        gsap.set([front, back], { backfaceVisibility: "hidden" });
        gsap.set(back, { rotationX: 180 });
      });
      gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });

      const flips = slots.map(() => 0);
      const angle = slots.map(() => 0);
      let current = 0;
      let busy = false;
      let progress: gsap.core.Tween | null = null;
      let titleTween: gsap.core.Tween | null = null;

      /* ---------- character-by-character title morph ---------- */
      const scrambleTitle = (to: string) => {
        titleTween?.kill();
        const from = titleEl.textContent ?? "";
        const len = Math.max(from.length, to.length);
        const lag = 6;
        const state = { p: 0 };

        titleTween = gsap.to(state, {
          p: len + lag,
          duration: reduced ? 0.01 : 1.2,
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
            titleEl.textContent = out;
          },
          onComplete: () => {
            titleEl.textContent = to;
          },
        });
      };

      /* ---------- particle burst ---------- */
      const burst = (index: number, color: string) => {
        const layerRect = layer.getBoundingClientRect();
        const r = slots[index].getBoundingClientRect();
        const cx = r.left - layerRect.left + r.width / 2;
        const cy = r.top - layerRect.top + r.height / 2;

        for (let i = 0; i < 14; i++) {
          const p = document.createElement("span");
          p.className = "absolute block size-1.5 rounded-sm";
          p.style.backgroundColor = color;
          p.style.left = `${cx}px`;
          p.style.top = `${cy}px`;
          layer.appendChild(p);

          const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
          const d = 50 + Math.random() * 60;
          gsap.fromTo(
            p,
            { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
            {
              x: Math.cos(a) * d,
              y: Math.sin(a) * d - 10,
              rotation: Math.random() * 360,
              scale: 0,
              opacity: 0,
              duration: 0.9 + Math.random() * 0.4,
              ease: "power3.out",
              onComplete: () => p.remove(),
            }
          );
        }
      };

      /* ---------- flipbook transition ---------- */
      const go = (next: number, origin = CENTER, dir = 1) => {
        if (busy) return;
        busy = true;

        scrambleTitle(ROLES[next].title);

        // write the next icons onto the hidden faces BEFORE flipping
        const hidden = flips.map((f) => (f + 1) % 2);
        flushSync(() =>
          setContent((prev) =>
            prev.map((pair, i) => {
              const copy = [...pair];
              copy[hidden[i]] = next;
              return copy;
            })
          )
        );

        slots.forEach((_, i) => {
          flips[i] += 1;
          angle[i] -= dir * 180;

          const tl = gsap.timeline({ delay: Math.abs(i - origin) * 0.09 });
          tl.to(
            inners[i],
            {
              rotationX: angle[i],
              duration: reduced ? 0.01 : 0.85,
              ease: "power3.inOut",
            },
            0
          ).to(
            inners[i],
            {
              y: -12,
              scale: 1.1,
              duration: 0.42,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
            },
            0
          );
        });

        current = next;
        gsap.delayedCall(1.5, () => {
          busy = false;
        });
      };

      /* ---------- auto-advance driven by the progress bars ---------- */
      const startProgress = () => {
        progress?.kill();
        bars.forEach((b, i) => gsap.set(b, { scaleX: i < current ? 1 : 0 }));
        if (reduced) {
          gsap.set(bars[current], { scaleX: 1 });
          return;
        }
        progress = gsap.fromTo(
          bars[current],
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: AUTO_DELAY,
            ease: "none",
            onComplete: () => {
              go((current + 1) % ROLES.length);
              startProgress();
            },
          }
        );
      };

      const jump = (target: number, origin = CENTER) => {
        if (busy || target === current) return;
        go(target, origin, target > current ? 1 : -1);
        startProgress();
      };

      const step = (dir: 1 | -1, origin = CENTER) => {
        if (busy) return;
        go((current + dir + ROLES.length) % ROLES.length, origin, dir);
        startProgress();
      };

      /* ---------- icon clicks ---------- */
      const slotHandlers = slots.map((slot, i) => {
        const handler = () => {
          if (busy) return;
          burst(i, ROLES[current].marks[i].accent);
          step(1, i);
        };
        slot.addEventListener("click", handler);
        return handler;
      });

      /* ---------- progress bar clicks ---------- */
      const barButtons = gsap.utils.toArray<HTMLElement>("[data-pager]", root);
      const barHandlers = barButtons.map((b, i) => {
        const handler = () => jump(i);
        b.addEventListener("click", handler);
        return handler;
      });

      /* ---------- keyboard ---------- */
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      };
      window.addEventListener("keydown", onKey);

      /* ---------- dock: magnify + tilt, pause on hover ---------- */
      const scaleTo = slots.map((s) => gsap.quickTo(s, "scale", { duration: 0.35, ease: "power3" }));
      const liftTo = slots.map((s) => gsap.quickTo(s, "y", { duration: 0.35, ease: "power3" }));
      const tiltXTo = slots.map((s) => gsap.quickTo(s, "rotationX", { duration: 0.4, ease: "power3" }));
      const tiltYTo = slots.map((s) => gsap.quickTo(s, "rotationY", { duration: 0.4, ease: "power3" }));

      const onRowMove = (e: PointerEvent) => {
        const rr = row.getBoundingClientRect();
        slots.forEach((s, i) => {
          const cx = rr.left + s.offsetLeft + s.offsetWidth / 2;
          const cy = rr.top + s.offsetTop + s.offsetHeight / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const k = Math.exp(-(dx * dx) / (2 * 70 * 70));
          scaleTo[i](1 + 0.5 * k);
          liftTo[i](-14 * k);
          tiltYTo[i](clamp(dx / s.offsetWidth, -1, 1) * 20 * k);
          tiltXTo[i](-clamp(dy / s.offsetHeight, -1.5, 1.5) * 16 * k);
        });
      };
      const onRowEnter = () => progress?.pause();
      const onRowLeave = () => {
        progress?.play();
        gsap.to(slots, {
          scale: 1,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.45)",
          overwrite: "auto",
        });
      };
      row.addEventListener("pointermove", onRowMove);
      row.addEventListener("pointerenter", onRowEnter);
      row.addEventListener("pointerleave", onRowLeave);

      /* ---------- name wave + magnetic button ---------- */
      const charY = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.45, ease: "power3" }));
      const hx = gsap.quickTo(hire, "x", { duration: 0.4, ease: "power3" });
      const hy = gsap.quickTo(hire, "y", { duration: 0.4, ease: "power3" });

      const onRootMove = (e: PointerEvent) => {
        if (!reduced) {
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const k = Math.exp(-(dx * dx + dy * dy) / (2 * 90 * 90));
            charY[i](-8 * k);
          });
        }

        const hr = hire.getBoundingClientRect();
        const hdx = e.clientX - (hr.left + hr.width / 2);
        const hdy = e.clientY - (hr.top + hr.height / 2);
        if (Math.hypot(hdx, hdy) < 140) {
          hx(hdx * 0.35);
          hy(hdy * 0.35);
        } else {
          hx(0);
          hy(0);
        }
      };
      const onRootLeave = () => {
        gsap.to(chars, { y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
        gsap.to(hire, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      };
      root.addEventListener("pointermove", onRootMove);
      root.addEventListener("pointerleave", onRootLeave);

      /* ---------- entrance ---------- */
      if (reduced) {
        gsap.set(masks, { overflow: "visible" });
      } else {
        const intro = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            gsap.set(masks, { overflow: "visible" }); // let the wave lift letters freely
          },
        });
        intro
          .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.035 })
          .from("[data-sub]", { y: 14, opacity: 0, duration: 0.8 }, "-=0.7")
          .from(
            slots,
            {
              opacity: 0,
              y: 32,
              scale: 0.5,
              duration: 0.9,
              stagger: 0.08,
              ease: "back.out(1.7)",
              clearProps: "opacity",
            },
            "-=0.5"
          )
          .from("[data-pager]", { opacity: 0, duration: 0.8, stagger: 0.05 }, "-=0.4")
          .from(hire, { y: 36, opacity: 0, duration: 0.9 }, "-=0.8");
      }

      startProgress();

      return () => {
        slots.forEach((s, i) => s.removeEventListener("click", slotHandlers[i]));
        barButtons.forEach((b, i) => b.removeEventListener("click", barHandlers[i]));
        window.removeEventListener("keydown", onKey);
        row.removeEventListener("pointermove", onRowMove);
        row.removeEventListener("pointerenter", onRowEnter);
        row.removeEventListener("pointerleave", onRowLeave);
        root.removeEventListener("pointermove", onRootMove);
        root.removeEventListener("pointerleave", onRootLeave);
        progress?.kill();
        titleTween?.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground"
    >
      {/* Name */}
      <h1
        aria-label={NAME}
        className="text-3xl font-semibold tracking-tight md:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {NAME.split("").map((char, i) => (
          <span
            key={i}
            data-mask
            aria-hidden="true"
            className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
          >
            <span data-char className="inline-block will-change-transform">
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        ))}
      </h1>

      {/* Morphing title */}
      <p
        data-sub
        className="mt-2 whitespace-pre text-sm text-muted-foreground md:text-base"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {"I’m "}
        <span ref={titleRef} className="text-foreground">
          {ROLES[0].title}
        </span>
      </p>

      {/* Flipbook icon dock */}
      <div ref={rowRef} className="relative mt-3 flex items-center gap-3 px-6 py-4">
        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
          <button
            key={i}
            data-slot
            type="button"
            aria-label="Flip to next role"
            className="relative size-11 cursor-pointer will-change-transform md:size-14"
          >
            <div data-inner className="relative size-full will-change-transform">
              {[0, 1].map((face) => (
                <div key={face} data-face className="absolute inset-0 text-foreground">
                  {ROLES[content[i][face]].marks[i].icon}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Pager (progress + navigation) */}
      <div className="mt-0 flex items-center gap-2">
        {ROLES.map((role) => (
          <button
            key={role.title}
            data-pager
            type="button"
            aria-label={`Show ${role.title}`}
            className="cursor-pointer py-3"
          >
            <span className="block h-0.5 w-8 overflow-hidden bg-border md:w-10">
              <span
                data-bar
                className="block h-full bg-foreground"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* Particle layer */}
      <div ref={layerRef} className="pointer-events-none absolute inset-0" />

      {/* Hire Me */}
      <a
        ref={hireRef}
        href="#contact"
        className="absolute bottom-6 right-6 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background md:bottom-8 md:right-8"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Hire Me
      </a>
    </section>
  );
}