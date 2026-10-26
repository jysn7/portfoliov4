import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import Image from 'next/image';

import type { WorkView } from '../data';
import { FOCUS, GRAIN, IMG_SIZES, INK, MASK, STEP, pad, type Box } from '../shared';

export type DialRefs = {
  wheel: RefObject<HTMLDivElement | null>;
  plate: RefObject<HTMLDivElement | null>;
  face: RefObject<HTMLDivElement | null>;
  pegRing: RefObject<HTMLDivElement | null>;
  hub: RefObject<HTMLDivElement | null>;
  hubSpin: RefObject<HTMLDivElement | null>;
  flap: RefObject<HTMLDivElement | null>;
  pivot: RefObject<HTMLSpanElement | null>;
  cards: Box<(HTMLButtonElement | null)[]>;
  imgs: Box<(HTMLSpanElement | null)[]>;
};

/* the wheel itself: bezel, face, pegs, hub, flapper and the work cards.
   All positioning is done by ArchiveWheel through the refs. */
export default function WheelDial({
  refs,
  views,
  ticks,
  pegs,
  active,
  onPointerDown,
  onCardClick,
}: {
  refs: DialRefs;
  views: WorkView[];
  ticks: { deg: number; major: boolean }[];
  pegs: number[];
  active: number;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onCardClick: (i: number) => void;
}) {
  const n = views.length;

  return (
    <div
      ref={refs.wheel}
      onPointerDown={onPointerDown}
      className="pointer-events-none absolute inset-0"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {/* bezel: tick marks and numbers, turns with the dial */}
      <div
        ref={refs.plate}
        className="pointer-events-auto absolute left-0 top-0 cursor-grab touch-pan-y rounded-full border border-border bg-card/60 active:cursor-grabbing"
      >
        {ticks.map(({ deg, major }) => {
          const idx = deg / STEP;
          return (
            <span
              key={deg}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ transform: `rotate(${-deg}deg)` }}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full ${
                  major ? 'h-px w-3 bg-foreground/60' : 'h-px w-1.5 bg-muted-foreground/40'
                }`}
              />
              {major && idx >= 0 && idx < n && (
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-muted-foreground/70">
                  {pad(idx + 1)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* still face of the wheel */}
      <div ref={refs.face} aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full border border-border bg-card" />

      {/* pegs between the works; they turn with the dial and knock the flapper */}
      <div ref={refs.pegRing} aria-hidden className="pointer-events-none absolute left-0 top-0">
        {pegs.map((deg) => (
          <span key={deg} className="absolute inset-0" style={{ transform: `rotate(${-deg}deg)` }}>
            <span
              className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-[#b9bfc6]"
              style={{ borderColor: INK }}
            />
          </span>
        ))}
      </div>

      {/* wooden hub with a crank knob, so you can see it turning */}
      <div
        ref={refs.hub}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        style={{ filter: `drop-shadow(-3px 4px 0 ${INK})` }}
      >
        <div
          ref={refs.hubSpin}
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: '#c98d51',
            backgroundImage: GRAIN,
            backgroundSize: '260px 100px',
            border: `3px solid ${INK}`,
          }}
        >
          <span
            className="absolute left-[10%] top-1/2 size-4 -translate-y-1/2 rounded-full border-[3px] bg-[#FF8FA3] md:size-5"
            style={{ borderColor: INK }}
          />
        </div>
      </div>

      {/* the flapper that points at the active work */}
      <div ref={refs.flap} aria-hidden className="pointer-events-none absolute left-0 top-0">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="size-full overflow-visible">
          <polygon
            points="2,20 98,2 98,38"
            fill="#FF8FA3"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <span
        ref={refs.pivot}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 size-3.5 rounded-full border-[3px] bg-[#b9bfc6]"
        style={{ borderColor: INK }}
      />

      {/* works */}
      {views.map((v, i) => (
        <button
          key={v.id}
          ref={(el) => {
            refs.cards.current[i] = el;
          }}
          data-card
          type="button"
          aria-label={`Open ${v.title}`}
          onClick={() => onCardClick(i)}
          className={`group pointer-events-auto absolute left-0 top-0 touch-pan-y overflow-hidden rounded-xl bg-muted text-left transition-[box-shadow,transform] duration-300 ease-out ${FOCUS} ${
            i === active ? '-translate-x-0.5 -translate-y-0.5 shadow-[6px_6px_0_var(--primary)]' : ''
          }`}
        >
          {v.image ? (
            <span
              ref={(el) => {
                refs.imgs.current[i] = el;
              }}
              className="pointer-events-none absolute -inset-4"
            >
              <Image
                src={v.image}
                alt=""
                fill
                draggable={false}
                sizes={IMG_SIZES}
                className={`object-cover transition-transform duration-[900ms] ease-out ${
                  i === active ? 'scale-[1.03]' : ''
                }`}
              />
            </span>
          ) : null}
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-card/90 px-2.5 py-1 font-pixel text-xs text-foreground backdrop-blur">
            {v.title}
          </span>
        </button>
      ))}
    </div>
  );
}