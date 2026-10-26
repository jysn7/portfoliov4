// import type { StaticImageData } from 'next/image';

// import { works } from '../../../lib/works'; // swap for '@/lib/works' if your alias points at the project root

// /* ------------------------------------------------------------------ */
// /* WHICH PROJECTS ARE FEATURED                                          */
// /* Matched against each work's id or title (partial, lower-case). Any   */
// /* work with `featured: true` is used next, then the first works.       */
// /* ------------------------------------------------------------------ */
// const FEATURED = ['tyga', 'kith', 'monostudios', 'epitrace'];

// /* ------------------------------------------------------------------ */
// /* CASE-STUDY COPY                                                      */
// /* Extra detail for the featured projects, matched the same way. Used   */
// /* only for fields your `works` data does not already have.             */
// /* ------------------------------------------------------------------ */
// export type Block = { title: string; text: string };
// export type Stat = { value: string; label: string };
// type Details = {
//   year?: string | number;
//   role?: string;
//   client?: string;
//   timeline?: string;
//   status?: string;
//   tags?: string[];
//   overview?: string[];
//   highlights?: Block[];
//   challenge?: string;
//   solution?: string;
//   results?: Stat[];
//   gallery?: (string | StaticImageData)[];
//   repo?: string;
// };

// const DETAILS: Record<string, Details> = {
//   tyga: {
//     role: 'Team lead, full-stack',
//     client: 'TYGA golf academy',
//     timeline: 'Academic project (ITPJA3)',
//     tags: ['Next.js', 'Supabase', 'Design system'],
//     overview: [
//       'A management platform for a golf academy, built by the Clubhouse student team that I lead as our ITPJA3 academic project.',
//       'It runs on Next.js and Supabase, with its own design system so every screen feels like one product.',
//     ],
//     highlights: [
//       { title: 'One design system', text: 'Shared components and tokens, so every page of the platform looks and behaves the same.' },
//       { title: 'Next.js + Supabase', text: 'A full-stack build with authentication and a database behind a fast, modern front end.' },
//       { title: 'Team delivery', text: 'Planning, splitting the work and reviewing code across a student development team.' },
//     ],
//   },
//   kith: {
//     role: 'Full-stack developer',
//     tags: ['PHP', 'MySQL'],
//     overview: [
//       'A consumer-to-consumer marketplace for preloved goods, where people list what they no longer need and buy directly from each other.',
//       'Built with PHP and MySQL, covering listings, accounts and the buying flow end to end.',
//     ],
//     highlights: [
//       { title: 'Listings and browsing', text: 'Sellers post items and buyers can search and browse them.' },
//       { title: 'PHP + MySQL', text: 'A classic server-rendered stack with a relational database behind it.' },
//     ],
//   },
//   monostudios: {
//     role: 'Founder, design and development',
//     client: 'Monostudios',
//     tags: ['GSAP', 'WebGL', 'Payload CMS'],
//     overview: [
//       'The website for my web design and development studio, built around an animated WebGL front end with a CMS behind it.',
//       'It is both the studio\u2019s shop window and a test bed for the motion and interaction ideas we offer clients.',
//     ],
//     highlights: [
//       { title: 'Animated front end', text: 'GSAP and WebGL give the site its motion and interactive visuals.' },
//       { title: 'Editable content', text: 'Payload CMS lets the studio update projects and copy without touching code.' },
//     ],
//   },
//   epitrace: {
//     role: 'Developer',
//     timeline: 'Hackathon',
//     tags: ['GeoTech', 'Hackathon'],
//     overview: [
//       'A GeoTech platform for syndromic reporting of foot-and-mouth disease (FMD), built as a hackathon submission.',
//       'It puts reports on a map so outbreaks can be spotted and followed by location.',
//     ],
//     highlights: [
//       { title: 'Map-based reporting', text: 'Cases are reported and viewed by place, not just as a list.' },
//       { title: 'Built in a weekend', text: 'Scoped, designed and shipped inside hackathon time limits.' },
//     ],
//   },
// };

// /* ------------------------------------------------------------------ */
// /* Normalise whatever shape `works` has into view models.               */
// /* ------------------------------------------------------------------ */
// export type WorkView = {
//   id: string | number;
//   title: string;
//   category: string;
//   description: string;
//   tags: string[];
//   image: string | StaticImageData | '';
//   href?: string;
//   year?: string | number;
//   featured?: boolean;
// };

// export type CaseView = WorkView & {
//   role?: string;
//   client?: string;
//   timeline?: string;
//   status?: string;
//   overview: string[];
//   highlights: Block[];
//   challenge?: string;
//   solution?: string;
//   results: Stat[];
//   gallery: (string | StaticImageData)[];
//   repo?: string;
// };

