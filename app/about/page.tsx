'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Flip } from 'gsap/dist/Flip';
import { ArrowUpRight, Download, Mail, MapPin, Copy, Check } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const HEADING = { fontFamily: 'var(--font-heading)' } as const;
const BODY = { fontFamily: 'var(--font-body)' } as const;

const WRAP = 'max-w-360';
const HERO_HEIGHT = '84svh';

const HERO_TEXT = 'a little more about me:)';

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */
type TimelineEvent = { title: string; text: string; tags?: string[] };
type TimelineYear = { year: string; now?: boolean; events: TimelineEvent[] };

const TIMELINE: TimelineYear[] = [
  {
    year: '2024',
    events: [
      {
        title: 'Started my Computer Science degree',
        text: 'Began a BSc in Computer Science at Eduvos in Gauteng, studying the theory alongside building real projects.',
        tags: ['Eduvos', 'BSc Computer Science'],
      },
      {
        title: 'Started freelancing',
        text: 'Began taking on freelance web design and development work alongside my studies.',
        tags: ['Freelance', 'Web design', 'Web development'],
      },
    ],
  },
  {
    year: '2025',
    events: [
      {
        title: 'Founded MonoStudios',
        text: 'Launched my own web design and development studio. Work since includes a jewellery brand, a spa demo, a painting company and a renovations company.',
        tags: ['MonoStudios', 'Next.js', 'GSAP'],
      },
      {
        title: 'Won the BASE x Eduvos Hackathon',
        text: 'Took the win at the BASE x Eduvos Hackathon.',
        tags: ['Hackathon', 'Winner'],
      },
      {
        title: 'Top 10 at HACKJAM 2025',
        text: 'Placed in the top ten at HACKJAM 2025.',
        tags: ['HACKJAM'],
      },
    ],
  },
  {
    year: '2026',
    now: true,
    events: [
      {
        title: 'Final year',
        text: 'Graduating this year with a BSc in Computer Science, and looking for internships and graduate programmes in software engineering.',
        tags: ['Graduating 2026', 'Software engineering'],
      },
      {
        title: 'Leading TYGA, building Velo',
        text: 'Team leader on TYGA, a junior golf development platform with client, coach and admin portals. Also building Velo, a project management SaaS, and this portfolio.',
        tags: ['TYGA', 'Velo', 'Next.js'],
      },
    ],
  },
];

