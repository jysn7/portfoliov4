'use client';

import { Category } from '@/lib/works';

export default function FilterBar({
  options,
  active,
  setActive,
}: {
  options: (Category | "All")[];
  active: string;
  setActive: (val: Category | "All") => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 md:absolute md:bottom-20 md:right-0">
      {options.map((f) => (
        <button
          key={f}
          onClick={() => setActive(f)}
          className={`px-4 py-2 md:px-8 md:py-4 rounded-full text-xs tracking-[0.3em] uppercase border transition ${
            active === f
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}