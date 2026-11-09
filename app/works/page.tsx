'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import Image, { type StaticImageData } from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

import { works } from '@/lib/works';
import { FEATURED as FEATURED_SOURCE, type CaseView as FeaturedCase } from '@/lib/featured';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ================================================================== */
/* CONFIG                                                               */
/* ================================================================== */
const HEADING = { fontFamily: 'var(--font-heading)' } as const;
const BODY = { fontFamily: 'var(--font-body)' } as const;

const HERO_TEXT = 'Some things I’ve worked on ;)';
const HERO_HEIGHT = '72svh'; // the rest of the first screen is the featured grid peeking in

const CLIP_HIDDEN = 'inset(100% 0% 0% 0% round 16px)';
const CLIP_SHOWN = 'inset(0% 0% 0% 0% round 16px)';
const IMG_SIZES = '(min-width: 768px) 640px, 90vw';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
const ROUND_BTN = `grid size-11 place-items-center rounded-xl bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 ${FOCUS}`;
const BTN = `inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-medium transition-colors duration-200 ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-foreground text-background hover:bg-foreground/85`;
const LABEL = 'text-sm text-muted-foreground';

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const t = (s: number) => (reduced() ? 0 : s);
const pad = (x: number) => String(x).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Social links under the hero. Edit the hrefs here.                    */
/* ------------------------------------------------------------------ */
const iconProps = {
  viewBox: '0 0 24 24',
  className: 'size-5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/jysn7',
    icon: (
      <svg {...iconProps}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jayson-baloyi-2a01512b0',
    icon: (
      <svg {...iconProps}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/amant.dur',
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    ),
  },
];

/* ================================================================== */
/* ARCHIVE COPY                                                         */
/* Extra detail for archive projects whose `works` entry lacks it.      */
/* (Featured projects get theirs from /lib/featured.)                   */
/* ================================================================== */
type Img = string | StaticImageData;
type Block = { title: string; text: string };
type Stat = { value: string; label: string };
type Details = {
  year?: string | number;
  role?: string;
  client?: string;
  timeline?: string;
  status?: string;
  tags?: string[];
  overview?: string[];
  highlights?: Block[];
  challenge?: string;
  solution?: string;
  results?: Stat[];
  gallery?: Img[];
  repo?: string;
};

const DETAILS: Record<string, Details> = {
  kith: {
    role: 'Full-stack developer',
    tags: ['PHP', 'MySQL'],
    overview: [
      'A consumer-to-consumer marketplace for preloved goods, where people list what they no longer need and buy directly from each other.',
      'Built with PHP and MySQL, covering listings, accounts and the buying flow end to end.',
    ],
    highlights: [
      { title: 'Listings and browsing', text: 'Sellers post items and buyers can search and browse them.' },
      { title: 'PHP + MySQL', text: 'A classic server-rendered stack with a relational database behind it.' },
    ],
  },
  epitrace: {
    role: 'Developer',
    timeline: 'Hackathon',
    tags: ['GeoTech', 'Hackathon'],
    overview: [
      'A GeoTech platform for syndromic reporting of foot-and-mouth disease (FMD), built as a hackathon submission.',
      'It puts reports on a map so outbreaks can be spotted and followed by location.',
    ],
    highlights: [
      { title: 'Map-based reporting', text: 'Cases are reported and viewed by place, not just as a list.' },
      { title: 'Built in a weekend', text: 'Scoped, designed and shipped inside hackathon time limits.' },
    ],
  },
};

/* ================================================================== */
/* DATA                                                                 */
/* Featured comes from /lib/featured. Everything else in /lib/works     */
/* goes to the archive.                                                 */
/* ================================================================== */
type CaseView = {
  id: string | number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: Img | '';
  video?: string;
  href?: string;
  year?: string | number;
  featured?: boolean;
  role?: string;
  client?: string;
  timeline?: string;
  status?: string;
  overview: string[];
  highlights: Block[];
  challenge?: string;
  solution?: string;
  results: Stat[];
  gallery: Img[];
  repo?: string;
};

const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const isVideoSrc = (s: unknown): s is string => typeof s === 'string' && VIDEO_RE.test(s);

/* eslint-disable @typescript-eslint/no-explicit-any */
const pick = (o: Record<string, any>, ...keys: string[]) => {
  for (const k of keys) if (o[k] != null && o[k] !== '') return o[k];
  return undefined;
};

const asParas = (raw: unknown): string[] => {
  if (typeof raw === 'string') return raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return [];
};
const asBlocks = (raw: unknown): Block[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) =>
      typeof x === 'string'
        ? { title: '', text: x }
        : {
            title: String((x as any)?.title ?? (x as any)?.name ?? ''),
            text: String((x as any)?.text ?? (x as any)?.description ?? ''),
          }
    )
    .filter((b) => b.title || b.text);
};
const asStats = (raw: unknown): Stat[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) =>
      typeof x === 'string'
        ? { value: x, label: '' }
        : { value: String((x as any)?.value ?? ''), label: String((x as any)?.label ?? '') }
    )
    .filter((s) => s.value);
};
const asGallery = (raw: unknown): Img[] => {
  if (Array.isArray(raw)) return raw.filter(Boolean) as Img[];
  return raw ? [raw as Img] : [];
};

const norm = (s: unknown) => String(s ?? '').toLowerCase();
const matches = (v: { id: unknown; title: string }, key: string) =>
  norm(v.id).includes(key) || norm(v.title).includes(key);

