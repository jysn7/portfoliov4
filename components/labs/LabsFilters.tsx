'use client';

import { FOCUS, MINI_ON, MINI_OFF, pad } from '@/lib/labs/constants';

export function LabsFilters({
  filters,
  filter,
  count,
  onChange,
}: {
  filters: string[];
  filter: string;
  count: number;
  onChange: (next: string) => void;
}) {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-360 flex-wrap items-center justify-between gap-4 px-4 md:mb-8 md:px-8">
      <div role="group" aria-label="Filter the experiments" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(f)}
              className={`h-8 rounded-lg px-6 text-sm cursor-pointer transition-colors duration-200 ${FOCUS} ${
                on ? MINI_ON : MINI_OFF
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
      <p className="text-sm tabular-nums text-muted-foreground">{pad(count)} experiments</p>
    </div>
  );
}