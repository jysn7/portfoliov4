'use client';

import { useEffect, useRef } from "react";
import { useEffects } from "@/context/EffectContext";
import gsap from "gsap";

export default function GrainEffect() {
  const { grain } = useEffects();
  const waveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!grain || !waveRef.current) return;

    // Create a timeline for the rolling interference wave
    const tl = gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 2 });

    tl.fromTo(waveRef.current, 
      { top: "-20%", opacity: 0 },
      { 
        top: "120%", 
        opacity: 0.3, // Increased opacity for visibility
        duration: 1.2, 
        ease: "none",
        onStart: () => {
          // Randomly skew the wave each time it passes
          gsap.set(waveRef.current, { skewY: Math.random() * 2 });
        }
      }
    );

    return () => {
      tl.kill();
    };
  }, [grain]);

  if (!grain) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* 1. Heavy Static Layer */}
      <div 
        className="absolute inset-[-100%] opacity-[0.15] contrast-[150%] brightness-[120%]"
        style={{ 
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
          backgroundSize: '100px 100px',
          animation: 'jitter 0.15s steps(2) infinite'
        }}
      />

      {/* 2. The Interference Wave (The Glitch) */}
      <div 
        ref={waveRef}
        className="absolute left-0 w-full h-[15vh] bg-white/10 blur-[40px] mix-blend-overlay border-t border-white/5"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes jitter {
          0% { transform: translate(0,0); }
          50% { transform: translate(-1%, -1.5%); }
          100% { transform: translate(1.5%, 0.5%); }
        }
      `}} />
    </div>
  );
}