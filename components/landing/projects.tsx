'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Project = {
  title: string;
  video: string;
  href: string;
};

// Edit everything here. Only two videos exist so far, so they alternate.
// Keep the count even so the two-column grid stays symmetrical.
const PROJECTS: Project[] = [
  { title: 'Frog Knight', video: '/works/FrogKnight.mp4', href: '/works' },
  { title: 'Mira Run', video: '/works/mira-run.mp4', href: '/works' },
  { title: 'Snake AI Neural Network', video: '/works/snake-cnn.mp4', href: '/works' },
  { title: 'Self Driving Generic Neural Network', video: '/works/self-driving-ann.mp4', href: '/works' },
];

const TITLE = 'Selected Work';
const SUBTITLE =
  'Games and interactive builds, made end to end. Each one starts as a rough idea and ends as something you can play, from the first prototype to the final polish.';

const HEADING = { fontFamily: 'var(--font-heading)' } as const;
const BODY = { fontFamily: 'var(--font-body)' } as const;
const CLIP_HIDDEN = 'inset(100% 0% 0% 0% round 16px)';
const CLIP_SHOWN = 'inset(0% 0% 0% 0% round 16px)';
const pad = (n: number) => String(n).padStart(2, '0');

const Arrow = () => (
  <svg
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  /* ---------- videos: play only while on screen, respect reduced motion ---------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>('video'));
    videos.forEach((v) => {
      v.muted = true; // required for autoplay in several browsers
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videos.forEach((v) => v.pause());
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const v = target as HTMLVideoElement;
          if (isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 }
    );
    videos.forEach((v) => io.observe(v));

    return () => io.disconnect();
  }, []);

  /* ---------- animation ---------- */
  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      },
      (context) => {
        const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };

        // Reduced motion: plain, fully visible layout
        if (!motion) return;

        const header = section.querySelector<HTMLElement>('[data-header]')!;
        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', section);
        const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', section);
        const fades = gsap.utils.toArray<HTMLElement>('[data-fade]', section);

        const articles = gsap.utils.toArray<HTMLElement>('[data-project]', section);
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', section);
        const zooms = gsap.utils.toArray<HTMLElement>('[data-zoom]', section);
        const drifts = gsap.utils.toArray<HTMLElement>('[data-drift]', section);
        const metas = gsap.utils.toArray<HTMLElement>('[data-meta]', section);

        /* ---------- heading: masked letter reveal, then subheading + link ---------- */
        gsap.set(fades, { opacity: 0, y: 14 });
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: header, start: 'top 88%', once: true },
            onComplete: () => {
              gsap.set(masks, { overflow: 'visible' });
            },
          })
          .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
          .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');

        /* ---------- cards: wipe in, settle, drift ---------- */
        gsap.set(cards, { clipPath: CLIP_HIDDEN });
        gsap.set(zooms, { scale: 1.25 });
        gsap.set(metas, { opacity: 0, y: 12 });
        gsap.set(drifts, { scale: 1.12 });

        ScrollTrigger.batch(articles, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            const els = batch as HTMLElement[];
            const q = (sel: string) => els.map((el) => el.querySelector(sel));

            gsap.to(q('[data-card]'), {
              clipPath: CLIP_SHOWN,
              duration: 1.4,
              stagger: 0.12,
              ease: 'expo.out',
              clearProps: 'clipPath',
            });
            gsap.to(q('[data-zoom]'), {
              scale: 1,
              duration: 1.8,
              stagger: 0.12,
              ease: 'expo.out',
            });
            gsap.to(q('[data-meta]'), {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.12,
              delay: 0.25,
              ease: 'power3.out',
            });
          },
        });

        // Video drifts inside its frame while scrolling (same for every card, so it stays symmetrical)
        articles.forEach((article, i) => {
          gsap.fromTo(
            drifts[i],
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: article, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });

        /* ---------- hover (mouse only): slow zoom + arrow swap ---------- */
        if (!hover) return;

        const cleanups: Array<() => void> = [];

        articles.forEach((article, i) => {
          const link = article.querySelector<HTMLElement>('[data-link]')!;
          const arrowA = article.querySelector<HTMLElement>('[data-arrow-a]')!;
          const arrowB = article.querySelector<HTMLElement>('[data-arrow-b]')!;

          gsap.set(arrowB, { opacity: 1, xPercent: -100, yPercent: 100 });

          // One interruptible timeline: play on enter, reverse on leave
          const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
          tl.to(zooms[i], { scale: 1.05, duration: 1.2 }, 0)
            .to(arrowA, { xPercent: 100, yPercent: -100, duration: 0.45, ease: 'power3.in' }, 0)
            .to(arrowB, { xPercent: 0, yPercent: 0, duration: 0.55 }, 0.15);

          const enter = () => tl.timeScale(1).play();
          const leave = () => tl.timeScale(1.6).reverse();

          link.addEventListener('pointerenter', enter);
          link.addEventListener('pointerleave', leave);
          link.addEventListener('focusin', enter);
          link.addEventListener('focusout', leave);

          cleanups.push(() => {
            link.removeEventListener('pointerenter', enter);
            link.removeEventListener('pointerleave', leave);
            link.removeEventListener('focusin', enter);
            link.removeEventListener('focusout', leave);
            tl.kill();
          });
        });

        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="work" className="relative w-full px-4 py-12 md:px-8 md:py-20">
      {/* Heading: left aligned, link to the works page on the right */}
      <header
        data-header
        className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-12"
      >
        <div>
          <h2
            aria-label={TITLE}
            className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            style={HEADING}
          >
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                data-mask
                aria-hidden="true"
                className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
              >
                <span data-char className="inline-block will-change-transform">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              </span>
            ))}
          </h2>
          <p
            data-fade
            className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
            style={HEADING}
          >
            {SUBTITLE}
          </p>
        </div>

        <Link
          data-fade
          href="/works"
          className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:text-base"
          style={BODY}
        >
          View all work
          <Arrow />
        </Link>
      </header>

      {/* Grid: two columns */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:gap-x-6 md:gap-y-12">
        {PROJECTS.map((p, i) => (
          <article key={i} data-project>
            <Link
              data-link
              href={p.href}
              aria-label={`${p.title}, project ${pad(i + 1)}`}
              className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {/* Video frame */}
              <div
                data-card
                className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted"
              >
                {/* Hover + settle layer */}
                <div data-zoom className="absolute inset-0 will-change-transform">
                  {/* Scroll drift layer */}
                  <div data-drift className="absolute inset-0 will-change-transform">
                    <video
                      src={`${p.video}#t=0.1`}
                      className="size-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </div>

              {/* Minimal caption */}
              <div data-meta className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-muted-foreground" style={BODY}>
                    {pad(i + 1)}
                  </span>
                  <h3 className="text-sm font-medium text-foreground md:text-base" style={HEADING}>
                    {p.title}
                  </h3>
                </div>

                {/* Arrow swap: old exits top-right, new enters bottom-left */}
                <span
                  aria-hidden="true"
                  className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden text-foreground"
                >
                  <span data-arrow-a className="flex items-center justify-center">
                    <Arrow />
                  </span>
                  <span
                    data-arrow-b
                    className="absolute inset-0 flex items-center justify-center opacity-0"
                  >
                    <Arrow />
                  </span>
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}