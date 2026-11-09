'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { HEADING, clamp, reduced } from '@/lib/labs/constants';
import { useOnScreen } from '@/lib/labs/hooks';

const MARQUEE_ROWS = [
  'Labs · Breaks · Fixes · Repeats · ',
  'Prototype · Poke · Polish · Ship · ',
  'Curious · Messy · Alive · Weird · ',
];

export function VelocityMarquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(rootRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = gsap.utils.toArray<HTMLElement>('[data-row]', root);
    const inners = gsap.utils.toArray<HTMLElement>('[data-inner]', root);

    const widths = inners.map(() => 0);
    const measure = () => inners.forEach((el, i) => (widths[i] = el.scrollWidth / 2));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (reduced()) return () => ro.disconnect();

    const base = [40, 60, 80];
    const dirs = [-1, 1, -1];
    const pos = inners.map(() => 0);
    const setX = inners.map((el) => gsap.quickSetter(el, 'x', 'px'));
    const skew = rows.map((r) => gsap.quickTo(r, 'skewX', { duration: 0.4, ease: 'power3' }));
    const v = { target: 0, cur: 0, dir: 1, dirTarget: 1, slow: 1 };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        v.target = self.getVelocity();
        if (Math.abs(v.target) > 40) v.dirTarget = v.target > 0 ? 1 : -1;
      },
    });

    const tick = (_: number, delta: number) => {
      if (!visible.current) return;
      const dt = Math.min(delta, 50) / 1000;
      v.target *= 0.92;
      v.cur += (v.target - v.cur) * 0.12;
      v.dir += (v.dirTarget - v.dir) * 0.08;
      const boost = Math.abs(v.cur) * 0.22;
      inners.forEach((_el, i) => {
        const w = widths[i];
        if (!w) return;
        pos[i] = gsap.utils.wrap(-w, 0, pos[i] + dirs[i] * v.dir * (base[i] + boost) * v.slow * dt);
        setX[i](pos[i]);
      });
      rows.forEach((_r, i) => skew[i](clamp(-v.cur / 90, -14, 14)));
    };

    const enter = () => gsap.to(v, { slow: 0.25, duration: 0.5 });
    const leave = () => gsap.to(v, { slow: 1, duration: 0.6 });
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(v);
      st.kill();
      ro.disconnect();
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
    };
  }, [visible]);

  return (
    <div ref={rootRef} className="flex size-full flex-col justify-center gap-3 overflow-hidden">
      {MARQUEE_ROWS.map((text, r) => (
        <div key={text} data-row className="will-change-transform">
          <div
            data-inner
            className={`flex w-max whitespace-nowrap text-5xl font-semibold tracking-tight md:text-8xl ${
              r === 1 ? 'text-muted-foreground' : 'text-foreground'
            }`}
            style={HEADING}
          >
            {[0, 1].map((k) => (
              <span key={k}>{text.repeat(3)}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}