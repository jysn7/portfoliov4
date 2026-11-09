'use client';

import { ArrowUpRight } from 'lucide-react';
import { HEADING, FOCUS, pad } from '@/lib/labs/constants';
import type { Lab } from '@/lib/labs/data';

export function LabCard({
  lab,
  index,
  clone,
  onOpen,
}: {
  lab: Lab;
  index: number;
  clone?: boolean;
  onOpen: (id: string, rect: DOMRect) => void;
}) {
  const Preview = lab.Preview;
  return (
    <button
      type="button"
      data-card={lab.id}
      data-first={index === 0 ? '' : undefined}
      aria-label={`Open ${lab.title}`}
      aria-hidden={clone ? true : undefined}
      tabIndex={clone ? -1 : 0}
      onClick={(e) => {
        const box = e.currentTarget.querySelector<HTMLElement>('[data-preview]');
        if (box) onOpen(lab.id, box.getBoundingClientRect());
      }}
      className={`group block w-72 shrink-0 pr-4 text-left md:w-96 md:pr-6 ${FOCUS} focus-visible:outline-offset-4`}
    >
      <span
        data-preview={lab.id}
        className="relative block aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 group-hover:border-foreground"
      >
        <span className="block size-full transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none">
          <Preview />
        </span>
        <span
          aria-hidden
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-background/80 text-foreground opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100"
        >
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </span>
      </span>

      <span className="mt-3 flex items-baseline justify-between gap-4">
        <span className="flex items-baseline gap-3">
          <span className="text-xs tabular-nums text-muted-foreground">{pad(index + 1)}</span>
          <span className="text-base font-medium tracking-tight text-foreground" style={HEADING}>
            {lab.title}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{lab.kind}</span>
      </span>
    </button>
  );
}