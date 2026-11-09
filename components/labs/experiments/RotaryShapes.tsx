'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { BODY, TAU } from '@/lib/labs/constants';

const KNOBS = ['Sides', 'Spin', 'Size'];

export function RotaryShapes() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const poly = root.querySelector<SVGPolygonElement>('polygon');
    const shape = root.querySelector<SVGGElement>('[data-shape]');
    const knobs = gsap.utils.toArray<HTMLElement>('[data-knob]', root);
    const vals = gsap.utils.toArray<HTMLElement>('[data-val]', root);
    if (!poly || !shape || knobs.length < 3) return;

    const MIN = -135;
    const MAX = 135;
    const state = { sides: 6, spin: 0, size: 1 };

    const render = () => {
      const pts: string[] = [];
      for (let i = 0; i < state.sides; i++) {
        const a = (i / state.sides) * TAU - Math.PI / 2;
        pts.push(`${(Math.cos(a) * 70).toFixed(1)},${(Math.sin(a) * 70).toFixed(1)}`);
      }
      poly.setAttribute('points', pts.join(' '));
      gsap.set(shape, { rotation: state.spin, scale: state.size });
      vals[0].textContent = String(state.sides);
      vals[1].textContent = `${Math.round(((state.spin % 360) + 360) % 360)}°`;
      vals[2].textContent = `${state.size.toFixed(1)}×`;
    };

    const pulse = () =>
      gsap.fromTo(
        poly,
        { attr: { 'stroke-width': 7 } },
        { attr: { 'stroke-width': 2 }, duration: 0.5, ease: 'power3.out', overwrite: true }
      );

    const map = gsap.utils.mapRange;
    gsap.set(knobs[0], { rotation: map(3, 10, MIN, MAX, 6) });
    gsap.set(knobs[1], { rotation: 0 });
    gsap.set(knobs[2], { rotation: map(0.4, 1.3, MIN, MAX, 1) });

    const apply = [
      (r: number) => {
        const s = Math.round(map(MIN, MAX, 3, 10, r));
        if (s !== state.sides) {
          state.sides = s;
          pulse();
        }
      },
      (r: number) => {
        state.spin = r * 2;
      },
      (r: number) => {
        state.size = map(MIN, MAX, 0.4, 1.3, r);
      },
    ];

    const drags = knobs.map(
      (el, i) =>
        Draggable.create(el, {
          type: 'rotation',
          inertia: true,
          bounds: { minRotation: MIN, maxRotation: MAX },
          onDrag(this: Draggable) {
            apply[i](this.rotation);
            render();
          },
          onThrowUpdate(this: Draggable) {
            apply[i](this.rotation);
            render();
          },
        })[0]
    );

    render();

    return () => {
      drags.forEach((d) => d.kill());
      gsap.killTweensOf([poly, ...knobs]);
    };
  }, []);

  return (
    <div ref={rootRef} className="flex size-full flex-col">
      <svg viewBox="-100 -100 200 200" className="min-h-0 w-full flex-1 p-4" aria-hidden>
        <circle r={78} className="fill-none stroke-border" strokeWidth={1.5} strokeDasharray="3 5" />
        <g data-shape>
          <polygon className="fill-primary stroke-foreground" strokeWidth={2} strokeLinejoin="round" />
        </g>
      </svg>

      <div className="grid grid-cols-3 gap-4 border-t border-border px-6 py-4" style={BODY}>
        {KNOBS.map((name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              data-knob
              className="relative size-14 cursor-grab touch-none rounded-full border-2 border-foreground bg-card active:cursor-grabbing"
              aria-label={`${name} knob`}
            >
              <span className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 bg-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {name} <span data-val className="tabular-nums text-foreground" />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}