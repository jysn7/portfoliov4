import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';

import type { WorkView } from '../data';
import {
  STEP,
  clamp,
  flapAngle,
  reduced,
  t,
  useIsoLayoutEffect,
  type DialSize,
} from '../shared';
import ArchiveFilters from './ArchiveFilters';
import { CursorChip, useCursorChip } from './CursorChip';
import WheelDetail from '@/components/work/archive/WheelDetail';
import WheelDial, { type DialRefs } from '@/components/work/archive/WheelDial';
import WheelInfo from './WheelInfo';

/* Where a card / the image slot is, relative to the dial stage (used for the fly animation) */
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

/* the dial for everything that is not featured: owns all the state and motion, the pieces are in sibling files */
export default function ArchiveWheel({ items, expanded }: { items: WorkView[]; expanded: boolean }) {
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
  const size = useRef<DialSize>({ W: 0, H: 0, R: 0, cx: 0, cy: 0 });
  const modeRef = useRef<'browse' | 'detail'>('browse');
  const busy = useRef(false);
  const hiddenIdx = useRef(-1);
  const activeRef = useRef(0);
  const selectedRef = useRef(0);
  const dragMoved = useRef(false);
  const viewsRef = useRef<WorkView[]>([]);
  const firstInfo = useRef(true);
  const introPlayed = useRef(false);

  const [activeFilter, setActiveFilter] = useState('All');
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<'browse' | 'detail'>('browse');

  const categories = useMemo(() => Array.from(new Set(items.map((v) => v.category).filter(Boolean))), [items]);
  const filterOptions = ['All', ...categories];

  const views = useMemo(
    () => (activeFilter === 'All' ? items : items.filter((v) => v.category === activeFilter)),
    [items, activeFilter]
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

  const dialRefs: DialRefs = {
    wheel: wheelRef,
    plate: plateRef,
    face: faceRef,
    pegRing: pegRingRef,
    hub: hubRef,
    hubSpin: hubSpinRef,
    flap: flapRef,
    pivot: pivotRef,
    cards: cardRefs,
    imgs: imgRefs,
  };

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

  const step = (d: number) => goTo(clamp(Math.round(dial.current.pos) + d, 0, Math.max(0, n - 1)), 0.6);

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

  /* back to a clean browse state (filter change, or the archive being closed) */
  const hardReset = useCallback(() => {
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
  }, [measure, layout]);

  useIsoLayoutEffect(() => {
    cardRefs.current.length = views.length;
    imgRefs.current.length = views.length;
    hardReset();
  }, [views, hardReset]);

  /* ---------------- mount ---------------- */
  useIsoLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const flap = flapRef.current;
    const els = [dial.current, flyRef.current, wheelRef.current, infoRef.current, detailRef.current, flap];

    if (flap) flapTo.current = gsap.quickTo(flap, 'rotation', { duration: 0.18, ease: 'power3.out' });
    measure();
    layout();

    const ro = new ResizeObserver(() => {
      measure();
      layout();
      if (modeRef.current === 'detail' && !busy.current) snapFly();
    });
    ro.observe(body);

    return () => {
      ro.disconnect();
      gsap.killTweensOf(els);
    };
  }, [measure, layout, snapFly]);

  /* the first time the archive opens the dial spins in; closing it resets the dial */
  useEffect(() => {
    if (!expanded) {
      if (modeRef.current === 'detail' || busy.current) hardReset();
      return;
    }
    if (introPlayed.current) return;
    introPlayed.current = true;
    measure();
    if (reduced()) {
      layout();
      return;
    }
    dial.current.pos = -2;
    layout();
    gsap.to(dial.current, { pos: 0, duration: 1.8, ease: 'power3.out', delay: 0.5, onUpdate: layout });
  }, [expanded, hardReset, measure, layout]);

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

  useCursorChip({
    bodyRef,
    chipRef: cursorRef,
    textRef: cursorTextRef,
    size,
    modeRef,
    busy,
    viewsRef,
  });

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

  return (
    <div className="pt-4 md:pt-8">
      <ArchiveFilters options={filterOptions} active={activeFilter} onChange={setActiveFilter} />

      <section
        tabIndex={0}
        aria-label="Archive dial. Arrow keys turn it, Enter opens a work, Escape goes back."
        onKeyDown={onKey}
        className="relative w-full outline-none focus-visible:outline-2 focus-visible:-outline-offset-6 focus-visible:outline-foreground"
      >
        <p className="sr-only" aria-live="polite">
          {cur ? (mode === 'detail' ? `Opened ${cur.title}` : `${cur.title}, ${active + 1} of ${n}`) : ''}
        </p>

        <div ref={bodyRef} className="relative h-[40rem] overflow-hidden md:h-[clamp(36rem,84svh,54rem)]">
          {n === 0 && (
            <p className="absolute inset-0 grid place-items-center font-display text-lg italic text-muted-foreground">
              nothing in this category yet
            </p>
          )}

          <WheelDial
            refs={dialRefs}
            views={views}
            ticks={ticks}
            pegs={pegs}
            active={active}
            onPointerDown={onWheelPointerDown}
            onCardClick={(i) => {
              if (dragMoved.current) return;
              open(i);
            }}
          />

          <WheelInfo infoRef={infoRef} cur={cur} active={active} n={n} onStep={step} />

          <WheelDetail
            detailRef={detailRef}
            slotRef={slotRef}
            flyRef={flyRef}
            flyInnerRef={flyInnerRef}
            cur={cur}
            index={selected ?? active}
            n={n}
            onClose={close}
            onGo={go}
          />

          <CursorChip chipRef={cursorRef} textRef={cursorTextRef} />
        </div>
      </section>
    </div>
  );
}