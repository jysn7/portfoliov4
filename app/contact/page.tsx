'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import emailjs from '@emailjs/browser';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ================================================================== */
/* CONFIG                                                               */
/* ================================================================== */
const HEADING = { fontFamily: 'var(--font-heading)' } as const;
const BODY = { fontFamily: 'var(--font-body)' } as const;

const HERO_TEXT = 'Say hello ;)';
const HERO_HEIGHT = '62svh';
const EMAIL = 'jysnbly7@gmail.com';

/* EmailJS (same service / template / key as the old contact page) */
const EMAILJS = {
  service: 'service_cyeam6u',
  template: 'template_y3b17lt',
  key: 'UfMt4Atrq_it57z6i',
};

/* the line under the hero heading cycles through these, character by character */
const MORPH_PREFIX = 'Let’s talk about';
const PHRASES = ['a website.', 'a game.', 'a 3D scene.', 'an experiment.', 'nothing at all.'];
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz&/<>_';

/* little bursts of colour when you click the hero */
const BURST_COLORS = ['var(--primary)', '#e1306c', '#25d366', '#0a66c2', 'var(--foreground)'];

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
const BTN = `inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-medium transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-foreground text-background hover:bg-foreground/85 disabled:pointer-events-none disabled:opacity-60`;
const BTN_MUTED = `${BTN} bg-muted text-foreground hover:bg-foreground hover:text-background`;
const LABEL = 'text-sm text-muted-foreground';
const FIELD =
  'h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground shadow-none outline-none transition-colors duration-200 placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-0';

/* `bg` / `fg` colour the back of each flipbook tile (the side revealed on hover) */
const SOCIALS: { label: string; href: string; icon: ReactNode; bg: string; fg: string }[] = [
  {
    label: 'Email',
    href: `mailto:${EMAIL}`,
    icon: <MdEmail size={22} />,
    bg: 'var(--primary)',
    fg: 'var(--primary-foreground)',
  },
  { label: 'GitHub', href: 'https://github.com/jysn7', icon: <FaGithub size={21} />, bg: 'var(--foreground)', fg: 'var(--background)' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jayson-baloyi-2a01512b0',
    icon: <FaLinkedinIn size={21} />,
    bg: '#0a66c2',
    fg: '#ffffff',
  },
  { label: 'Instagram', href: 'https://instagram.com/amant.dur', icon: <FaInstagram size={21} />, bg: '#e1306c', fg: '#ffffff' },
  { label: 'X', href: 'https://x.com/jyysn7', icon: <FaXTwitter size={20} />, bg: 'var(--foreground)', fg: 'var(--background)' },
  { label: 'WhatsApp', href: 'https://wa.me/+27780345709', icon: <FaWhatsapp size={22} />, bg: '#25d366', fg: '#ffffff' },
];

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const t = (s: number) => (reduced() ? 0 : s);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const angDiff = (a: number, b: number) => ((a - b + 540) % 360) - 180;

/* ================================================================== */
/* PHONE GEOMETRY (SVG units)                                           */
/* ================================================================== */
const VB = { x: 0, y: -70, w: 1100, h: 770 };
const CX = 550;
const BASE = VB.y + VB.h;
const R_DOME = 520;
const C = { x: CX, y: 448 };
const R_PLATE = 205;
const R_HOLES = 148;
const R_HOLE = 31;
const STOP = 120;
const TARGET = '0780345709';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const HS_R = 548;
const HS_A = 50;
const HS_O = { x: CX, y: 430 };
const HS_ORIGIN = `${HS_O.x} ${HS_O.y}`;
const HS_LIFT = -80;
const HS_TILT = -4;
const CORD_START = { x: 80, y: 430 };
const CORD_END = { x: 92, y: 566 };

const toRad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, a: number) => ({
  x: Number((CX + r * Math.sin(toRad(a))).toFixed(2)),
  y: Number((BASE - r * Math.cos(toRad(a))).toFixed(2)),
});
const arc = (r: number, a0: number, a1: number) => {
  const s = pt(r, a0);
  const e = pt(r, a1);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
};

const BODY_PATH = `M ${CX - R_DOME} ${BASE} A ${R_DOME} ${R_DOME} 0 0 1 ${CX + R_DOME} ${BASE} Z`;
const PLINTH = `M ${CX - R_DOME} ${BASE} V ${BASE - 22} H ${CX + R_DOME} V ${BASE} Z`;

