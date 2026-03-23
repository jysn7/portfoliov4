'use client';

import { Tv } from "lucide-react";
import { useEffects } from "@/context/EffectContext";

export default function Header() {
  const { grain, setGrain } = useEffects();

  return (
    <header className="flex justify-end items-center w-full max-w-350 mx-auto z-50 relative h-12">
      <button 
        onClick={() => setGrain(!grain)}
        className="
          flex items-center gap-3 p-3 rounded-full 
          border border-border bg-background/40 backdrop-blur-md
          transition-all duration-300 group
        "
      >
        <Tv className={`w-3.5 h-3.5 transition-colors ${grain ? 'text-foreground' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
        
      </button>
    </header>
  );
}