'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { MINI, MINI_ON, MINI_OFF, pad, reduced } from '@/lib/labs/constants';

type FlipLayout = 'grid' | 'fan' | 'wide';
const FLIP_LAYOUTS: Record<FlipLayout, { label: string; box: string; item: string }> = {
  grid: { label: 'Grid', box: 'grid grid-cols-6 gap-3', item: 'size-11 sm:size-14 md:size-20' },
  fan: { label: 'Fan', box: 'flex -space-x-5 md:-space-x-8', item: 'size-11 sm:size-14 md:size-20' },
  wide: { label: 'Wide', box: 'grid w-full max-w-sm grid-cols-2 gap-3 md:max-w-xl', item: 'h-10 w-full md:h-12' },
};
const FLIP_STYLES = [
  'bg-foreground text-background',
  'bg-primary text-primary-foreground',
  'border border-border bg-background text-foreground',
  'bg-muted text-foreground',
];

export function FlipShuffle() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<FlipLayout>('grid');
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: 12 }, (_, i) => i));

  const flip = (change: () => void) => {
    const root = rootRef.current;
    if (!root) return change();
    const items = root.querySelectorAll('[data-flip-id]');
    const state = Flip.getState(items);
    flushSync(change);
    Flip.from(state, {
      duration: reduced() ? 0 : 0.9,
      ease: 'power3.inOut',
      stagger: { amount: 0.3 },
    });
  };

  const cfg = FLIP_LAYOUTS[layout];

  return (
    <div ref={rootRef} className="relative size-full">
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        {(Object.keys(FLIP_LAYOUTS) as FlipLayout[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={layout === k}
            onClick={() => k !== layout && flip(() => setLayout(k))}
            className={`${MINI} ${layout === k ? MINI_ON : MINI_OFF}`}
          >
            {FLIP_LAYOUTS[k].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => flip(() => setOrder((o) => gsap.utils.shuffle([...o])))}
          className={`${MINI} ${MINI_OFF}`}
        >
          Shuffle
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-6 pt-14">
        <div className={cfg.box}>
          {order.map((id) => (
            <div
              key={id}
              data-flip-id={id}
              className={`grid place-items-center rounded-lg text-xs font-medium md:text-sm ${cfg.item} ${
                FLIP_STYLES[id % FLIP_STYLES.length]
              }`}
            >
              {pad(id + 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}