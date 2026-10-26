// import { useRef } from 'react';
// import { ArrowDown } from 'lucide-react';
// import gsap from 'gsap';

// import Board from './Board';
// import { FOCUS, INK, VGRAIN, reduced, useIsoLayoutEffect } from './shared';

// export default function Signpost({
//   hasArchive,
//   onFeatured,
//   onArchive,
// }: {
//   hasArchive: boolean;
//   onFeatured: () => void;
//   onArchive: () => void;
// }) {
//   const headerRef = useRef<HTMLElement>(null);

//   /* boards slide in from the left, the copy rises */
//   useIsoLayoutEffect(() => {
//     if (reduced()) return;
//     const ctx = gsap.context(() => {
//       gsap.from('[data-board]', { x: '-115%', duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
//       gsap.from('[data-reveal]', { y: 28, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.5 });
//     }, headerRef);
//     return () => ctx.revert();
//   }, []);

//   return (
//     <header ref={headerRef} className="relative z-10 pt-40 md:pt-72">
//       <div className="pointer-events-none absolute left-0 top-40 h-[17rem] w-full md:top-72 md:h-[26rem]">
//         <span
//           aria-hidden
//           className="absolute -top-5 bottom-0 left-0 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] md:w-10"
//           style={{ backgroundColor: '#b97c43', backgroundImage: VGRAIN, backgroundSize: '40px 200px', borderColor: INK }}
//         />

//         <div className="absolute left-0 top-0 w-full">
//           <div data-board className="absolute left-0 top-10 md:top-16">
//             <Board
//               tone="#c98d51"
//               className="origin-left -translate-x-6 -rotate-[8deg] [--tip:2.5rem] md:[--tip:4.25rem]"
//               inner="py-1 pl-14 pr-[calc(var(--tip)+1rem)] md:py-2 md:pl-[5.5rem] md:pr-[calc(var(--tip)+1.75rem)]"
//               nails="left-[1.9rem] md:left-[2.2rem]"
//               knot="right-[calc(var(--tip)+0.3rem)] top-2.5 md:top-4"
//             >
//               <h1 className="relative font-display font-soft text-[clamp(3.25rem,13vw,8.5rem)] font-normal leading-none tracking-[-0.045em] text-[#2a1608] [text-shadow:0_2px_0_#efc18a] md:[text-shadow:0_3px_0_#efc18a]">
//                 works
//               </h1>
//             </Board>
//           </div>

//           <div data-board className="absolute left-0 top-[8.25rem] md:top-[14.5rem]">
//             <Board
//               tone="#d39a5c"
//               className="origin-left -translate-x-8 -rotate-[4deg] [--tip:1.5rem] md:[--tip:2.25rem]"
//               inner="py-1.5 pl-[4.5rem] pr-[calc(var(--tip)+0.9rem)] md:py-2 md:pl-[6rem]"
//               nails="left-[2.4rem] md:left-[2.7rem]"
//             >
//               <span className="relative block font-pixel text-xs text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-sm">
//                 selected work
//               </span>
//             </Board>
//           </div>

//           <div data-board className="absolute left-0 top-[11.25rem] md:top-[19.5rem]">
//             <Board
//               tone="#bd8449"
//               className="origin-left -translate-x-10 rotate-[2.5deg] [--tip:1.25rem] md:[--tip:1.75rem]"
//               inner="py-1 pl-20 pr-[calc(var(--tip)+0.75rem)] md:py-1.5 md:pl-[6.5rem]"
//               nails="left-[2.9rem] md:left-[3.2rem]"
//             >
//               <span className="relative block font-pixel text-[10px] text-[#2a1608] [text-shadow:0_1.5px_0_#efc18a] md:text-xs">
//                 four, then the archive
//               </span>
//             </Board>
//           </div>
//         </div>
//       </div>

//       <div className="mx-auto max-w-360 px-6 pt-[17rem] md:flex md:min-h-[26rem] md:items-end md:justify-end md:px-12 md:pt-0">
//         <div data-reveal className="max-w-[44ch] md:pb-4">
//           <p className="font-display text-lg italic leading-snug text-foreground md:text-xl">
//             websites, games and odd little experiments.
//           </p>
//           <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
//             the four I&apos;m proudest of come first, each with its full story. everything else is kept in the
//             archive, on a dial.
//           </p>
//           <div className="mt-6 flex flex-wrap gap-2">
//             <button
//               type="button"
//               onClick={onFeatured}
//               className={`inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-pixel text-xs text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground ${FOCUS}`}
//             >
//               featured work
//               <ArrowDown size={14} strokeWidth={1.75} aria-hidden />
//             </button>
//             {hasArchive && (
//               <button
//                 type="button"
//                 onClick={onArchive}
//                 className={`inline-flex h-10 items-center gap-2 rounded-full bg-muted px-5 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`}
//               >
//                 open the archive
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }