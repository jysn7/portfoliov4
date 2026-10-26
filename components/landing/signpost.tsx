'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Sign = {
  label: string;
  href: string;
  dir: 'left' | 'right';
  wood: string;
  rot: number; // resting tilt in degrees
  shift: number; // px offset from the post
};

// Edit the planks here: label, link, which way it points.
const SIGNS: Sign[] = [
  { label: 'all work', href: '/works', dir: 'right', wood: '#DDA86C', rot: -2, shift: 26 },
  { label: 'about', href: '/about', dir: 'left', wood: '#CB8D4E', rot: 1.5, shift: -26 },
  { label: 'say hello', href: '/contact', dir: 'right', wood: '#BF7F42', rot: -1, shift: 14 },
];

const CLIP = {
  right: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)',
  left: 'polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)',
};

const GRAIN = 'repeating-linear-gradient(180deg, rgba(60, 30, 5, 0.08) 0 1px, transparent 1px 8px)';
const VGRAIN = 'repeating-linear-gradient(90deg, rgba(60, 30, 5, 0.08) 0 1px, transparent 1px 8px)';
const INK = '#2a1608';

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Signpost() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (reduced()) return;

    const ctx = gsap.context(() => {
      const planks = gsap.utils.toArray<HTMLElement>('[data-plank]');

      gsap.set('[data-post]', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('[data-ground]', { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set('[data-sign-head]', { opacity: 0, y: 16 });
      planks.forEach((el) =>
        gsap.set(el, {
          rotate: el.dataset.dir === 'right' ? -35 : 35,
          opacity: 0,
          transformOrigin: el.dataset.dir === 'right' ? '0% 50%' : '100% 50%',
        })
      );

      gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } })
        .to('[data-sign-head]', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('[data-post]', { scaleY: 1, duration: 0.9, ease: 'power3.out' }, '-=0.4')
        .to('[data-ground]', { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '<0.1')
        .to(planks, { opacity: 1, duration: 0.25, stagger: 0.15, ease: 'none' }, '-=0.3')
        .to(planks, { rotate: 0, duration: 1.4, stagger: 0.15, ease: 'elastic.out(1, 0.35)' }, '<');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Hover: the plank gives a little swing
  const swing = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced()) return;
    const right = e.currentTarget.dataset.dir === 'right';
    gsap.fromTo(
      e.currentTarget,
      { rotate: right ? -6 : 6 },
      { rotate: 0, duration: 1.3, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' }
    );
  };

  return (
    <section ref={sectionRef} className="w-full  px-3 pb-24 pt-16 md:px-6 md:pt-24">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center">
        <h2
          data-sign-head
          className="text-center font-display font-soft text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-foreground"
        >
          Where to next?
        </h2>

        <div className="relative mt-10 flex flex-col items-center">
          {/* Post */}
          <span
            data-post
            aria-hidden
            className="absolute inset-y-0 left-0 right-0 mx-auto w-4 rounded-t-sm border-x-2 md:w-5"
            style={{
              backgroundColor: '#7A4E24',
              backgroundImage: VGRAIN,
              borderColor: INK,
            }}
          />

          <ul className="relative flex flex-col items-center gap-4 pb-16 pt-10">
            {SIGNS.map((s) => (
              <li
                key={s.label}
                className="relative"
                style={{
                  transform: `translateX(${s.shift}px) rotate(${s.rot}deg)`,
                  filter: 'drop-shadow(3px 3px 0 rgba(42, 22, 8, 0.85))',
                }}
              >
                <Link
                  href={s.href}
                  data-plank
                  data-dir={s.dir}
                  onPointerEnter={swing}
                  className={`group relative flex h-12 w-56 items-center gap-2 font-pixel text-base text-[#2B1A0B] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2B1A0B] sm:w-64 ${
                    s.dir === 'right' ? 'justify-start pl-4 pr-10' : 'justify-end pl-10 pr-4'
                  }`}
                  style={{ clipPath: CLIP[s.dir], backgroundColor: s.wood, backgroundImage: GRAIN }}
                >
                  {/* top/bottom bevel bands for a bit of wood feel */}
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#efc18a]/70" />
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[#93582a]/70" />

                  {/* nail at the flat end */}
                  <span
                    aria-hidden
                    className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#2B1A0B]/50 ${
                      s.dir === 'right' ? 'left-2.5' : 'right-2.5'
                    }`}
                  />

                  <span className="relative">{s.label}</span>

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden
                    className="relative -translate-x-1 scale-75 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Ground */}
          <span
            data-ground
            aria-hidden
            className="block h-2 w-44 rounded-full bg-foreground/15 md:w-56"
          />
        </div>
      </div>
    </section>
  );
}