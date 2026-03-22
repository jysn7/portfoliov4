'use client';

import { useEffect, useRef, useState } from 'react';
import { useEffects } from "@/context/EffectContext";
import gsap from "gsap";

export default function Spotlight() {
  const { spotlight } = useEffects();
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!spotlight || !mounted || !frameRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Subtle breathing of the frame
      gsap.to(frameRef.current, {
        scale: 1.005,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // 2. Focus pulse: the corner brackets and inner shadow shift slightly
      gsap.to(".camera-bracket", {
        opacity: 0.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.2
      });

      // 3. Subtle chromatic shimmer on the inner edge
      gsap.to(".lens-edge", {
        borderColor: "rgba(255, 255, 255, 0.15)",
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "none"
      });
    });

    return () => ctx.revert();
  }, [spotlight, mounted]);

  if (!spotlight || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
      <div 
        ref={frameRef}
        className="relative w-[96vw] h-[94vh] rounded-4xl border-black border-[100vh] flex-none"
        style={{
          boxSizing: 'content-box',
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.95)", 
        }}
      >
        {/* The Glass Edge (Inner Border) */}
        <div className="lens-edge absolute inset-0 border border-white/10 rounded-4xl transition-colors duration-1000" />

        {/* Corner Brackets with refined styling */}
        <div className="camera-bracket absolute top-12 left-12 w-8 h-8 border-t border-l border-white/20 rounded-tl-sm" />
        <div className="camera-bracket absolute top-12 right-12 w-8 h-8 border-t border-r border-white/20 rounded-tr-sm" />
        <div className="camera-bracket absolute bottom-12 left-12 w-8 h-8 border-b border-l border-white/20 rounded-bl-sm" />
        <div className="camera-bracket absolute bottom-12 right-12 w-8 h-8 border-b border-r border-white/20 rounded-br-sm" />
        
        {/* Metadata Overlay */}
        <div className="absolute top-6 left-12 flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 animate-pulse" />
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
            4K RAW 60FPS
          </span>
        </div>

        {/* Subtle Lens Reflection - keeps it artsy but readable */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}