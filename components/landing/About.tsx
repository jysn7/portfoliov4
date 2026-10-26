'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';
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

/* rotating words around the badge */
const RING_TEXT = 'GPA 3.89  •  GRADE AVG 84%  •  OPEN TO WORK  •  BSC COMPUTER SCIENCE  •  ';

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const outerRef = useRef<HTMLSpanElement>(null);

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

      /* badge: slap-down entrance + slow continuous spin */
      if (outerRef.current && ringRef.current) {
        gsap
          .timeline({
            scrollTrigger: { trigger: outerRef.current, start: 'top 88%', once: true },
          })
          .fromTo(
            outerRef.current,
            { scale: 0.4, rotate: -180, autoAlpha: 0 },
            { scale: 1, rotate: -12, autoAlpha: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)' }
          )
          .fromTo(
            ringRef.current,
            { rotate: -90 },
            { rotate: 0, duration: 1.1, ease: 'power3.out' },
            '<'
          )
          .add(() => {
            gsap.to(ringRef.current, {
              rotate: 360,
              duration: 24,
              ease: 'none',
              repeat: -1,
              transformOrigin: '50% 50%',
            });
          });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* circular text path */
  const radius = 60;
  const cx = 72;
  const cy = 72;

  return (
    <section ref={sectionRef} id="about" className="w-full px-6 py-20 sm:px-10 md:py-28 lg:px-16">
      <div className="mx-auto w-full max-w-8xl">
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
                    <span key={j} data-char className="inline-block will-change-[transform,opacity,filter]">
                      {ch}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>

        {/* bottom row — mobile: badge floats right, sits higher; desktop: side-by-side */}
        <div className="relative mt-14 flex items-end justify-between gap-6 md:mt-16">
          <Link
            data-more
            href="/about"
            className="inline-block max-w-[60%] font-pixel text-xs text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:max-w-none"
          >
            more about me
          </Link>

          {/* stylised resume badge — pulled up and to the right on mobile */}
          <a
            href="/cv.pdf"
            download
            className="group relative -mt-16 inline-flex h-[128px] w-[128px] shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:mt-0 md:h-[144px] md:w-[144px]"
            aria-label="Download resume"
          >
            {/* hard offset shadow */}
            <span
              ref={outerRef}
              aria-hidden
              className="absolute inset-0 rounded-full bg-foreground"
              style={{ transform: 'translate(4px, 4px)' }}
            />

            {/* the badge proper — a disk rotated -12° at rest */}
            <span
              className="relative inline-flex h-full w-full items-center justify-center rounded-full border-[2px] border-foreground bg-primary transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-0.5 group-hover:-translate-x-0.5"
              style={{ transform: 'rotate(-12deg)' }}
            >
              {/* rotating circular text */}
              <svg
                ref={ringRef}
                viewBox="0 0 144 144"
                className="absolute inset-0 h-full w-full"
                aria-hidden
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <path
                    id="about-ring"
                    d={`M ${cx} ${cy - radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 ${-radius * 2}`}
                  />
                </defs>
                <text
                  className="fill-background font-pixel uppercase"
                  style={{ fontSize: 8.5, letterSpacing: '0.22em' }}
                >
                  <textPath href="#about-ring" startOffset="0">
                    {RING_TEXT}
                  </textPath>
                </text>
              </svg>

              {/* inner ink ring — the dashed divider */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[16px] rounded-full border border-dashed border-foreground/40 md:inset-[18px]"
              />

              {/* centre circle */}
              <span className="relative grid h-[74px] w-[74px] place-items-center rounded-full border-[2px] border-foreground bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:bg-foreground group-hover:text-background md:h-[84px] md:w-[84px]">
                <ArrowDownToLine
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  className="transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0.5"
                />
                <span className="mt-1 font-pixel text-[9px] uppercase tracking-[0.25em]">resume</span>
              </span>

              {/* tiny corner ticks to give it a stamped feel */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0 6deg, color-mix(in srgb, var(--foreground) 25%, transparent) 6deg 7deg, transparent 7deg 360deg)',
                  maskImage: 'radial-gradient(circle at center, transparent 72%, #000 73%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, transparent 72%, #000 73%)',
                }}
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}