// /* eslint-disable @typescript-eslint/no-explicit-any */
// const pick = (o: Record<string, any>, ...keys: string[]) => {
//   for (const k of keys) if (o[k] != null && o[k] !== '') return o[k];
//   return undefined;
// };

// const toView = (w: unknown, i: number): WorkView => {
//   const o = w as Record<string, any>;
//   const rawTags = pick(o, 'tags', 'tech', 'stack', 'technologies');
//   const gallery = pick(o, 'images', 'gallery');
//   return {
//     id: pick(o, 'id', 'slug') ?? i,
//     title: String(pick(o, 'title', 'name') ?? 'Untitled'),
//     category: String(pick(o, 'category', 'type') ?? ''),
//     description: String(pick(o, 'description', 'summary', 'blurb', 'excerpt') ?? ''),
//     tags: Array.isArray(rawTags) ? rawTags.map(String) : [],
//     image: pick(o, 'image', 'thumbnail', 'cover', 'img', 'preview') ?? (Array.isArray(gallery) ? gallery[0] : '') ?? '',
//     href: pick(o, 'href', 'link', 'url', 'liveUrl', 'live', 'site'),
//     year: pick(o, 'year', 'date'),
//     featured: Boolean(pick(o, 'featured', 'pinned', 'highlight')),
//   };
// };

// const asParas = (raw: unknown): string[] => {
//   if (typeof raw === 'string') return raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
//   if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
//   return [];
// };
// const asBlocks = (raw: unknown): Block[] => {
//   if (!Array.isArray(raw)) return [];
//   return raw
//     .map((x) =>
//       typeof x === 'string'
//         ? { title: '', text: x }
//         : { title: String((x as any)?.title ?? (x as any)?.name ?? ''), text: String((x as any)?.text ?? (x as any)?.description ?? '') }
//     )
//     .filter((b) => b.title || b.text);
// };
// const asStats = (raw: unknown): Stat[] => {
//   if (!Array.isArray(raw)) return [];
//   return raw
//     .map((x) =>
//       typeof x === 'string'
//         ? { value: x, label: '' }
//         : { value: String((x as any)?.value ?? ''), label: String((x as any)?.label ?? '') }
//     )
//     .filter((s) => s.value);
// };
// const asGallery = (raw: unknown): (string | StaticImageData)[] => {
//   if (Array.isArray(raw)) return raw.filter(Boolean) as (string | StaticImageData)[];
//   return raw ? [raw as string] : [];
// };

// const norm = (s: unknown) => String(s ?? '').toLowerCase();
// const matches = (v: WorkView, key: string) => norm(v.id).includes(key) || norm(v.title).includes(key);

// const toCase = (w: unknown, i: number): CaseView => {
//   const o = w as Record<string, any>;
//   const v = toView(w, i);
//   const d: Details = Object.entries(DETAILS).find(([k]) => matches(v, k))?.[1] ?? {};
//   const ov = asParas(pick(o, 'overview', 'longDescription', 'details', 'content', 'body'));
//   const hl = asBlocks(pick(o, 'highlights', 'features'));
//   const rs = asStats(pick(o, 'results', 'outcomes', 'metrics'));
//   const gl = asGallery(pick(o, 'gallery', 'images'));
//   return {
//     ...v,
//     year: v.year ?? d.year,
//     tags: v.tags.length ? v.tags : d.tags ?? [],
//     role: pick(o, 'role') ?? d.role,
//     client: pick(o, 'client') ?? d.client,
//     timeline: pick(o, 'timeline', 'duration') ?? d.timeline,
//     status: pick(o, 'status') ?? d.status,
//     overview: ov.length ? ov : d.overview ?? [],
//     highlights: hl.length ? hl : d.highlights ?? [],
//     challenge: pick(o, 'challenge', 'problem') ?? d.challenge,
//     solution: pick(o, 'solution', 'approach') ?? d.solution,
//     results: rs.length ? rs : d.results ?? [],
//     gallery: gl.length > 1 ? gl : d.gallery ?? [],
//     repo: pick(o, 'repo', 'github', 'source', 'sourceUrl') ?? d.repo,
//   };
// };

// /* split the works into the four featured and the rest */
// const ALL: CaseView[] = works.map(toCase);

// export const { FEATURED_ITEMS, ARCHIVE_ITEMS } = (() => {
//   const used = new Set<number>();
//   const out: CaseView[] = [];
//   const take = (i: number) => {
//     if (i >= 0 && !used.has(i) && out.length < 4) {
//       used.add(i);
//       out.push(ALL[i]);
//     }
//   };
//   FEATURED.forEach((key) => take(ALL.findIndex((c) => matches(c, key))));
//   ALL.forEach((c, i) => {
//     if (c.featured) take(i);
//   });
//   ALL.forEach((_, i) => take(i));
//   return { FEATURED_ITEMS: out, ARCHIVE_ITEMS: ALL.filter((_, i) => !used.has(i)) as WorkView[] };
// })();