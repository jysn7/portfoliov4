'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { BODY, t, reduced } from '@/lib/labs/constants';
import { LABS, FILTERS } from '@/lib/labs/data';
import type { CarouselApi } from '@/lib/labs/carouselApi';
import { LabsHero } from '@/components/labs/LabsHero';
import { LabsFilters } from '@/components/labs/LabsFilters';
import { LabsCarousel } from '@/components/labs/LabsCarousel';
import { LabCanvas } from '@/components/labs/LabCanvas';
import { FlyPreview } from '@/components/labs/FlyPreview';

export default function LabsPage() {
  const mainRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const apiRef = useRef<CarouselApi | null>(null);

  const busy = useRef(false);
  const openRef = useRef<string | null>(null);
  const alive = useRef(true);
  const actions = useRef<{ close: () => void; step: (d: 1 | -1) => void }>({ close: () => {}, step: () => {} });

  const [filter, setFilter] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [flyId, setFlyId] = useState(LABS[0].id);

  const views = useMemo(() => LABS.filter((l) => filter === 'All' || l.kind === filter), [filter]);
  const lab = openId ? (LABS.find((l) => l.id === openId) ?? null) : null;
  const pos = lab ? views.findIndex((l) => l.id === lab.id) : -1;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      gsap.killTweensOf([flyRef.current, demoRef.current, viewRef.current, boxRef.current].filter(Boolean));
    };
  }, []);

  const rel = (r: DOMRect) => {
    const s = sectionRef.current!.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, width: r.width, height: r.height };
  };

  const openLab = (id: string, from: DOMRect) => {
    const fly = flyRef.current;
    const section = sectionRef.current;
    if (!fly || !section || busy.current || openRef.current) return;
    busy.current = true;
    openRef.current = id;
    const start = rel(from);

    flushSync(() => {
      setFlyId(id);
      setOpenId(id);
      setLive(false);
    });

    const slot = slotRef.current;
    if (!slot) {
      busy.current = false;
      openRef.current = null;
      return;
    }
    const end = rel(slot.getBoundingClientRect());
    const parts = gsap.utils.toArray<HTMLElement>('[data-d]', section);
    const title = section.querySelector<HTMLElement>('[data-d-title]');

    gsap.set(fly, { ...start, autoAlpha: 1 });
    gsap.set(parts, { autoAlpha: 0 });
    if (title) gsap.set(title, { yPercent: 110 });

    section.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });

    const tl = gsap.timeline({
      onComplete: () => {
        if (!alive.current) return;
        flushSync(() => setLive(true));
        gsap.fromTo(demoRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.5), ease: 'power2.out' });
        gsap.to(fly, {
          autoAlpha: 0,
          duration: t(0.4),
          delay: t(0.1),
          onComplete: () => {
            busy.current = false;
            backRef.current?.focus({ preventScroll: true });
          },
        });
      },
    });
    tl.to(fly, { ...end, duration: t(1.1), ease: 'power3.inOut' }, 0).to(
      parts,
      { autoAlpha: 1, duration: t(0.7), stagger: t(0.07), ease: 'power3.out' },
      t(0.3)
    );
    if (title) tl.to(title, { yPercent: 0, duration: t(0.9), ease: 'expo.out' }, t(0.35));
  };

  const step = (dir: 1 | -1) => {
    const id = openRef.current;
    if (!id || busy.current || views.length < 2) return;
    const i = views.findIndex((l) => l.id === id);
    const next = views[(i + dir + views.length) % views.length];
    busy.current = true;

    gsap.to(demoRef.current, {
      autoAlpha: 0,
      duration: t(0.25),
      ease: 'power2.in',
      onComplete: () => {
        if (!alive.current) return;
        openRef.current = next.id;
        flushSync(() => {
          setOpenId(next.id);
          setFlyId(next.id);
        });
        const section = sectionRef.current!;
        gsap.fromTo(demoRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.5), ease: 'power2.out' });
        const title = section.querySelector('[data-d-title]');
        if (title) gsap.fromTo(title, { yPercent: 110 * dir }, { yPercent: 0, duration: t(0.8), ease: 'expo.out' });
        gsap.fromTo(
          section.querySelectorAll('[data-swap]'),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: t(0.6), stagger: t(0.06), ease: 'power3.out' }
        );
        gsap.delayedCall(t(0.6), () => {
          busy.current = false;
        });
      },
    });
  };

  const closeLab = () => {
    const id = openRef.current;
    const fly = flyRef.current;
    const slot = slotRef.current;
    const section = sectionRef.current;
    if (!id || !fly || !slot || !section || busy.current) return;
    busy.current = true;
    const start = rel(slot.getBoundingClientRect());

    gsap.to(demoRef.current, {
      autoAlpha: 0,
      duration: t(0.3),
      ease: 'power2.in',
      onComplete: () => {
        if (!alive.current) return;
        gsap.set(fly, { ...start, autoAlpha: 1 });
        flushSync(() => {
          setLive(false);
          setFlyId(id);
          setOpenId(null);
        });

        const api = apiRef.current;
        api?.reveal(id);
        const card = api?.rectOf(id);
        const view = viewRef.current;
        if (!api || !card || !view) {
          gsap.set(fly, { autoAlpha: 0 });
          openRef.current = null;
          busy.current = false;
          return;
        }

        const end = rel(card);
        api.hide(id, true);
        section.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
        gsap.fromTo(view, { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.6), ease: 'power2.out' });
        gsap.to(fly, {
          ...end,
          duration: t(1),
          ease: 'power3.inOut',
          onComplete: () => {
            api.hide(id, false);
            gsap.set(fly, { autoAlpha: 0 });
            api.focus(id);
            openRef.current = null;
            busy.current = false;
          },
        });
      },
    });
  };

  actions.current = { close: closeLab, step };

  const isOpen = openId !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.current.close();
      } else if (e.key === 'ArrowRight') {
        actions.current.step(1);
      } else if (e.key === 'ArrowLeft') {
        actions.current.step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const changeFilter = (next: string) => {
    if (next === filter || busy.current) return;
    const box = boxRef.current;
    if (!box || reduced()) {
      setFilter(next);
      return;
    }
    gsap.to(box, {
      autoAlpha: 0,
      y: 8,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (!alive.current) return;
        flushSync(() => setFilter(next));
        gsap.fromTo(box, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      },
    });
  };

  return (
    <main ref={mainRef} className="relative w-full overflow-x-clip" style={BODY}>
      <LabsHero />

      <section ref={sectionRef} id="experiments" className="relative w-full scroll-mt-20 pb-16 md:pb-24">
        <div ref={viewRef} className={openId ? 'hidden' : ''}>
          <div data-enter>
            <LabsFilters filters={FILTERS} filter={filter} count={views.length} onChange={changeFilter} />
          </div>

          <div data-enter ref={boxRef}>
            <LabsCarousel items={views} apiRef={apiRef} onOpen={openLab} />
          </div>

          <p className="mx-auto mt-6 w-full max-w-360 px-4 text-xs text-muted-foreground md:px-8">
            Drag to browse, click one to open it.
          </p>
        </div>

        {lab && (
          <LabCanvas
            lab={lab}
            pos={pos}
            total={views.length}
            live={live}
            slotRef={slotRef}
            demoRef={demoRef}
            backRef={backRef}
            onClose={closeLab}
            onStep={step}
          />
        )}

        <FlyPreview flyId={flyId} flyRef={flyRef} />
      </section>
    </main>
  );
}