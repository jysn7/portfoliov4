'use client';

import { useState } from 'react';
import { Aperture, Tv, X } from "lucide-react";
import { useEffects } from "@/context/EffectContext";

export default function Header() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { grain, setGrain, spotlight, setSpotlight } = useEffects();

  const toggleEffect = (effect: 'grain' | 'spotlight') => {
    setGrain(false);
    setSpotlight(false);

    if (effect === 'grain' && !grain) setGrain(true);
    if (effect === 'spotlight' && !spotlight) setSpotlight(true);
  };

  const ActiveIcon = spotlight ? Aperture : Tv;

  return (
    <header className="flex justify-end items-center w-full max-w-[1400px] mx-auto z-50 relative h-12">
      <div 
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`
          flex items-center cursor-pointer transition-all duration-500 ease-in-out rounded-full 
          border border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-md overflow-hidden
          ${isExpanded ? 'px-5 py-2 gap-5' : 'p-3 gap-0'}
        `}
      >
        {/* Compact State: Just the icon */}
        {!isExpanded && (
          <ActiveIcon className={`w-3.5 h-3.5 ${grain || spotlight ? 'text-[var(--foreground)]' : 'text-neutral-700'}`} />
        )}

        {/* Expanded State */}
        <div className={`flex items-center gap-5 transition-all duration-500 ${isExpanded ? 'opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleEffect('grain'); }} 
              className="group relative"
            >
              <Tv className={`w-3.5 h-3.5 transition-colors ${grain ? 'text-[var(--foreground)]' : 'text-neutral-700 hover:text-neutral-500'}`} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); toggleEffect('spotlight'); }} 
              className="group relative"
            >
              <Aperture className={`w-3.5 h-3.5 transition-colors ${spotlight ? 'text-[var(--foreground)]' : 'text-neutral-700 hover:text-neutral-500'}`} />
            </button>
          </div>
          
          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase whitespace-nowrap">
              {grain ? "Film" : spotlight ? "Focus" : "Default"}
            </span>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="hover:text-[var(--foreground)] text-neutral-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}