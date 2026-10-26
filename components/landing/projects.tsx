'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Project = {
  title: string;
  description: string;
  tags: string[];
  image: string;
  href: string;
};

// Edit everything here: copy, images, links.
const PROJECTS: Project[] = [
  {
    title: 'SIRL',
    description: 'An e-commerce storefront for a jewelry brand — product pages, collections, and a checkout flow that feels as considered as the pieces themselves.',
    tags: ['Next.js', 'Sanity'],
    image: '/new-work/sirl.png',
    href: '/works',
  },
  {
    title: 'Canvas',
    description: 'A portfolio site for a painting business, with a gallery that puts the work first and lets the artwork do the talking.',
    tags: ['Next.js', 'GSAP'],
    image: '/new-work/canvas.png',
    href: '/works',
  },
  {
    title: 'Izakhiwo',
    description: 'A booking and quote site for a roofing and plumbing contractor, built around a clean job-request flow.',
    tags: ['Next.js', 'Supabase'],
    image: '/new-work/izakhiwo.png',
    href: '/works',
  },
  {
    title: 'Monostudios',
    description: 'The website for my web studio, with an animated WebGL front end and a CMS behind it.',
    tags: ['GSAP', 'WebGL', 'Payload CMS'],
    image: '/new-work/monos.png',
    href: '/works',
  },
];

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  // One quiet moment: heading and cards fade up as they scroll into view
  useIsoLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.set('[data-project]', { opacity: 0, y: 40 });
      gsap.set('[data-head]', { opacity: 0, y: 20 });

      gsap.to('[data-head]', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-head]', start: 'top 85%', once: true },
      });

      ScrollTrigger.batch('[data-project]', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="w-full px-6 py-16 sm:px-10 md:py-24 lg:px-16"
    >
      {/* Same 68rem width and side padding as the hero, so the edges line up */}
      <div className="mx-auto w-full max-w-8xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-12">
          <div>
            <h2
              data-head
              className="font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground"
            >
              Selected work
            </h2>
            <p data-head className="mt-3 text-sm text-muted-foreground">
              Four projects I&apos;m proudest of.
            </p>
          </div>

          <Link
            data-head
            href="/works"
            className="rounded-md font-pixel text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-300 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            all work
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 md:gap-y-16">
          {PROJECTS.map((p) => (
            <article key={p.title} data-project>
              <Link
                href={p.href}
                aria-label={`${p.title}: ${p.description}`}
                className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              >
                {/* Image: bigger and near-square, same bordered window look */}
                <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl  bg-muted transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_var(--primary)] md:aspect-square">
                  <Image
                    src={p.image}
                    alt={`${p.title} preview`}
                    fill
                    sizes="(min-width: 1088px) 544px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h3 className="font-display font-soft text-2xl tracking-tight text-foreground">{p.title}</h3>
                  <ul className="flex flex-wrap justify-end gap-1.5">
                    {p.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md border-[1.5px] border-foreground px-2 py-0.5 font-pixel text-xs text-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}