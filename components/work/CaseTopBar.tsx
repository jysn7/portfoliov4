// import type { RefObject } from 'react';
// import { ArrowLeft, ArrowRight } from 'lucide-react';

// import { CASE_WRAP, FOCUS, ROUND_BTN, pad } from '../shared';

// export default function CaseTopBar({
//   index,
//   total,
//   closeBtnRef,
//   onClose,
//   onGo,
// }: {
//   index: number;
//   total: number;
//   closeBtnRef: RefObject<HTMLButtonElement | null>;
//   onClose: () => void;
//   onGo: (dir: number) => void;
// }) {
//   return (
//     <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
//       <div className={`${CASE_WRAP} flex h-16 items-center justify-between`}>
//         <button
//           ref={closeBtnRef}
//           type="button"
//           onClick={onClose}
//           className={`flex h-10 items-center gap-2 rounded-full bg-muted px-5 font-pixel text-xs text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`}
//         >
//           <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
//           back to works
//         </button>
//         <span className="font-pixel text-xs tabular-nums text-muted-foreground">
//           {pad(index + 1)} / {pad(total)}
//         </span>
//         <span className="flex items-center gap-2">
//           <button type="button" aria-label="Previous project" onClick={() => onGo(-1)} className={ROUND_BTN}>
//             <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
//           </button>
//           <button type="button" aria-label="Next project" onClick={() => onGo(1)} className={ROUND_BTN}>
//             <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
//           </button>
//         </span>
//       </div>
//     </div>
//   );
// }