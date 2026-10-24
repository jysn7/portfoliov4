'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Volume2,
  VolumeX,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* constants                                                            */
/* ------------------------------------------------------------------ */

/* signpost board shape (arrow tip depth comes from --tip) */
const SIGN_R = 'polygon(0 0, calc(100% - var(--tip)) 0, 100% 50%, calc(100% - var(--tip)) 100%, 0 100%)';

/* wood: cartoon outline + tileable grain (horizontal for boards, vertical for the post) */
const INK = '#2a1608';
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
const VGRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200' viewBox='0 0 40 200'%3E%3Cg fill='none' stroke='%23915427' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M10 0 C14 50 6 100 10 150 S14 190 10 200'/%3E%3Cpath d='M28 0 C24 40 32 90 28 140 S24 190 28 200'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const LINKS = [
  { label: 'email', icon: Mail, val: 'jysnbly7@gmail.com', href: 'mailto:jysnbly7@gmail.com' },
  { label: 'linkedin', icon: Linkedin, val: 'jayson-baloyi', href: 'https://www.linkedin.com/in/jayson-baloyi' },
  { label: 'instagram', icon: Instagram, val: '@amant.dur', href: 'https://instagram.com/amant.dur' },
  { label: 'twitter', icon: Twitter, val: '@jyysn7', href: 'https://twitter.com/jyysn7' },
  { label: 'whatsapp', icon: MessageCircle, val: '+27 78 034 5709', href: 'https://wa.me/27780345709' },
];

const TOPICS = ['website', 'game', '3d', 'experiment', 'just saying hi'];

/* ---- phone geometry (SVG units) ---- */
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

const BODY = `M ${CX - R_DOME} ${BASE} A ${R_DOME} ${R_DOME} 0 0 1 ${CX + R_DOME} ${BASE} Z`;
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

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const t = (s: number) => (reduced() ? 0 : s);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const angDiff = (a: number, b: number) => ((a - b + 540) % 360) - 180;

/* tiny synth for the clicks, no audio files needed */
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
type FormState = 'idle' | 'missing' | 'sent';

/* ------------------------------------------------------------------ */
/* small pieces                                                         */
/* ------------------------------------------------------------------ */

