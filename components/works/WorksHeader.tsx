'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
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
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.4 } });

      tl.fromTo(titleRef.current, 
        { y: 80, opacity: 0 }, 
        { y: 0, opacity: 1, delay: 0.1 }
      )
      .fromTo(descriptionRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1 }, 
        "-=1"
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={headerRef} className="max-w-full flex flex-col gap-12 mb-40 border-b border-border pb-20 relative">
      
      <h1 ref={titleRef} className="text-5xl md:text-[8rem] font-thin tracking-tighter uppercase leading-none text-foreground">
        Works
      </h1>

      <FilterBar
        options={filterOptions}
        active={activeFilter}
        setActive={setActiveFilter}
      />

      <div ref={descriptionRef} className="mt-8 max-w-xl">
        <p className="text-sm font-extralight text-foreground italic leading-relaxed">
          a collection of things i made while caffeinated. 
    mostly just ideas and pixels arranged until they looked right. 
    feel free to look around, they don't bite.
        </p>
      </div>
    </div>
  );
}