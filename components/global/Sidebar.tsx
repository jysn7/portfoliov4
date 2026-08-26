'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, ArrowUp, Sun, Moon } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Works', href: '/works' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

const taglines = [
  'CS STUDENT',
  'SOFTWARE ENGINEER',
  'CREATIVE WRITER',
  'PHOTOGRAPHER',
];

const COLLAPSED_HEIGHT = 78;

export default function Sidebar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => setMounted(true), []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!taglineRef.current) {
        setTaglineIndex((i) => (i + 1) % taglines.length);
        return;
      }
      taglineRef.current.style.opacity = '0';
      taglineRef.current.style.transform = 'translateY(-6px)';
      
      setTimeout(() => {
        setTaglineIndex((i) => (i + 1) % taglines.length);
        if (taglineRef.current) {
          taglineRef.current.style.transform = 'translateY(6px)';
          setTimeout(() => {
            if (taglineRef.current) {
              taglineRef.current.style.opacity = '1';
              taglineRef.current.style.transform = 'translateY(0)';
            }
          }, 30);
        }
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleDock = (forceState?: boolean) => {
    const nextState = forceState ?? !isOpen;
    setIsOpen(nextState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 max-w-2xl mx-auto sm:mx-0 px-4"
      >
        <div
          ref={dockRef}
          className={`relative flex flex-col justify-end items-center w-full transition-all duration-300 ease-in-out
            bg-background/90 backdrop-blur-xl border-2 border-border/40
            ${isOpen ? 'rounded-2xl' : 'rounded-2xl'}
          `}
          style={{ 
            height: isOpen ? 'auto' : COLLAPSED_HEIGHT,
            minHeight: COLLAPSED_HEIGHT
          }}
        >
          <div
            ref={contentRef}
            className={`flex-col gap-1 px-2 pt-5 pb-4 w-full transition-all duration-300
              ${isOpen ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'}
            `}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-4 rounded-xl px-5 py-3.5 transition-all duration-200
                    ${active 
                      ? 'bg-accent/80 text-accent-foreground font-semibold' 
                      : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                    }
                  `}
                >
                  <span className="text-sm font-medium tracking-wide">
                    {item.name}
                  </span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  )}
                </Link>
              );
            })}
            <div className="h-px bg-border/40 mx-4 mt-2" />
          </div>

          <div className="flex items-center gap-4 h-[78px] px-6 shrink-0 w-full">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted/60 shrink-0 border border-border/40 ring-1 ring-border/20 shadow-sm">
              <div
                className="absolute inset-0 transition-transform duration-300 hover:scale-105"
                style={{
                  backgroundImage: `url(/avatar.png)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                JAYSON BALOYI
              </span>
              <span
                ref={taglineRef}
                className="text-[11px] font-medium tracking-wider text-muted-foreground truncate transition-all duration-300 uppercase inline-block"
              >
                {taglines[taglineIndex]}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                {mounted ? (
                  isDark ? <Sun size={17} className="transition-transform duration-300 hover:rotate-45" /> : <Moon size={17} className="transition-transform duration-300 hover:-rotate-12" />
                ) : (
                  <span className="w-[17px] h-[17px]" />
                )}
              </button>

              <button
                onClick={() => toggleDock()}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                  ${isOpen
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                {isOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 md:right-10 z-50
          flex items-center justify-center w-11 h-11
          rounded-xl bg-background/90 backdrop-blur-xl border border-border/40
          shadow-lg shadow-foreground/5 text-muted-foreground hover:text-foreground hover:bg-accent/50
          transition-all duration-300 ease-in-out
          ${showBackToTop 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
          }
        `}
      >
        <ArrowUp className="w-4 h-4 transition-transform duration-200 hover:-translate-y-0.5" />
      </button>
    </>
  );
}