'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import gsap from 'gsap';

const NAV = [
  { name: 'home', href: '/', bg: 'var(--primary)' },
  { name: 'works', href: '/works', bg: '#8FB8FF' },
  { name: 'gallery', href: '/gallery', bg: '#FF8FA3' },
  { name: 'contact', href: '/contact', bg: '#7ED492' },
];

const GREETING = "hi, i'm jayson";

// 5x7 pixel "J"
const J = ['.####', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.###.'];

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function PixelJ() {
  return (
    <svg viewBox="0 0 5 7" width="14" height="20" shapeRendering="crispEdges" aria-hidden>
      {J.flatMap((row, y) =>
        row
          .split('')
          .map((c, x) =>
            c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null
          )
      )}
    </svg>
  );
}

const chipBase =
  'block rounded-lg border-[1.5px] border-foreground font-pixel text-[#000203] shadow-[2px_2px_0_var(--foreground)] transition-shadow duration-200 hover:shadow-[4px_5px_0_var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground';
const chipPressed = 'shadow-none hover:shadow-none translate-x-[2px] translate-y-[2px]';

export default function Navbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const logoTileRef = useRef<HTMLAnchorElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const knobIconRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(false);
  const knobFirst = useRef(true);
  const panelFirst = useRef(true);

  const isDark = mounted && resolvedTheme === 'dark';

  // ---------------------------------------------------------------------------
  // Entrance: logo tile spins in, greeting types, chips drop in with a bounce
  // ---------------------------------------------------------------------------
  useIsoLayoutEffect(() => {
    setMounted(true);
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      // caret blink (kept even for reduced motion; it is tiny and slow)
      gsap
        .timeline({ repeat: -1 })
        .set(caretRef.current, { opacity: 0 }, 0.55)
        .set(caretRef.current, { opacity: 1 }, 1.1);

      if (reduced()) return;

      gsap
        .timeline({ delay: 0.2, defaults: { ease: 'power3.out' } })
        .from('[data-logo-tile]', { scale: 0, rotate: -200, duration: 1, ease: 'elastic.out(1, 0.6)' })
        .from('[data-type]', { opacity: 0, duration: 0.01, stagger: 0.045 }, '-=0.55')
        .from(
          '[data-chip]',
          { y: -56, opacity: 0, rotate: () => gsap.utils.random(-8, 8), duration: 0.9, stagger: 0.08, ease: 'back.out(2.4)' },
          '-=0.8'
        )
        .from('[data-switch]', { scale: 0, duration: 0.7, ease: 'back.out(2.5)' }, '-=0.6');
    }, header);

    return () => ctx.revert();
  }, []);

  // ---------------------------------------------------------------------------
  // Scroll: glass background after a few px, hide on scroll down, show on up
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let lastY = window.scrollY;
    let hidden = false;

    const show = () => {
      hidden = false;
      gsap.to(headerRef.current, { yPercent: 0, duration: reduced() ? 0 : 0.5, ease: 'power3.out', overwrite: 'auto' });
    };
    const hide = () => {
      hidden = true;
      gsap.to(headerRef.current, { yPercent: -120, duration: reduced() ? 0 : 0.5, ease: 'power3.inOut', overwrite: 'auto' });
    };

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (menuOpenRef.current) return;
      if (y > lastY + 4 && y > 140 && !hidden) hide();
      else if ((y < lastY - 4 || y < 140) && hidden) show();
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ---------------------------------------------------------------------------
  // Theme switch: knob slides with a squash, icon spins in
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mounted || !knobRef.current) return;
    const x = isDark ? 25 : 0;
    if (knobFirst.current || reduced()) {
      knobFirst.current = false;
      gsap.set(knobRef.current, { x });
      return;
    }
    gsap
      .timeline()
      .to(knobRef.current, { x, duration: 0.55, ease: 'back.out(1.8)' }, 0)
      .to(knobRef.current, { scaleX: 1.35, scaleY: 0.8, duration: 0.15, ease: 'power2.out' }, 0)
      .to(knobRef.current, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, 0.15);
    gsap.fromTo(
      knobIconRef.current,
      { rotate: -140, scale: 0.3 },
      { rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(2.5)' }
    );
  }, [isDark, mounted]);

  // ---------------------------------------------------------------------------
  // Mobile menu panel
  // ---------------------------------------------------------------------------
  useEffect(() => {
    menuOpenRef.current = menuOpen;
    const panel = panelRef.current;
    if (!panel) return;
    if (panelFirst.current) {
      panelFirst.current = false;
      gsap.set(panel, { autoAlpha: 0 });
      return;
    }
    const r = reduced();
    const items = panel.querySelectorAll('[data-m-item]');
    if (menuOpen) {
      gsap
        .timeline()
        .fromTo(
          panel,
          { autoAlpha: 0, y: -14, scale: 0.94, transformOrigin: 'top right' },
          { autoAlpha: 1, y: 0, scale: 1, duration: r ? 0 : 0.45, ease: 'back.out(2)' }
        )
        .fromTo(
          items,
          { x: 28, opacity: 0 },
          { x: 0, opacity: 1, duration: r ? 0 : 0.4, stagger: r ? 0 : 0.06, ease: 'back.out(2)' },
          r ? 0 : '<+=0.05'
        );
    } else {
      gsap.to(panel, { autoAlpha: 0, y: -10, scale: 0.96, duration: r ? 0 : 0.25, ease: 'power2.in', overwrite: 'auto' });
    }
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // ---------------------------------------------------------------------------
  // Hover helpers
  // ---------------------------------------------------------------------------
  const lift = (el: HTMLElement, active: boolean) => {
    if (active || reduced()) return;
    gsap.to(el, { y: -3, rotate: gsap.utils.random(-2.5, 2.5), duration: 0.45, ease: 'back.out(3)', overwrite: 'auto' });
  };
  const drop = (el: HTMLElement) =>
    gsap.to(el, { y: 0, rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });

  const wiggleLogo = () => {
    if (reduced()) return;
    gsap
      .timeline()
      .to(logoTileRef.current, { rotate: -14, scale: 1.1, duration: 0.12, ease: 'power2.out' })
      .to(logoTileRef.current, { rotate: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)' });
  };

  const press = (el: HTMLElement) => !reduced() && gsap.to(el, { scale: 0.92, duration: 0.15, ease: 'power3.out' });
  const release = (el: HTMLElement) =>
    gsap.to(el, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-b border-border bg-background/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 w-full max-w-360 items-center justify-between gap-4 px-5 md:px-10">
        {/* Logo: pixel J tile + greeting */}
        <Link
          href="/"
          aria-label="Jayson Baloyi, home"
          onPointerEnter={wiggleLogo}
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <span
            ref={logoTileRef}
            data-logo-tile
            className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-foreground bg-primary text-[#000203] shadow-[2px_2px_0_var(--foreground)]"
          >
            <PixelJ />
          </span>
          <span aria-hidden className="flex items-center font-pixel text-base text-foreground sm:text-lg">
            {GREETING.split('').map((ch, i) => (
              <span key={i} data-type className="inline-block whitespace-pre">
                {ch}
              </span>
            ))}
            <span ref={caretRef} className="ml-1 inline-block h-[0.85em] w-[0.45em] rounded-xs bg-foreground" />
          </span>
          <span className="sr-only">{GREETING}</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop chips */}
          <ul className="hidden items-center gap-2.5 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.name} data-chip>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onPointerEnter={(e) => lift(e.currentTarget, active)}
                    onPointerLeave={(e) => drop(e.currentTarget)}
                    onPointerDown={(e) => press(e.currentTarget)}
                    onPointerUp={(e) => release(e.currentTarget)}
                    className={`${chipBase} px-3.5 py-1 text-sm ${active ? chipPressed : ''}`}
                    style={{ background: item.bg }}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Light / dark switch */}
          <button
            data-switch
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            onPointerDown={(e) => press(e.currentTarget)}
            onPointerUp={(e) => release(e.currentTarget)}
            onPointerLeave={(e) => release(e.currentTarget)}
            className="relative h-8 w-14 shrink-0 rounded-lg border-[1.5px] border-foreground bg-card shadow-[2px_2px_0_var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <span
              ref={knobRef}
              className="absolute left-0.5 top-[2.5px] flex h-6 w-6 items-center justify-center rounded-md border-[1.5px] border-foreground bg-primary text-[#000203]"
            >
              <span ref={knobIconRef} className="inline-flex">
                {mounted ? isDark ? <Moon size={12} /> : <Sun size={12} /> : null}
              </span>
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            ref={menuBtnRef}
            data-chip
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
            onPointerDown={(e) => press(e.currentTarget)}
            onPointerUp={(e) => release(e.currentTarget)}
            onPointerLeave={(e) => release(e.currentTarget)}
            className={`${chipBase} bg-foreground px-3 py-1 text-sm !text-background md:hidden ${menuOpen ? chipPressed : ''}`}
          >
            {menuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        ref={panelRef}
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className="invisible absolute right-5 top-full mt-2 w-48 rounded-xl border-[1.5px] border-foreground bg-background p-3 shadow-[4px_4px_0_var(--primary)] md:hidden"
      >
        <ul className="flex flex-col gap-2.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.name} data-m-item>
                <Link
                  href={item.href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`${chipBase} px-3 py-2 text-base ${active ? chipPressed : ''}`}
                  style={{ background: item.bg }}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}