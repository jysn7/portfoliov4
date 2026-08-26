'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const paragraphs = gsap.utils.toArray<HTMLParagraphElement>(
        '.about-text p'
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power4.out',
        }
      )
        .fromTo(
          paragraphs,
          {
            opacity: 0,
            y: 45,
            rotateX: -15,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
          },
          '-=0.6'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center"
    >
      <h2
        ref={headerRef}
        className="text-xs uppercase tracking-[0.3em] font-normal text-muted-foreground mb-12"
      >
        About
      </h2>

      <div
        ref={textRef}
        className="about-text flex flex-col gap-10 text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed text-foreground"
      >
        <p>
          Third year computer science student dedicated to building clean,
          interactive web experiences that bring creative ideas to life.
        </p>

        <p>
          I focus on full stack development and custom web interfaces, blending design detail with solid functionality.
        </p>

        <p className="text-base sm:text-lg text-muted-foreground">
          When I am not coding, I make music, draw, take photos, and write screenplays.
        </p>
      </div>
    </div>
  );
}