'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* signpost board shape (arrow tip depth comes from --tip) */
const SIGN_R = 'polygon(0 0, calc(100% - var(--tip)) 0, 100% 50%, calc(100% - var(--tip)) 100%, 0 100%)';

/* wood: cartoon outline + tileable grain (horizontal for boards, vertical for the post) */
const INK = '#2a1608';
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
const VGRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200' viewBox='0 0 40 200'%3E%3Cg fill='none' stroke='%23915427' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M10 0 C14 50 6 100 10 150 S14 190 10 200'/%3E%3Cpath d='M28 0 C24 40 32 90 28 140 S24 190 28 200'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const TIMELINE = [
  { year: '2021', title: 'Started building for the web', text: 'First lines of HTML & CSS. Broke a lot of things. Learned to love the debugger.' },
  { year: '2022', title: 'Went deep on JavaScript', text: 'React, state, effects, the whole party. Shipped my first real client site.' },
  { year: '2023', title: 'Studio work', text: 'Freelance + collaborative projects. Learning how design and code actually meet.' },
  { year: '2024', title: 'MonoStudios', text: 'Started my own web studio. Animated front ends, CMSs, and the odd WebGL experiment.' },
  { year: '2025', title: 'Games, tooling, and 3d', text: 'Branching out into interactive experiments — games, spatial interfaces, and generative toys.' },
];

const STACK = [
  'React', 'Next.js', 'TypeScript', 'Tailwind', 'GSAP', 'Three.js',
  'Figma', 'Supabase', 'PHP', 'MySQL', 'Payload CMS', 'WebGL',
];

const VALUES = [
  {
    title: 'craft over noise',
    body: 'Fewer, better things. Every pixel and every millisecond of animation earns its place.',
  },
  {
    title: 'play is research',
    body: 'The experiments, the odd little side projects, the games — they teach the client work how to be bolder.',
  },
  {
    title: 'build for people',
    body: 'Accessible by default, fast by default, and pleasant to use even on the worst phone on the worst network.',
  },
];

