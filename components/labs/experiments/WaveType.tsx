'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HEADING, BODY, reduced } from '@/lib/labs/constants';
import { useOnScreen } from '@/lib/labs/hooks';

const WAVE_WORDS = ['Letters', 'with', 'feelings'];

export function WaveType() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ampRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLInputElement>(null);
  const visible = useOnScreen(rootRef);

  useEffect(() => {
    const root = rootRef.current;
    const ampEl = ampRef.current;
    const speedEl = speedRef.current;
    if (!root || !ampEl || !speedEl || reduced()) return;

    const chars = gsap.utils.toArray<HTMLElement>('[data-wchar]', root);
    const setY = chars.map((c) => gsap.quickSetter(c, 'y', 'px'));
    const setR = chars.map((c) => gsap.quickSetter(c, 'rotation', 'deg'));
    const swell = { v: 0 };
    let tt = 0;

    const tick = (_: number, delta: number) => {
      if (!visible.current) return;
      const amp = Number(ampEl.value) * (1 + swell.v * 0.6);
      tt += (Math.min(delta, 50) / 1000) * Number(speedEl.value);
      chars.forEach((_c, i) => {
        const p = tt * 3 + i * 0.55;
        setY[i](Math.sin(p) * amp);
        setR[i](Math.cos(p) * amp * 0.25);
      });
    };

    const enter = () => gsap.to(swell, { v: 1, duration: 0.6, ease: 'power2.out' });
    const leave = () => gsap.to(swell, { v: 0, duration: 0.8, ease: 'power2.out' });
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(swell);
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
    };
  }, [visible]);

  return (
    <div ref={rootRef} className="flex size-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
        <p className="text-5xl font-semibold leading-tight tracking-tight text-foreground md:text-8xl" style={HEADING}>
          {WAVE_WORDS.map((word, w) => (
            <span key={word}>
              <span className="inline-block whitespace-nowrap">
                {Array.from(word).map((ch, i) => (
                  <span key={i} data-wchar className="inline-block will-change-transform">
                    {ch}
                  </span>
                ))}
              </span>
              {w < WAVE_WORDS.length - 1 ? ' ' : null}
            </span>
          ))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border px-4 py-4" style={BODY}>
        <label className="flex flex-col gap-2 text-xs text-muted-foreground">
          Amplitude
          <input ref={ampRef} type="range" min={0} max={40} step={1} defaultValue={14} className="w-full accent-foreground" />
        </label>
        <label className="flex flex-col gap-2 text-xs text-muted-foreground">
          Speed
          <input ref={speedRef} type="range" min={0} max={3} step={0.1} defaultValue={1} className="w-full accent-foreground" />
        </label>
      </div>
    </div>
  );
}