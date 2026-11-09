'use client';

import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import '@/lib/labs/motion'; // registers Draggable + InertiaPlugin before this effect runs
import { EDGE, SPEED, reduced } from '@/lib/labs/constants';
import { useOnScreen } from '@/lib/labs/hooks';
import type { CarouselApi } from '@/lib/labs/carouselApi';
import type { Lab } from '@/lib/labs/data';
import { LabCard } from './LabCard';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function LabsCarousel({
  items,
  apiRef,
  onOpen,
}: {
  items: Lab[];
  apiRef: MutableRefObject<CarouselApi | null>;
  onOpen: (id: string, rect: DOMRect) => void;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(viewRef);
  const [loop, setLoop] = useState(true);
  const st = useRef({ pos: 0, mul: 1, dragging: false, moved: false, setW: 0 });

  useIsoLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const decide = () => {
      if (!view.clientWidth) return;
      const outer = window.matchMedia('(min-width: 768px)').matches ? 384 : 288;
      setLoop(items.length * outer > view.clientWidth);
    };
    decide();
    const ro = new ResizeObserver(decide);
    ro.observe(view);
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    const view = viewRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    const s = st.current;
    s.pos = 0;
    s.mul = 1;
    s.dragging = false;
    s.moved = false;
    const rm = reduced();

    const setX = gsap.quickSetter(track, 'x', 'px');
    const apply = () => setX(loop && s.setW ? gsap.utils.wrap(-s.setW, 0, s.pos) : 0);
    const measure = () => {
      const firsts = track.querySelectorAll<HTMLElement>('[data-first]');
      s.setW = loop && firsts.length > 1 ? firsts[1].offsetLeft - firsts[0].offsetLeft : 0;
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(view);
    ro.observe(track);

    const tick = (_: number, delta: number) => {
      if (!loop || rm || !visible.current || s.dragging) return;
      s.pos -= SPEED * s.mul * (Math.min(delta, 50) / 1000);
      if (s.setW) s.pos = gsap.utils.wrap(-s.setW, 0, s.pos);
      apply();
    };
    gsap.ticker.add(tick);

    // Draggable.create returns an array; keep the single instance.
    let drag: Draggable | undefined;
    if (loop) {
      const proxy = document.createElement('div');
      const [instance] = Draggable.create(proxy, {
        trigger: view,
        type: 'x',
        inertia: true,
        dragClickables: true,
        onPress(this: Draggable) {
          s.dragging = true;
          s.moved = false;
          gsap.set(proxy, { x: s.pos });
          this.update();
        },
        onDrag(this: Draggable) {
          if (Math.abs(this.x - this.startX) > 5) s.moved = true;
          s.pos = this.x;
          apply();
        },
        onThrowUpdate(this: Draggable) {
          s.pos = this.x;
          apply();
        },
        onThrowComplete() {
          s.dragging = false;
        },
        onRelease() {
          gsap.delayedCall(0.05, () => {
            s.moved = false;
          });
          gsap.delayedCall(0.03, () => {
            if (!drag?.isThrowing) s.dragging = false;
          });
        },
      });
      drag = instance;
    }

    const onWheel = (e: WheelEvent) => {
      if (!loop || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      s.pos -= e.deltaX;
      apply();
    };
    view.addEventListener('wheel', onWheel, { passive: false });

    const slow = () => gsap.to(s, { mul: 0, duration: 0.5, overwrite: 'auto' });
    const go = () => gsap.to(s, { mul: 1, duration: 0.8, overwrite: 'auto' });
    view.addEventListener('pointerenter', slow);
    view.addEventListener('pointerleave', go);

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!el.matches(':focus-visible')) return;
      slow();
      if (!loop) return;
      const card = el.closest<HTMLElement>('[data-card]');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const vr = view.getBoundingClientRect();
      const edge = 32;
      const delta =
        r.left < vr.left + edge ? vr.left + edge - r.left : r.right > vr.right - edge ? vr.right - edge - r.right : 0;
      if (delta) gsap.to(s, { pos: s.pos + delta, duration: 0.5, ease: 'power3.out', onUpdate: apply, overwrite: 'auto' });
    };
    view.addEventListener('focusin', onFocusIn);
    view.addEventListener('focusout', go);
    const onScroll = () => {
      view.scrollLeft = 0;
    };
    view.addEventListener('scroll', onScroll);

    const previews = (id: string) => Array.from(track.querySelectorAll<HTMLElement>(`[data-preview="${id}"]`));
    apiRef.current = {
      rectOf: (id) => {
        const vr = view.getBoundingClientRect();
        const mid = vr.left + vr.width / 2;
        const dist = (r: DOMRect) => Math.abs(r.left + r.width / 2 - mid);
        return (
          previews(id)
            .map((el) => el.getBoundingClientRect())
            .sort((a, b) => dist(a) - dist(b))[0] ?? null
        );
      },
      reveal: (id) => {
        measure();
        s.mul = 1;
        if (!loop || !s.setW) return;
        const el = track.querySelector<HTMLElement>(`[data-card="${id}"]`);
        if (!el) return;
        s.pos = view.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
        apply();
      },
      hide: (id, on) =>
        previews(id).forEach((el) => {
          el.style.visibility = on ? 'hidden' : '';
        }),
      focus: (id) => track.querySelector<HTMLElement>(`[data-card="${id}"]`)?.focus({ preventScroll: true }),
    };

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(s);
      drag?.kill();
      ro.disconnect();
      view.removeEventListener('wheel', onWheel);
      view.removeEventListener('pointerenter', slow);
      view.removeEventListener('pointerleave', go);
      view.removeEventListener('focusin', onFocusIn);
      view.removeEventListener('focusout', go);
      view.removeEventListener('scroll', onScroll);
      apiRef.current = null;
    };
  }, [loop, items, visible, apiRef]);

  return (
    <div
      ref={viewRef}
      className={`relative w-full overflow-hidden ${loop ? 'cursor-grab touch-pan-y active:cursor-grabbing' : ''}`}
      style={loop ? { maskImage: EDGE, WebkitMaskImage: EDGE } : undefined}
    >
      <div ref={trackRef} className={`relative flex w-max will-change-transform ${loop ? '' : 'px-4 md:px-8'}`}>
        {Array.from({ length: loop ? 2 : 1 }).map((_, c) =>
          items.map((lab, i) => (
            <LabCard key={`${c}-${lab.id}`} lab={lab} index={i} clone={c > 0} onOpen={onOpen} />
          ))
        )}
      </div>
    </div>
  );
}