'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filters = containerRef.current?.querySelectorAll('.filter-btn');
    if (filters) {
      gsap.fromTo(filters, 
        { opacity: 0, y: 5 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.05, 
          ease: "expo.out" 
        }
      );
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-wrap items-center gap-2 md:absolute md:bottom-20 md:right-0 w-full md:w-auto justify-start md:justify-end py-4 md:py-0"
    >
      {options.map((f) => {
        const isActive = active === f;

        return (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`
              filter-btn group cursor-pointer relative flex items-center gap-3 py-1.5 px-4 border rounded-md overflow-hidden transition-all duration-500
              ${isActive ? 'border-foreground bg-foreground' : 'border-border hover:border-foreground bg-transparent'}
              active:scale-[0.96]
            `}
          >
            {/* The Compact Wipe */}
            <div className={`
              absolute inset-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
              ${isActive ? 'translate-y-0' : 'translate-y-[102%] group-hover:translate-y-0'}
            `} />

            {/* Label - text-xs is the limit */}
            <span className={`
              relative z-10 text-xs tracking-[0.2em] uppercase transition-colors duration-500
              ${isActive ? 'text-background' : 'text-muted-foreground group-hover:text-background'}
            `}>
              {f}
            </span>

            {/* Minimalist Line */}
            <div className={`
              relative z-10 h-0.5 bg-background transition-all duration-500
              ${isActive ? 'w-3' : 'w-0 group-hover:w-3'}
            `} />
          </button>
        );
      })}
    </div>
  );
}