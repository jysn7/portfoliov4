import { useEffect, useRef, type RefObject } from 'react';

const TOKEN_VARS = {
  fg: '--foreground',
  bg: '--background',
  card: '--card',
  primary: '--primary',
  muted: '--muted-foreground',
  border: '--border',
} as const;

export type Tokens = Record<keyof typeof TOKEN_VARS, string>;

const FALLBACK: Tokens = {
  fg: '#111111',
  bg: '#ffffff',
  card: '#ffffff',
  primary: '#ffb800',
  muted: '#888888',
  border: '#dddddd',
};

export const readTokens = (host: HTMLElement): Tokens => {
  const out = { ...FALLBACK };
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  host.appendChild(probe);
  (Object.keys(TOKEN_VARS) as (keyof Tokens)[]).forEach((k) => {
    probe.style.color = `var(${TOKEN_VARS[k]})`;
    out[k] = getComputedStyle(probe).color;
  });
  probe.remove();
  return out;
};

export function useTokens(ref: RefObject<HTMLElement | null>) {
  const tokens = useRef<Tokens>(FALLBACK);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      tokens.current = readTokens(el);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    return () => mo.disconnect();
  }, [ref]);
  return tokens;
}

export const fitCanvas = (canvas: HTMLCanvasElement, w: number, h: number) => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};