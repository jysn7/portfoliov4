'use client';

import { useEffect, useRef, useState } from 'react';
import { useEffects } from "@/context/EffectContext";
import gsap from "gsap";

export default function Spotlight() {
  const { spotlight } = useEffects();
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!spotlight || !mounted || !frameRef.current) return;

    const ctx = gsap.context(() => {
      // Breathing effect
      gsap.to(frameRef.current, {
        scale: 1.01,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Bracket pulse
      gsap.to(".camera-bracket", {
        opacity: 0.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.1
      });
    });

    return () => ctx.revert();
  }, [spotlight, mounted]);

  if (!spotlight || !mounted) return null;

  return (
    <div className="fixed inset-0 z-9999 pointer-events-none flex items-center justify-center overflow-hidden">
      <div 
        ref={frameRef}
        className="relative w-[92vw] md:w-[96vw] h-[92vh] md:h-[94vh] rounded-[32px] md:rounded-[48px] border-black border-[50vw] md:border-[100vh] flex-none"
        style={{ boxSizing: 'content-box' }}
      >
        {/* Inner Glass Edge */}
        <div className="lens-edge absolute inset-0 border border-white/5 rounded-[32px] md:rounded-[48px]" />

        {/* Brackets */}
        <div className="camera-bracket absolute top-6 md:top-12 left-6 md:left-12 w-6 h-6 border-t border-l border-white/20" />
        <div className="camera-bracket absolute top-6 md:top-12 right-6 md:right-12 w-6 h-6 border-t border-r border-white/20" />
        <div className="camera-bracket absolute bottom-6 md:bottom-12 left-6 md:left-12 w-6 h-6 border-b border-l border-white/20" />
        <div className="camera-bracket absolute bottom-6 md:bottom-12 right-6 md:right-12 w-6 h-6 border-b border-r border-white/20" />
        
        {/* Metadata Overlay */}
        <div className="absolute top-4 md:top-8 left-8 md:left-20 flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-red-600/60 animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            REC 4K 60
          </span>
        </div>

        {/* Minimal Lens Glare */}
        <div className="absolute inset-0 bg-linear-to-br from-white/2 to-transparent" />
      </div>
    </div>
  );
}