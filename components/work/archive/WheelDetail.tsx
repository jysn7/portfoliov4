import type { RefObject } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { WorkView } from '@/components/work/data';
import { FOCUS, IMG_SIZES, ROUND_BTN, pad } from '@/components/work/shared';

/* the opened work: image slot on the left, copy on the right, plus the flying image that lands in the slot */
export default function WheelDetail({
  detailRef,
  slotRef,
  flyRef,
  flyInnerRef,
  cur,
  index,
  n,
  onClose,
  onGo,
}: {
  detailRef: RefObject<HTMLDivElement | null>;
  slotRef: RefObject<HTMLDivElement | null>;
  flyRef: RefObject<HTMLDivElement | null>;
  flyInnerRef: RefObject<HTMLDivElement | null>;
  cur: WorkView | undefined;
  index: number;
  n: number;
  onClose: () => void;
  onGo: (dir: number) => void;
}) {
  return (
    <>
      <div ref={detailRef} className="invisible absolute inset-0 z-20">
        <div className="mx-auto flex h-full max-w-360 flex-col gap-4 px-3 py-5 md:px-6 md:py-8">
          <div data-detail className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to the dial"
              className={`flex h-10 items-center gap-2 rounded-full bg-muted px-5 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`}
            >
              <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
              back
            </button>
            {n > 0 && (
              <span className="font-pixel text-xs tabular-nums text-muted-foreground">
                {pad(index + 1)} / {pad(n)}
              </span>
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-5 md:grid-cols-[1.1fr_1fr] md:grid-rows-1 md:gap-12">
            <div className="flex items-center">
              <div ref={slotRef} className="aspect-[16/10] w-full" aria-hidden />
            </div>

            <div className="flex min-h-0 flex-col justify-center gap-3 overflow-hidden md:gap-5">
              {cur && (
                <>
                  <p data-detail data-detail-swap className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary px-3 py-1 font-pixel text-xs text-primary-foreground">
                      {cur.category}
                    </span>
                    {cur.year ? <span className="font-pixel text-xs text-muted-foreground">{cur.year}</span> : null}
                  </p>

                  <h3
                    data-detail
                    data-detail-swap
                    className="font-display font-soft text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[0.95] tracking-[-0.04em] text-foreground"
                  >
                    {cur.title}
                  </h3>

                  <p
                    data-detail
                    data-detail-swap
                    className="line-clamp-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground md:line-clamp-none"
                  >
                    {cur.description}
                  </p>

                  {cur.tags.length > 0 && (
                    <ul data-detail data-detail-swap className="flex flex-wrap gap-2">
                      {cur.tags.map((tag) => (
                        <li key={tag} className="rounded-full bg-muted px-3 py-1 font-pixel text-xs text-foreground">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div data-detail className="mt-1 flex flex-wrap items-center gap-4">
                    {cur.href && (
                      <a
                        href={cur.href}
                        target={/^https?:/.test(cur.href) ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-5 rounded-full bg-foreground py-2 pl-7 pr-2 text-background transition-colors duration-300 hover:bg-primary hover:text-primary-foreground ${FOCUS}`}
                      >
                        <span className="font-pixel text-sm">visit project</span>
                        <span className="grid size-11 place-items-center rounded-full bg-background text-foreground transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
                          <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
                        </span>
                      </a>
                    )}
                    {n > 1 && (
                      <span className="flex items-center gap-2">
                        <button type="button" aria-label="Previous work" onClick={() => onGo(-1)} className={ROUND_BTN}>
                          <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
                        </button>
                        <button type="button" aria-label="Next work" onClick={() => onGo(1)} className={ROUND_BTN}>
                          <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                        </button>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* The flying image: starts on the dial, lands in the slot */}
      <div
        ref={flyRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 z-30 overflow-hidden rounded-2xl bg-muted"
      >
        <div ref={flyInnerRef} className="absolute inset-0">
          {cur?.image ? (
            <Image src={cur.image} alt="" fill draggable={false} sizes={IMG_SIZES} className="object-cover" />
          ) : null}
        </div>
      </div>
    </>
  );
}