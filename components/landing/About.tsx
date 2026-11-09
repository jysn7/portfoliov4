'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const TITLE = 'About';
const SUBTITLE = 'Student, developer and maker.';

const INTRO =
  'Third year computer science student dedicated to building clean, interactive web experiences that bring creative ideas to life.';
const BODY_COPY =
  'I focus on full stack development and custom web interfaces, blending design detail with solid functionality.';

// The last line cycles through these, character by character (same trick as the Hero title)
const PHRASES = ['make music.', 'draw.', 'take photos.', 'write screenplays.'];
const MORPH_PREFIX = 'When I am not coding, I';
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz&/<>_';

type Stat = {
  label: string;
  value?: number; // numeric stats count up on scroll
  decimals?: number;
  suffix?: string;
  text?: string; // plain stats
};

const STATS: Stat[] = [
  { label: 'GPA', value: 3.89, decimals: 2 },
  { label: 'Grade average', value: 84, decimals: 0, suffix: '%' },
  { label: 'Availability', text: 'Open' },
  { label: 'BSc Computer Science', text: 'Year 3' },
];

const HEADING = { fontFamily: 'var(--font-heading)' } as const;
const BODY = { fontFamily: 'var(--font-body)' } as const;

const formatStat = (v: number, decimals = 0, suffix = '') => `${v.toFixed(decimals)}${suffix}`;

