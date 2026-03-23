'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Works', href: '/works' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export default function Sidebar() {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const topBtnRef = useRef<HTMLButtonElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebar = (forceState?: boolean) => {
    const nextState = forceState ?? !isOpen;
    if (nextState === isOpen) return;
    setIsOpen(nextState);

    gsap.killTweensOf([sidebarRef.current, contentRef.current, ringRef.current]);

    if (nextState) {
      const tl = gsap.timeline();
      tl.to(ringRef.current, {
        rotate: 360,
        duration: 0.4,
        ease: 'power2.inOut'
      })
      .to(ringRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      })
      .to(sidebarRef.current, {
        width: '180px',
        height: '280px',
        borderRadius: '90px',
        backgroundColor: 'var(--background)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        duration: 0.6,
        ease: 'expo.out',
      }, '-=0.1')
      .to(contentRef.current, {
        display: 'flex',
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.3');

    } else {
      const tl = gsap.timeline();
      tl.to(contentRef.current, {
        opacity: 0,
        y: 10,
        pointerEvents: 'none',
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(contentRef.current, { display: 'none' });
        }
      })
      .to(sidebarRef.current, {
        width: '56px',
        height: '56px',
        borderRadius: '999px',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(0px)',
        border: '1px solid transparent',
        duration: 0.5,
        ease: 'expo.inOut',
      })
      .set(ringRef.current, { rotate: 0 })
      .to(ringRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      }, '-=0.2');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        toggleSidebar(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div 
        ref={containerRef} 
        className="fixed top-1/2 left-5 md:left-10 -translate-y-1/2 z-50 flex flex-col items-center gap-4"
      >
        <div className="flex items-center justify-center w-12 h-12">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }}
              >
                <Sun className="h-4 w-4 dark:scale-0 transition-all" />
                <Moon className="absolute h-4 w-4 scale-0 dark:scale-100 transition-all" />
            </Button>
        </div>

        <div className="relative flex items-center justify-center">
            <div 
            ref={ringRef}
            className="absolute w-12 h-12 border-2 border-muted-foreground border-t-transparent border-r-transparent rounded-full pointer-events-none"
            />

            <aside 
            ref={sidebarRef}
            onMouseEnter={() => { if (window.innerWidth > 768) toggleSidebar(true); }}
            onMouseLeave={() => { if (window.innerWidth > 768) toggleSidebar(false); }}
            onClick={() => { if (window.innerWidth <= 768) toggleSidebar(); }}
            className="relative w-14 h-14 flex flex-col items-center justify-center pointer-events-auto cursor-pointer overflow-hidden"
            >
            <div 
                ref={contentRef} 
                className="hidden opacity-0 translate-y-4 pointer-events-none flex-col items-center justify-center w-full h-full"
            >
                <nav className="flex flex-col items-center gap-6">
                    {navItems.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {item.name}
                    </Link>
                    ))}
                </nav>
            </div>
            </aside>
        </div>
      </div>

      <button
        ref={topBtnRef}
        onClick={scrollToTop}
        className={`
          fixed bottom-10 left-7 md:left-12 z-50
          flex items-center justify-center w-10 h-10 
          rounded-full border border-border bg-background/50 backdrop-blur-sm
          text-muted-foreground hover:text-foreground hover:border-foreground
          transition-all duration-500 ease-in-out
          ${showBackToTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
        `}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </>
  );
}