const steps = (d: number) => (d === 0 ? 10 : d);
const holeAngle = (d: number) => STOP - 30 * steps(d) - 30;
const rotNeeded = (d: number) => 30 * steps(d) + 30;
const polar = (r: number, deg: number) => ({
  x: Number((C.x + r * Math.sin(toRad(deg))).toFixed(2)),
  y: Number((C.y - r * Math.cos(toRad(deg))).toFixed(2)),
});
const circle = (x: number, y: number, r: number) =>
  `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;

const PLATE_PATH = [
  circle(C.x, C.y, R_PLATE),
  ...DIGITS.map((d) => {
    const p = polar(R_HOLES, holeAngle(d));
    return circle(p.x, p.y, R_HOLE);
  }),
].join(' ');

const OVERLAY: CSSProperties = {
  left: `${((C.x - R_PLATE - VB.x) / VB.w) * 100}%`,
  top: `${((C.y - R_PLATE - VB.y) / VB.h) * 100}%`,
  width: `${((R_PLATE * 2) / VB.w) * 100}%`,
  height: `${((R_PLATE * 2) / VB.h) * 100}%`,
};

const cordPath = (p: number) => {
  const dy = HS_LIFT * p;
  const rad = toRad(HS_TILT * p);
  const ox = CORD_START.x - HS_O.x;
  const oy = CORD_START.y - HS_O.y;
  const ax = HS_O.x + ox * Math.cos(rad) - oy * Math.sin(rad);
  const ay = HS_O.y + ox * Math.sin(rad) + oy * Math.cos(rad) + dy;
  const mx = (ax + CORD_END.x) / 2 - 110;
  const my = (ay + CORD_END.y) / 2 + 30;
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${CORD_END.x} ${CORD_END.y}`;
};

const sfx = {
  ctx: null as AudioContext | null,
  on: true,
  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  },
  tick(freq = 1700, vol = 0.05, len = 0.03) {
    const ctx = this.ctx;
    if (!this.on || !ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + len + 0.01);
  },
};

type Status = 'idle' | 'connected' | 'wrong';
type SendState = 'idle' | 'sending' | 'sent' | 'error';

/* ================================================================== */
/* SHARED PIECES                                                        */
/* ================================================================== */