/* a `works` entry -> view model. Videos can live in `video` or in the image field. */
const toCase = (w: unknown, i: number): CaseView => {
  const o = w as Record<string, any>;
  const rawTags = pick(o, 'tags', 'tech', 'stack', 'technologies');
  const gallery = pick(o, 'images', 'gallery');
  const firstGallery = Array.isArray(gallery) ? gallery[0] : undefined;
  const rawImage = pick(o, 'image', 'thumbnail', 'cover', 'img', 'preview');
  const rawVideo = pick(o, 'video', 'clip', 'mp4');

  const video = [rawVideo, rawImage, firstGallery].find(isVideoSrc) as string | undefined;
  const still = ([rawImage, firstGallery].find((x) => x && !isVideoSrc(x)) ?? '') as Img | '';

  const base = { id: pick(o, 'id', 'slug') ?? i, title: String(pick(o, 'title', 'name') ?? 'Untitled') };
  const d: Details = Object.entries(DETAILS).find(([k]) => matches(base, k))?.[1] ?? {};
  const tags: string[] = Array.isArray(rawTags) ? rawTags.map(String) : [];
  const ov = asParas(pick(o, 'overview', 'longDescription', 'details', 'content', 'body'));
  const hl = asBlocks(pick(o, 'highlights', 'features'));
  const rs = asStats(pick(o, 'results', 'outcomes', 'metrics'));
  const gl = asGallery(pick(o, 'gallery', 'images'));

  return {
    ...base,
    category: String(pick(o, 'category', 'type') ?? ''),
    description: String(pick(o, 'description', 'summary', 'blurb', 'excerpt') ?? ''),
    tags: tags.length ? tags : d.tags ?? [],
    image: still,
    video,
    href: pick(o, 'href', 'link', 'url', 'liveUrl', 'live', 'site'),
    year: pick(o, 'year', 'date') ?? d.year,
    role: pick(o, 'role') ?? d.role,
    client: pick(o, 'client') ?? d.client,
    timeline: pick(o, 'timeline', 'duration') ?? d.timeline,
    status: pick(o, 'status') ?? d.status,
    overview: ov.length ? ov : d.overview ?? [],
    highlights: hl.length ? hl : d.highlights ?? [],
    challenge: pick(o, 'challenge', 'problem') ?? d.challenge,
    solution: pick(o, 'solution', 'approach') ?? d.solution,
    results: rs.length ? rs : d.results ?? [],
    gallery: gl.length > 1 ? gl : d.gallery ?? [],
    repo: pick(o, 'repo', 'github', 'source', 'sourceUrl') ?? d.repo,
  };
};

const fromFeatured = (f: FeaturedCase): CaseView => ({
  id: f.id,
  title: f.title,
  category: f.category,
  description: f.description,
  tags: f.tags,
  image: f.image,
  href: f.href,
  year: f.year,
  featured: true,
  role: f.role,
  client: f.client,
  timeline: f.timeline,
  status: f.status,
  overview: f.overview,
  highlights: f.highlights,
  challenge: f.challenge,
  solution: f.solution,
  results: f.results.map((r) => ({ value: r.value, label: r.label ?? '' })),
  gallery: f.gallery,
  repo: f.repo,
});

const FEATURED_ITEMS: CaseView[] = FEATURED_SOURCE.map(fromFeatured);

const isFeatured = (c: CaseView) =>
  FEATURED_ITEMS.some(
    (f) =>
      norm(f.id) === norm(c.id) ||
      norm(f.title) === norm(c.title) ||
      norm(c.id).startsWith(`${norm(f.id)}-`)
  );

const ARCHIVE_ITEMS: CaseView[] = works.map(toCase).filter((c) => !isFeatured(c));

/* ================================================================== */
/* SHARED PIECES                                                        */
/* ================================================================== */
function lockScroll() {
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight = sw > 0 ? `${sw}px` : '';
}
function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
}
const findFrame = (id: string | number) =>
  document.querySelector<HTMLElement>(`[data-frame="${CSS.escape(String(id))}"]`);

/* Image or video with a pulsing skeleton until it has loaded. If the source is a
   video (via `video`, or an image field that points at a video file) it renders a
   <video> that autoplays muted and looped while on screen. Fills its relative,
   overflow-hidden parent. */
