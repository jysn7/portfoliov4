'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import Image, { type StaticImageData } from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

import { works, Category } from '../../lib/works';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const STEP = 22; // degrees between works on the dial
const IMG_SIZES = '(min-width: 768px) 640px, 90vw';
const MASK = 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)';

/* signpost board shape (arrow tip depth comes from --tip) */
const SIGN_R = 'polygon(0 0, calc(100% - var(--tip)) 0, 100% 50%, calc(100% - var(--tip)) 100%, 0 100%)';

/* wood: cartoon outline + tileable grain (horizontal for boards, vertical for the post) */
const INK = '#2a1608';
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
const VGRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200' viewBox='0 0 40 200'%3E%3Cg fill='none' stroke='%23915427' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M10 0 C14 50 6 100 10 150 S14 190 10 200'/%3E%3Cpath d='M28 0 C24 40 32 90 28 140 S24 190 28 200'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const t = (s: number) => (reduced() ? 0 : s);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const pad = (x: number) => String(x).padStart(2, '0');

/* The flapper on the wheel: pegs push it up, then it flicks back past centre and settles.
   s = 0 is a work sitting dead-centre; a peg crosses the flapper at s = 0.5. */
const FLAP_MAX = 18;
const flapAngle = (pos: number) => {
  const s = pos - Math.floor(pos);
  if (s >= 0.3 && s < 0.5) return FLAP_MAX * ((s - 0.3) / 0.2);
  if (s >= 0.5 && s < 0.7) return -FLAP_MAX * 0.45 * ((0.7 - s) / 0.2);
  return 0;
};

/* ------------------------------------------------------------------ */
/* Normalise whatever shape `works` has into one view model.            */
/* ------------------------------------------------------------------ */
type WorkView = {
  id: string | number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string | StaticImageData | '';
  href?: string;
  year?: string | number;
};

const toView = (w: unknown, i: number): WorkView => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = w as Record<string, any>;
  const first = (...keys: string[]) => {
    for (const k of keys) if (o[k] != null && o[k] !== '') return o[k];
    return undefined;
  };
  const rawTags = first('tags', 'tech', 'stack', 'technologies');
  const gallery = first('images', 'gallery');
  return {
    id: first('id', 'slug') ?? i,
    title: String(first('title', 'name') ?? 'Untitled'),
    category: String(first('category', 'type') ?? ''),
    description: String(first('description', 'summary', 'blurb', 'excerpt') ?? ''),
    tags: Array.isArray(rawTags) ? rawTags.map(String) : [],
    image: first('image', 'thumbnail', 'cover', 'img', 'preview') ?? (Array.isArray(gallery) ? gallery[0] : '') ?? '',
    href: first('href', 'link', 'url', 'liveUrl', 'live', 'site'),
    year: first('year', 'date'),
  };
};

/* Where a card / the image slot is, relative to the stage body (used for the fly animation) */
const cardBox = (card: HTMLElement, b: DOMRect) => {
  const r = card.getBoundingClientRect();
  const sc = Number(gsap.getProperty(card, 'scale')) || 1;
  const w = card.offsetWidth * sc;
  const h = card.offsetHeight * sc;
  return {
    x: r.left - b.left + r.width / 2 - w / 2,
    y: r.top - b.top + r.height / 2 - h / 2,
    width: w,
    height: h,
    rotate: Number(gsap.getProperty(card, 'rotate')) || 0,
    borderRadius: 12,
  };
};
const slotBox = (slot: HTMLElement, b: DOMRect) => {
  const s = slot.getBoundingClientRect();
  return { x: s.left - b.left, y: s.top - b.top, width: s.width, height: s.height, rotate: 0, borderRadius: 16 };
};

/* ------------------------------------------------------------------ */
/* one wooden arrow board: outline, grain, bevel bands, nails, optional knot */
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

/* ------------------------------------------------------------------ */

