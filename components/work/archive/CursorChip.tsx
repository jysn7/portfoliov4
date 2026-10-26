import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

import type { WorkView } from '@/components/work/data';
import type { Box, DialSize } from '@/components/work/shared';

/* the little "drag" / "open" label that follows a mouse over the dial */
export function CursorChip({
  chipRef,
  textRef,
}: {
  chipRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div ref={chipRef} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 z-40">
      <span
        ref={textRef}
        className="flex h-8 items-center rounded-full bg-foreground px-3.5 font-pixel text-xs text-background"
      >
        drag
      </span>
    </div>
  );
}

export function useCursorChip({
  bodyRef,
  chipRef,
  textRef,
  size,
  modeRef,
  busy,
  viewsRef,
}: {
  bodyRef: RefObject<HTMLDivElement | null>;
  chipRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
  size: Box<DialSize>;
  modeRef: Box<'browse' | 'detail'>;
  busy: Box<boolean>;
  viewsRef: Box<WorkView[]>;
}) {
  useEffect(() => {
    const body = bodyRef.current;
    const chip = chipRef.current;
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
      if (textRef.current)
        textRef.current.textContent = (e.target as Element).closest('[data-card]') ? 'open' : 'drag';
    };
    const onLeave = () => show(false);

    body.addEventListener('pointermove', onMove);
    body.addEventListener('pointerleave', onLeave);
    return () => {
      body.removeEventListener('pointermove', onMove);
      body.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(chip);
    };
  }, [bodyRef, chipRef, textRef, size, modeRef, busy, viewsRef]);
}