function Media({
  image,
  video,
  alt = '',
  sizes,
  priority,
  className = 'object-cover',
}: {
  image?: Img | '';
  video?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);

  const vsrc = video ?? (isVideoSrc(image) ? image : undefined);
  const still: Img | '' = isVideoSrc(image) ? '' : image ?? '';

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // required for autoplay in several browsers
    v.defaultMuted = true;
    if (v.readyState >= 2) setReady(true);
    if (reduced()) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting }) => {
          visible.current = isIntersecting;
          if (isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [vsrc]);

  if (!still && !vsrc) return <span aria-hidden className="absolute inset-0 block bg-muted" />;

  const poster = typeof still === 'string' ? still : still ? still.src : undefined;

  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 block animate-pulse bg-muted transition-opacity duration-500 motion-reduce:animate-none ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute inset-0 block transition-opacity duration-700 ease-out ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {vsrc ? (
          <video
            ref={videoRef}
            src={`${vsrc}#t=0.1`}
            poster={poster}
            className={`absolute inset-0 size-full ${className}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={(e) => {
              setReady(true);
              if (visible.current && !reduced()) e.currentTarget.play().catch(() => {});
            }}
            onError={() => setReady(true)}
          />
        ) : (
          <Image
            src={still as Img}
            alt={alt}
            fill
            priority={priority}
            draggable={false}
            sizes={sizes}
            className={className}
            onLoad={() => setReady(true)}
            onError={() => setReady(true)}
          />
        )}
      </span>
    </>
  );
}

/* arrow used by the featured hover (same shape as the homepage Projects) */
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

/* arrow that swaps on hover with CSS, driven by a parent `group` (archive rows) */
const SwapArrow = ({ size = 16 }: { size?: number }) => (
  <span aria-hidden className="relative block overflow-hidden" style={{ width: size, height: size }}>
    <ArrowUpRight
      size={size}
      strokeWidth={1.5}
      className="transition-transform duration-500 ease-out group-hover:-translate-y-5 group-hover:translate-x-5 motion-reduce:transition-none"
    />
    <ArrowUpRight
      size={size}
      strokeWidth={1.5}
      className="absolute inset-0 -translate-x-5 translate-y-5 transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none"
    />
  </span>
);

/* section heading: masked letter reveal, animated by the page-level effect */
function SectionHead({ title, note, aside }: { title: string; note?: string; aside?: ReactNode }) {
  return (
    <header
      data-header
      className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-12"
    >
      <div>
        <h2
          aria-label={title}
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          style={HEADING}
        >
          {title.split('').map((char, i) => (
            <span
              key={i}
              data-hmask
              aria-hidden="true"
              className="-mb-2 inline-block overflow-hidden pb-2 align-bottom"
            >
              <span data-hchar className="inline-block will-change-transform">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </h2>
        {note && (
          <p
            data-sub
            className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
            style={HEADING}
          >
            {note}
          </p>
        )}
      </div>
      {aside && <div data-sub>{aside}</div>}
    </header>
  );
}

/* ================================================================== */
/* CASE STUDY                                                           */
/* ================================================================== */
function CaseTopBar({
  index,
  total,
  closeBtnRef,
  onClose,
  onGo,
}: {
  index: number;
  total: number;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onGo: (dir: number) => void;
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between px-4 md:px-8">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className={`flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`}
        >
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
          Back to works
        </button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span className="flex items-center gap-2">
          <button type="button" aria-label="Previous project" onClick={() => onGo(-1)} className={ROUND_BTN}>
            <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
          </button>
          <button type="button" aria-label="Next project" onClick={() => onGo(1)} className={ROUND_BTN}>
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </span>
      </div>
    </div>
  );
}

function Pair({ images, alt }: { images: Img[]; alt: string }) {
  if (!images.length) return null;
  return (
    <div className="my-12 grid gap-4 md:grid-cols-2 md:gap-6">
      {images.map((src, k) => (
        <div
          key={k}
          data-cs
          className="relative aspect-16/10 overflow-hidden rounded-2xl border border-border bg-muted"
        >
          <Media image={src} alt={`${alt} ${k + 1}`} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      ))}
    </div>
  );
}

function CaseBody({
  c,
  next,
  total,
  heroRef,
  heroInnerRef,
  onGo,
}: {
  c: CaseView;
  next: CaseView | null;
  total: number;
  heroRef: RefObject<HTMLDivElement | null>;
  heroInnerRef: RefObject<HTMLDivElement | null>;
  onGo: (dir: number) => void;
}) {
  const meta = (
    [
      ['role', c.role],
      ['client', c.client],
      ['timeline', c.timeline],
      ['status', c.status],
      ['year', c.year != null ? String(c.year) : undefined],
    ].filter(([, v]) => v) as [string, string][]
  ).slice(0, 4);
  const overview = c.overview.length ? c.overview : [c.description].filter(Boolean);
  const pairA = c.gallery.slice(0, 2);
  const pairB = c.gallery.slice(2);

  const sections = useMemo(() => {
    const s: { id: string; label: string }[] = [];
    if (overview.length) s.push({ id: 'overview', label: 'Overview' });
    if (c.highlights.length) s.push({ id: 'highlights', label: 'Highlights' });
    if (c.challenge || c.solution) s.push({ id: 'thinking', label: 'The thinking' });
    if (c.results.length) s.push({ id: 'results', label: 'Results' });
    if (c.tags.length) s.push({ id: 'built', label: 'Built with' });
    return s;
  }, [overview.length, c.highlights.length, c.challenge, c.solution, c.results.length, c.tags.length]);

  const tocRef = useRef<HTMLElement>(null);
  const activeIdRef = useRef<string>(sections[0]?.id ?? '');

  /* highlight the contents entry for the section in view */
  useEffect(() => {
    const root = tocRef.current?.closest('[data-cs-overlay]') as HTMLElement | null;
    if (!root || sections.length === 0) return;

    const ids = new Set(sections.map((s) => s.id));
    const els = sections
      .map((s) => document.getElementById(`cs-${s.id}`))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const setActive = (id: string) => {
      if (activeIdRef.current === id) return;
      activeIdRef.current = id;
      tocRef.current?.querySelectorAll<HTMLElement>('[data-toc-item]').forEach((el) => {
        el.dataset.active = el.dataset.tocId === id ? 'true' : 'false';
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^cs-/, '');
          if (ids.has(id)) setActive(id);
        }
      },
      { root, rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.6, 1] }
    );
    els.forEach((el) => io.observe(el));
    setActive(sections[0].id);
    return () => io.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const root = tocRef.current?.closest('[data-cs-overlay]') as HTMLElement | null;
    const el = document.getElementById(`cs-${id}`);
    if (!el || !root) return;
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top: top - 88, behavior: reduced() ? 'auto' : 'smooth' });
  };

  const Title = ({ children }: { children: ReactNode }) => (
    <h3 data-cs className={`mb-5 ${LABEL}`}>
      {children}
    </h3>
  );

  return (
    <div className="mx-auto w-full max-w-360 px-4 md:px-8">
      {/* hero */}
      <header className="pt-10 md:pt-14">
        <p data-cs className="flex flex-wrap items-center gap-3">
          {c.category && (
            <span className="rounded-xl border border-border px-3 py-1 text-xs text-foreground">{c.category}</span>
          )}
          {c.year != null && <span className="text-xs text-muted-foreground">{c.year}</span>}
        </p>
        <h2
          data-cs
          className="mt-4 text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl"
          style={HEADING}
        >
          {c.title}
        </h2>
        <p data-cs className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {c.description}
        </p>

        <div ref={heroRef} className="mt-10 aspect-16/10 w-full md:aspect-2/1">
          <div
            ref={heroInnerRef}
            className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-muted"
          >
            <Media image={c.image} video={c.video} alt={`${c.title} preview`} priority sizes="100vw" />
          </div>
        </div>
      </header>

      {/* details on small screens (the sidebar is desktop only) */}
      {meta.length > 0 && (
        <dl data-cs className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-6 md:hidden">
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt className={`${LABEL} capitalize`}>{k}</dt>
              <dd className="mt-1.5 text-sm text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* blog layout: sticky contents on the left, the story on the right */}
      <div className="mt-12 grid w-full gap-10 md:mt-16 md:grid-cols-[180px_minmax(0,1fr)] md:gap-16">
        <aside
          ref={tocRef}
          aria-label="Case study sections"
          className="hidden self-start md:sticky md:top-24 md:block"
        >
          <p className={`mb-4 ${LABEL}`}>Contents</p>
          <nav>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    data-toc-item
                    data-toc-id={s.id}
                    data-active={s.id === activeIdRef.current ? 'true' : 'false'}
                    onClick={() => scrollToSection(s.id)}
                    className={`group flex w-full items-center gap-2 rounded-md py-1 text-left text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground data-[active=true]:text-foreground ${FOCUS}`}
                  >
                    <span
                      aria-hidden
                      className="h-px w-4 bg-muted-foreground/40 transition-all duration-300 group-data-[active=true]:w-8 group-data-[active=true]:bg-foreground"
                    />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {meta.length > 0 && (
            <dl className="mt-10 space-y-4 border-t border-border pt-6">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className={`${LABEL} capitalize`}>{k}</dt>
                  <dd className="mt-1 text-sm text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>

        <div className="min-w-0">
          {overview.length > 0 && (
            <section id="cs-overview" className="scroll-mt-24">
              <Title>Overview</Title>
              <div data-cs className="space-y-5">
                {overview.map((p, k) => (
                  <p key={k} className="max-w-2xl text-base leading-relaxed text-foreground md:text-lg">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {c.highlights.length > 0 && (
            <section id="cs-highlights" className="mt-16 scroll-mt-24">
              <Title>Highlights</Title>
              <ol className="border-b border-border">
                {c.highlights.map((h, k) => (
                  <li key={k} data-cs className="grid gap-2 border-t border-border py-6 md:grid-cols-6 md:gap-6">
                    <span className="text-sm tabular-nums text-muted-foreground md:col-span-1">{pad(k + 1)}</span>
                    <h4
                      className="text-xl font-medium tracking-tight text-foreground md:col-span-2 md:text-2xl"
                      style={HEADING}
                    >
                      {h.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground md:col-span-3">{h.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Pair images={pairA} alt={`${c.title} preview`} />

          {(c.challenge || c.solution) && (
            <section id="cs-thinking" className="mt-16 scroll-mt-24">
              <Title>The thinking</Title>
              <div className="grid gap-10 md:grid-cols-2 md:gap-12">
                {c.challenge && (
                  <div data-cs>
                    <p className="text-sm text-foreground">The challenge</p>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{c.challenge}</p>
                  </div>
                )}
                {c.solution && (
                  <div data-cs>
                    <p className="text-sm text-foreground">The approach</p>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{c.solution}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {c.results.length > 0 && (
            <section id="cs-results" className="mt-16 scroll-mt-24">
              <Title>Results</Title>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
                {c.results.map((r, k) => (
                  <div key={k} data-cs className="border border-border rounded-xl px-6 py-8">
                    <p
                      className="text-4xl font-semibold leading-none tracking-tight text-foreground md:text-5xl"
                      style={HEADING}
                    >
                      {r.value}
                    </p>
                    {r.label && <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <Pair images={pairB} alt={`${c.title} preview`} />

          {c.tags.length > 0 && (
            <section id="cs-built" className="mt-16 scroll-mt-24">
              <Title>Built with</Title>
              <ul data-cs className="flex flex-wrap gap-2">
                {c.tags.map((tag) => (
                  <li key={tag} className="rounded-xl border border-border px-3 py-1 text-xs text-foreground">
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(c.href || c.repo) && (
            <section className="mt-16 border-t border-border pt-10">
              <div data-cs className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {c.href && (
                  <a
                    href={c.href}
                    target={/^https?:/.test(c.href) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={BTN_PRIMARY}
                  >
                    Visit project
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                  </a>
                )}
                {c.repo && (
                  <a
                    href={c.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-md text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground ${FOCUS}`}
                  >
                    View the code
                  </a>
                )}
              </div>
            </section>
          )}

          {next && total > 1 && (
            <section className="mt-16 pb-16">
              <button
                type="button"
                data-cs
                onClick={() => onGo(1)}
                className={`group flex w-full items-end justify-between gap-6 border-t border-border pt-6 text-left ${FOCUS}`}
              >
                <span className="min-w-0">
                  <span className={LABEL}>Next project</span>
                  <span
                    className="mt-3 block truncate text-3xl font-semibold leading-none tracking-tight text-foreground md:text-5xl"
                    style={HEADING}
                  >
                    {next.title}
                  </span>
                </span>
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl cursor-pointer bg-muted text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                  <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
                </span>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* One dialog shared by Featured + Archive. The clicked image flies into the
   case study and back again. */
type OpenArgs = {
  list: CaseView[];
  index: number;
  frame: HTMLElement | null;
  trigger: HTMLElement | null;
};
type LayerHandle = { open: (a: OpenArgs) => void };

const CaseStudyLayer = forwardRef<LayerHandle, { mainRef: RefObject<HTMLElement | null> }>(
  function CaseStudyLayer({ mainRef }, ref) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const heroInnerRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const flyRef = useRef<HTMLDivElement>(null);

    const openRef = useRef<number | null>(null);
    const busy = useRef(false);
    const freshOpen = useRef(false);
    const lastFocus = useRef<HTMLElement | null>(null);

    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<CaseView[]>([]);
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const [flySrc, setFlySrc] = useState<CaseView['image']>('');

    useEffect(() => setMounted(true), []);

    const setPageInert = (on: boolean) => {
      const main = mainRef.current;
      if (!main) return;
      if (on) main.setAttribute('inert', '');
      else main.removeAttribute('inert');
    };

    /* never leave the page locked if this unmounts while open */
    useEffect(
      () => () => {
        unlockScroll();
        mainRef.current?.removeAttribute('inert');
      },
      [mainRef]
    );

    /* content fades in as it scrolls into view; swapping projects fades the hero */
    useIsoLayoutEffect(() => {
      const overlay = overlayRef.current;
      if (openIdx === null || !overlay) return;
      const fresh = freshOpen.current;
      freshOpen.current = false;
      if (!fresh) overlay.focus({ preventScroll: true });
      if (reduced()) return;

      const els = Array.from(overlay.querySelectorAll<HTMLElement>('[data-cs]'));
      gsap.set(els, { autoAlpha: 0, y: 28 });
      let first = true;
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries.filter((e) => e.isIntersecting);
          vis.forEach((e, k) => {
            gsap.to(e.target, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              delay: (first ? (fresh ? 0.55 : 0.1) : 0) + k * 0.07,
              ease: 'power3.out',
            });
            io.unobserve(e.target);
          });
          if (vis.length) first = false;
        },
        { root: overlay, threshold: 0.08 }
      );
      els.forEach((el) => io.observe(el));

      if (!fresh && heroInnerRef.current) {
        gsap.fromTo(
          heroInnerRef.current,
          { autoAlpha: 0, scale: 1.04 },
          { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
        );
      }
      return () => {
        io.disconnect();
        gsap.killTweensOf(els);
      };
    }, [openIdx]);

    /* ---------------- open: the image flies into the case study ---------------- */
    const openCase = ({ list, index, frame, trigger }: OpenArgs) => {
      if (!mounted || busy.current || openRef.current !== null || !list[index]) return;

      busy.current = true;
      openRef.current = index;
      freshOpen.current = true;
      lastFocus.current = trigger ?? (document.activeElement as HTMLElement | null);

      const from = frame ? frame.getBoundingClientRect() : null;
      lockScroll();
      setPageInert(true);
      flushSync(() => {
        setItems(list);
        setFlySrc(list[index].image);
        setOpenIdx(index);
      });

      const overlay = overlayRef.current;
      const hero = heroRef.current;
      const heroInner = heroInnerRef.current;
      const fly = flyRef.current;
      if (!overlay || !hero || !heroInner || !fly) {
        busy.current = false;
        return;
      }

      overlay.scrollTop = 0;

      // no still image to fly (video only) or reduced motion: a plain fade
      if (!from || reduced() || !list[index].image) {
        gsap.set(heroInner, { autoAlpha: 1 });
        gsap.set(fly, { autoAlpha: 0 });
        gsap.fromTo(
          overlay,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: t(0.4),
            ease: 'power2.out',
            onComplete: () => {
              busy.current = false;
              closeBtnRef.current?.focus({ preventScroll: true });
            },
          }
        );
        return;
      }

      const to = hero.getBoundingClientRect();
      const inner = frame?.querySelector('[data-frame-img]');

      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(heroInner, { autoAlpha: 0 });
      gsap.set(fly, { x: from.left, y: from.top, width: from.width, height: from.height, autoAlpha: 1 });
      if (inner) gsap.set(inner, { autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            gsap.set(heroInner, { autoAlpha: 1 });
            gsap.set(fly, { autoAlpha: 0 });
            busy.current = false;
            closeBtnRef.current?.focus({ preventScroll: true });
          },
        })
        .to(overlay, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(fly, { x: to.left, y: to.top, width: to.width, height: to.height, duration: 1 }, 0);
    };

    useImperativeHandle(ref, () => ({ open: openCase }));

    /* ---------------- close: back to where it came from ---------------- */
    const closeCase = () => {
      const i = openRef.current;
      const overlay = overlayRef.current;
      const hero = heroRef.current;
      const heroInner = heroInnerRef.current;
      const fly = flyRef.current;
      if (i === null || !overlay || !hero || !heroInner || !fly || busy.current) return;

      busy.current = true;
      const target = findFrame(items[i].id);

      const finish = () => {
        document.querySelectorAll('[data-frame-img]').forEach((el) => gsap.set(el, { autoAlpha: 1 }));
        gsap.set(fly, { autoAlpha: 0 });
        gsap.set(overlay, { autoAlpha: 0 });
        openRef.current = null;
        setOpenIdx(null);
        setPageInert(false);
        unlockScroll();
        busy.current = false;
        lastFocus.current?.focus({ preventScroll: true });
      };

      if (!target || !items[i].image) {
        gsap.to(overlay, { autoAlpha: 0, duration: t(0.4), ease: 'power2.in', onComplete: finish });
        return;
      }

      // bring the source into view if the person browsed to a different project
      let to = target.getBoundingClientRect();
      if (to.bottom < 0 || to.top > window.innerHeight) {
        target.scrollIntoView({ block: 'center' });
        to = target.getBoundingClientRect();
      }
      const fromRect = hero.getBoundingClientRect();
      const heroVisible = overlay.scrollTop < 160 && fromRect.bottom > 0 && fromRect.top < window.innerHeight;

      if (!heroVisible || reduced()) {
        gsap.to(overlay, { autoAlpha: 0, duration: t(0.4), ease: 'power2.in', onComplete: finish });
        return;
      }

      flushSync(() => setFlySrc(items[i].image));
      const inner = target.querySelector('[data-frame-img]');
      gsap.set(fly, { x: fromRect.left, y: fromRect.top, width: fromRect.width, height: fromRect.height, autoAlpha: 1 });
      gsap.set(heroInner, { autoAlpha: 0 });
      if (inner) gsap.set(inner, { autoAlpha: 0 });

      gsap
        .timeline({ onComplete: finish })
        .to(overlay, { autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' }, 0.2)
        .to(
          fly,
          { x: to.left, y: to.top, width: to.width, height: to.height, duration: 0.95, ease: 'power3.inOut' },
          0
        );
    };

    /* previous / next project in the list it was opened from */
    const go = (dir: number) => {
      const i = openRef.current;
      if (i === null || busy.current || items.length < 2) return;
      const next = (i + dir + items.length) % items.length;
      openRef.current = next;
      setOpenIdx(next);
      overlayRef.current?.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    };

    const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCase();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Tab') {
        const f = overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!f || !f.length) return;
        const firstEl = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    const c = openIdx !== null ? items[openIdx] : null;
    const next = openIdx !== null ? items[(openIdx + 1) % items.length] : null;

    if (!mounted) return null;

    return createPortal(
      <>
        <div
          ref={overlayRef}
          data-cs-overlay
          role="dialog"
          aria-modal="true"
          aria-label={c ? `${c.title} case study` : undefined}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          style={BODY}
          className="invisible fixed inset-0 z-60 select-text overflow-y-auto overscroll-contain bg-background text-foreground outline-none"
        >
          {c && openIdx !== null && (
            <div key={openIdx}>
              <CaseTopBar
                index={openIdx}
                total={items.length}
                closeBtnRef={closeBtnRef}
                onClose={closeCase}
                onGo={go}
              />
              <CaseBody
                c={c}
                next={next}
                total={items.length}
                heroRef={heroRef}
                heroInnerRef={heroInnerRef}
                onGo={go}
              />
            </div>
          )}
        </div>

        {/* The flying image: starts on the source, lands in the case study (and back) */}
        <div
          ref={flyRef}
          aria-hidden
          className="pointer-events-none invisible fixed left-0 top-0 z-70 overflow-hidden rounded-2xl bg-muted"
        >
          {flySrc ? <Image src={flySrc} alt="" fill sizes={IMG_SIZES} className="object-cover" /> : null}
        </div>
      </>,
      document.body
    );
  }
);

