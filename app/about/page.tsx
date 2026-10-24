'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowUpRight, Download, Mail, MapPin } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SIGN_R = 'polygon(0 0, calc(100% - var(--tip)) 0, 100% 50%, calc(100% - var(--tip)) 100%, 0 100%)';
const INK = '#2a1608';
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
const VGRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200' viewBox='0 0 40 200'%3E%3Cg fill='none' stroke='%23915427' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M10 0 C14 50 6 100 10 150 S14 190 10 200'/%3E%3Cpath d='M28 0 C24 40 32 90 28 140 S24 190 28 200'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const TIMELINE = [
  { year: '2021', title: 'Started building for the web', text: 'First lines of HTML & CSS. Broke a lot of things. Learned to love the debugger.' },
  { year: '2022', title: 'Went deep on JavaScript', text: 'React, state, effects, the whole party. Shipped my first real client site.' },
  { year: '2023', title: 'Studio work', text: 'Freelance + collaborative projects. Learning how design and code actually meet.' },
  {
    year: '2024',
    title: 'MonoStudios & the degree',
    text: 'Started my own web studio and began a Computer Science degree at Eduvos. Juggling clients, coursework, and the fun of learning theory alongside practice.',
  },
  { year: '2025', title: 'Games, tooling, and 3d', text: 'Branching out into interactive experiments — games, spatial interfaces, and generative toys.' },
];

