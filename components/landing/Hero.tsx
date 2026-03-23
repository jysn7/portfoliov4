'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!nameRef.current) return;

    // We use a fixed string to prevent accidental double-renders or innerText issues
    const textLines = ["Jayson", "Baloyi"];
    
    // Clear and rebuild the HTML with proper line handling
    nameRef.current.innerHTML = textLines
      .map(line => 
        `<span class="block overflow-hidden">
          ${line.split('').map(char => 
            `<span class="char inline-block translate-y-full opacity-0 blur-sm whitespace-nowrap">${char === ' ' ? '&nbsp;' : char}</span>`
          ).join('')}
        </span>`
      ).join('');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(".char", {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.5,
        stagger: {
          amount: 0.5,
          from: "random"
        }
      });

      tl.fromTo(subRef.current, 
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=1.2"
      );
    }, nameRef); // Scope to nameRef to target chars safely

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative pr-4 min-h-[calc(100vh-80px)] w-full flex flex-col justify-end items-end pb-12 select-none">
      <div className="flex flex-col text-right max-w-full">
        <h1 
          ref={nameRef}
          className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tight leading-none text-[var(--foreground)] uppercase"
        >
          {/* Initial text for SEO, GSAP will replace this */}
          Jayson Baloyi
        </h1>
        <p 
          ref={subRef}
          className="mt-6 md:mt-8 text-lg md:text-2xl font-extralight tracking-wider text-[var(--foreground)]"
        >
          Artist - Web Developer
        </p>
      </div>
    </section>
  );
}