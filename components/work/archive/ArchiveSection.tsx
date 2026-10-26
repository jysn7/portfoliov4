import { useEffect, useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { Plus } from 'lucide-react';
import gsap from 'gsap';

import type { WorkView } from '@/components/work/data';
import { FOCUS, t } from '@/components/work/shared';
import ArchiveWheel from './ArchiveWheel';

/* the section heading, the open/close button and the sliding panel the dial lives in */
export default function ArchiveSection({
  items,
  open,
  onOpen,
  onClose,
}: {
  items: WorkView[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstPanel = useRef(true);

  /* the panel slides open and shut */
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
        { height: el.offsetHeight },
        { height: 'auto', duration: t(0.9), ease: 'power3.inOut', onComplete: () => void gsap.set(el, { height: 'auto' }) }
      );
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

  const peek = items.filter((v) => v.image).slice(0, 5);

  return (
    <section
      id="archive"
      className="relative z-10 w-full scroll-mt-16 border-t border-border px-3 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto w-full max-w-360">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div>
            <h2 className="font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground">
              Archive
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              {items.length} more {items.length === 1 ? 'project' : 'projects'}, kept on a dial. Turn it to browse,
              click one to open it.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {!open && peek.length > 0 && (
              <span aria-hidden className="hidden items-center sm:flex">
                {peek.map((v, k) => (
                  <span
                    key={v.id}
                    className="relative -ml-4 h-12 w-16 overflow-hidden rounded-lg border-2 border-background bg-muted first:ml-0"
                    style={{ zIndex: peek.length - k }}
                  >
                    <Image src={v.image as string | StaticImageData} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                ))}
              </span>
            )}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="archive-panel"
              onClick={() => (open ? onClose() : onOpen())}
              className={`group inline-flex items-center gap-4 rounded-full border border-foreground/20 py-2 pl-6 pr-2 font-pixel text-sm text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background ${FOCUS}`}
            >
              {open ? 'close archive' : 'open archive'}
              <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-colors duration-300 group-hover:bg-background group-hover:text-foreground">
                <Plus
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  className={`transition-transform duration-500 ${open ? 'rotate-[135deg]' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* The dial lives in here; it is laid out at full size even while closed so it can measure itself */}
        <div id="archive-panel" ref={panelRef} className="invisible h-0 overflow-hidden">
          <ArchiveWheel items={items} expanded={open} />
        </div>
      </div>
    </section>
  );
}