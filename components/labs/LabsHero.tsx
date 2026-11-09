'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { HEADING, HERO_TEXT, HERO_HEIGHT } from '@/lib/labs/constants';
import { useIsoLayoutEffect } from '@/lib/labs/hooks';

export function LabsHero() {
  const heroRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const mm = gsap.matchMedia(hero);
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      },
      (context) => {
        const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };
        if (!motion) return;

        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', hero);
        const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', hero);

        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => {
              gsap.set(masks, { overflow: 'visible' });
            },
          })
          .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.03 });

        const cleanups: Array<() => void> = [];
        if (hover) {
          const charY = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' }));
          const onMove = (e: PointerEvent) => {
            chars.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              charY[i](-8 * Math.exp(-(dx * dx + dy * dy) / (2 * 90 * 90)));
            });
          };
          const onLeave = () => {
            gsap.to(chars, { y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
          };
          hero.addEventListener('pointermove', onMove);
          hero.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            hero.removeEventListener('pointermove', onMove);
            hero.removeEventListener('pointerleave', onLeave);
          });
        }
        return () => cleanups.forEach((fn) => fn());
      }
    );
    return () => mm.revert();
  }, []);

  return (
    <header
      ref={heroRef}
      data-hero
      className="flex w-full items-center justify-center px-4 pb-8 pt-28 text-center md:pb-12 md:pt-36"
      style={{ minHeight: HERO_HEIGHT }}
    >
      <h1
        aria-label={HERO_TEXT}
        className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-foreground md:text-2xl"
        style={HEADING}
      >
        {HERO_TEXT.split(' ').map((word, w, words) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, i) => (
                <span
                  key={i}
                  data-mask
                  aria-hidden="true"
                  className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
                >
                  <span data-char className="inline-block will-change-transform">
                    {char}
                  </span>
                </span>
              ))}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </h1>
    </header>
  );
}