'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      on.current = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}