/* ------------------------------------------------------------------ */
/* one wooden arrow board */
/* ------------------------------------------------------------------ */
function Board({
  tone,
  className = '',
  inner = '',
  nails,
  knot,
  children,
}: {
  tone: string;
  className?: string;
  inner?: string;
  nails: string;
  knot?: string;
  children: React.ReactNode;
}) {
  const nail = `absolute z-[1] size-2.5 rounded-full border-2 bg-[#b9bfc6] md:size-3 ${nails}`;
  return (
    <div className={`relative w-fit ${className}`} style={{ filter: `drop-shadow(5px 5px 0 ${INK})` }}>
      <div style={{ clipPath: SIGN_R, backgroundColor: INK }} className="p-[3px]">
        <div
          style={{ clipPath: SIGN_R, backgroundColor: tone, backgroundImage: GRAIN, backgroundSize: '260px 100px' }}
          className={`relative ${inner}`}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[#efc18a]" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-[#93582a]" />
          <span aria-hidden className={`${nail} top-[22%]`} style={{ borderColor: INK }} />
          <span aria-hidden className={`${nail} bottom-[22%]`} style={{ borderColor: INK }} />
          {knot && (
            <span
              aria-hidden
              className={`absolute grid size-5 place-items-center rounded-full border-[2.5px] bg-[#a86a30] md:size-6 ${knot}`}
              style={{ borderColor: '#7a4519' }}
            >
              <span className="size-2 rounded-full border-2 md:size-2.5" style={{ borderColor: '#7a4519' }} />
            </span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function AboutPage() {
  const scope = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-board]', { x: '-115%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
      gsap.from('[data-reveal]', { y: 28, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.5 });

      gsap.utils.toArray<HTMLElement>('[data-scroll]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';

  return (
    <main ref={scope} className="relative w-full select-none overflow-x-hidden">
      {/* ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 38rem at 88% 9rem, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 70%), radial-gradient(46rem 34rem at -5% 52rem, color-mix(in srgb, var(--foreground) 5%, transparent), transparent 70%)',
        }}
      />

      {/* -------------------------------------------------------------- */}
      {/* Signpost header                                                  */}
      {/* -------------------------------------------------------------- */}
      <header className="relative z-10 pt-40 md:pt-72">
        <div className="pointer-events-none absolute left-0 top-40 h-[17rem] w-full md:top-72 md:h-[26rem]">
          {/* the post */}
          <span
            aria-hidden
            className="absolute -top-5 bottom-0 left-0 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] md:w-10"
            style={{ backgroundColor: '#b97c43', backgroundImage: VGRAIN, backgroundSize: '40px 200px', borderColor: INK }}
          />

          {/* boards */}
          <div className="absolute left-0 top-0 w-full">
            <div data-board className="absolute left-0 top-10 md:top-16">
              <Board
                tone="#c98d51"
                className="origin-left -translate-x-6 -rotate-[8deg] [--tip:2.5rem] md:[--tip:4.25rem]"
                inner="py-1 pl-14 pr-[calc(var(--tip)+1rem)] md:py-2 md:pl-[5.5rem] md:pr-[calc(var(--tip)+1.75rem)]"
                nails="left-[1.9rem] md:left-[2.2rem]"
                knot="right-[calc(var(--tip)+0.3rem)] top-2.5 md:top-4"
              >
                <h1 className="relative font-display font-soft text-[clamp(3.25rem,13vw,8.5rem)] font-normal leading-none tracking-[-0.045em] text-[#2a1608] [text-shadow:0_2px_0_#efc18a] md:[text-shadow:0_3px_0_#efc18a]">
                  about
                </h1>
              </Board>
            </div>

            <div data-board className="absolute left-0 top-[8.25rem] md:top-[14.5rem]">
              <Board
                tone="#d39a5c"
                className="origin-left -translate-x-8 -rotate-[4deg] [--tip:1.5rem] md:[--tip:2.25rem]"
                inner="py-1.5 pl-[4.5rem] pr-[calc(var(--tip)+0.9rem)] md:py-2 md:pl-[6rem]"
                nails="left-[2.4rem] md:left-[2.7rem]"
              >
                <span className="relative block font-pixel text-xs text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-sm">
                  the person behind the pixels
                </span>
              </Board>
            </div>

            <div data-board className="absolute left-0 top-[11.25rem] md:top-[19.5rem]">
              <Board
                tone="#bd8449"
                className="origin-left -translate-x-10 rotate-[2.5deg] [--tip:1.25rem] md:[--tip:1.75rem]"
                inner="py-1 pl-20 pr-[calc(var(--tip)+0.75rem)] md:py-1.5 md:pl-[6.5rem]"
                nails="left-[2.9rem] md:left-[3.2rem]"
              >
                <span className="relative block font-pixel text-[10px] text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-xs">
                  johannesburg, south africa
                </span>
              </Board>
            </div>
          </div>
        </div>

        {/* intro paragraph */}
        <div className="mx-auto max-w-350 px-6 pt-[17rem] md:flex md:min-h-[26rem] md:items-end md:justify-end md:px-12 md:pt-0">
          <div data-reveal className="max-w-[48ch] md:pb-4">
            <p className="font-display text-lg italic leading-snug text-foreground md:text-xl">
              hi, I&apos;m Jayson — a web designer and developer based in Johannesburg.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              I build websites, games, and odd little interactive experiments. I care about craft,
              clarity, and making things that feel alive without getting in the way.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/works"
                className={`inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-pixel text-xs text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${focus}`}
              >
                see the work
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/contact"
                className={`inline-flex h-10 items-center gap-2 rounded-full bg-muted px-5 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${focus}`}
              >
                <Mail size={14} strokeWidth={1.5} aria-hidden />
                get in touch
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* Portrait + statement                                             */}
      {/* -------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto mt-24 max-w-350 px-6 md:mt-32 md:px-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end md:gap-16">
          <div data-scroll className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src="/works/mira-landscape.png"
              alt="Portrait"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 font-pixel text-[10px] uppercase tracking-[0.3em] text-foreground backdrop-blur">
              johannesburg · {new Date().getFullYear()}
            </span>
          </div>

          <div data-scroll>
            <p className="font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              the short version
            </p>
            <h2 className="mt-4 font-display font-soft text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em] text-foreground">
              I like building things that feel a little more alive than a website.
            </h2>
            <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              I started with static HTML pages and never quite stopped finding ways to make them move.
              Today I work across design and engineering — designing interfaces, writing the front end,
              wiring up the backend, and occasionally letting something silly like a rotary phone be the
              contact page.
            </p>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              I run a small studio called MonoStudios, take on select freelance projects, and spend the
              rest of the time building interactive experiments just to see what happens.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} strokeWidth={1.5} aria-hidden />
                Johannesburg, ZA
              </span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
              <span>open to freelance</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Timeline                                                         */}
      {/* -------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto mt-28 max-w-350 px-6 md:mt-36 md:px-12">
        <div data-scroll className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              how it happened
            </p>
            <h2 className="mt-3 font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] leading-none tracking-[-0.035em] text-foreground">
              a short timeline
            </h2>
          </div>
        </div>

        <ol className="relative border-l border-border">
          {TIMELINE.map((item) => (
            <li key={item.year} data-scroll className="relative pl-8 pb-12 last:pb-0 md:pl-12">
              <span
                aria-hidden
                className="absolute left-0 top-2 -translate-x-1/2 size-3 rounded-full border border-foreground bg-card"
              />
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-pixel text-xs tabular-nums text-muted-foreground">{item.year}</span>
                <h3 className="font-display font-soft text-2xl tracking-[-0.02em] text-foreground">{item.title}</h3>
              </div>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Stack                                                            */}
      {/* -------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto mt-28 max-w-350 px-6 md:mt-36 md:px-12">
        <div data-scroll>
          <p className="font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            the tools
          </p>
          <h2 className="mt-3 font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] leading-none tracking-[-0.035em] text-foreground">
            what I reach for
          </h2>
        </div>
        <ul data-scroll className="mt-8 flex flex-wrap gap-2">
          {STACK.map((tool) => (
            <li
              key={tool}
              className="rounded-full border border-border px-4 py-2 font-pixel text-xs text-foreground transition-colors duration-200 hover:border-foreground hover:bg-foreground hover:text-background"
            >
              {tool}
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Values                                                           */}
      {/* -------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto mt-28 max-w-350 px-6 md:mt-36 md:px-12">
        <div data-scroll className="mb-10">
          <p className="font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            the rules
          </p>
          <h2 className="mt-3 font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] leading-none tracking-[-0.035em] text-foreground">
            what I try to hold to
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:gap-10">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              data-scroll
              className="rounded-2xl border border-border bg-card/50 p-6 md:p-8"
            >
              <p className="font-pixel text-xs text-muted-foreground tabular-nums">0{i + 1}</p>
              <h3 className="mt-4 font-display font-soft text-2xl leading-tight tracking-[-0.02em] text-foreground">
                {v.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* -------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto mt-28 max-w-350 px-6 pb-32 md:mt-36 md:px-12 md:pb-40">
        <div data-scroll className="flex flex-col items-start justify-between gap-6 border-t border-border pt-12 md:flex-row md:items-end">
          <div>
            <p className="font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              next
            </p>
            <h2 className="mt-3 font-display font-soft text-[clamp(2.25rem,6vw,4.5rem)] leading-none tracking-[-0.04em] text-foreground">
              let&apos;s build something.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/contact"
              className={`inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 font-pixel text-xs text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${focus}`}
            >
              start a project
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link
              href="/works"
              className={`inline-flex h-11 items-center gap-2 rounded-full bg-muted px-6 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${focus}`}
            >
              browse the works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}