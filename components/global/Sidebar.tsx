'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import gsap from 'gsap';

const NAV = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/about' },
  { name: 'labs', href: '/labs' },
  { name: 'works', href: '/works' },
  { name: 'contact', href: '/contact' },
];

const GREETING = "hi, i'm jayson";

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';

const WOOD = {
  ink: '#2a1608',
  tone: '#c98d51',
  highlight: '#efc18a',
  shadow: '#93582a',
  grain: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
};

export default function Navbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const logoTileRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const knobIconRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(false);
  const knobFirst = useRef(true);
  const panelFirst = useRef(true);

  const isDark = mounted && resolvedTheme === 'dark';

  // Entrance: quiet fade-up stagger. No rotate, no bounce, no steps().
  useIsoLayoutEffect(() => {
    setMounted(true);
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ repeat: -1 })
        .set(caretRef.current, { opacity: 0 }, 0.55)
        .set(caretRef.current, { opacity: 1 }, 1.1);

      if (reduced()) return;

      gsap
        .timeline({ delay: 0.15, defaults: { ease: 'power3.out' } })
        .from('[data-logo-tile]', { scale: 0.6, opacity: 0, duration: 0.8, ease: 'expo.out' })
        .from('[data-type]', { opacity: 0, duration: 0.01, stagger: 0.04 }, '-=0.4')
        .from('[data-nav-item]', { y: -6, opacity: 0, duration: 0.6, stagger: 0.05 }, '-=0.55')
        .from('[data-switch]', { opacity: 0, scale: 0.8, duration: 0.5, ease: 'expo.out' }, '-=0.4');
    }, header);

    return () => ctx.revert();
  }, []);

  // Scroll: glass, hide on down, show on up
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

  // Wooden switch — simplified motion
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
      .to(knobRef.current, { x, duration: 0.45, ease: 'back.out(1.6)' }, 0)
      .to(knobRef.current, { scaleX: 1.18, scaleY: 0.9, duration: 0.12, ease: 'power2.out' }, 0)
      .to(knobRef.current, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }, 0.12);
    gsap.fromTo(
      knobIconRef.current,
      { rotate: -90, scale: 0.5, opacity: 0 },
      { rotate: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' }
    );
  }, [isDark, mounted]);

  // Mobile panel — simple fade + slight rise
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
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: r ? 0 : 0.3, ease: 'power3.out' }
        )
        .fromTo(
          items,
          { opacity: 0, y: -4 },
          { opacity: 1, y: 0, duration: r ? 0 : 0.3, stagger: r ? 0 : 0.04, ease: 'power3.out' },
          r ? 0 : '<+=0.05'
        );
    } else {
      gsap.to(panel, { autoAlpha: 0, y: -6, duration: r ? 0 : 0.2, ease: 'power2.in', overwrite: 'auto' });
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

  // Logo hover: a single small scale tick, no rotate
  const wiggleLogo = () => {
    if (reduced()) return;
    gsap
      .timeline()
      .to(logoTileRef.current, { scale: 1.08, duration: 0.15, ease: 'power2.out' })
      .to(logoTileRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
  };

  const press = (el: HTMLElement) => !reduced() && gsap.to(el, { scale: 0.94, duration: 0.15, ease: 'power3.out' });
  const release = (el: HTMLElement) =>
    gsap.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-b border-border bg-background/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-360 items-center justify-between gap-6 px-5 md:px-8"
      >
        {/* Logo + pixel greeting */}
        <Link
          href="/"
          aria-label="Jayson Baloyi, home"
          onPointerEnter={wiggleLogo}
          className={`group flex items-center gap-3 rounded-md ${FOCUS}`}
        >
          <span
            ref={logoTileRef}
            data-logo-tile
            className="inline-flex shrink-0 items-center justify-center will-change-transform"
          >
            <Image
              src="/jay/logo.png"
              alt=""
              width={32}
              height={32}
              priority
              draggable={false}
              className="h-7 w-7 object-contain select-none sm:h-8 sm:w-8"
            />
          </span>
          <span
            aria-hidden
            className="hidden items-center font-pixel text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground sm:flex"
          >
            {GREETING.split('').map((ch, i) => (
              <span key={i} data-type className="inline-block whitespace-pre">
                {ch}
              </span>
            ))}
            <span ref={caretRef} className="ml-1 inline-block h-[0.8em] w-[0.42em] rounded-[1px] bg-current" />
          </span>
          <span className="sr-only">{GREETING}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop nav — plain text, sliding underline on hover/active */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.name} data-nav-item>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group/nav relative inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors duration-200 ${FOCUS} ${
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="relative">
                      {item.name}
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left bg-current transition-transform duration-300 ease-out ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'
                        }`}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Wood switch — the one signature detail, kept small */}
          <button
            data-switch
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            onPointerDown={(e) => press(e.currentTarget)}
            onPointerUp={(e) => release(e.currentTarget)}
            onPointerLeave={(e) => release(e.currentTarget)}
            className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground`}
            style={{
              borderColor: WOOD.ink,
              background: WOOD.tone,
              backgroundImage: WOOD.grain,
              backgroundSize: '260px 100px',
            }}
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: WOOD.highlight }} />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]" style={{ background: WOOD.shadow }} />
            <span
              ref={knobRef}
              className="absolute left-[2px] top-[2px] flex h-[20px] w-[20px] items-center justify-center rounded-full border text-[#2a1608] will-change-transform"
              style={{
                borderColor: WOOD.ink,
                background: WOOD.tone,
                backgroundImage: WOOD.grain,
                backgroundSize: '80px 40px',
              }}
            >
              <span ref={knobIconRef} className="inline-flex">
                {mounted ? isDark ? <Moon size={10} strokeWidth={2} /> : <Sun size={10} strokeWidth={2} /> : null}
              </span>
            </span>
          </button>

          {/* Mobile toggle — plain text */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
            className={`inline-flex h-9 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground md:hidden ${FOCUS}`}
          >
            {menuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {/* Mobile panel — minimal: rounded card, hairline border, soft shadow */}
      <div
        ref={panelRef}
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className="invisible absolute inset-x-4 top-full mt-2 origin-top-right overflow-hidden rounded-2xl border border-border bg-background shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:hidden"
      >
        <ul className="flex flex-col gap-0.5 p-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.name} data-m-item>
                <Link
                  href={item.href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex h-10 items-center justify-between rounded-xl px-3 text-sm transition-colors duration-200 ${FOCUS} ${
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{item.name}</span>
                  {active && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border px-3 py-2.5">
          <p className="font-pixel text-[10px] tracking-wide text-muted-foreground">
            johannesburg · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </header>
  );
}