export default function WorksPage() {
  const stageRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const pegRingRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const hubSpinRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const flyInnerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const imgRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flapTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const dial = useRef({ pos: 0 });
  const size = useRef({ W: 0, H: 0, R: 0, cx: 0, cy: 0 });
  const modeRef = useRef<'browse' | 'detail'>('browse');
  const busy = useRef(false);
  const hiddenIdx = useRef(-1);
  const activeRef = useRef(0);
  const selectedRef = useRef(0);
  const dragMoved = useRef(false);
  const viewsRef = useRef<WorkView[]>([]);
  const firstInfo = useRef(true);

  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<'browse' | 'detail'>('browse');

  const filterOptions: (Category | 'All')[] = ['All', 'Web', 'Game', '3d', 'Experimental'];

  const views = useMemo(
    () => (activeFilter === 'All' ? works : works.filter((w) => w.category === activeFilter)).map(toView),
    [activeFilter]
  );
  viewsRef.current = views;

  /* bezel ticks (every quarter step) */
  const ticks = useMemo(() => {
    const count = Math.min(64, 33 + 4 * Math.max(0, views.length - 1));
    return Array.from({ length: count }, (_, k) => ({ deg: (k - 16) * (STEP / 4), major: (k - 16) % 4 === 0 }));
  }, [views.length]);

  /* pegs sit half a step between works, so the flapper rests between two pegs on every work */
  const pegs = useMemo(
    () => Array.from({ length: views.length + 3 }, (_, k) => (k - 1.5) * STEP),
    [views.length]
  );

  const n = views.length;
  const cur = views[selected ?? active] ?? views[0];

  /* ---------------- geometry ---------------- */
  const measure = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const W = body.clientWidth;
    const H = body.clientHeight;
    const mobile = W < 768;

    const fitH = H * 0.72;
    const R = mobile
      ? clamp(Math.min(fitH, W * 0.7), 150, 290)
      : clamp(Math.min(fitH, W * 0.42), 220, 520);
    const cx = W;
    const cy = H / 2;
    size.current = { W, H, R, cx, cy };

    const ring = (el: HTMLElement | null, r: number) =>
      el && gsap.set(el, { x: cx - r, y: cy - r, width: r * 2, height: r * 2 });
    ring(plateRef.current, R * 1.45);
    ring(faceRef.current, R * 0.66);
    ring(pegRingRef.current, R * 0.5);
    ring(hubRef.current, R * 0.26);

    // flapper: base on the pivot, tip pointing out toward the works
    const L = R * 0.27;
    const fh = clamp(R * 0.075, 14, 34);
    const pivotX = cx - R * 0.3;
    if (flapRef.current)
      gsap.set(flapRef.current, { x: pivotX - L, y: cy - fh / 2, width: L, height: fh, transformOrigin: '100% 50%' });
    if (pivotRef.current) gsap.set(pivotRef.current, { x: pivotX, y: cy, xPercent: -50, yPercent: -50 });

    const ch = R * 0.37;
    cardRefs.current.forEach((el) => el && gsap.set(el, { width: ch * 1.6, height: ch }));
  }, []);

  /* place every card on the arc for the current dial position */
  const layout = useCallback(() => {
    const { R, cx, cy } = size.current;
    if (!R) return;
    const pos = dial.current.pos;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos;
      const ad = Math.abs(d);
      const a = d * STEP;
      const rad = (a * Math.PI) / 180;
      const op = i === hiddenIdx.current ? 0 : ad < 1.3 ? 1 : Math.max(0, 1 - (ad - 1.3) / 1.4);
      gsap.set(el, {
        x: cx - R * Math.cos(rad),
        y: cy + R * Math.sin(rad),
        xPercent: -50,
        yPercent: -50,
        rotate: a * 0.3,
        scale: 1.16 - Math.min(ad, 2) * 0.2,
        autoAlpha: op,
        zIndex: Math.round(100 - ad * 10),
      });

      // parallax: the picture slides against the card as it travels
      const img = imgRefs.current[i];
      if (img) {
        const dd = clamp(d, -1.6, 1.6);
        gsap.set(img, { x: dd * -6, y: dd * -9 });
      }
    });

    if (plateRef.current) gsap.set(plateRef.current, { rotate: pos * STEP });
    if (pegRingRef.current) gsap.set(pegRingRef.current, { rotate: pos * STEP });
    if (hubSpinRef.current) gsap.set(hubSpinRef.current, { rotate: pos * STEP * 1.6 });
    flapTo.current?.(flapAngle(pos));

    const r = clamp(Math.round(pos), 0, Math.max(0, viewsRef.current.length - 1));
    if (r !== activeRef.current) {
      activeRef.current = r;
      setActive(r);
    }
  }, []);

  const snapFly = useCallback(() => {
    const body = bodyRef.current;
    const slot = slotRef.current;
    const fly = flyRef.current;
    if (!body || !slot || !fly) return;
    const { x, y, width, height } = slotBox(slot, body.getBoundingClientRect());
    gsap.set(fly, { x, y, width, height });
  }, []);

  /* ---------------- dial movement ---------------- */
  const goTo = useCallback(
    (target: number, dur = 0.7) => {
      gsap.to(dial.current, {
        pos: target,
        duration: t(dur),
        ease: 'power3.out',
        overwrite: true,
        onUpdate: layout,
        onComplete: layout,
      });
    },
    [layout]
  );

  /* ---------------- open ---------------- */
  const open = useCallback(
    (i: number) => {
      const body = bodyRef.current;
      const fly = flyRef.current;
      const slot = slotRef.current;
      const card = cardRefs.current[i];
      if (!body || !fly || !slot || !card || busy.current || modeRef.current !== 'browse') return;

      busy.current = true;
      modeRef.current = 'detail';
      selectedRef.current = i;

      const b = body.getBoundingClientRect();
      const from = cardBox(card, b);

      flushSync(() => {
        setSelected(i);
        setMode('detail');
      });

      const to = slotBox(slot, b);
      const R = size.current.R;
      const details = detailRef.current?.querySelectorAll('[data-detail]') ?? [];

      hiddenIdx.current = i;
      gsap.set(fly, { ...from, autoAlpha: 1 });
      goTo(i, 1);

      gsap
        .timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            busy.current = false;
            snapFly();
          },
        })
        .to(fly, { ...to, duration: t(1.05) }, 0)
        .to(wheelRef.current, { x: R * 0.7, autoAlpha: 0, duration: t(0.9), ease: 'power3.in' }, 0)
        .to(infoRef.current, { x: -30, autoAlpha: 0, duration: t(0.45), ease: 'power2.in' }, 0)
        .set(detailRef.current, { autoAlpha: 1 }, t(0.45))
        .fromTo(
          details,
          { x: 40, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: t(0.8), stagger: t(0.07), ease: 'power3.out' },
          t(0.55)
        );
    },
    [goTo, snapFly]
  );

  /* ---------------- close ---------------- */
  const close = useCallback(() => {
    const body = bodyRef.current;
    const fly = flyRef.current;
    const i = selectedRef.current;
    const card = cardRefs.current[i];
    if (!body || !fly || !card || busy.current || modeRef.current !== 'detail') return;

    busy.current = true;
    const R = size.current.R;

    gsap.killTweensOf(dial.current);
    dial.current.pos = i;
    layout();
    gsap.set(wheelRef.current, { x: 0 });

    const to = cardBox(card, body.getBoundingClientRect());
    const details = detailRef.current?.querySelectorAll('[data-detail]') ?? [];

    gsap
      .timeline({
        onComplete: () => {
          hiddenIdx.current = -1;
          gsap.set(fly, { autoAlpha: 0 });
          layout();
          modeRef.current = 'browse';
          busy.current = false;
          setMode('browse');
          setSelected(null);
        },
      })
      .to(
        details,
        { x: 30, autoAlpha: 0, duration: t(0.35), stagger: { each: 0.04, from: 'end' }, ease: 'power2.in' },
        0
      )
      .set(detailRef.current, { autoAlpha: 0 }, t(0.5))
      .to(fly, { ...to, duration: t(1), ease: 'power3.inOut' }, t(0.15))
      .fromTo(
        wheelRef.current,
        { x: R * 0.7, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: t(0.9), ease: 'power3.out' },
        t(0.3)
      )
      .to(infoRef.current, { x: 0, autoAlpha: 1, duration: t(0.5), ease: 'power3.out' }, t(0.7));
  }, [layout]);

  /* previous / next */
  const go = useCallback(
    (dir: number) => {
      const len = viewsRef.current.length;
      if (busy.current || modeRef.current !== 'detail' || len < 2) return;
      const next = (selectedRef.current + dir + len) % len;
      selectedRef.current = next;
      hiddenIdx.current = next;
      flushSync(() => setSelected(next));

      if (!reduced()) {
        gsap.fromTo(
          flyInnerRef.current,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', overwrite: true }
        );
        const q = detailRef.current?.querySelectorAll('[data-detail-swap]');
        if (q)
          gsap.fromTo(
            q,
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true }
          );
      }
      goTo(next, 0.8);
    },
    [goTo]
  );

  /* ---------------- reset on filter change ---------------- */
  useIsoLayoutEffect(() => {
    cardRefs.current.length = views.length;
    imgRefs.current.length = views.length;
    gsap.killTweensOf([dial.current, flyRef.current, wheelRef.current, infoRef.current, detailRef.current]);
    modeRef.current = 'browse';
    busy.current = false;
    hiddenIdx.current = -1;
    activeRef.current = 0;
    dial.current.pos = 0;
    setMode('browse');
    setSelected(null);
    setActive(0);
    gsap.set(wheelRef.current, { x: 0, autoAlpha: 1 });
    gsap.set(infoRef.current, { x: 0, autoAlpha: 1 });
    gsap.set(detailRef.current, { autoAlpha: 0 });
    gsap.set(flyRef.current, { autoAlpha: 0 });
    measure();
    layout();
  }, [views, measure, layout]);

  /* ---------------- mount ---------------- */
  useIsoLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const stage = stageRef.current;
    const flap = flapRef.current;
    const els = [dial.current, flyRef.current, wheelRef.current, infoRef.current, detailRef.current, stage, flap];

    if (flap) flapTo.current = gsap.quickTo(flap, 'rotation', { duration: 0.18, ease: 'power3.out' });

    if (!reduced()) {
      dial.current.pos = -2;
      layout();
      gsap.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' });
      gsap.to(dial.current, { pos: 0, duration: 1.8, ease: 'power3.out', delay: 0.35, onUpdate: layout });
      gsap.from('[data-board]', { x: '-115%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
      gsap.from('[data-reveal]', { y: 28, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.5 });
    }

    const ro = new ResizeObserver(() => {
      measure();
      layout();
      if (modeRef.current === 'detail' && !busy.current) snapFly();
    });
    ro.observe(body);

    return () => {
      ro.disconnect();
      gsap.killTweensOf(els);
      gsap.killTweensOf('[data-board]');
      gsap.killTweensOf('[data-reveal]');
    };
  }, [measure, layout, snapFly]);

  /* info reveal */
  useEffect(() => {
    if (firstInfo.current) {
      firstInfo.current = false;
      return;
    }
    if (modeRef.current !== 'browse' || reduced()) return;
    const el = infoRef.current;
    if (!el) return;
    gsap.fromTo(
      el.querySelectorAll('[data-info]'),
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true }
    );
  }, [active]);

  /* mouse wheel turns the dial (page still scrolls at either end) */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let timer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== 'browse' || busy.current) return;
      const len = viewsRef.current.length;
      if (len < 2 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const pos = dial.current.pos;
      if ((e.deltaY > 0 && pos >= len - 1 - 0.01) || (e.deltaY < 0 && pos <= 0.01)) return;

      e.preventDefault();
      gsap.killTweensOf(dial.current);
      const px = size.current.R * ((STEP * Math.PI) / 180);
      dial.current.pos = clamp(pos + e.deltaY / (px * 0.7), 0, len - 1);
      layout();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => goTo(Math.round(dial.current.pos), 0.5), 140);
    };

    body.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      body.removeEventListener('wheel', onWheel);
      window.clearTimeout(timer);
    };
  }, [layout, goTo]);

  /* cursor chip: "drag" over the wheel, "open" over a work (mouse only) */
  useEffect(() => {
    const body = bodyRef.current;
    const chip = cursorRef.current;
    if (!body || !chip || !window.matchMedia('(pointer: fine)').matches) return;

    gsap.set(chip, { autoAlpha: 0, scale: 0.6 });
    const qx = gsap.quickTo(chip, 'x', { duration: 0.35, ease: 'power3.out' });
    const qy = gsap.quickTo(chip, 'y', { duration: 0.35, ease: 'power3.out' });
    let shown = false;

    const show = (v: boolean) => {
      if (v === shown) return;
      shown = v;
      gsap.to(chip, { autoAlpha: v ? 1 : 0, scale: v ? 1 : 0.6, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const b = body.getBoundingClientRect();
      const { R, cx } = size.current;
      const lx = e.clientX - b.left;
      const ly = e.clientY - b.top;
      const inDial =
        modeRef.current === 'browse' && !busy.current && viewsRef.current.length > 0 && lx > cx - R * 1.45;
      if (!inDial) return show(false);
      if (!shown) gsap.set(chip, { x: lx + 18, y: ly + 18 });
      show(true);
      qx(lx + 18);
      qy(ly + 18);
      if (cursorTextRef.current)
        cursorTextRef.current.textContent = (e.target as Element).closest('[data-card]') ? 'open' : 'drag';
    };
    const onLeave = () => show(false);

    body.addEventListener('pointermove', onMove);
    body.addEventListener('pointerleave', onLeave);
    return () => {
      body.removeEventListener('pointermove', onMove);
      body.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(chip);
    };
  }, []);

  /* drag: vertical with a mouse, horizontal swipe on touch (so the page can still scroll) */
  const onWheelPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (modeRef.current !== 'browse' || busy.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const len = viewsRef.current.length;
    dragMoved.current = false;
    if (len < 2) return;

    const isTouch = e.pointerType !== 'mouse';
    const axis = (ev: { clientX: number; clientY: number }) => (isTouch ? ev.clientX : ev.clientY);
    const px = size.current.R * ((STEP * Math.PI) / 180);
    const a0 = axis(e);
    const p0 = dial.current.pos;
    let last = a0;
    let lastT = performance.now();
    let v = 0;
    gsap.killTweensOf(dial.current);

    const move = (ev: PointerEvent) => {
      const d = axis(ev) - a0;
      if (Math.abs(d) > 6) dragMoved.current = true;
      if (!dragMoved.current) return;
      dial.current.pos = clamp(p0 - d / px, 0, len - 1);
      layout();
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) v = v * 0.6 + ((-(axis(ev) - last) / px / dt) * 1000) * 0.4;
      last = axis(ev);
      lastT = now;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (dragMoved.current) {
        goTo(clamp(Math.round(dial.current.pos + v * 0.18), 0, len - 1), 0.8);
        window.setTimeout(() => (dragMoved.current = false), 0);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  /* keyboard */
  const onKey = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (modeRef.current === 'detail') {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        go(-1);
      }
      return;
    }
    if (busy.current) return;
    const step = (d: number) => goTo(clamp(Math.round(dial.current.pos) + d, 0, Math.max(0, n - 1)), 0.6);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      open(activeRef.current);
    }
  };

  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const roundBtn = `grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 ${focus}`;
  const step = (d: number) => goTo(clamp(Math.round(dial.current.pos) + d, 0, Math.max(0, n - 1)), 0.6);

  return (
    <main className="relative w-full select-none overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 38rem at 88% 9rem, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 70%), radial-gradient(46rem 34rem at -5% 52rem, color-mix(in srgb, var(--foreground) 5%, transparent), transparent 70%)',
        }}
      />

      <header className="relative z-10 pt-40 md:pt-72">
        <div className="pointer-events-none absolute left-0 top-40 h-[17rem] w-full md:top-72 md:h-[26rem]">
          <span
            aria-hidden
            className="absolute -top-5 bottom-0 left-0 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] md:w-10"
            style={{ backgroundColor: '#b97c43', backgroundImage: VGRAIN, backgroundSize: '40px 200px', borderColor: INK }}
          />

          <div className="absolute left-0 top-0 w-full">
            <div data-board className="absolute left-0 top-10 md:top-16">
              <Board
                tone="#c98d51"
                className="origin-left -translate-x-6 -rotate-[8deg] [--tip:2.5rem] md:[--tip:4.25rem]"
                inner="py-1 pl-14 pr-[calc(var(--tip)+1rem)] md:py-2 md:pl-[5.5rem] md:pr-[calc(var(--tip)+1.75rem)]"
                nails="left-[1.9rem] md:left-[2.2rem]"
                knot="right-[calc(var(--tip)+0.3rem)] top-2.5 md:top-4"
              >
                <h1 className="relative font-display font-soft text-[clamp(3.25rem,13vw,8.5rem)] font-normal leading-none tracking-[-0.045em] text-[#2a1608] [text-shadow:0_2px_0_#efc18a] md:[text-shadow:0_3px_0_#efc18a]">
                  works
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
                  selected work
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
                  turn the dial, pick one
                </span>
              </Board>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-350 px-6 pt-[17rem] md:flex md:min-h-[26rem] md:items-end md:justify-end md:px-12 md:pt-0">
          <div data-reveal className="max-w-[44ch] md:pb-4">
            <p className="font-display text-lg italic leading-snug text-foreground md:text-xl">
              websites, games and odd little experiments.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              each one points somewhere different. pick a direction, turn the dial, and see where it leads.
            </p>

            <div role="group" aria-label="Filter works" className="mt-6 flex flex-wrap gap-2">
              {filterOptions.map((f) => {
                const on = activeFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActiveFilter(f)}
                    className={`h-10 rounded-full px-5 font-pixel text-xs transition-colors duration-200 ${focus} ${
                      on
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground hover:bg-foreground hover:text-background'
                    }`}
                  >
                    {f.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <section
        ref={stageRef}
        tabIndex={0}
        aria-label="Works dial. Arrow keys turn it, Enter opens a work, Escape goes back."
        onKeyDown={onKey}
        className="relative z-10 mt-12 w-full outline-none focus-visible:outline-2 focus-visible:-outline-offset-6 focus-visible:outline-foreground md:mt-20"
      >
        <p className="sr-only" aria-live="polite">
          {cur ? (mode === 'detail' ? `Opened ${cur.title}` : `${cur.title}, ${active + 1} of ${n}`) : ''}
        </p>

        <div ref={bodyRef} className="relative overflow-hidden h-[40rem] md:h-[clamp(36rem,84svh,54rem)]">
          {n === 0 && (
            <p className="absolute inset-0 grid place-items-center font-display text-lg italic text-muted-foreground">
              nothing in this category yet
            </p>
          )}

          {/* The wheel (masked top and bottom so it fades instead of spilling out) */}
          <div
            ref={wheelRef}
            onPointerDown={onWheelPointerDown}
            className="pointer-events-none absolute inset-0"
            style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          >
            {/* bezel: tick marks and numbers, turns with the dial */}
            <div
              ref={plateRef}
              className="pointer-events-auto absolute left-0 top-0 cursor-grab touch-pan-y rounded-full border border-border bg-card/60 active:cursor-grabbing"
            >
              {ticks.map(({ deg, major }) => {
                const idx = deg / STEP;
                return (
                  <span
                    key={deg}
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ transform: `rotate(${-deg}deg)` }}
                  >
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full ${
                        major ? 'h-px w-3 bg-foreground/60' : 'h-px w-1.5 bg-muted-foreground/40'
                      }`}
                    />
                    {major && idx >= 0 && idx < n && (
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-muted-foreground/70">
                        {pad(idx + 1)}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* still face of the wheel */}
            <div ref={faceRef} aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full border border-border bg-card" />

            {/* pegs between the works; they turn with the dial and knock the flapper */}
            <div ref={pegRingRef} aria-hidden className="pointer-events-none absolute left-0 top-0">
              {pegs.map((deg) => (
                <span key={deg} className="absolute inset-0" style={{ transform: `rotate(${-deg}deg)` }}>
                  <span
                    className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-[#b9bfc6]"
                    style={{ borderColor: INK }}
                  />
                </span>
              ))}
            </div>

            {/* wooden hub with a crank knob, so you can see it turning */}
            <div
              ref={hubRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0"
              style={{ filter: `drop-shadow(-3px 4px 0 ${INK})` }}
            >
              <div
                ref={hubSpinRef}
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: '#c98d51',
                  backgroundImage: GRAIN,
                  backgroundSize: '260px 100px',
                  border: `3px solid ${INK}`,
                }}
              >
                <span
                  className="absolute left-[10%] top-1/2 size-4 -translate-y-1/2 rounded-full border-[3px] bg-[#FF8FA3] md:size-5"
                  style={{ borderColor: INK }}
                />
              </div>
            </div>

            {/* the flapper that points at the active work */}
            <div ref={flapRef} aria-hidden className="pointer-events-none absolute left-0 top-0">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="size-full overflow-visible">
                <polygon
                  points="2,20 98,2 98,38"
                  fill="#FF8FA3"
                  stroke={INK}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <span
              ref={pivotRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 size-3.5 rounded-full border-[3px] bg-[#b9bfc6]"
              style={{ borderColor: INK }}
            />

            {/* works */}
            {views.map((v, i) => (
              <button
                key={v.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-card
                type="button"
                aria-label={`Open ${v.title}`}
                onClick={() => {
                  if (dragMoved.current) return;
                  open(i);
                }}
                className={`group pointer-events-auto absolute left-0 top-0 touch-pan-y overflow-hidden rounded-xl bg-muted text-left transition-[box-shadow,transform] duration-300 ease-out ${focus} ${
                  i === active ? '-translate-x-0.5 -translate-y-0.5 shadow-[6px_6px_0_var(--primary)]' : ''
                }`}
              >
                {v.image ? (
                  <span
                    ref={(el) => {
                      imgRefs.current[i] = el;
                    }}
                    className="pointer-events-none absolute -inset-4"
                  >
                    <Image
                      src={v.image}
                      alt=""
                      fill
                      draggable={false}
                      sizes={IMG_SIZES}
                      className={`object-cover transition-transform duration-[900ms] ease-out ${
                        i === active ? 'scale-[1.03]' : ''
                      }`}
                    />
                  </span>
                ) : null}
                <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-card/90 px-2.5 py-1 font-pixel text-xs text-foreground backdrop-blur">
                  {v.title}
                </span>
              </button>
            ))}
          </div>

          {/* Left: what the dial is pointing at */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="mx-auto flex h-full max-w-350 items-start px-6 pt-8 md:items-center md:px-12 md:pt-0">
              <div ref={infoRef} className="max-w-[55%] md:max-w-xs lg:max-w-md">
                {cur && (
                  <>
                    <p data-info className="font-pixel text-xs tabular-nums text-muted-foreground">
                      {pad(active + 1)} / {pad(n)}
                      {cur.category ? ` · ${cur.category.toLowerCase()}` : ''}
                    </p>
                    <h2
                      data-info
                      className="mt-3 font-display font-soft text-[clamp(2rem,4.6vw,4rem)] font-normal leading-none tracking-[-0.04em] text-foreground"
                    >
                      {cur.title}
                    </h2>
                  </>
                )}
                <p data-info className="mt-6 font-pixel text-xs text-muted-foreground">
                  <span className="md:hidden">swipe the dial, tap to open</span>
                  <span className="hidden md:inline">drag or scroll the dial, click to open</span>
                </p>
                {n > 1 && (
                  <div className="pointer-events-auto mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous work"
                      disabled={active <= 0}
                      onClick={() => step(-1)}
                      className={roundBtn}
                    >
                      <ArrowUp size={18} strokeWidth={1.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Next work"
                      disabled={active >= n - 1}
                      onClick={() => step(1)}
                      className={roundBtn}
                    >
                      <ArrowDown size={18} strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details: image slot on the left, copy on the right */}
          <div ref={detailRef} className="invisible absolute inset-0 z-20">
            <div className="mx-auto flex h-full max-w-350 flex-col gap-4 px-6 py-5 md:px-12 md:py-8">
              <div data-detail className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Back to the dial"
                  className={`flex h-10 items-center gap-2 rounded-full bg-muted px-5 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${focus}`}
                >
                  <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
                  back
                </button>
                {n > 0 && (
                  <span className="font-pixel text-xs tabular-nums text-muted-foreground">
                    {pad((selected ?? active) + 1)} / {pad(n)}
                  </span>
                )}
              </div>

              <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-5 md:grid-cols-[1.1fr_1fr] md:grid-rows-1 md:gap-12">
                <div className="flex items-center">
                  <div ref={slotRef} className="aspect-[16/10] w-full" aria-hidden />
                </div>

                <div className="flex min-h-0 flex-col justify-center gap-3 overflow-hidden md:gap-5">
                  {cur && (
                    <>
                      <p data-detail data-detail-swap className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-primary px-3 py-1 font-pixel text-xs text-primary-foreground">
                          {cur.category}
                        </span>
                        {cur.year ? <span className="font-pixel text-xs text-muted-foreground">{cur.year}</span> : null}
                      </p>

                      <h2
                        data-detail
                        data-detail-swap
                        className="font-display font-soft text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[0.95] tracking-[-0.04em] text-foreground"
                      >
                        {cur.title}
                      </h2>

                      <p
                        data-detail
                        data-detail-swap
                        className="line-clamp-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground md:line-clamp-none"
                      >
                        {cur.description}
                      </p>

                      {cur.tags.length > 0 && (
                        <ul data-detail data-detail-swap className="flex flex-wrap gap-2">
                          {cur.tags.map((tag) => (
                            <li key={tag} className="rounded-full bg-muted px-3 py-1 font-pixel text-xs text-foreground">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div data-detail className="mt-1 flex flex-wrap items-center gap-4">
                        {cur.href && (
                          <a
                            href={cur.href}
                            target={/^https?:/.test(cur.href) ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-5 rounded-full bg-foreground py-2 pl-7 pr-2 text-background transition-colors duration-300 hover:bg-primary hover:text-primary-foreground ${focus}`}
                          >
                            <span className="font-pixel text-sm">visit project</span>
                            <span className="grid size-11 place-items-center rounded-full bg-background text-foreground transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
                              <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
                            </span>
                          </a>
                        )}
                        {n > 1 && (
                          <span className="flex items-center gap-2">
                            <button type="button" aria-label="Previous work" onClick={() => go(-1)} className={roundBtn}>
                              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
                            </button>
                            <button type="button" aria-label="Next work" onClick={() => go(1)} className={roundBtn}>
                              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                            </button>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* The flying image: starts on the dial, lands in the slot */}
          <div
            ref={flyRef}
            aria-hidden
            className="pointer-events-none invisible absolute left-0 top-0 z-30 overflow-hidden rounded-2xl bg-muted"
          >
            <div ref={flyInnerRef} className="absolute inset-0">
              {cur?.image ? (
                <Image src={cur.image} alt="" fill draggable={false} sizes={IMG_SIZES} className="object-cover" />
              ) : null}
            </div>
          </div>

          {/* Cursor chip (mouse only) */}
          <div ref={cursorRef} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 z-40">
            <span
              ref={cursorTextRef}
              className="flex h-8 items-center rounded-full bg-foreground px-3.5 font-pixel text-xs text-background"
            >
              drag
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}