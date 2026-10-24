'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LINES: { text: string; footnote?: boolean }[] = [
  {
    text: 'Third year computer science student dedicated to building clean, interactive web experiences that bring creative ideas to life.',
  },
  {
    text: 'I focus on full stack development and custom web interfaces, blending design detail with solid functionality.',
  },
  {
    text: 'When I am not coding, I make music, draw, take photos, and write screenplays.',
    footnote: true,
  },
];

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (!sectionRef.current || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-head]',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.utils.toArray<HTMLElement>('[data-line]').forEach((line) => {
        const chars = line.querySelectorAll<HTMLElement>('[data-char]');
        if (!chars.length) return;

        gsap.fromTo(
          chars,
          { opacity: 0.15, y: 12, rotateX: -20, filter: 'blur(2px)' },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.012,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 88%',
              end: 'bottom 55%',
              scrub: 0.6,
            },
          }
        );
      });

      gsap.fromTo(
        '[data-more]',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-more]',
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full px-6 py-20 sm:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto w-full max-w-272">
        <p
          data-head
          className="mb-12 font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:mb-16"
        >
          about
        </p>

        <div className="flex flex-col gap-8 md:gap-10">
          {LINES.map((line, i) => {
            const isFootnote = line.footnote;
            return (
              <p
                key={i}
                data-line
                className={
                  isFootnote
                    ? 'max-w-[52ch] font-display text-base italic leading-snug text-muted-foreground md:text-lg'
                    : 'max-w-[46ch] font-display font-soft text-[clamp(1.6rem,3.4vw,2.6rem)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground'
                }
              >
                {Array.from(line.text).map((ch, j) => {
                  if (ch === ' ') return <span key={j}> </span>;
                  return (
                    <span
                      key={j}
                      data-char
                      className="inline-block will-change-[transform,opacity,filter]"
                    >
                      {ch}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>

        <Link
          data-more
          href="/about"
          className="mt-12 inline-block font-pixel text-xs text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          more about me
        </Link>
      </div>
    </section>
  );
}