const STACK = [
  { label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind'] },
  { label: 'Motion and 3D', items: ['GSAP', 'Three.js', 'WebGL'] },
  { label: 'Design', items: ['Figma'] },
  { label: 'Backend', items: ['Supabase', 'PHP', 'MySQL', 'Payload CMS'] },
];

const VALUES = [
  {
    title: 'Craft over noise',
    body: 'Fewer, better things. Every pixel and every millisecond of animation earns its place.',
    file: 'craft.txt',
    glyph: ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'],
  },
  {
    title: 'Play is research',
    body: 'The experiments, the odd little side projects, the games. They teach the client work how to be bolder.',
    file: 'play.txt',
    glyph: ['...#...', '..###..', '#######', '.#####.', '.##.##.', '.#...#.', '#.....#'],
  },
  {
    title: 'Build for people',
    body: 'Accessible by default, fast by default, and pleasant to use even on the worst phone on the worst network.',
    file: 'people.txt',
    glyph: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  },
];

/* ------------------------------------------------------------------ */
/* Shared class strings                                                */
/* ------------------------------------------------------------------ */
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
const BTN = `inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-foreground text-background hover:bg-foreground/85`;
const BTN_MUTED = `${BTN} bg-muted text-foreground hover:bg-foreground hover:text-background`;
const BTN_OUTLINE = `${BTN} border border-border text-foreground hover:border-foreground`;
const CHIP = 'rounded-lg border border-border px-3 py-1 text-xs text-foreground';
const SECTION = 'w-full border-t border-border px-4 py-16 md:px-8 md:py-24';
const INNER = `mx-auto w-full ${WRAP}`;

/* ------------------------------------------------------------------ */
/* Flipbook button                                                     */
/* ------------------------------------------------------------------ */
const FLIP_COLOURS = ['bg-pink', 'bg-blue', 'bg-primary', 'bg-foreground'];

function FlipbookButton({
  href,
  download,
  children,
  icon,
}: {
  href: string;
  download?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cellsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = ref.current;
    const cellsWrap = cellsRef.current;
    if (!btn || !cellsWrap) return;
    if (reduced()) return;

    let tl: gsap.core.Timeline | null = null;

    const shuffle = () => {
      tl?.kill();
      const current = gsap.utils.toArray<HTMLElement>('[data-cell]', cellsWrap);
      const state = Flip.getState(current);

      const pool = [...FLIP_COLOURS];
      const order: string[] = [];
      while (order.length < current.length) {
        const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0] ?? FLIP_COLOURS[0];
        order.push(pick);
      }

      current.forEach((el, i) => {
        el.className = `absolute inset-0 ${order[i]}`;
      });

      tl = Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        stagger: 0.05,
        absolute: true,
      });
    };

    btn.addEventListener('pointerenter', shuffle);
    btn.addEventListener('focus', shuffle);

    return () => {
      tl?.kill();
      btn.removeEventListener('pointerenter', shuffle);
      btn.removeEventListener('focus', shuffle);
    };
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      download={download}
      className={`${BTN} relative isolate overflow-hidden bg-foreground text-background hover:text-background`}
    >
      <span
        ref={cellsRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
      >
        <span data-cell className="absolute inset-0 hover:bg-foreground" />
        <span data-cell className="absolute inset-0 hover:bg-pink" />
        <span data-cell className="absolute inset-0 hover:bg-blue" />
        <span data-cell className="absolute inset-0 hover:bg-primary" />
      </span>
      <span className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Pixel glyph                                                         */
/* ------------------------------------------------------------------ */
function PixelGlyph({ rows }: { rows: string[] }) {
  return (
    <svg viewBox="0 0 7 7" className="size-8" shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        row
          .split('')
          .map((c, x) =>
            c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null
          )
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Split heading                                                       */
/* ------------------------------------------------------------------ */
function SplitHeading({ text, className }: { text: string; className: string }) {
  return (
    <h2 aria-label={text} className={className} style={HEADING}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          data-hmask
          aria-hidden="true"
          className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
        >
          <span data-hchar className="inline-block will-change-transform">
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </h2>
  );
}

function SectionHead({ title, note, action }: { title: string; note?: string; action?: ReactNode }) {
  return (
    <header
      data-header
      className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-12"
    >
      <div>
        <SplitHeading text={title} className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl" />
        {note && (
          <p
            data-sub
            className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
            style={HEADING}
          >
            {note}
          </p>
        )}
      </div>
      {action && <div data-sub>{action}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Halftone print filter                                               */
/* ------------------------------------------------------------------ */
const DOT = { small: 6, large: 8 };
const ANGLE_A = 15;
const ANGLE_B = 75;
const MISREGISTER: [number, number] = [2.5, -1.5];
const LENS_SIZE = 0.3;

const LENS_MASK =
  'radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 50%), transparent 0, transparent calc(var(--r, 0px) * 0.7), #000 var(--r, 0px))';

const resolveToken = (host: HTMLElement, token: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  host.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

function HalftoneImage({
  src,
  alt,
  caption,
  className = '',
}: {
  src: string | StaticImageData;
  alt: string;
  caption?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLCanvasElement>(null);
  const url = typeof src === 'string' ? src : src.src;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = printRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;
    const rm = reduced();

    const lens = { x: 0, y: 0, r: 0 };
    const apply = () => {
      canvas.style.setProperty('--x', `${lens.x}px`);
      canvas.style.setProperty('--y', `${lens.y}px`);
      canvas.style.setProperty('--r', `${lens.r}px`);
    };
    apply();

    let ready = false;
    let shown = false;
    let raf = 0;
    let touched = false;
    let sweep: gsap.core.Timeline | null = null;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    const draw = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!ready || !w || !h) return;

      const paper = resolveToken(wrap, '--background');
      const inkA = resolveToken(wrap, '--foreground');
      const inkB = resolveToken(wrap, '--primary');

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);

      const sw = Math.max(48, Math.round(w / 3));
      const sh = Math.max(48, Math.round(h / 3));
      const sc = document.createElement('canvas');
      sc.width = sw;
      sc.height = sh;
      const sctx = sc.getContext('2d', { willReadFrequently: true });
      let data: Uint8ClampedArray | null = null;
      if (sctx) {
        const s = Math.max(sw / img.naturalWidth, sh / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        sctx.drawImage(img, (sw - dw) / 2, (sh - dh) / 2, dw, dh);
        try {
          data = sctx.getImageData(0, 0, sw, sh).data;
        } catch {
          data = null;
        }
      }
      const luma = (x: number, y: number) => {
        if (!data) return 0.5;
        const ix = clamp(Math.floor((x / w) * sw), 0, sw - 1);
        const iy = clamp(Math.floor((y / h) * sh), 0, sh - 1);
        const i = (iy * sw + ix) * 4;
        return (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      };

      const screen = (
        angle: number,
        gap: number,
        ink: string,
        offX: number,
        offY: number,
        amount: (l: number) => number
      ) => {
        const a = (angle * Math.PI) / 180;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const half = Math.hypot(w, h) / 2;
        ctx.fillStyle = ink;
        ctx.beginPath();
        for (let v = -half; v <= half; v += gap) {
          for (let u = -half; u <= half; u += gap) {
            const x = w / 2 + u * cos - v * sin + offX;
            const y = h / 2 + u * sin + v * cos + offY;
            if (x < -gap || x > w + gap || y < -gap || y > h + gap) continue;
            const d = amount(luma(x - offX, y - offY));
            if (d <= 0.03) continue;
            const r = gap * 0.74 * Math.sqrt(d);
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      };

      const gap = w < 520 ? DOT.small : DOT.large;
      screen(ANGLE_B, gap * 1.15, inkB, MISREGISTER[0], MISREGISTER[1], (l) =>
        clamp(Math.sin(clamp(1 - l, 0, 1) * Math.PI) * 0.95, 0, 1)
      );
      screen(ANGLE_A, gap, inkA, 0, 0, (l) => clamp(Math.pow(1 - l, 1.25) * 1.1, 0, 1));

      if (!shown) {
        shown = true;
        gsap.to(canvas, { opacity: 1, duration: rm ? 0 : 0.9, ease: 'power2.out' });
      }
    };

    img.onload = () => {
      ready = true;
      draw();
    };
    img.src = url;

    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(redraw);
    ro.observe(wrap);

    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });

    const radius = () => Math.max(90, Math.min(wrap.clientWidth, wrap.clientHeight) * LENS_SIZE);
    const local = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const onEnter = (e: PointerEvent) => {
      touched = true;
      sweep?.kill();
      const p = local(e);
      lens.x = p.x;
      lens.y = p.y;
      gsap.to(lens, { r: radius(), duration: rm ? 0 : 0.5, ease: 'power3.out', overwrite: 'auto', onUpdate: apply });
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      gsap.to(lens, { x: p.x, y: p.y, duration: rm ? 0 : 0.35, ease: 'power3.out', overwrite: 'auto', onUpdate: apply });
    };
    const onLeave = () => {
      gsap.to(lens, { r: 0, duration: rm ? 0 : 0.5, ease: 'power3.out', overwrite: 'auto', onUpdate: apply });
    };
    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (rm || touched) return;
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        lens.x = w * 0.15;
        lens.y = h * 0.3;
        lens.r = 0;
        sweep = gsap
          .timeline({ onUpdate: apply })
          .to(lens, { r: radius(), duration: 0.5, ease: 'power2.out' })
          .to(lens, { x: w * 0.85, y: h * 0.7, duration: 1.6, ease: 'sine.inOut' }, 0.2)
          .to(lens, { r: 0, duration: 0.6, ease: 'power2.in' }, '-=0.5');
      },
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      st.kill();
      sweep?.kill();
      gsap.killTweensOf([lens, canvas]);
      wrap.removeEventListener('pointerenter', onEnter);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [url]);

  return (
    <div
      ref={wrapRef}
      data-scroll
      className={`relative touch-pan-y overflow-hidden rounded-lg border border-border bg-muted ${className}`}
    >
      <Image src={src} alt={alt} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />

      <canvas
        ref={printRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-0"
        style={{ maskImage: LENS_MASK, WebkitMaskImage: LENS_MASK }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-background/85 px-2.5 py-1 text-xs text-foreground backdrop-blur-md"
        style={BODY}
      >
        <span className="flex">
          <span className="size-2.5 rounded-sm bg-foreground" />
          <span className="-ml-1 size-2.5 rounded-sm bg-primary" />
        </span>
        2-colour print
      </span>
      {caption && (
        <span
          className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-background/85 px-3 py-1 text-xs text-foreground backdrop-blur-md"
          style={BODY}
        >
          {caption}
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md"
        style={BODY}
      >
        <span className="[@media(pointer:coarse)]:hidden">hover to reveal</span>
        <span className="hidden [@media(pointer:coarse)]:inline">touch to reveal</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy-email button                                                   */
/* ------------------------------------------------------------------ */
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<gsap.core.Tween | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('hello@monostudios.co.za');
      setCopied(true);
      timer.current?.kill();
      timer.current = gsap.delayedCall(1.8, () => setCopied(false));
    } catch {
      /* clipboard blocked — silent */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      className={`${BTN_OUTLINE} tabular-nums`}
    >
      {copied ? <Check size={14} strokeWidth={2} aria-hidden /> : <Copy size={14} strokeWidth={1.5} aria-hidden />}
      {copied ? 'Copied' : 'hello@monostudios.co.za'}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  const scope = useRef<HTMLElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const main = scope.current;
    if (!main) return;

    const mm = gsap.matchMedia(main);

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      },
      (context) => {
        const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };
        if (!motion) return;

        const hero = main.querySelector<HTMLElement>('[data-hero]')!;
        const heroChars = gsap.utils.toArray<HTMLElement>('[data-char]', main);
        const heroMasks = gsap.utils.toArray<HTMLElement>('[data-mask]', main);

        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => gsap.set(heroMasks, { overflow: 'visible' }),
          })
          .from(heroChars, { yPercent: 115, duration: 1.1, stagger: 0.03 });

        const cleanups: Array<() => void> = [];
        if (hover) {
          const charY = heroChars.map((c) => gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' }));
          const onMove = (e: PointerEvent) => {
            heroChars.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              charY[i](-8 * Math.exp(-(dx * dx + dy * dy) / (2 * 90 * 90)));
            });
          };
          const onLeave = () => {
            gsap.to(heroChars, { y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
          };
          hero.addEventListener('pointermove', onMove);
          hero.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            hero.removeEventListener('pointermove', onMove);
            hero.removeEventListener('pointerleave', onLeave);
          });
        }

        gsap.utils.toArray<HTMLElement>('[data-header]', main).forEach((header) => {
          const chars = header.querySelectorAll<HTMLElement>('[data-hchar]');
          const masks = header.querySelectorAll<HTMLElement>('[data-hmask]');
          const subs = header.querySelectorAll<HTMLElement>('[data-sub]');

          gsap.set(subs, { opacity: 0, y: 14 });
          gsap
            .timeline({
              defaults: { ease: 'expo.out' },
              scrollTrigger: { trigger: header, start: 'top 88%', once: true },
              onComplete: () => {
                gsap.set(masks, { overflow: 'visible' });
              },
            })
            .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
            .to(subs, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');
        });

        gsap.utils.toArray<HTMLElement>('[data-scroll]', main).forEach((el) => {
          gsap.from(el, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });

        const spine = main.querySelector<HTMLElement>('[data-timeline-spine]');
        if (spine) {
          gsap.fromTo(
            spine,
            { scaleY: 0, transformOrigin: 'top' },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: spine.parentElement,
                start: 'top 70%',
                end: 'bottom 60%',
                scrub: 0.6,
              },
            }
          );
        }

        gsap.utils.toArray<HTMLElement>('[data-timeline-row]', main).forEach((row) => {
          gsap.from(row, {
            x: -24,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 85%', once: true },
          });

          const dot = row.querySelector('[data-timeline-dot]');
          if (dot) {
            gsap.fromTo(
              dot,
              { scale: 0 },
              {
                scale: 1,
                duration: 0.5,
                ease: 'back.out(2)',
                scrollTrigger: { trigger: row, start: 'top 82%', once: true },
              }
            );
          }
        });

        if (caretRef.current) {
          gsap
            .timeline({ repeat: -1 })
            .set(caretRef.current, { opacity: 0 }, 0.55)
            .set(caretRef.current, { opacity: 1 }, 1.1);
        }

        gsap.set('[data-value-card]', { autoAlpha: 0, y: 36 });
        ScrollTrigger.batch('[data-value-card]', {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: 'power3.out',
              clearProps: 'transform',
            }),
        });

        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <main ref={scope} className="relative w-full overflow-x-clip" style={BODY}>
      {/* -------------------------------------------------------------- */}
      {/* HERO — only the 2xl heading + two flipbook buttons              */}
      {/* -------------------------------------------------------------- */}
      <header
        data-hero
        className="flex w-full flex-col items-center justify-center px-4 pb-8 pt-28 text-center md:pb-12 md:pt-36"
        style={{ minHeight: HERO_HEIGHT }}
      >
        <h1
          aria-label={HERO_TEXT}
          className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-foreground md:text-2xl"
          style={HEADING}
        >
          {HERO_TEXT.split(' ').map((word, w, words) => (
            <span key={w}>
              <span className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, i) => (
                  <span
                    key={i}
                    data-mask
                    aria-hidden="true"
                    className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
                  >
                    <span data-char className="inline-block will-change-transform">
                      {char}
                    </span>
                  </span>
                ))}
              </span>
              {w < words.length - 1 ? ' ' : null}
            </span>
          ))}
        </h1>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* ABOUT                                                           */}
      {/* -------------------------------------------------------------- */}
      <section className="w-full px-4 pb-16 pt-4 md:px-8 md:pb-24 md:pt-8">
        <div className={INNER}>
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <HalftoneImage
              src="/works/mira-landscape.png"
              alt="Portrait"
              caption={`Johannesburg · ${new Date().getFullYear()}`}
              className="aspect-4/3 w-full md:aspect-4/5 md:max-h-184"
            />

            <div data-scroll>
              <h2
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
                style={HEADING}
              >
                I like building things that feel a little more alive than a website.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                I started with static HTML pages and never quite stopped finding ways to make them
                move. Today I work across design and engineering: designing interfaces, writing the
                front end, wiring up the backend, and occasionally letting something silly like a
                rotary phone be the contact page.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                I run a small studio called MonoStudios, study Computer Science at Eduvos (graduating
                this year), take on select freelance projects, and spend the rest of the time building
                interactive experiments just to see what happens.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={1.5} aria-hidden />
                  Johannesburg, ZA
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1 text-foreground">
                  <span aria-hidden className="size-1.5 rounded-sm bg-primary" />
                  Open to freelance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* TIMELINE                                                        */}
      {/* -------------------------------------------------------------- */}
      <section className={SECTION}>
        <div className={INNER}>
          <SectionHead title="Timeline" note="How it happened, one year at a time." />

          <div className="relative pl-8 md:pl-12">
            <span aria-hidden className="absolute bottom-2 left-2 top-2 w-px bg-border md:left-4" />
            <span
              data-timeline-spine
              aria-hidden
              className="absolute bottom-2 left-2 top-2 w-px bg-foreground md:left-4"
            />

            <ol className="flex flex-col">
              {TIMELINE.map((group) => (
                <li key={group.year} data-timeline-row className="relative pb-12 last:pb-0">
                  <span
                    data-timeline-dot
                    aria-hidden
                    className="absolute -left-8 top-1.5 size-2.5 rounded-sm bg-foreground md:-left-12"
                  />

                  <div className="flex flex-col gap-3 md:flex-row md:gap-8">
                    <span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground md:w-32 md:shrink-0">
                      {group.year}
                      {group.now && (
                        <>
                          <span
                            ref={caretRef}
                            aria-hidden
                            className="h-[0.85em] w-[0.45em] rounded-xs bg-foreground"
                          />
                          <span className="sr-only">(now)</span>
                        </>
                      )}
                    </span>

                    <div className="flex-1 border-t border-border">
                      {group.events.map((e) => (
                        <div
                          key={e.title}
                          className="grid gap-3 border-b border-border py-6 last:border-b-0 last:pb-0 lg:grid-cols-5 lg:gap-10"
                        >
                          <div className="lg:col-span-3">
                            <h3
                              className="text-xl font-medium tracking-tight text-foreground md:text-2xl"
                              style={HEADING}
                            >
                              {e.title}
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                              {e.text}
                            </p>
                          </div>
                          {e.tags && (
                            <ul className="flex flex-wrap content-start gap-2 lg:col-span-2 lg:justify-end">
                              {e.tags.map((tag) => (
                                <li key={tag} className={CHIP}>
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* TOOLS                                                           */}
      {/* -------------------------------------------------------------- */}
      <section className={SECTION}>
        <div className={INNER}>
          <SectionHead title="Tools" note="What I reach for most." />

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((group) => (
              <div key={group.label} data-scroll>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span aria-hidden className="size-1.5 rounded-sm bg-foreground" />
                  {group.label}
                </p>
                <ul className="mt-3 border-t border-border">
                  {group.items.map((tool) => (
                    <li
                      key={tool}
                      className="border-b border-border py-2.5 text-sm text-foreground transition-colors duration-200 hover:text-muted-foreground"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* PRINCIPLES                                                      */}
      {/* -------------------------------------------------------------- */}
      <section className={SECTION}>
        <div className={INNER}>
          <SectionHead title="Principles" note="Three rules I keep coming back to." />

          <div className="grid items-stretch gap-4 md:grid-cols-3 md:gap-6">
            {VALUES.map((v, i) => (
              <article
                key={v.title}
                data-value-card
                className="group flex flex-col rounded-lg border border-border bg-card transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground motion-reduce:transition-none"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted-foreground">
                  <span>{v.file}</span>
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, '0')}/{String(VALUES.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <span
                    aria-hidden
                    className="grid size-14 place-items-center rounded-lg border border-border bg-background text-foreground transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none"
                  >
                    <PixelGlyph rows={v.glyph} />
                  </span>

                  <h3
                    className="text-2xl font-medium leading-none tracking-tight text-foreground"
                    style={HEADING}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* CTA                                                             */}
      {/* -------------------------------------------------------------- */}
      <section className={`${SECTION} pb-24 md:pb-32`}>
        <div className={`${INNER} flex flex-col items-start justify-between gap-8 md:flex-row md:items-end`}>
          <header data-header>
            <SplitHeading
              text="Let’s build something."
              className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl"
            />
            <p
              data-sub
              className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base"
              style={HEADING}
            >
              Got a project in mind, or a strange experiment to try? Say hello.
            </p>
          </header>

          <div data-scroll className="flex flex-wrap gap-2">
            <Link href="/contact" className={BTN_PRIMARY}>
              Start a project
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
            </Link>
            <CopyEmail />
            <a href="/cv.pdf" download className={BTN_MUTED}>
              <Download size={14} strokeWidth={1.75} aria-hidden />
              Download CV
            </a>
            <Link href="/works" className={BTN_MUTED}>
              <Mail size={14} strokeWidth={1.5} aria-hidden />
              Browse the works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}