'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BTN_MUTED, BTN_PRIMARY, HEADING, ROUND_BTN, pad } from '@/lib/labs/constants';
import type { Lab } from '@/lib/labs/data';
import type { ReactNode, RefObject } from 'react';

export function LabCanvas({
  lab,
  pos,
  total,
  live,
  slotRef,
  demoRef,
  backRef,
  onClose,
  onStep,
}: {
  lab: Lab;
  pos: number;
  total: number;
  live: boolean;
  slotRef: RefObject<HTMLDivElement | null>;
  demoRef: RefObject<HTMLDivElement | null>;
  backRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
}) {
  const Demo = lab.Demo;
  return (
    <div className="mx-auto w-full max-w-360 px-4 md:px-8">
      <div data-d className="flex flex-wrap items-center justify-between gap-3">
        <button ref={backRef} type="button" onClick={onClose} className={BTN_MUTED}>
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
          All labs
        </button>

        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs tabular-nums text-muted-foreground">
            {pad(pos + 1)} / {pad(total)}
          </span>
          {total > 1 && (
            <>
              <button type="button" aria-label="Previous lab" onClick={() => onStep(-1)} className={ROUND_BTN}>
                <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <button type="button" onClick={() => onStep(1)} className={BTN_PRIMARY}>
                Next
                <ArrowRight size={15} strokeWidth={1.5} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>

      <div data-d className="mb-5 mt-8 md:mb-6 md:mt-10">
        <p data-swap className="text-sm text-muted-foreground">
          {pad(pos + 1)} · {lab.kind}
        </p>
        <div className="-mb-2 mt-2 overflow-hidden pb-2">
          <h2
            data-d-title
            className="text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl"
            style={HEADING}
          >
            {lab.title}
          </h2>
        </div>
        <p className="sr-only" aria-live="polite">
          {lab.title}
        </p>
      </div>

      <div
        ref={slotRef}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-card"
        style={{ height: 'clamp(24rem, 70svh, 50rem)' }}
      >
        <div ref={demoRef} className="absolute inset-0">
          {live && <Demo key={lab.id} />}
        </div>
      </div>

      <div data-d className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-12">
        <div data-swap>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{lab.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="text-foreground">Try:</span> {lab.hint}
          </p>
        </div>
        <ul data-swap className="flex flex-wrap content-start gap-2 md:justify-end">
          {lab.libs.map((lib) => (
            <li key={lib} className="rounded-lg border border-border px-3 py-1 text-xs text-foreground">
              {lib}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}