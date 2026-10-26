// import type { RefObject } from 'react';
// import Image from 'next/image';
// import { ArrowRight, ArrowUpRight } from 'lucide-react';

// import type { CaseView } from '../data';
// import { CASE_LABEL, CASE_ROW, CASE_ROW_FLAT, CASE_WRAP, FOCUS, pad } from '../shared';

// export default function CaseBody({
//   c,
//   next,
//   total,
//   heroRef,
//   heroInnerRef,
//   onGo,
// }: {
//   c: CaseView;
//   next: CaseView | null;
//   total: number;
//   heroRef: RefObject<HTMLDivElement | null>;
//   heroInnerRef: RefObject<HTMLDivElement | null>;
//   onGo: (dir: number) => void;
// }) {
//   const meta = (
//     [
//       ['role', c.role],
//       ['client', c.client],
//       ['timeline', c.timeline],
//       ['status', c.status],
//       ['year', c.year != null ? String(c.year) : undefined],
//     ].filter(([, v]) => v) as [string, string][]
//   ).slice(0, 4);
//   const overview = c.overview.length ? c.overview : [c.description].filter(Boolean);

//   return (
//     <>
//       <header className={`${CASE_WRAP} pt-10 md:pt-14`}>
//         <p data-cs className="flex flex-wrap items-center gap-3">
//           {c.category && (
//             <span className="rounded-full bg-primary px-3 py-1 font-pixel text-xs text-primary-foreground">
//               {c.category}
//             </span>
//           )}
//           {c.year != null && <span className="font-pixel text-xs text-muted-foreground">{c.year}</span>}
//         </p>
//         <h2
//           data-cs
//           className="mt-4 font-display font-soft text-[clamp(2.5rem,6.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-foreground"
//         >
//           {c.title}
//         </h2>
//         <p data-cs className="mt-5 max-w-[56ch] text-base leading-relaxed text-muted-foreground md:text-lg">
//           {c.description}
//         </p>

//         <div ref={heroRef} className="mt-10 aspect-[16/10] w-full md:aspect-[2/1]">
//           <div
//             ref={heroInnerRef}
//             className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-muted"
//           >
//             {c.image ? (
//               <Image src={c.image} alt={`${c.title} preview`} fill priority sizes="100vw" className="object-cover" />
//             ) : null}
//           </div>
//         </div>
//       </header>

//       {meta.length > 0 && (
//         <dl data-cs className={`${CASE_WRAP} mt-10`}>
//           <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-6 md:grid-cols-4">
//             {meta.map(([k, v]) => (
//               <div key={k}>
//                 <dt className={CASE_LABEL}>{k}</dt>
//                 <dd className="mt-1.5 text-sm text-foreground">{v}</dd>
//               </div>
//             ))}
//           </div>
//         </dl>
//       )}

//       {overview.length > 0 && (
//         <section className={`${CASE_WRAP} mt-6`}>
//           <div className={CASE_ROW_FLAT}>
//             <h3 data-cs className={CASE_LABEL}>
//               overview
//             </h3>
//             <div data-cs className="space-y-5">
//               {overview.map((p, k) => (
//                 <p key={k} className="max-w-[62ch] text-base leading-relaxed text-foreground md:text-lg">
//                   {p}
//                 </p>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {c.highlights.length > 0 && (
//         <section className={CASE_WRAP}>
//           <div className={CASE_ROW}>
//             <h3 data-cs className={CASE_LABEL}>
//               highlights
//             </h3>
//             <ol className="border-b border-border">
//               {c.highlights.map((h, k) => (
//                 <li
//                   key={k}
//                   data-cs
//                   className="grid gap-2 border-t border-border py-6 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.5fr)] md:gap-6"
//                 >
//                   <span className="font-pixel text-sm tabular-nums text-muted-foreground">{pad(k + 1)}</span>
//                   <h4 className="font-display font-soft text-2xl tracking-[-0.02em] text-foreground">{h.title}</h4>
//                   <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{h.text}</p>
//                 </li>
//               ))}
//             </ol>
//           </div>
//         </section>
//       )}

