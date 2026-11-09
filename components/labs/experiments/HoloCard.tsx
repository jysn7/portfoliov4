'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HEADING, FOCUS, reduced } from '@/lib/labs/constants';

export function HoloCard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const float = floatRef.current;
    const tilt = tiltRef.current;
    const flipEl = flipRef.current;
    const sheen = sheenRef.current;
    if (!root || !float || !tilt || !flipEl || !sheen) return;
    const rm = reduced();

    const faces = gsap.utils.toArray<HTMLElement>('[data-face]', flipEl);
    gsap.set(faces, { backfaceVisibility: 'hidden' });
    gsap.set(faces[1], { rotationY: 180 });
    gsap.set(tilt, { transformPerspective: 900 });
    gsap.set([tilt, flipEl], { transformStyle: 'preserve-3d' });

    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', root);
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.5, ease: 'power3' });
    const sx = gsap.quickTo(sheen, 'x', { duration: 0.6, ease: 'power3' });
    const lx = layers.map((l) => gsap.quickTo(l, 'x', { duration: 0.6, ease: 'power3' }));
    const ly = layers.map((l) => gsap.quickTo(l, 'y', { duration: 0.6, ease: 'power3' }));

    const idle = rm
      ? null
      : gsap.to(float, { y: -8, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });

    const move = (e: PointerEvent) => {
      if (rm) return;
      const r = root.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rx(-ny * 24);
      ry(nx * 24);
      sx(nx * 220);
      layers.forEach((l, i) => {
        const d = Number(l.dataset.depth);
        lx[i](nx * d);
        ly[i](ny * d);
      });
    };
    const leave = () => {
      rx(0);
      ry(0);
      sx(0);
      layers.forEach((_l, i) => {
        lx[i](0);
        ly[i](0);
      });
    };

    let flipped = false;
    const toggle = () => {
      flipped = !flipped;
      gsap.to(flipEl, { rotationY: flipped ? 180 : 0, duration: rm ? 0 : 0.9, ease: 'power3.inOut' });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };

    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    tilt.addEventListener('click', toggle);
    tilt.addEventListener('keydown', onKey);

    return () => {
      idle?.kill();
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      tilt.removeEventListener('click', toggle);
      tilt.removeEventListener('keydown', onKey);
      gsap.killTweensOf([float, tilt, flipEl, sheen, ...layers]);
    };
  }, []);

  return (
    <div ref={rootRef} className="grid size-full place-items-center">
      <div ref={floatRef}>
        <div
          ref={tiltRef}
          role="button"
          tabIndex={0}
          aria-label="Flip the card"
          className={`aspect-3/4 w-44 cursor-pointer rounded-lg md:w-72 ${FOCUS} focus-visible:outline-offset-4`}
        >
          <div ref={flipRef} className="relative size-full">
            <div
              data-face
              className="absolute inset-0 flex flex-col justify-between rounded-lg border border-border bg-background p-4 md:p-6"
            >
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <span
                  ref={sheenRef}
                  className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/4 -skew-x-12 bg-foreground/10"
                />
              </div>
              <div data-depth="8" className="relative flex items-center justify-between text-xs text-muted-foreground">
                <span>MonoStudios</span>
                <span className="tabular-nums">001</span>
              </div>
              <div
                data-depth="18"
                className="relative text-center text-7xl font-semibold tracking-tight text-foreground md:text-9xl"
                style={HEADING}
              >
                JB
              </div>
              <div data-depth="10" className="relative">
                <p className="text-sm font-medium text-foreground md:text-base" style={HEADING}>
                  Jayson Baloyi
                </p>
                <p className="text-xs text-muted-foreground md:text-sm">Software engineer</p>
              </div>
            </div>

            <div
              data-face
              className="absolute inset-0 flex flex-col justify-between rounded-lg border border-foreground bg-foreground p-4 text-background md:p-6"
            >
              <p className="text-xs text-background/60">Est. 2025</p>
              <div className="grid grid-cols-6 gap-1 md:gap-1.5" aria-hidden>
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className={`aspect-square rounded-sm bg-background ${
                      ['opacity-10', 'opacity-30', 'opacity-60', 'opacity-90'][(i * 7) % 4]
                    }`}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold leading-tight md:text-2xl" style={HEADING}>
                Let’s build something.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}