/* section heading: masked letter reveal, animated by the page-level effect */
function SectionHead({ title, note, aside }: { title: string; note?: string; aside?: ReactNode }) {
  return (
    <header
      data-header
      className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-12"
    >
      <div>
        <h2
          aria-label={title}
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          style={HEADING}
        >
          {title.split('').map((char, i) => (
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
      {aside && <div data-sub>{aside}</div>}
    </header>
  );
}

/* a row of flipbook tiles: each one flips over on hover to a coloured back face */
function Socials() {
  return (
    <div data-reveal>
      <ul className="flex flex-wrap items-center gap-3">
        {SOCIALS.map((s) => (
          <li key={s.label}>
            <a
              data-social
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`relative block size-11 rounded-xl md:size-12 ${FOCUS}`}
              style={{ perspective: 600 }}
            >
              <span
                data-social-inner
                className="relative block size-full will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* front: neutral */}
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center rounded-xl bg-muted text-foreground"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {s.icon}
                </span>
                {/* back: a bit of colour, revealed when the tile flips */}
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center rounded-xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                    backgroundColor: s.bg,
                    color: s.fg,
                  }}
                >
                  {s.icon}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================== */
/* PAGE                                                                 */
/* ================================================================== */
export default function ContactPage() {
  const scope = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<SVGGElement>(null);
  const plateRef = useRef<SVGGElement>(null);
  const handsetRef = useRef<SVGGElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const coilRef = useRef<SVGPathElement>(null);
  const padRef = useRef<HTMLDivElement>(null);

  const hs = useRef({ p: 0 });
  const rot = useRef({ v: 0 });
  const busy = useRef(false);
  const offRef = useRef(false);
  const numRef = useRef('');
  const statusRef = useRef<Status>('idle');

  const [off, setOff] = useState(false);
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sound, setSound] = useState(true);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sendState, setSendState] = useState<SendState>('idle');

  const setSt = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  useEffect(() => {
    sfx.on = sound;
  }, [sound]);

  /* ---------------- motion: hero, headings, socials, fields, phone ---------------- */
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

        // Reduced motion: everything stays visible in its final state
        if (!motion) return;

        const hero = main.querySelector<HTMLElement>('[data-hero]')!;
        const heroContent = main.querySelector<HTMLElement>('[data-hero-content]')!;
        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', hero);
        const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', hero);
        const subs = gsap.utils.toArray<HTMLElement>('[data-hero-sub]', hero);
        const morph = hero.querySelector<HTMLElement>('[data-morph]');
        const glow = hero.querySelector<HTMLElement>('[data-glow]');
        const burstLayer = hero.querySelector<HTMLElement>('[data-burst-layer]');

        /* ---------- hero entrance: heading letters, then the line ---------- */
        gsap.set(subs, { opacity: 0, y: 14 });
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => {
              gsap.set(masks, { overflow: 'visible' }); // lets the wave lift letters freely
            },
          })
          .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
          .to(subs, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');

        /* ---------- scrolling: the hero drifts up and fades back ---------- */
        gsap.to(heroContent, {
          opacity: 0,
          y: -60,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        /* ---------- the line cycles through what you might want to talk about ---------- */
        let idx = 0;
        let timer: gsap.core.Tween | null = null;
        let scramble: gsap.core.Tween | null = null;

        const scrambleTo = (to: string) => {
          if (!morph) return;
          scramble?.kill();
          const from = morph.textContent ?? '';
          const len = Math.max(from.length, to.length);
          const lag = 6;
          const state = { p: 0 };

          scramble = gsap.to(state, {
            p: len + lag,
            duration: 1.1,
            ease: 'none',
            onUpdate: () => {
              let out = '';
              for (let i = 0; i < len; i++) {
                const target = to[i] ?? '';
                if (state.p >= i + lag) out += target;
                else if (state.p >= i)
                  out +=
                    target === ' ' || target === '' || target === '.'
                      ? target
                      : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                else out += from[i] ?? '';
              }
              morph.textContent = out;
            },
            onComplete: () => {
              morph.textContent = to;
            },
          });
        };

        const tick = () => {
          idx = (idx + 1) % PHRASES.length;
          scrambleTo(PHRASES[idx]);
          timer = gsap.delayedCall(3, tick);
        };
        const start = () => {
          timer?.kill();
          timer = gsap.delayedCall(2.4, tick);
        };
        const stop = () => timer?.kill();

        if (morph) {
          ScrollTrigger.create({
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? start() : stop()),
          });
        }

        const cleanups: Array<() => void> = [
          () => {
            timer?.kill();
            scramble?.kill();
            if (morph) morph.textContent = PHRASES[0];
          },
        ];

        /* ---------- click anywhere in the hero: a small burst of colour ---------- */
        const burst = (x: number, y: number) => {
          if (!burstLayer) return;
          const count = 12;
          for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'absolute block size-1.5 rounded-sm';
            p.style.backgroundColor = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            burstLayer.appendChild(p);

            const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const d = 40 + Math.random() * 70;
            gsap.fromTo(
              p,
              { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
              {
                x: Math.cos(a) * d,
                y: Math.sin(a) * d - 10,
                rotation: Math.random() * 360,
                scale: 0,
                opacity: 0,
                duration: 0.8 + Math.random() * 0.4,
                ease: 'power3.out',
                onComplete: () => p.remove(),
              }
            );
          }
        };
        const onHeroClick = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          burst(e.clientX - r.left, e.clientY - r.top);
        };
        hero.addEventListener('click', onHeroClick);
        cleanups.push(() => hero.removeEventListener('click', onHeroClick));

        /* ---------- mouse only: heading wave + a soft glow that follows the pointer ---------- */
        if (hover) {
          const charY = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' }));

          if (glow) gsap.set(glow, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
          const glowX = glow ? gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' }) : null;
          const glowY = glow ? gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' }) : null;

          const onMove = (e: PointerEvent) => {
            chars.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              charY[i](-8 * Math.exp(-(dx * dx + dy * dy) / (2 * 90 * 90)));
            });
            if (glow && glowX && glowY) {
              const r = hero.getBoundingClientRect();
              glowX(e.clientX - r.left);
              glowY(e.clientY - r.top);
            }
          };
          const onEnter = (e: PointerEvent) => {
            if (!glow) return;
            const r = hero.getBoundingClientRect();
            gsap.set(glow, { x: e.clientX - r.left, y: e.clientY - r.top });
            gsap.to(glow, { autoAlpha: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
          };
          const onLeave = () => {
            gsap.to(chars, { y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
            if (glow) gsap.to(glow, { autoAlpha: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
          };
          hero.addEventListener('pointermove', onMove);
          hero.addEventListener('pointerenter', onEnter);
          hero.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            hero.removeEventListener('pointermove', onMove);
            hero.removeEventListener('pointerenter', onEnter);
            hero.removeEventListener('pointerleave', onLeave);
          });

          /* ---------- socials: flipbook tiles, front -> coloured back ---------- */
          const socials = gsap.utils.toArray<HTMLElement>('[data-social]', main);
          socials.forEach((social) => {
            const inner = social.querySelector<HTMLElement>('[data-social-inner]');
            if (!inner) return;

            const tl = gsap.timeline({ paused: true });
            tl.to(inner, { rotationX: -180, duration: 0.7, ease: 'power3.inOut' }, 0).to(
              inner,
              { y: -6, scale: 1.1, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 },
              0
            );

            const enter = () => tl.timeScale(1).play();
            const leave = () => tl.timeScale(1.4).reverse();

            social.addEventListener('pointerenter', enter);
            social.addEventListener('pointerleave', leave);
            social.addEventListener('focusin', enter);
            social.addEventListener('focusout', leave);

            cleanups.push(() => {
              social.removeEventListener('pointerenter', enter);
              social.removeEventListener('pointerleave', leave);
              social.removeEventListener('focusin', enter);
              social.removeEventListener('focusout', leave);
              tl.kill();
            });
          });
        }

        /* ---------- section headings: masked letter reveal, then the note + aside ---------- */
        gsap.utils.toArray<HTMLElement>('[data-header]', main).forEach((header) => {
          const hchars = header.querySelectorAll<HTMLElement>('[data-hchar]');
          const hmasks = header.querySelectorAll<HTMLElement>('[data-hmask]');
          const hsubs = header.querySelectorAll<HTMLElement>('[data-sub]');

          gsap.set(hsubs, { opacity: 0, y: 14 });
          gsap
            .timeline({
              defaults: { ease: 'expo.out' },
              scrollTrigger: { trigger: header, start: 'top 88%', once: true },
              onComplete: () => {
                gsap.set(hmasks, { overflow: 'visible' });
              },
            })
            .from(hchars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
            .to(hsubs, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');
        });

        /* ---------- left column, socials and form fields: rise in on scroll ---------- */
        const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]', main);
        gsap.set(reveals, { opacity: 0, y: 28 });
        ScrollTrigger.batch(reveals, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'transform',
            }),
        });

        /* ---------- the phone rises into frame ---------- */
        const wrap = phoneWrapRef.current;
        const stage = stageRef.current;
        if (wrap && stage) {
          gsap.set(wrap, { yPercent: 35, autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: stage,
            start: 'top 80%',
            once: true,
            onEnter: () => gsap.to(wrap, { yPercent: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out' }),
          });
        }

        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, []);

  /* ---------------- form (EmailJS) ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));
    if (sendState === 'sent' || sendState === 'error') setSendState('idle');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current || sendState === 'sending') return;

    setSendState('sending');

    emailjs
      .sendForm(EMAILJS.service, EMAILJS.template, formRef.current, EMAILJS.key)
      .then(() => {
        setSendState('sent');
        setFormData({ name: '', email: '', message: '' });
      })
      .catch(() => {
        setSendState('error');
      });
  };

  /* ---------------- phone ---------------- */
  const setPlate = useCallback((v: number) => {
    gsap.set(plateRef.current, { rotation: v, svgOrigin: `${C.x} ${C.y}` });
  }, []);

  const applyHandset = useCallback(() => {
    const p = hs.current.p;
    gsap.set(handsetRef.current, { y: HS_LIFT * p, rotation: HS_TILT * p, svgOrigin: HS_ORIGIN });
    const d = cordPath(p);
    cordRef.current?.setAttribute('d', d);
    coilRef.current?.setAttribute('d', d);
  }, []);

  const nudge = useCallback(() => {
    if (reduced()) return;
    gsap.fromTo(
      handsetRef.current,
      { rotation: -2.5, svgOrigin: HS_ORIGIN },
      { rotation: 0, svgOrigin: HS_ORIGIN, duration: 0.7, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' }
    );
  }, []);

  const shake = useCallback(() => {
    if (reduced()) return;
    gsap.fromTo(phoneRef.current, { x: -14 }, { x: 0, duration: 0.8, ease: 'elastic.out(1, 0.2)', overwrite: 'auto' });
  }, []);

  const pushDigit = useCallback((d: number) => {
    if (numRef.current.length >= 10) return;
    numRef.current += String(d);
    setNumber(numRef.current);
  }, []);

  const springBack = useCallback(
    (d: number | null, from: number) => {
      busy.current = true;
      let last = Math.floor(from / 30);
      gsap.to(rot.current, {
        v: 0,
        duration: t(0.12 + (from / 360) * 1.05),
        ease: 'none',
        overwrite: true,
        onUpdate: () => {
          setPlate(rot.current.v);
          const k = Math.floor(rot.current.v / 30);
          if (k < last) {
            last = k;
            if (k >= 1) sfx.tick();
          }
        },
        onComplete: () => {
          rot.current.v = 0;
          setPlate(0);
          busy.current = false;
          if (d !== null) pushDigit(d);
        },
      });
    },
    [pushDigit, setPlate]
  );

  const autoDial = useCallback(
    (d: number) => {
      if (!offRef.current) {
        nudge();
        return;
      }
      if (busy.current || numRef.current.length >= 10 || statusRef.current !== 'idle') return;
      busy.current = true;
      const to = rotNeeded(d);
      gsap.to(rot.current, {
        v: to,
        duration: t(0.2 + (to / 360) * 0.45),
        ease: 'power2.out',
        overwrite: true,
        onUpdate: () => setPlate(rot.current.v),
        onComplete: () => springBack(d, to),
      });
    },
    [nudge, setPlate, springBack]
  );

  const toggleHandset = useCallback(
    (force?: boolean) => {
      const next = force ?? !offRef.current;
      if (next === offRef.current) return;
      sfx.init();
      offRef.current = next;
      setOff(next);

      if (!next) {
        gsap.killTweensOf(rot.current);
        busy.current = false;
        rot.current.v = 0;
        setPlate(0);
        numRef.current = '';
        setNumber('');
        setSt('idle');
      }

      sfx.tick(next ? 900 : 420, 0.08, 0.06);
      gsap.to(hs.current, {
        p: next ? 1 : 0,
        duration: t(next ? 0.7 : 0.65),
        ease: next ? 'back.out(1.6)' : 'bounce.out',
        overwrite: true,
        onUpdate: applyHandset,
        onComplete: applyHandset,
      });
    },
    [applyHandset, setPlate, setSt]
  );

  useEffect(() => {
    if (number.length < 10) return;
    if (number === TARGET) {
      setSt('connected');
      sfx.tick(880, 0.07, 0.14);
      window.setTimeout(() => sfx.tick(660, 0.07, 0.14), 170);
      if (!reduced()) {
        gsap.fromTo(
          phoneRef.current,
          { y: 0 },
          { y: -9, yoyo: true, repeat: 5, duration: 0.07, ease: 'power1.inOut', overwrite: 'auto' }
        );
      }
      return;
    }
    setSt('wrong');
    sfx.tick(200, 0.09, 0.2);
    shake();
    const id = window.setTimeout(() => {
      numRef.current = '';
      setNumber('');
      setSt('idle');
    }, 1700);
    return () => window.clearTimeout(id);
  }, [number, setSt, shake]);

  const onPadDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    sfx.init();
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const padEl = padRef.current;
    if (!padEl) return;

    const box = padEl.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const unit = box.width / 2 / R_PLATE;
    const toPolar = (x: number, y: number) => ({
      ang: (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI,
      r: Math.hypot(x - cx, y - cy) / unit,
    });

    const down = toPolar(e.clientX, e.clientY);
    let best = -1;
    let bestDiff = 999;
    for (const d of DIGITS) {
      const diff = Math.abs(angDiff(down.ang, holeAngle(d)));
      if (diff < bestDiff) {
        bestDiff = diff;
        best = d;
      }
    }
    if (down.r < 90 || best < 0 || bestDiff > 16) return;

    if (!offRef.current) {
      nudge();
      return;
    }
    if (busy.current || numRef.current.length >= 10 || statusRef.current !== 'idle') return;

    const limit = rotNeeded(best);
    const x0 = e.clientX;
    const y0 = e.clientY;
    let prev = down.ang;
    let acc = 0;
    let moved = false;
    busy.current = true;
    gsap.killTweensOf(rot.current);

    const move = (ev: PointerEvent) => {
      const a = toPolar(ev.clientX, ev.clientY).ang;
      let da = a - prev;
      if (da > 180) da -= 360;
      if (da < -180) da += 360;
      prev = a;
      acc = clamp(acc + da, 0, limit);
      if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) moved = true;
      rot.current.v = acc;
      setPlate(acc);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (!moved) {
        busy.current = false;
        autoDial(best);
        return;
      }
      springBack(acc >= limit - 5 ? best : null, acc);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onPhoneKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      sfx.init();
      autoDial(Number(e.key));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (busy.current || statusRef.current !== 'idle') return;
      numRef.current = numRef.current.slice(0, -1);
      setNumber(numRef.current);
    } else if (e.key === 'Escape') {
      toggleHandset(false);
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      toggleHandset();
    }
  };

  const clearNumber = () => {
    if (busy.current) return;
    numRef.current = '';
    setNumber('');
  };

  const hint = !off
    ? 'Tap the handset to pick up.'
    : status === 'connected'
      ? 'Connected. Say something clever.'
      : status === 'wrong'
        ? 'Wrong number. Hang on, resetting.'
        : 'Drag a hole round to the stop, or just tap a number.';

  const svgText = { fontFamily: 'var(--font-heading)' } as const;

  return (
    <main ref={scope} className="relative w-full select-none overflow-x-clip" style={BODY}>
      {/* -------------------------------------------------------------- */}
      {/* Hero: centered heading and a cycling line                        */}
      {/* -------------------------------------------------------------- */}
      <header
        data-hero
        className="relative flex w-full flex-col items-center justify-center px-4 mt-12 md:mt-32 text-center"
        style={{ minHeight: HERO_HEIGHT }}
      >
        {/* soft glow that follows the pointer (mouse only) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            data-glow
            className="invisible absolute left-0 top-0 size-104 rounded-full"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent), transparent 65%)',
            }}
          />
        </div>

        {/* click bursts land here */}
        <div data-burst-layer aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden" />

        <div data-hero-content className="relative z-10 flex flex-col items-center will-change-transform">
          <h1
            aria-label={HERO_TEXT}
            className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl"
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

          <p
            data-hero-sub
            className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base"
            style={HEADING}
          >
            <span className="sr-only">{`${MORPH_PREFIX} ${PHRASES.join(' ')}`}</span>
            <span aria-hidden="true">
              {MORPH_PREFIX}
              <span data-morph className="block min-h-[1.5em] text-foreground">
                {PHRASES[0]}
              </span>
            </span>
          </p>
        </div>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* Get in touch (left) + the form (right). Socials sit under the    */}
      {/* get in touch side.                                               */}
      {/* -------------------------------------------------------------- */}
      <section id="message" className="w-full px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-360">
          <SectionHead title="Get in touch" note="Pick a channel, or tell me what you’re building." />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* left: get in touch, then the socials */}
            <div className="flex flex-col gap-10">
              <div data-reveal className="flex flex-col gap-3">
                <p className={LABEL}>Email me directly</p>
                <a
                  href={`mailto:${EMAIL}`}
                  className={`w-fit break-all rounded-md text-2xl font-semibold tracking-tight text-foreground underline decoration-foreground/30 underline-offset-8 transition-colors duration-300 hover:decoration-foreground md:text-3xl ${FOCUS}`}
                  style={HEADING}
                >
                  {EMAIL}
                </a>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                  Collaborations, questions, or just a hello. I’m always up for a good idea.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p data-reveal className={LABEL}>
                  Or find me here
                </p>
                <Socials />
              </div>
            </div>

            {/* right: the form */}
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div data-reveal className="flex flex-col gap-2">
                <label htmlFor="c-name" className={LABEL}>
                  Name
                </label>
                <Input
                  id="c-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={FIELD}
                />
              </div>

              <div data-reveal className="flex flex-col gap-2">
                <label htmlFor="c-email" className={LABEL}>
                  Email
                </label>
                <Input
                  id="c-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={FIELD}
                />
              </div>

              <div data-reveal className="flex flex-col gap-2">
                <label htmlFor="c-msg" className={LABEL}>
                  Message
                </label>
                <Textarea
                  id="c-msg"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or idea..."
                  className={`${FIELD} h-auto min-h-22 resize-none py-3`}
                />
              </div>

              <div data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <button type="submit" disabled={sendState === 'sending'} className={`group ${BTN_PRIMARY}`}>
                  {sendState === 'sending' ? (
                    <>
                      <span
                        aria-hidden
                        className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background motion-reduce:animate-none"
                      />
                      Sending
                    </>
                  ) : sendState === 'sent' ? (
                    'Message sent'
                  ) : (
                    <>
                      Send message
                      <span aria-hidden className="relative block size-4 overflow-hidden">
                        <ArrowUpRight
                          size={16}
                          strokeWidth={1.5}
                          className="transition-transform duration-500 ease-out group-hover:-translate-y-5 group-hover:translate-x-5 motion-reduce:transition-none"
                        />
                        <ArrowUpRight
                          size={16}
                          strokeWidth={1.5}
                          className="absolute inset-0 -translate-x-5 translate-y-5 transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
                        />
                      </span>
                    </>
                  )}
                </button>
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {sendState === 'sent'
                    ? 'Thanks, I’ll get back to you soon.'
                    : sendState === 'error'
                      ? 'Something went wrong. Try again, or email me directly.'
                      : 'Typically responds within 48 hours.'}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* The phone                                                        */}
      {/* -------------------------------------------------------------- */}
      <section ref={stageRef} id="call" className="relative w-full border-t border-border pt-12 md:pt-20">
        <div className="mx-auto w-full max-w-360 px-4 md:px-8">
          <SectionHead
            title="Or call"
            note="It’s a rotary phone, so be patient."
            aside={
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                {!off && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-foreground" />}
                {hint}
              </p>
            }
          />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pb-10 text-center md:pb-14">
          <div
            data-reveal
            aria-live="polite"
            aria-label={off ? `Dialled ${number || 'nothing yet'}` : 'Phone on the hook'}
            className="flex min-h-[1.1em] items-center justify-center text-4xl font-semibold leading-none tracking-tight tabular-nums md:text-6xl"
            style={HEADING}
          >
            {off ? (
              Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={`${i === 3 || i === 6 ? 'ml-[0.4em]' : ''} transition-colors duration-300 ${
                    i < number.length
                      ? status === 'wrong'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                      : 'text-foreground/15'
                  }`}
                >
                  {number[i] ?? '0'}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground/70">Pick up the phone</span>
            )}
          </div>

          <div data-reveal className="flex min-h-11 flex-wrap items-center justify-center gap-2">
            {status === 'connected' && (
              <>
                <a
                  href="https://wa.me/27780345709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_PRIMARY}
                >
                  Open WhatsApp
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                </a>
                <a href="tel:+27780345709" className={BTN_MUTED}>
                  Call
                </a>
              </>
            )}
            {status === 'idle' && off && number.length > 0 && (
              <button type="button" onClick={clearNumber} className={BTN_MUTED}>
                Clear
              </button>
            )}
            {status === 'idle' && off && number.length === 0 && (
              <span className="text-sm text-muted-foreground/70">Psst, try 078 034 5709</span>
            )}
            {off && (
              <button type="button" onClick={() => toggleHandset(false)} className={BTN_MUTED}>
                Hang up
              </button>
            )}
            <button
              type="button"
              aria-pressed={sound}
              aria-label={sound ? 'Mute dial sounds' : 'Unmute dial sounds'}
              onClick={() => {
                sfx.init();
                setSound((s) => !s);
              }}
              className={`grid size-11 place-items-center rounded-xl bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`}
            >
              {sound ? (
                <Volume2 size={16} strokeWidth={1.5} aria-hidden />
              ) : (
                <VolumeX size={16} strokeWidth={1.5} aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div className="relative -mb-px flex justify-center overflow-hidden">
          <div
            ref={phoneWrapRef}
            tabIndex={0}
            role="group"
            aria-label="Rotary phone. Press enter to pick up the handset, then type digits to dial. Escape hangs up."
            onKeyDown={onPhoneKey}
            className="relative w-[clamp(700px,94vw,1100px)] shrink-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-foreground"
          >
            <svg
              viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
              className="block h-auto -mt-22 w-full"
              role="img"
              aria-label="A big dome-shaped rotary telephone"
            >
              <g ref={phoneRef}>
                <path d={BODY_PATH} transform="translate(14 14)" className="fill-foreground" />

                <path ref={cordRef} d={cordPath(0)} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-foreground" />
                <path
                  ref={coilRef}
                  d={cordPath(0)}
                  fill="none"
                  strokeWidth="9"
                  strokeDasharray="2.5 7.5"
                  className="stroke-card"
                />

                <path d={BODY_PATH} strokeWidth="3" className="fill-primary stroke-foreground" />
                <path d={PLINTH} className="fill-foreground" />

                <path d={arc(498, -86, 86)} fill="none" strokeWidth="2" className="stroke-foreground/20" />
                <path d={arc(478, -74, -34)} fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-background/35" />
                <circle cx={pt(478, -20).x} cy={pt(478, -20).y} r="6" className="fill-background/35" />
                <path d={arc(486, 52, 74)} fill="none" strokeWidth="16" strokeLinecap="round" className="stroke-foreground/10" />

                {[-HS_A, HS_A].map((a) => {
                  const p = pt(496, a);
                  return (
                    <g key={a} transform={`translate(${p.x} ${p.y}) rotate(${a})`}>
                      <rect x="-110" y="-20" width="220" height="40" rx="20" className="fill-foreground" />
                    </g>
                  );
                })}

                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x="150" y={440 + i * 22} width="110" height="9" rx="4.5" className="fill-foreground" />
                ))}
                <circle
                  cx="900"
                  cy="474"
                  r="18"
                  strokeWidth="3"
                  className={`stroke-foreground transition-colors duration-300 ${off ? 'fill-card' : 'fill-foreground'}`}
                />
                <circle cx="900" cy="474" r="6" className="fill-primary" />
                <text x="900" y="522" textAnchor="middle" dominantBaseline="central" fontSize="18" style={svgText} className="fill-primary-foreground">
                  line
                </text>

                <circle cx={C.x} cy={C.y} r={R_PLATE + 16} className="fill-foreground" />
                <circle cx={C.x} cy={C.y} r={R_PLATE + 9} fill="none" strokeWidth="5" strokeDasharray="2.4 11" className="stroke-background/30" />
                {DIGITS.map((d) => {
                  const p = polar(R_HOLES, holeAngle(d));
                  return (
                    <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="40" style={svgText} className="fill-card">
                      {d}
                    </text>
                  );
                })}

                <g ref={plateRef}>
                  <path d={PLATE_PATH} fillRule="evenodd" strokeWidth="2.5" className="fill-card stroke-foreground" />
                  <circle cx={C.x} cy={C.y} r={R_PLATE - 14} fill="none" strokeWidth="1.5" className="stroke-foreground/20" />
                </g>

                <g transform={`translate(${polar(R_PLATE + 8, STOP).x} ${polar(R_PLATE + 8, STOP).y}) rotate(${STOP})`}>
                  <rect x="-9" y="-26" width="18" height="52" rx="7" strokeWidth="2.5" className="fill-primary stroke-foreground" />
                  <circle r="3" className="fill-foreground" />
                </g>

                <circle cx={C.x} cy={C.y} r="66" strokeWidth="2.5" className="fill-primary stroke-foreground" />
                <circle cx={C.x} cy={C.y} r="54" fill="none" strokeWidth="1.5" className="stroke-foreground/30" />
                <text x={C.x} y={C.y - 8} textAnchor="middle" dominantBaseline="central" fontSize="22" style={svgText} className="fill-primary-foreground">
                  say
                </text>
                <text x={C.x} y={C.y + 16} textAnchor="middle" dominantBaseline="central" fontSize="22" style={svgText} className="fill-primary-foreground">
                  hi
                </text>

                <g
                  ref={handsetRef}
                  role="button"
                  aria-label={off ? 'Hang up the handset' : 'Pick up the handset'}
                  aria-pressed={off}
                  onClick={() => toggleHandset()}
                  className="cursor-pointer"
                >
                  <path d={arc(HS_R, -HS_A - 4, HS_A + 4)} fill="none" strokeWidth="46" strokeLinecap="round" className="stroke-foreground" />
                  <path d={arc(HS_R + 9, -HS_A + 10, HS_A - 10)} fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-background/25" />
                  {[-HS_A, HS_A].map((a) => {
                    const p = pt(HS_R, a);
                    return (
                      <g key={a} transform={`translate(${p.x} ${p.y}) rotate(${a})`}>
                        <rect x="-102" y="-50" width="204" height="100" rx="46" strokeWidth="3" className="fill-foreground stroke-foreground" />
                        <rect x="-86" y="-34" width="172" height="68" rx="34" fill="none" strokeWidth="2.5" className="stroke-background/25" />
                        <rect x="-70" y="-40" width="100" height="8" rx="4" className="fill-background/25" />
                        {[-48, -24, 0, 24, 48].map((dx) => (
                          <circle key={dx} cx={dx} cy="12" r="4.5" className="fill-background/30" />
                        ))}
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>

            <div
              ref={padRef}
              aria-hidden
              onPointerDown={onPadDown}
              className={`absolute touch-none rounded-full ${off ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
              style={OVERLAY}
            />
          </div>
        </div>
      </section>
    </main>
  );
}