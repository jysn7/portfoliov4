export const HEADING = { fontFamily: 'var(--font-heading)' } as const;
export const BODY = { fontFamily: 'var(--font-body)' } as const;

export const HERO_TEXT = 'Small experiments, mostly working';
export const HERO_HEIGHT = '74svh';
export const CANVAS_H = 'clamp(24rem, 70svh, 50rem)';
export const EDGE =
  'linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)';
export const SPEED = 46;
export const TAU = Math.PI * 2;

export const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
export const MINI = `h-8 rounded-lg px-3 text-xs transition-colors duration-200 ${FOCUS}`;
export const MINI_ON = 'bg-foreground text-background';
export const MINI_OFF = 'bg-muted text-foreground hover:bg-foreground hover:text-background';
export const BTN = `inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors duration-200 ${FOCUS}`;
export const BTN_PRIMARY = `${BTN} bg-foreground text-background hover:bg-foreground/85`;
export const BTN_MUTED = `${BTN} bg-muted text-foreground hover:bg-foreground hover:text-background`;
export const ROUND_BTN = `grid size-11 place-items-center rounded-lg bg-muted text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background ${FOCUS}`;

/* --- pure helpers (moved here so any component can import them from one place) --- */

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const t = (s: number) => (reduced() ? 0 : s);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const pad = (n: number) => String(n).padStart(2, '0');