import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import Image from 'next/image';

import type { CaseView } from '@/lib/featured';
import { IMG_SIZES } from '../shared';
import CaseBody from './CaseBody';
import CaseTopBar from './CaseTopBar';

/* the portal content: the full-screen case study plus the flying image that lands in it */
export default function CaseStudy({
  items,
  openIdx,
  flySrc,
  overlayRef,
  heroRef,
  heroInnerRef,
  closeBtnRef,
  flyRef,
  onClose,
  onGo,
  onKeyDown,
}: {
  items: CaseView[];
  openIdx: number | null;
  flySrc: CaseView['image'];
  overlayRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLDivElement | null>;
  heroInnerRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  flyRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onGo: (dir: number) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
}) {
  const c = openIdx !== null ? items[openIdx] : null;
  const next = openIdx !== null ? items[(openIdx + 1) % items.length] : null;

  return (
    <>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={c ? `${c.title} case study` : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="invisible fixed inset-0 z-[60] select-text overflow-y-auto overscroll-contain bg-background outline-none"
      >
        {c && openIdx !== null && (
          <div key={openIdx}>
            <CaseTopBar
              index={openIdx}
              total={items.length}
              closeBtnRef={closeBtnRef}
              onClose={onClose}
              onGo={onGo}
            />
            <CaseBody
              c={c}
              next={next}
              total={items.length}
              heroRef={heroRef}
              heroInnerRef={heroInnerRef}
              onGo={onGo}
            />
          </div>
        )}
      </div>

      {/* The flying image: starts on the card, lands in the case study (and back) */}
      <div
        ref={flyRef}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 z-[70] overflow-hidden rounded-2xl bg-muted"
      >
        {flySrc ? <Image src={flySrc} alt="" fill sizes={IMG_SIZES} className="object-cover" /> : null}
      </div>
    </>
  );
}