function Board({
  tone,
  className = '',
  inner = '',
  nails,
  knot,
  children,
}: {
  tone: string;
  className?: string;
  inner?: string;
  nails: string;
  knot?: string;
  children: ReactNode;
}) {
  const nail = `absolute z-[1] size-2.5 rounded-full border-2 bg-[#b9bfc6] md:size-3 ${nails}`;
  return (
    <div className={`relative w-fit ${className}`} style={{ filter: `drop-shadow(5px 5px 0 ${INK})` }}>
      <div style={{ clipPath: SIGN_R, backgroundColor: INK }} className="p-[3px]">
        <div
          style={{ clipPath: SIGN_R, backgroundColor: tone, backgroundImage: GRAIN, backgroundSize: '260px 100px' }}
          className={`relative ${inner}`}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[#efc18a]" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-[#93582a]" />
          <span aria-hidden className={`${nail} top-[22%]`} style={{ borderColor: INK }} />
          <span aria-hidden className={`${nail} bottom-[22%]`} style={{ borderColor: INK }} />
          {knot && (
            <span
              aria-hidden
              className={`absolute grid size-5 place-items-center rounded-full border-[2.5px] bg-[#a86a30] md:size-6 ${knot}`}
              style={{ borderColor: '#7a4519' }}
            >
              <span className="size-2 rounded-full border-2 md:size-2.5" style={{ borderColor: '#7a4519' }} />
            </span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function Line({ n, label, children }: { n: string; label: string; children: ReactNode }) {
  return (
    <label className="group relative block">
      <span className="flex items-baseline gap-3 font-pixel text-xs text-muted-foreground transition-colors duration-300 group-focus-within:text-foreground">
        <span className="tabular-nums">{n}</span>
        {label}
      </span>
      {children}
      <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-full bg-border" />
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-focus-within:scale-x-100"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const scope = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
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
  const [clock, setClock] = useState('');

  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fMsg, setFMsg] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [formState, setFormState] = useState<FormState>('idle');

  const setSt = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  useEffect(() => {
    sfx.on = sound;
  }, [sound]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced()) return;
      gsap.from('[data-board]', { x: '-115%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
      gsap.from('[data-reveal]', { y: 28, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.5 });
    }, scope);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = phoneWrapRef.current;
    const stage = stageRef.current;
    if (!el || !stage || reduced()) return;
    gsap.set(el, { yPercent: 35, autoAlpha: 0 });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out' });
        io.disconnect();
      },
      { threshold: 0.12 }
    );
    io.observe(stage);
    return () => {
      io.disconnect();
      gsap.killTweensOf(el);
    };
  }, []);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Johannesburg',
    });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fMsg.trim()) {
      setFormState('missing');
      return;
    }
    const who = fName.trim();
    const subject = `${topic} / hello from ${who || 'your site'}`;
    const body = `${fMsg.trim()}\n\n${who}${fEmail.trim() ? ` (${fEmail.trim()})` : ''}`;
    window.location.href = `mailto:jysnbly7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormState('sent');
  };

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
    const pad = padRef.current;
    if (!pad) return;

    const box = pad.getBoundingClientRect();
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

  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const pill = `flex h-10 items-center gap-1.5 rounded-full px-5 font-pixel text-xs transition-colors duration-200 ${focus}`;
  const pillSoft = `${pill} bg-muted text-foreground hover:bg-foreground hover:text-background`;
  const input =
    'mt-3 block w-full min-w-0 select-text bg-transparent pb-4 font-display font-soft text-2xl tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground placeholder:opacity-100 md:text-3xl';

  const hint = !off
    ? 'tap the handset to pick up'
    : status === 'connected'
      ? 'connected. say something clever.'
      : status === 'wrong'
        ? 'wrong number. hang on, resetting'
        : 'drag a hole round to the stop, or just tap a number';

  return (
    <main ref={scope} className="relative w-full select-none overflow-x-hidden pb-0">
      <header className="relative z-10 pt-48 md:pt-72">
        <div className="pointer-events-none absolute left-0 top-48 h-[17rem] w-full md:top-72 md:h-[26rem]">
          <span
            aria-hidden
            className="absolute -top-5 bottom-0 left-0 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] md:w-10"
            style={{ backgroundColor: '#b97c43', backgroundImage: VGRAIN, backgroundSize: '40px 200px', borderColor: INK }}
          />

          <div data-board className="absolute left-0 top-10 md:top-16">
            <Board
              tone="#c98d51"
              className="origin-left -translate-x-6 -rotate-[8deg] [--tip:2.5rem] md:[--tip:4.25rem]"
              inner="py-1 pl-14 pr-[calc(var(--tip)+1rem)] md:py-2 md:pl-[5.5rem] md:pr-[calc(var(--tip)+1.75rem)]"
              nails="left-[1.9rem] md:left-[2.2rem]"
              knot="right-[calc(var(--tip)+0.3rem)] top-2.5 md:top-4"
            >
              <h1 className="relative font-display font-soft text-[clamp(3.25rem,13vw,8.5rem)] font-normal leading-none tracking-[-0.045em] text-[#2a1608] [text-shadow:0_2px_0_#efc18a] md:[text-shadow:0_3px_0_#efc18a]">
                contact
              </h1>
            </Board>
          </div>

          <div data-board className="absolute left-0 top-[8.25rem] md:top-[14.5rem]">
            <Board
              tone="#d39a5c"
              className="origin-left -translate-x-8 -rotate-[4deg] [--tip:1.5rem] md:[--tip:2.25rem]"
              inner="py-1.5 pl-[4.5rem] pr-[calc(var(--tip)+0.9rem)] md:py-2 md:pl-[6rem]"
              nails="left-[2.4rem] md:left-[2.7rem]"
            >
              <span className="relative block font-pixel text-xs text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-sm">
                say hello
              </span>
            </Board>
          </div>

          <div data-board className="absolute left-0 top-[11.25rem] md:top-[19.5rem]">
            <Board
              tone="#bd8449"
              className="origin-left -translate-x-10 rotate-[2.5deg] [--tip:1.25rem] md:[--tip:1.75rem]"
              inner="py-1 pl-20 pr-[calc(var(--tip)+0.75rem)] md:py-1.5 md:pl-[6.5rem]"
              nails="left-[2.9rem] md:left-[3.2rem]"
            >
              <span className="relative block font-pixel text-[10px] text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-xs">
                or call, at the bottom
              </span>
            </Board>
          </div>
        </div>

        <div className="mx-auto max-w-350 px-6 pt-[17rem] md:flex md:min-h-[26rem] md:items-end md:justify-end md:px-12 md:pt-0">
          <div data-reveal className="max-w-[34ch] md:pb-4">
            <p className="font-display text-lg italic leading-snug text-foreground md:text-xl">
              have a project in mind, or just want to chat?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              drop a message below, or pick up the phone at the bottom of the page. i usually respond faster than a
              compiler error.
            </p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-20 max-w-350 px-6 md:mt-32 md:px-12">
        <div className="grid gap-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-24">
          <div className="flex flex-col gap-14">
            <div data-reveal>
              <p className="mb-5 font-pixel text-xs text-muted-foreground">find me</p>
              <ul className="flex flex-col gap-1">
                {LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-4 py-2 ${focus}`}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                        <item.icon size={18} strokeWidth={1.5} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 transition-transform duration-300 group-hover:translate-x-1">
                        <span className="block font-pixel text-[11px] text-muted-foreground">{item.label}</span>
                        <span className="block truncate text-sm tracking-wide text-foreground">{item.val}</span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden
                        className="-translate-x-2 scale-0 text-foreground transition-transform duration-300 group-hover:translate-x-0 group-hover:scale-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal>
              <p className="mb-3 font-pixel text-xs text-muted-foreground">based in</p>
              <p className="font-display font-soft text-3xl leading-none tracking-[-0.03em] text-foreground md:text-4xl">
                johannesburg,
                <br />
                south africa
              </p>
              <p className="mt-4 flex items-center gap-2 font-pixel text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                {clock ? `${clock} sast, probably awake` : 'probably awake'}
              </p>
            </div>
          </div>

          <form data-reveal onSubmit={onSubmit} noValidate className="flex flex-col gap-10 md:gap-12">
            <div>
              <p className="font-pixel text-xs text-muted-foreground">send a message</p>
              <h2 className="mt-3 font-display font-soft text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em] text-foreground">
                tell me what you&rsquo;re building
              </h2>
            </div>

            <Line n="01" label="name">
              <input
                name="name"
                type="text"
                autoComplete="name"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="your name"
                className={input}
              />
            </Line>

            <Line n="02" label="email">
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={fEmail}
                onChange={(e) => setFEmail(e.target.value)}
                placeholder="you@email.com"
                className={input}
              />
            </Line>

            <fieldset className="min-w-0">
              <legend className="flex items-baseline gap-3 font-pixel text-xs text-muted-foreground">
                <span className="tabular-nums">03</span>what&rsquo;s it about
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOPICS.map((tp) => {
                  const on = topic === tp;
                  return (
                    <button
                      key={tp}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTopic(tp)}
                      className={`h-10 rounded-full px-5 font-pixel text-xs transition-colors duration-200 ${focus} ${
                        on ? 'bg-foreground text-background' : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                      }`}
                    >
                      {tp}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Line n="04" label="message">
              <textarea
                name="message"
                rows={4}
                value={fMsg}
                onChange={(e) => {
                  setFMsg(e.target.value);
                  if (formState !== 'idle') setFormState('idle');
                }}
                placeholder="tell me about the project"
                className={`${input} resize-none !text-xl md:!text-2xl`}
              />
            </Line>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="submit"
                className={`group flex items-center gap-5 rounded-full bg-foreground py-2 pl-7 pr-2 text-background transition-colors duration-300 hover:bg-primary hover:text-primary-foreground active:scale-[0.98] ${focus}`}
              >
                <span className="font-pixel text-sm">send message</span>
                <span className="grid size-11 place-items-center rounded-full bg-background text-foreground transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
                  <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
                </span>
              </button>
              <p aria-live="polite" className="font-pixel text-xs text-muted-foreground">
                {formState === 'missing'
                  ? 'add a message first'
                  : formState === 'sent'
                    ? 'opening your mail app. or call me, below'
                    : 'usually within a day'}
              </p>
            </div>
          </form>
        </div>
      </section>

      <section ref={stageRef} className="relative z-10 mt-28 md:mt-44">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 pb-10 text-center md:pb-14">
          <p data-reveal className="flex items-center gap-2 font-pixel text-xs text-muted-foreground">
            {!off && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-primary" />}
            {hint}
          </p>

          <div
            data-reveal
            aria-live="polite"
            aria-label={off ? `Dialled ${number || 'nothing yet'}` : 'Phone on the hook'}
            className="flex min-h-[1.1em] items-center justify-center font-display font-soft text-[clamp(2.25rem,7vw,5.25rem)] leading-none tracking-[-0.04em] tabular-nums"
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
              <span className="italic text-muted-foreground/70">pick up the phone</span>
            )}
          </div>

          <div data-reveal className="flex min-h-10 flex-wrap items-center justify-center gap-2">
            {status === 'connected' && (
              <>
                <a
                  href="https://wa.me/27780345709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${pill} bg-primary text-primary-foreground hover:bg-foreground hover:text-background`}
                >
                  open whatsapp
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                </a>
                <a href="tel:+27780345709" className={pillSoft}>
                  call
                </a>
              </>
            )}
            {status === 'idle' && off && number.length > 0 && (
              <button type="button" onClick={clearNumber} className={pillSoft}>
                clear
              </button>
            )}
            {status === 'idle' && off && number.length === 0 && (
              <span className="font-pixel text-xs text-muted-foreground/70">psst, try 078 034 5709</span>
            )}
            {off && (
              <button type="button" onClick={() => toggleHandset(false)} className={pillSoft}>
                hang up
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
              className={`grid size-10 place-items-center rounded-full bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${focus}`}
            >
              {sound ? <Volume2 size={15} strokeWidth={1.5} aria-hidden /> : <VolumeX size={15} strokeWidth={1.5} aria-hidden />}
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
              className="block h-auto w-full"
              role="img"
              aria-label="A big dome-shaped rotary telephone"
            >
              <g ref={phoneRef}>
                <path d={BODY} transform="translate(14 14)" className="fill-foreground" />

                <path ref={cordRef} d={cordPath(0)} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-foreground" />
                <path
                  ref={coilRef}
                  d={cordPath(0)}
                  fill="none"
                  strokeWidth="9"
                  strokeDasharray="2.5 7.5"
                  className="stroke-card"
                />

                <path d={BODY} strokeWidth="3" className="fill-primary stroke-foreground" />
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
                <circle cx="900" cy="474" r="18" strokeWidth="3" className={`stroke-foreground transition-colors duration-300 ${off ? 'fill-card' : 'fill-foreground'}`} />
                <circle cx="900" cy="474" r="6" className="fill-primary" />
                <text x="900" y="522" textAnchor="middle" dominantBaseline="central" fontSize="18" className="fill-primary-foreground font-pixel">
                  line
                </text>

                <circle cx={C.x} cy={C.y} r={R_PLATE + 16} className="fill-foreground" />
                <circle cx={C.x} cy={C.y} r={R_PLATE + 9} fill="none" strokeWidth="5" strokeDasharray="2.4 11" className="stroke-background/30" />
                {DIGITS.map((d) => {
                  const p = polar(R_HOLES, holeAngle(d));
                  return (
                    <text
                      key={d}
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="40"
                      className="fill-card font-pixel"
                    >
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
                <text x={C.x} y={C.y - 8} textAnchor="middle" dominantBaseline="central" fontSize="22" className="fill-primary-foreground font-pixel">
                  say
                </text>
                <text x={C.x} y={C.y + 16} textAnchor="middle" dominantBaseline="central" fontSize="22" className="fill-primary-foreground font-pixel">
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