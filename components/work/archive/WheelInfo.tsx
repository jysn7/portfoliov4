import type { RefObject } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

import type { WorkView } from '../data';
import { ROUND_BTN, pad } from '../shared';

/* left side: what the dial is pointing at */
export default function WheelInfo({
  infoRef,
  cur,
  active,
  n,
  onStep,
}: {
  infoRef: RefObject<HTMLDivElement | null>;
  cur: WorkView | undefined;
  active: number;
  n: number;
  onStep: (d: number) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="mx-auto flex h-full max-w-360 items-start px-3 pt-8 md:items-center md:px-6 md:pt-0">
        <div ref={infoRef} className="max-w-[55%] md:max-w-xs lg:max-w-md">
          {cur && (
            <>
              <p data-info className="font-pixel text-xs tabular-nums text-muted-foreground">
                {pad(active + 1)} / {pad(n)}
                {cur.category ? ` · ${cur.category.toLowerCase()}` : ''}
              </p>
              <h3
                data-info
                className="mt-3 font-display font-soft text-[clamp(2rem,4.6vw,4rem)] font-normal leading-none tracking-[-0.04em] text-foreground"
              >
                {cur.title}
              </h3>
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
                onClick={() => onStep(-1)}
                className={ROUND_BTN}
              >
                <ArrowUp size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next work"
                disabled={active >= n - 1}
                onClick={() => onStep(1)}
                className={ROUND_BTN}
              >
                <ArrowDown size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}