/* ================================================================== */
/* HERO: centered heading with small flipbook social tiles underneath   */
/* ================================================================== */
function Socials() {
  return (
    <ul className="mt-6 flex items-center justify-center gap-3 md:mt-8">
      {SOCIALS.map((s) => (
        <li key={s.label}>
          <a
            data-social
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className={`relative block size-10 rounded-xl will-change-transform md:size-11 ${FOCUS}`}
            style={{ perspective: 600 }}
          >
            <span
              data-social-inner
              className="relative block size-full will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* front */}
              <span
                aria-hidden
                className="absolute inset-0 grid place-items-center rounded-xl bg-muted text-foreground"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {s.icon}
              </span>
              {/* back: inverted, revealed when the tile flips */}
              <span
                aria-hidden
                className="absolute inset-0 grid place-items-center rounded-xl bg-foreground text-background"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
              >
                {s.icon}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Hero() {
  return (
    <header
      data-hero
      className="relative z-0 flex w-full flex-col items-center justify-center px-4 text-center"
      style={{ minHeight: HERO_HEIGHT }}
    >
      <div data-hero-content className="flex flex-col items-center will-change-transform">
        <h1
          aria-label={HERO_TEXT}
          className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-foreground md:text-xl"
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

        <Socials />
      </div>
    </header>
  );
}

/* ================================================================== */
/* FEATURED: just the images (from /lib/featured)                       */
/* Same motion as the homepage Projects: wipe in, settle, drift, then   */
/* a slow zoom + arrow swap on hover.                                   */
/* ================================================================== */
function Featured({ items, layerRef }: { items: CaseView[]; layerRef: RefObject<LayerHandle | null> }) {
  const rootRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      },
      (context) => {
        const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };

        // Reduced motion: plain, fully visible layout
        if (!motion) return;

        const feats = gsap.utils.toArray<HTMLElement>('[data-feat]', root);
        const frames = gsap.utils.toArray<HTMLElement>('[data-frame]', root);
        const zooms = gsap.utils.toArray<HTMLElement>('[data-zoom]', root);
        const drifts = gsap.utils.toArray<HTMLElement>('[data-drift]', root);

        /* ---------- wipe in, settle, drift ---------- */
        gsap.set(frames, { clipPath: CLIP_HIDDEN });
        gsap.set(zooms, { scale: 1.25 });
        gsap.set(drifts, { scale: 1.12 });

        ScrollTrigger.batch(feats, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            const els = batch as HTMLElement[];
            const q = (sel: string) => els.map((el) => el.querySelector(sel));

            gsap.to(q('[data-frame]'), {
              clipPath: CLIP_SHOWN,
              duration: 1.4,
              stagger: 0.12,
              ease: 'expo.out',
              clearProps: 'clipPath',
            });
            gsap.to(q('[data-zoom]'), { scale: 1, duration: 1.8, stagger: 0.12, ease: 'expo.out' });
          },
        });

        // the media drifts inside its frame while scrolling (same for every card)
        feats.forEach((feat, i) => {
          gsap.fromTo(
            drifts[i],
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: feat, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });

        /* ---------- hover (mouse only): slow zoom + arrow swap ---------- */
        if (!hover) return;

        const cleanups: Array<() => void> = [];

        feats.forEach((feat, i) => {
          const link = feat.querySelector<HTMLElement>('[data-link]')!;
          const arrowA = feat.querySelector<HTMLElement>('[data-arrow-a]')!;
          const arrowB = feat.querySelector<HTMLElement>('[data-arrow-b]')!;

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

  // keep the grid balanced: three columns only when the count divides evenly
  const cols = items.length % 3 === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section ref={rootRef} id="featured" className="relative w-full px-4 pb-12 md:px-8 md:pb-20">
      <ol className={`grid grid-cols-2 gap-4 sm:grid-cols-2 ${cols} md:gap-6`}>
        {items.map((it, i) => (
          <li key={it.id} data-feat>
            <button
              data-link
              type="button"
              aria-haspopup="dialog"
              aria-label={`Open the ${it.title} case study`}
              onClick={(e) =>
                layerRef.current?.open({
                  list: items,
                  index: i,
                  frame: e.currentTarget.querySelector<HTMLElement>('[data-frame]'),
                  trigger: e.currentTarget,
                })
              }
              className={`group block w-full rounded-2xl text-left ${FOCUS} focus-visible:outline-offset-4`}
            >
              <span
                data-frame={String(it.id)}
                className="relative block aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted"
              >
                <span data-frame-img className="absolute inset-0 block">
                  {/* hover + settle layer */}
                  <span data-zoom className="absolute inset-0 block will-change-transform">
                    {/* scroll drift layer */}
                    <span data-drift className="absolute inset-0 block will-change-transform">
                      <Media
                        image={it.image}
                        video={it.video}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </span>
                  </span>
                </span>

                {/* Arrow swap: old exits top-right, new enters bottom-left */}
                <span
                  aria-hidden
                  className="absolute right-3 top-3 flex size-10 items-center justify-center overflow-hidden rounded-xl bg-background/80 text-foreground backdrop-blur-md"
                >
                  <span data-arrow-a className="flex items-center justify-center">
                    <Arrow />
                  </span>
                  <span data-arrow-b className="absolute inset-0 flex items-center justify-center opacity-0">
                    <Arrow />
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ================================================================== */
/* ARCHIVE: everything that is not featured. Closed by default, nothing */
/* previewed. Opens into a ruled index (no cards), unlike the grid.     */
/* ================================================================== */
function Archive({ items, layerRef }: { items: CaseView[]; layerRef: RefObject<LayerHandle | null> }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstPanel = useRef(true);
  const firstFilter = useRef(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => Array.from(new Set(items.map((v) => v.category).filter(Boolean))), [items]);
  const rows = useMemo(() => (filter === 'All' ? items : items.filter((v) => v.category === filter)), [items, filter]);

  /* the panel slides open and shut; rows rise in when it opens */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (firstPanel.current) {
      firstPanel.current = false;
      el.setAttribute('inert', '');
      return;
    }
    gsap.killTweensOf(el);
    if (open) {
      el.removeAttribute('inert');
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(
        el,
        { height: 0 },
        {
          height: 'auto',
          duration: t(0.9),
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(el, { height: 'auto' });
            ScrollTrigger.refresh();
          },
        }
      );
      if (!reduced()) {
        gsap.fromTo(
          el.querySelectorAll('[data-row]'),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, delay: 0.35, ease: 'power3.out', clearProps: 'transform' }
        );
      }
    } else {
      el.setAttribute('inert', '');
      gsap.fromTo(
        el,
        { height: el.offsetHeight },
        {
          height: 0,
          duration: t(0.7),
          ease: 'power3.inOut',
          onComplete: () => void gsap.set(el, { visibility: 'hidden' }),
        }
      );
    }
  }, [open]);

  /* rows re-rise when the filter changes */
  useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false;
      return;
    }
    const el = panelRef.current;
    if (!el || !open || reduced()) return;
    gsap.fromTo(
      el.querySelectorAll('[data-row]'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', clearProps: 'transform', overwrite: 'auto' }
    );
  }, [filter, open]);

  const toggle = () => {
    if (!open) {
      setOpen(true);
      window.setTimeout(
        () =>
          document
            .getElementById('archive')
            ?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }),
        60
      );
    } else {
      setOpen(false);
    }
  };

  return (
    <section id="archive" className="w-full scroll-mt-16 border-t border-border px-4 py-12 md:px-8 md:py-20">
      <SectionHead
        title="Archive"
        note={`${items.length} more ${items.length === 1 ? 'project' : 'projects'}. Open it to browse.`}
        aside={
          <button
            type="button"
            aria-expanded={open}
            aria-controls="archive-panel"
            onClick={toggle}
            className={`group inline-flex h-11 items-center gap-4 rounded-2xl border border-border pl-5 pr-1.5 text-sm text-foreground transition-colors duration-300 hover:border-foreground ${FOCUS}`}
          >
            {open ? 'Close archive' : 'Open archive'}
            <span className="grid size-8 place-items-center rounded-xl bg-foreground text-background">
              <Plus
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className={`transition-transform duration-500 motion-reduce:transition-none ${
                  open ? 'rotate-135' : ''
                }`}
              />
            </span>
          </button>
        }
      />

      <div id="archive-panel" ref={panelRef} className="invisible h-0 overflow-hidden">
        {categories.length > 1 && (
          <div role="group" aria-label="Filter the archive" className="mb-6 flex flex-wrap gap-2 md:mb-8">
            {['All', ...categories].map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  className={`h-10 rounded-xl px-4 text-sm transition-colors duration-200 ${FOCUS} ${
                    on
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-foreground hover:bg-foreground hover:text-background'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        )}

        <ul className="border-b border-border">
          {rows.map((v, i) => (
            <li key={v.id} data-row className="border-t border-border">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Open the ${v.title} case study`}
                onClick={(e) =>
                  layerRef.current?.open({
                    list: rows,
                    index: i,
                    frame: e.currentTarget.querySelector<HTMLElement>('[data-frame]'),
                    trigger: e.currentTarget,
                  })
                }
                className={`group flex w-full items-center gap-4 py-4 text-left md:gap-6 md:py-5 ${FOCUS} focus-visible:outline-offset-4`}
              >
                <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground md:w-8">{pad(i + 1)}</span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-xl font-medium tracking-tight text-foreground transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-3xl motion-reduce:transition-none"
                    style={HEADING}
                  >
                    {v.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground md:hidden">
                    {[v.category, v.year].filter(Boolean).join(' · ')}
                  </span>
                </span>

                <span className="hidden w-40 shrink-0 truncate text-sm text-muted-foreground md:block">
                  {v.category}
                </span>
                <span className="hidden w-56 shrink-0 truncate text-sm text-muted-foreground lg:block">
                  {v.tags.slice(0, 3).join(', ')}
                </span>
                <span className="hidden w-12 shrink-0 text-sm tabular-nums text-muted-foreground md:block">
                  {v.year ?? ''}
                </span>

                {/* thumbnail: a still image, or a video that plays */}
                <span
                  data-frame={String(v.id)}
                  className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted md:h-14 md:w-20"
                >
                  <span data-frame-img className="absolute inset-0 block">
                    <Media
                      image={v.image}
                      video={v.video}
                      sizes="80px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
                    />
                  </span>
                </span>

                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background"
                >
                  <SwapArrow />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {rows.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nothing in this category yet</p>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/* PAGE                                                                 */
/* ================================================================== */
export default function WorksPage() {
  const mainRef = useRef<HTMLElement>(null);
  const layerRef = useRef<LayerHandle>(null);

  /* hero entrance + scroll fade, social flips, heading wave, and every section heading */
  useIsoLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const mm = gsap.matchMedia(main);

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        hover: '(hover: hover) and (pointer: fine)',
      },
      (context) => {
        const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };

        // Reduced motion: everything stays visible in its final state
        if (!motion) return;

        const hero = main.querySelector<HTMLElement>('[data-hero]')!;
        const heroContent = main.querySelector<HTMLElement>('[data-hero-content]')!;
        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', hero);
        const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', hero);
        const socials = gsap.utils.toArray<HTMLElement>('[data-social]', hero);

        /* ---------- hero entrance: heading letters, then the social tiles ---------- */
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => {
              gsap.set(masks, { overflow: 'visible' }); // lets the wave lift letters freely
            },
          })
          .from(chars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
          .from(
            socials,
            {
              opacity: 0,
              y: 24,
              scale: 0.5,
              duration: 0.9,
              stagger: 0.08,
              ease: 'back.out(1.7)',
              clearProps: 'opacity',
            },
            '-=0.6'
          );

        /* ---------- scrolling: the hero content drifts up and fades back ---------- */
        gsap.to(heroContent, {
          opacity: 0,
          y: -60,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        /* ---------- mouse only: heading wave + flipbook social tiles ---------- */
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

          // each tile flips over (front -> inverted back) while hovered, and flips back on leave
          socials.forEach((social) => {
            const inner = social.querySelector<HTMLElement>('[data-social-inner]');
            if (!inner) return;

            const tl = gsap.timeline({ paused: true });
            tl.to(inner, { rotationX: -180, duration: 0.7, ease: 'power3.inOut' }, 0).to(
              inner,
              { y: -6, scale: 1.08, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 },
              0
            );

            const enter = () => tl.timeScale(1).play();
            const leave = () => tl.timeScale(1.4).reverse();

            social.addEventListener('pointerenter', enter);
            social.addEventListener('pointerleave', leave);
            social.addEventListener('focusin', enter);
            social.addEventListener('focusout', leave);

            cleanups.push(() => {
              social.removeEventListener('pointerenter', enter);
              social.removeEventListener('pointerleave', leave);
              social.removeEventListener('focusin', enter);
              social.removeEventListener('focusout', leave);
              tl.kill();
            });
          });
        }

        /* ---------- section headings: masked letter reveal, then the note + action ---------- */
        gsap.utils.toArray<HTMLElement>('[data-header]', main).forEach((header) => {
          const hchars = header.querySelectorAll<HTMLElement>('[data-hchar]');
          const hmasks = header.querySelectorAll<HTMLElement>('[data-hmask]');
          const subs = header.querySelectorAll<HTMLElement>('[data-sub]');

          gsap.set(subs, { opacity: 0, y: 14 });
          gsap
            .timeline({
              defaults: { ease: 'expo.out' },
              scrollTrigger: { trigger: header, start: 'top 88%', once: true },
              onComplete: () => {
                gsap.set(hmasks, { overflow: 'visible' });
              },
            })
            .from(hchars, { yPercent: 115, duration: 1.1, stagger: 0.03 })
            .to(subs, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');
        });

        return () => cleanups.forEach((fn) => fn());
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <main ref={mainRef} className="relative w-full select-none overflow-x-clip" style={BODY}>
      <Hero />

      <Featured items={FEATURED_ITEMS} layerRef={layerRef} />

      {ARCHIVE_ITEMS.length > 0 && <Archive items={ARCHIVE_ITEMS} layerRef={layerRef} />}

      <CaseStudyLayer ref={layerRef} mainRef={mainRef} />
    </main>
  );
}