/* Splits text into words (never breaking mid-word) made of animatable characters */
const SplitChars = ({ text }: { text: string }) => (
  <>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">
      {text.split(' ').map((word, w, words) => (
        <span key={w}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, j) => (
              <span key={j} data-char className="inline-block will-change-transform">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  </>
);

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const headChars = gsap.utils.toArray<HTMLElement>('[data-hchar]', section);
      const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', section);
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]', section);
      const stats = gsap.utils.toArray<HTMLElement>('[data-stat]', section);
      const counts = gsap.utils.toArray<HTMLElement>('[data-count]', section);
      const morph = section.querySelector<HTMLElement>('[data-morph]');

      /* ---------- heading: masked letter reveal, then subheading + link ---------- */
      gsap.set(fades, { opacity: 0, y: 14 });
      gsap
        .timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: '[data-header]', start: 'top 88%', once: true },
          onComplete: () => {
            gsap.set(masks, { overflow: 'visible' });
          },
        })
        .from(headChars, { yPercent: 115, duration: 1.1, stagger: 0.04 })
        .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');

      /* ---------- statement: letters resolve as you scroll ---------- */
      gsap.utils.toArray<HTMLElement>('[data-line]', section).forEach((line) => {
        const chars = line.querySelectorAll<HTMLElement>('[data-char]');
        if (!chars.length) return;

        gsap.fromTo(
          chars,
          { opacity: 0.15, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.012,
            ease: 'power3.out',
            scrollTrigger: { trigger: line, start: 'top 88%', end: 'bottom 55%', scrub: 0.6 },
          }
        );
      });

      /* ---------- stat cards: rise in, numbers count up ---------- */
      gsap.set(stats, { opacity: 0, y: 32 });
      ScrollTrigger.batch(stats, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform',
          }),
      });

      counts.forEach((el) => {
        const to = Number(el.dataset.to);
        const decimals = Number(el.dataset.decimals ?? 0);
        const suffix = el.dataset.suffix ?? '';
        const state = { v: 0 };
        el.textContent = formatStat(0, decimals, suffix);

        gsap.to(state, {
          v: to,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = formatStat(state.v, decimals, suffix);
          },
          onComplete: () => {
            el.textContent = formatStat(to, decimals, suffix);
          },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });

      /* ---------- the "when I'm not coding" line cycles through hobbies ---------- */
      let idx = 0;
      let timer: gsap.core.Tween | null = null;
      let scramble: gsap.core.Tween | null = null;

      const scrambleTo = (to: string) => {
        if (!morph) return;
        scramble?.kill();
        const from = morph.textContent ?? '';
        const len = Math.max(from.length, to.length);
        const lag = 6;
        const state = { p: 0 };

        scramble = gsap.to(state, {
          p: len + lag,
          duration: 1.1,
          ease: 'none',
          onUpdate: () => {
            let out = '';
            for (let i = 0; i < len; i++) {
              const target = to[i] ?? '';
              if (state.p >= i + lag) out += target;
              else if (state.p >= i)
                out +=
                  target === ' ' || target === '' || target === '.'
                    ? target
                    : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              else out += from[i] ?? '';
            }
            morph.textContent = out;
          },
          onComplete: () => {
            morph.textContent = to;
          },
        });
      };

      const tick = () => {
        idx = (idx + 1) % PHRASES.length;
        scrambleTo(PHRASES[idx]);
        timer = gsap.delayedCall(3, tick);
      };
      const start = () => {
        timer?.kill();
        timer = gsap.delayedCall(2, tick);
      };
      const stop = () => {
        timer?.kill();
      };

      if (morph) {
        ScrollTrigger.create({
          trigger: morph,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? start() : stop()),
        });
      }

      return () => {
        timer?.kill();
        scramble?.kill();
        if (morph) morph.textContent = PHRASES[0];
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative w-full px-4 py-12 md:px-8 md:py-20">
      {/* Heading: left aligned, link on the right */}
      <header
        data-header
        className="mb-10 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-12"
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
                <span data-hchar className="inline-block will-change-transform">
                  {char}
                </span>
              </span>
            ))}
          </h2>
          <p
            data-fade
            className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
            style={HEADING}
          >
            {SUBTITLE}
          </p>
        </div>

        <Link
          data-fade
          href="/about"
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-md text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:text-base"
          style={BODY}
        >
          More about me
          <span aria-hidden className="relative size-4 overflow-hidden">
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-out group-hover:-translate-y-5 group-hover:translate-x-5 motion-reduce:transition-none"
            />
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              className="absolute inset-0 -translate-x-5 translate-y-5 transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
            />
          </span>
        </Link>
      </header>

      {/* Two equal columns: story left, facts right */}
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {/* Story */}
        <div className="flex flex-col gap-6 md:gap-8">
          <p
            data-line
            className="max-w-xl text-2xl leading-tight tracking-tight text-foreground md:text-3xl"
            style={HEADING}
          >
            <SplitChars text={INTRO} />
          </p>

          <p
            data-line
            className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            style={HEADING}
          >
            <SplitChars text={BODY_COPY} />
          </p>

          <p
            className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            style={HEADING}
          >
            <span className="sr-only">
              When I am not coding, I make music, draw, take photos, and write screenplays.
            </span>
            <span aria-hidden="true">
              {MORPH_PREFIX}
              <span data-morph className="block text-foreground">
                {PHRASES[0]}
              </span>
            </span>
          </p>
        </div>

        {/* Facts */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                data-stat
                className="flex aspect-4/3 flex-col justify-between rounded-2xl border border-border p-4 transition-colors duration-300 hover:border-foreground md:p-5"
              >
                <span className="text-sm text-muted-foreground" style={BODY}>
                  {s.label}
                </span>
                {s.value !== undefined ? (
                  <span
                    data-count
                    data-to={s.value}
                    data-decimals={s.decimals}
                    data-suffix={s.suffix}
                    className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
                    style={HEADING}
                  >
                    {formatStat(s.value, s.decimals, s.suffix)}
                  </span>
                ) : (
                  <span
                    className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
                    style={HEADING}
                  >
                    {s.text}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Resume */}
          <a
            data-stat
            href="/cv.pdf"
            download
            aria-label="Download resume"
            className="group flex items-center justify-between rounded-2xl bg-foreground px-5 py-4 text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <span className="text-sm font-medium md:text-base" style={BODY}>
              Download resume
            </span>
            <span aria-hidden className="relative size-5 overflow-hidden">
              <ArrowDownToLine
                size={20}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-out group-hover:translate-y-6 motion-reduce:transition-none"
              />
              <ArrowDownToLine
                size={20}
                strokeWidth={1.5}
                className="absolute inset-0 -translate-y-6 transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none"
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}