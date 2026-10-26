import { useEffect, useLayoutEffect } from 'react';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* a ref-like holder that works across React 18 and 19 types */
export type Box<T> = { current: T };

export type DialSize = { W: number; H: number; R: number; cx: number; cy: number };

export const STEP = 22; // degrees between works on the dial
export const IMG_SIZES = '(min-width: 768px) 640px, 90vw';
export const MASK = 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)';

/* signpost board shape (arrow tip depth comes from --tip) */
export const SIGN_R = 'polygon(0 0, calc(100% - var(--tip)) 0, 100% 50%, calc(100% - var(--tip)) 100%, 0 100%)';

/* wood: cartoon outline + tileable grain (horizontal for boards, vertical for the post) */
export const INK = '#2a1608';
export const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='100' viewBox='0 0 260 100'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23b27237' stroke-width='2.5'%3E%3Cpath d='M0 16 C40 8 70 24 120 16 S200 8 260 16'/%3E%3Cpath d='M0 42 C50 50 90 34 140 42 S220 50 260 42'/%3E%3Cpath d='M0 68 C30 60 80 76 130 68 S210 60 260 68'/%3E%3Cpath d='M0 90 C60 96 100 84 150 90 S230 96 260 90'/%3E%3C/g%3E%3Cg stroke='%23d9a265' stroke-width='2'%3E%3Cpath d='M20 29 C60 23 90 35 130 29'/%3E%3Cpath d='M150 56 C190 50 220 62 250 56'/%3E%3Cpath d='M10 79 C40 75 70 83 100 79'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
export const VGRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200' viewBox='0 0 40 200'%3E%3Cg fill='none' stroke='%23915427' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M10 0 C14 50 6 100 10 150 S14 190 10 200'/%3E%3Cpath d='M28 0 C24 40 32 90 28 140 S24 190 28 200'/%3E%3C/g%3E%3C/svg%3E")`;

export const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
export const ROUND_BTN = `grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 ${FOCUS}`;

/* case study layout classes */
export const CASE_WRAP = 'mx-auto w-full max-w-360 px-3 md:px-6';
export const CASE_ROW_FLAT =
  'grid gap-4 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:gap-12 md:py-16';
export const CASE_ROW = `border-t border-border ${CASE_ROW_FLAT}`;
export const CASE_LABEL = 'font-pixel text-sm text-muted-foreground';

export const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const t = (s: number) => (reduced() ? 0 : s);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const pad = (x: number) => String(x).padStart(2, '0');

export const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });

/* The flapper on the wheel: pegs push it up, then it flicks back past centre and settles.
   s = 0 is a work sitting dead-centre; a peg crosses the flapper at s = 0.5. */
const FLAP_MAX = 18;
export const flapAngle = (pos: number) => {
  const s = pos - Math.floor(pos);
  if (s >= 0.3 && s < 0.5) return FLAP_MAX * ((s - 0.3) / 0.2);
  if (s >= 0.5 && s < 0.7) return -FLAP_MAX * 0.45 * ((0.7 - s) / 0.2);
  return 0;
};