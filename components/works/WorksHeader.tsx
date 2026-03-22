'use client';

import FilterBar from './FilterBar';
import { Category } from '@/lib/works';

export default function WorksHeader({
  activeFilter,
  setActiveFilter,
  filterOptions,
}: {
  activeFilter: Category | "All";
  setActiveFilter: (val: Category | "All") => void;
  filterOptions: (Category | "All")[];
}) {
  return (
    <div className="max-w-full flex flex-col gap-12 mb-40 border-b border-border pb-20 relative">
      
      <h1 className="text-5xl md:text-[8rem] font-thin tracking-tighter uppercase leading-none text-foreground">
        Works
      </h1>

      <FilterBar
        options={filterOptions}
        active={activeFilter}
        setActive={setActiveFilter}
      />

      <p className="text-xs text-muted-foreground uppercase tracking-[0.5em] mt-8">
        Selected Works / {activeFilter}
      </p>
    </div>
  );
}