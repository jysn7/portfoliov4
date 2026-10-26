import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal, flushSync } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

import type { CaseView } from '@/lib/featured';
import { pad, reduced, t, useIsoLayoutEffect } from '../shared';
import CaseStudy from './CaseStudy';
import FeaturedCard from '@/components/work/FeaturedCard';
import SectionHead from '@/components/work/SectionHead';
import { lockScroll, unlockScroll } from '@/components/work/scrollLock';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* symmetric layout: two cards per row, second row offset for rhythm */
const SPAN = [
  'md:col-span-6',
  'md:col-span-6',
  'md:col-span-6 md:mt-20',
  'md:col-span-6 md:mt-20',
];

export default function Featured({ items }: { items: CaseView[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const cardImgRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);

  const openRef = useRef<number | null>(null);
  const originRef = useRef(-1);
  const busy = useRef(false);
  const freshOpen = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [flySrc, setFlySrc] = useState<CaseView['image']>('');

  useEffect(() => setMounted(true), []);

  /* cards rise in as they scroll into view */
  useIsoLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.set('[data-feat]', { opacity: 0, y: 48 });
      gsap.set('[data-head]', { opacity: 0, y: 20 });
      gsap.to('[data-head]', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-head]', start: 'top 88%', once: true },
      });
      ScrollTrigger.batch('[data-feat]', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.14, ease: 'power3.out' }),
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

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

  useEffect(
    () => () => {
      unlockScroll();
      rootRef.current?.closest('main')?.removeAttribute('inert');
    },
    []
  );

  const setPageInert = (on: boolean) => {
    const main = rootRef.current?.closest('main');
    if (!main) return;
    if (on) main.setAttribute('inert', '');
    else main.removeAttribute('inert');
  };

  const openCase = (i: number) => {
    const imgEl = cardImgRefs.current[i];
    if (!imgEl || busy.current || openRef.current !== null) return;

    busy.current = true;
    openRef.current = i;
    originRef.current = i;
    freshOpen.current = true;
    lastFocus.current = document.activeElement as HTMLElement | null;

    const from = imgEl.getBoundingClientRect();
    lockScroll();
    setPageInert(true);
    flushSync(() => {
      setFlySrc(items[i].image);
      setOpenIdx(i);
    });

    const overlay = overlayRef.current;
    const hero = heroRef.current;
    const heroInner = heroInnerRef.current;
    const fly = flyRef.current;
    const inner = imgEl.querySelector('[data-feat-img]');
    if (!overlay || !hero || !heroInner || !fly) {
      busy.current = false;
      return;
    }

    overlay.scrollTop = 0;
    const to = hero.getBoundingClientRect();

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
      .to(overlay, { autoAlpha: 1, duration: t(0.5), ease: 'power2.out' }, 0)
      .to(fly, { x: to.left, y: to.top, width: to.width, height: to.height, duration: t(1) }, 0);
  };

  const closeCase = () => {
    const i = openRef.current;
    const overlay = overlayRef.current;
    const hero = heroRef.current;
    const heroInner = heroInnerRef.current;
    const fly = flyRef.current;
    if (i === null || !overlay || !hero || !heroInner || !fly || busy.current) return;

    busy.current = true;
    const target = cardImgRefs.current[i];

    const finish = () => {
      cardImgRefs.current.forEach((el) => {
        const inner = el?.querySelector('[data-feat-img]');
        if (inner) gsap.set(inner, { autoAlpha: 1 });
      });
      gsap.set(fly, { autoAlpha: 0 });
      gsap.set(overlay, { autoAlpha: 0 });
      openRef.current = null;
      setOpenIdx(null);
      setPageInert(false);
      unlockScroll();
      busy.current = false;
      (cardBtnRefs.current[i] ?? lastFocus.current)?.focus({ preventScroll: true });
    };

    if (!target) return finish();

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
    const inner = target.querySelector('[data-feat-img]');
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

  const go = (dir: number) => {
    const i = openRef.current;
    if (i === null || busy.current || items.length < 2) return;
    const next = (i + dir + items.length) % items.length;
    openRef.current = next;
    setOpenIdx(next);
    overlayRef.current?.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  };

  const onOverlayKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
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

  return (
    <section
      ref={rootRef}
      id="featured"
      className="relative z-10 w-full scroll-mt-16 border-t border-border px-3 pb-16 pt-16 md:px-6 md:pb-24 md:pt-24"
    >
      <div className="mx-auto w-full max-w-360">
        <SectionHead
          title="Featured"
          note="Four projects, in depth. Open one for the full story: what it is, how it was built and what came out of it."
          aside={<p data-head className="font-pixel text-sm text-muted-foreground">01 – {pad(items.length)}</p>}
        />

        <ol className="grid items-start gap-x-5 gap-y-14 md:grid-cols-12 md:gap-x-8 md:gap-y-16">
          {items.map((it, i) => (
            <FeaturedCard
              key={it.id}
              item={it}
              index={i}
              className={SPAN[i % SPAN.length]}
              onOpen={() => openCase(i)}
              btnRef={(el) => {
                cardBtnRefs.current[i] = el;
              }}
              imgRef={(el) => {
                cardImgRefs.current[i] = el;
              }}
            />
          ))}
        </ol>
      </div>

      {mounted &&
        createPortal(
          <CaseStudy
            items={items}
            openIdx={openIdx}
            flySrc={flySrc}
            overlayRef={overlayRef}
            heroRef={heroRef}
            heroInnerRef={heroInnerRef}
            closeBtnRef={closeBtnRef}
            flyRef={flyRef}
            onClose={closeCase}
            onGo={go}
            onKeyDown={onOverlayKey}
          />,
          document.body
        )}
    </section>
  );
}