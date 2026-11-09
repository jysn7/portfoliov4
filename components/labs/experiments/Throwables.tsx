'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { HEADING, clamp } from '@/lib/labs/constants';

const TILES: [string, number, number][] = [
  ['L', 0.1, 0.18],
  ['A', 0.38, 0.56],
  ['B', 0.68, 0.14],
  ['S', 0.18, 0.66],
  ['!', 0.56, 0.34],
  ['?', 0.82, 0.62],
];
const TILE_STYLES = [
  'bg-foreground text-background',
  'bg-primary text-primary-foreground',
  'border border-border bg-background text-foreground',
];

export function Throwables() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]', root);
    let placed = false;
    let z = 10;

    const drags = Draggable.create(tiles, {
      type: 'x,y',
      bounds: root,
      inertia: true,
      edgeResistance: 0.85,
      onPress(this: Draggable) {
        gsap.set(this.target, { zIndex: ++z });
        gsap.to(this.target, { scale: 1.12, duration: 0.25, ease: 'power3.out' });
      },
      onDrag(this: Draggable) {
        gsap.to(this.target, {
          rotation: clamp(this.deltaX * 1.4, -25, 25),
          duration: 0.25,
          overwrite: 'auto',
        });
      },
      onRelease(this: Draggable) {
        gsap.to(this.target, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      },
    });

    const place = () => {
      if (placed || !root.clientWidth) return;
      placed = true;
      const tw = tiles[0].offsetWidth;
      const w = root.clientWidth - tw;
      const h = root.clientHeight - tw;
      tiles.forEach((el, i) =>
        gsap.set(el, { x: w * TILES[i][1], y: h * TILES[i][2], rotation: (i % 2 ? 1 : -1) * (4 + i * 2) })
      );
      drags.forEach((d) => {
        d.update();
        d.applyBounds(root);
      });
    };

    const ro = new ResizeObserver(() => {
      place();
      drags.forEach((d) => d.applyBounds(root));
    });
    ro.observe(root);
    place();

    const scatter = () => {
      const tw = tiles[0].offsetWidth;
      const w = root.clientWidth - tw;
      const h = root.clientHeight - tw;
      gsap.to(tiles, {
        x: () => gsap.utils.random(0, w),
        y: () => gsap.utils.random(0, h),
        rotation: () => gsap.utils.random(-30, 30),
        duration: 1.1,
        ease: 'elastic.out(1, 0.6)',
        stagger: 0.05,
        overwrite: true,
        onComplete: () => drags.forEach((d) => d.update()),
      });
    };
    root.addEventListener('dblclick', scatter);

    return () => {
      root.removeEventListener('dblclick', scatter);
      ro.disconnect();
      drags.forEach((d) => d.kill());
      gsap.killTweensOf(tiles);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative size-full touch-pan-y">
      {TILES.map(([label], i) => (
        <div
          key={label}
          data-tile
          className={`absolute left-0 top-0 grid size-16 cursor-grab place-items-center rounded-lg text-3xl font-semibold active:cursor-grabbing md:size-24 md:text-5xl ${
            TILE_STYLES[i % TILE_STYLES.length]
          }`}
          style={HEADING}
        >
          {label}
        </div>
      ))}
    </div>
  );
}