//       {(c.challenge || c.solution) && (
//         <section className={CASE_WRAP}>
//           <div className={CASE_ROW}>
//             <h3 data-cs className={CASE_LABEL}>
//               the thinking
//             </h3>
//             <div className="grid gap-10 md:grid-cols-2 md:gap-12">
//               {c.challenge && (
//                 <div data-cs>
//                   <p className="font-pixel text-sm text-foreground">the challenge</p>
//                   <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{c.challenge}</p>
//                 </div>
//               )}
//               {c.solution && (
//                 <div data-cs>
//                   <p className="font-pixel text-sm text-foreground">the approach</p>
//                   <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{c.solution}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       )}

//       {c.results.length > 0 && (
//         <section className={CASE_WRAP}>
//           <div className={CASE_ROW}>
//             <h3 data-cs className={CASE_LABEL}>
//               results
//             </h3>
//             <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
//               {c.results.map((r, k) => (
//                 <div key={k} data-cs className="border-t border-foreground pt-4">
//                   <p className="font-display font-soft text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[-0.04em] text-foreground">
//                     {r.value}
//                   </p>
//                   {r.label && <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {c.tags.length > 0 && (
//         <section className={CASE_WRAP}>
//           <div className={CASE_ROW}>
//             <h3 data-cs className={CASE_LABEL}>
//               built with
//             </h3>
//             <ul data-cs className="flex flex-wrap gap-2">
//               {c.tags.map((tag) => (
//                 <li key={tag} className="rounded-full bg-muted px-4 py-1.5 font-pixel text-xs text-foreground">
//                   {tag}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </section>
//       )}

//       {c.gallery.length > 0 && (
//         <section className={`${CASE_WRAP} border-t border-border py-12 md:py-16`}>
//           <h3 data-cs className={`${CASE_LABEL} mb-6`}>
//             gallery
//           </h3>
//           <div className="grid gap-5 md:grid-cols-2">
//             {c.gallery.map((g, k) => (
//               <div
//                 key={k}
//                 data-cs
//                 className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted"
//               >
//                 <Image src={g} alt={`${c.title} screenshot ${k + 1}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {(c.href || c.repo) && (
//         <section className={`${CASE_WRAP} border-t border-border py-12 md:py-16`}>
//           <div data-cs className="flex flex-wrap items-center gap-x-8 gap-y-4">
//             {c.href && (
//               <a
//                 href={c.href}
//                 target={/^https?:/.test(c.href) ? '_blank' : undefined}
//                 rel="noopener noreferrer"
//                 className={`group flex items-center gap-5 rounded-full bg-foreground py-2 pl-7 pr-2 text-background transition-colors duration-300 hover:bg-primary hover:text-primary-foreground ${FOCUS}`}
//               >
//                 <span className="font-pixel text-sm">visit project</span>
//                 <span className="grid size-11 place-items-center rounded-full bg-background text-foreground transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
//                   <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
//                 </span>
//               </a>
//             )}
//             {c.repo && (
//               <a
//                 href={c.repo}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className={`font-pixel text-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground ${FOCUS}`}
//               >
//                 view the code
//               </a>
//             )}
//           </div>
//         </section>
//       )}

//       {next && total > 1 && (
//         <section className={`${CASE_WRAP} pb-16`}>
//           <button
//             type="button"
//             data-cs
//             onClick={() => onGo(1)}
//             className={`group flex w-full items-end justify-between gap-6 border-t border-foreground pt-6 text-left ${FOCUS}`}
//           >
//             <span>
//               <span className={CASE_LABEL}>next project</span>
//               <span className="mt-3 block font-display font-soft text-[clamp(2rem,5vw,4rem)] leading-none tracking-[-0.04em] text-foreground">
//                 {next.title}
//               </span>
//             </span>
//             <span className="grid size-14 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
//               <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
//             </span>
//           </button>
//         </section>
//       )}
//     </>
//   );
// }