const STACK = [
  { label: 'frontend', color: '#FFB800', items: ['React', 'Next.js', 'TypeScript', 'Tailwind'] },
  { label: 'motion & 3d', color: '#8FB8FF', items: ['GSAP', 'Three.js', 'WebGL'] },
  { label: 'design', color: '#FF8FA3', items: ['Figma'] },
  { label: 'backend', color: '#7ED492', items: ['Supabase', 'PHP', 'MySQL', 'Payload CMS'] },
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

/* section head — no border-b now; the divider lives on the content, not twice */
function SectionHead({
  eyebrow,
  title,
  note,
  action,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div data-scroll className="mb-10 md:mb-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-pixel text-xs tracking-wide text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-2 font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground">
            {title}
          </h2>
          {note && <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">{note}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const scope = useRef<HTMLElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ repeat: -1 })
        .set(caretRef.current, { opacity: 0 }, 0.55)
        .set(caretRef.current, { opacity: 1 }, 1.1);

      if (reduced()) return;

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

      /* ---------- timeline-specific animation ---------- */
      // The vertical spine draws as the list scrolls into view
      const spine = document.querySelector('[data-timeline-spine]') as HTMLElement | null;
      if (spine) {
        gsap.fromTo(
          spine,
          { scaleY: 0, transformOrigin: 'top' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: spine.parentElement,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.6,
            },
          }
        );
      }

      // Each row reveals in sequence as it enters the viewport
      gsap.utils.toArray<HTMLElement>('[data-timeline-row]').forEach((row, i) => {
        gsap.from(row, {
          x: -24,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
          delay: i === 0 ? 0 : 0.05,
        });

        // The little dot on each row pulses once when it enters
        const dot = row.querySelector('[data-timeline-dot]');
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.5,
              ease: 'back.out(2)',
              scrollTrigger: { trigger: row, start: 'top 82%', once: true },
            }
          );
        }
      });

      /* ---------- values card entrance ---------- */
      gsap.utils.toArray<HTMLElement>('[data-value-card]').forEach((card, i) => {
        gsap.from(card, {
          y: 32,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const section = 'relative z-10 w-full border-t border-border px-4 py-16 md:px-8 md:py-24';
  const inner = 'mx-auto w-full max-w-6xl';

  const pill = `inline-flex h-10 items-center gap-2 rounded-full px-5 font-pixel text-xs transition-colors duration-200 ${focus}`;
  const pillPrimary = `${pill} bg-foreground text-background hover:bg-primary hover:text-primary-foreground`;
  const pillMuted = `${pill} bg-muted text-foreground hover:bg-foreground hover:text-background`;
  const pillOutline = `${pill} border border-foreground/30 text-foreground hover:bg-foreground hover:text-background`;

  return (
    <main ref={scope} className="relative w-full select-none overflow-x-hidden">
      {/* -------------------------------------------------------------- */}
      {/* Signpost header — no ambient gradient                            */}
      {/* -------------------------------------------------------------- */}
      <header className="relative z-10 pt-40 md:pt-72">
        <div className="pointer-events-none absolute left-0 top-40 h-[17rem] w-full md:top-72 md:h-[26rem]">
          <span
            aria-hidden
            className="absolute -top-5 bottom-0 left-0 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] md:w-10"
            style={{ backgroundColor: '#b97c43', backgroundImage: VGRAIN, backgroundSize: '40px 200px', borderColor: INK }}
          />

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

        <div className="mx-auto max-w-6xl px-4 pt-[17rem] md:flex md:min-h-[26rem] md:items-end md:justify-end md:px-8 md:pt-0">
          <div data-reveal className="max-w-[48ch] md:pb-4">
            <p className="font-pixel text-xs tracking-wide text-muted-foreground">hello</p>
            <p className="mt-2 font-display text-lg italic leading-snug text-foreground md:text-xl">
              I&apos;m Jayson — a web designer and developer based in Johannesburg.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              I build websites, games, and odd little interactive experiments. I care about craft,
              clarity, and making things that feel alive without getting in the way.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/works" className={pillPrimary}>
                see the work
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
              </Link>
              <Link href="/contact" className={pillMuted}>
                <Mail size={14} strokeWidth={1.5} aria-hidden />
                get in touch
              </Link>
              <a href="/cv.pdf" download className={pillOutline}>
                <Download size={14} strokeWidth={1.75} aria-hidden />
                download cv
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* Portrait + statement                                             */}
      {/* -------------------------------------------------------------- */}
      <section className={`${section} mt-20 md:mt-28`}>
        <div className={inner}>
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
            <div
              data-scroll
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border/60 bg-muted md:aspect-[4/5]"
            >
              <Image
                src="/works/mira-landscape.png"
                alt="Portrait"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 font-pixel text-xs text-foreground backdrop-blur-md">
                johannesburg · {new Date().getFullYear()}
              </span>
            </div>

            <div data-scroll>
              <p className="font-pixel text-xs tracking-wide text-muted-foreground">the short version</p>
              <h2 className="mt-2 font-display font-soft text-[clamp(1.75rem,3.6vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.035em] text-foreground">
                I like building things that feel a little more alive than a website.
              </h2>

              <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                I started with static HTML pages and never quite stopped finding ways to make them move.
                Today I work across design and engineering — designing interfaces, writing the front end,
                wiring up the backend, and occasionally letting something silly like a rotary phone be the
                contact page.
              </p>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                I run a small studio called MonoStudios, study Computer Science at Eduvos, take on select
                freelance projects, and spend the rest of the time building interactive experiments just
                to see what happens.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
                <span className="inline-flex items-center gap-2 font-pixel text-xs tracking-wide text-muted-foreground">
                  <MapPin size={13} strokeWidth={1.5} aria-hidden />
                  johannesburg, za
                </span>
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-pixel text-xs text-[#000203]">
                  open to freelance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Timeline — GSAP spine + staggered rows                           */}
      {/* -------------------------------------------------------------- */}
      <section className={section}>
        <div className={inner}>
          <SectionHead eyebrow="history" title="A short timeline" note="How it happened, one year at a time." />

          <div className="relative pl-8 md:pl-12">
            {/* Vertical spine that draws itself as you scroll */}
            <span
              data-timeline-spine
              aria-hidden
              className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-border to-transparent md:left-4"
            />

            <ol className="flex flex-col">
              {TIMELINE.map((item, i) => (
                <li
                  key={item.year}
                  data-timeline-row
                  className="relative pb-10 last:pb-0"
                >
                  {/* Dot marker on the spine */}
                  <span
                    data-timeline-dot
                    aria-hidden
                    className="absolute -left-8 top-2 size-3 rounded-full border-2 border-background bg-primary md:-left-12"
                  />

                  <div className="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8">
                    <span className="flex items-center gap-2 font-pixel text-sm tabular-nums text-muted-foreground">
                      {item.year}
                      {i === TIMELINE.length - 1 && (
                        <span ref={caretRef} aria-hidden className="h-[0.85em] w-[0.45em] bg-foreground" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-display font-soft text-xl tracking-[-0.02em] text-foreground md:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Stack                                                            */}
      {/* -------------------------------------------------------------- */}
      <section className={section}>
        <div className={inner}>
          <SectionHead eyebrow="tools" title="What I reach for" note="The tools I use most." />

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((group) => (
              <div key={group.label} data-scroll>
                <p className="flex items-center gap-2 font-pixel text-xs tracking-wide text-muted-foreground">
                  <span aria-hidden className="size-1.5 rounded-full" style={{ background: group.color }} />
                  {group.label}
                </p>
                <ul className="mt-3 border-t border-border">
                  {group.items.map((tool) => (
                    <li
                      key={tool}
                      className="border-b border-border py-2.5 text-sm text-foreground transition-colors duration-200 hover:text-primary"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Values — as cards                                                */}
      {/* -------------------------------------------------------------- */}
      <section className={section}>
        <div className={inner}>
          <SectionHead eyebrow="principles" title="What I try to hold to" note="Three rules I keep coming back to." />

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                data-value-card
                className="group flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md md:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs tabular-nums text-muted-foreground">
                    0{i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-primary opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <h3 className="mt-2 font-display font-soft text-xl leading-tight tracking-[-0.02em] text-foreground md:text-2xl">
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* -------------------------------------------------------------- */}
      <section className={`${section} pb-28 md:pb-36`}>
        <div className={`${inner} flex flex-col items-start justify-between gap-8 md:flex-row md:items-end`}>
          <div data-scroll>
            <p className="font-pixel text-xs tracking-wide text-muted-foreground">next</p>
            <h2 className="mt-2 font-display font-soft text-[clamp(2rem,5vw,3.75rem)] font-normal leading-none tracking-[-0.04em] text-foreground">
              let&apos;s build something.
            </h2>
            <p className="mt-3 max-w-[40ch] text-sm text-muted-foreground">
              Got a project in mind, or a strange experiment to try? Say hello.
            </p>
          </div>
          <div data-scroll className="flex flex-wrap gap-2">
            <Link href="/contact" className={pillPrimary}>
              start a project
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
            </Link>
            <a href="/cv.pdf" download className={pillOutline}>
              <Download size={14} strokeWidth={1.75} aria-hidden />
              download cv
            </a>
            <Link href="/works" className={pillMuted}>
              browse the works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}