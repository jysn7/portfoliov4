'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TAU } from '@/lib/labs/constants';
import { useTokens, fitCanvas } from '@/lib/labs/tokens';
import { useOnScreen } from '@/lib/labs/hooks';

type Particle = { x: number; y: number; px: number; py: number; hot: boolean };

export function FlowField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokens = useTokens(rootRef);
  const visible = useOnScreen(rootRef);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const pointer = { x: -999, y: -999, active: false };
    const state = { t: 0, speed: 1 };

    const init = () => {
      const n = Math.min(900, Math.round((w * h) / 450));
      particles = Array.from({ length: n }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { x, y, px: x, py: y, hot: Math.random() < 0.12 };
      });
    };

    const angle = (x: number, y: number, tt: number) =>
      (Math.sin(x * 0.006 + tt * 0.6) + Math.cos(y * 0.007 - tt * 0.5) + Math.sin((x + y) * 0.004 + tt * 0.3)) *
      Math.PI *
      0.9;

    const step = () => {
      if (!ctx) return;
      const tk = tokens.current;
      state.t += 0.008 * state.speed;

      ctx.globalAlpha = 0.07;
      ctx.fillStyle = tk.card;
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      for (const hot of [false, true]) {
        ctx.strokeStyle = hot ? tk.primary : tk.fg;
        ctx.globalAlpha = hot ? 0.9 : 0.55;
        ctx.beginPath();
        for (const p of particles) {
          if (p.hot !== hot) continue;
          const a = angle(p.x, p.y, state.t);
          let vx = Math.cos(a) * 1.4;
          let vy = Math.sin(a) * 1.4;
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 150 && d > 0.01) {
              const f = (1 - d / 150) * 3;
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          p.px = p.x;
          p.py = p.y;
          p.x += vx;
          p.y += vy;
          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.px = p.x;
            p.py = p.y;
          }
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const nw = root.clientWidth;
      const nh = root.clientHeight;
      if (!nw || !nh) return;
      w = nw;
      h = nh;
      ctx = fitCanvas(canvas, w, h);
      ctx.fillStyle = tokens.current.card;
      ctx.fillRect(0, 0, w, h);
      init();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        for (let i = 0; i < 160; i++) step();
    };

    const tick = () => {
      if (!visible.current || !w) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      step();
    };

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = () => {
      gsap.to(state, { t: state.t + 2, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      gsap.fromTo(state, { speed: 6 }, { speed: 1, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();
    gsap.ticker.add(tick);
    root.addEventListener('pointermove', local);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      ro.disconnect();
      root.removeEventListener('pointermove', local);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
    };
  }, [tokens, visible]);

  return (
    <div ref={rootRef} className="relative size-full touch-pan-y">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}