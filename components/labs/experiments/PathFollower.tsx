'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { MINI, MINI_OFF, TAU } from '@/lib/labs/constants';

export function PathFollower() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGPolygonElement>(null);
  const api = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const ship = shipRef.current;
    if (!root || !svg || !path || !ship) return;

    const dots = gsap.utils.toArray<SVGElement>('[data-dot]', svg);
    const all: SVGElement[] = [ship, ...dots];
    let tweens: gsap.core.Tween[] = [];
    let custom = false;
    let drawing = false;
    let pts: { x: number; y: number }[] = [];

    const smooth = (p: { x: number; y: number }[]) => {
      if (p.length < 2) return '';
      let d = `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`;
      if (p.length === 2) return `${d} L${p[1].x.toFixed(1)},${p[1].y.toFixed(1)}`;
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2;
        const my = (p[i].y + p[i + 1].y) / 2;
        d += ` Q${p[i].x.toFixed(1)},${p[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      const last = p[p.length - 1];
      return `${d} L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
    };

    const stop = () => {
      tweens.forEach((tw) => tw.kill());
      tweens = [];
    };

    const run = () => {
      stop();
      const len = path.getTotalLength();
      if (!len) return;
      const dur = Math.max(2.5, len / 170);
      gsap.set(all, { x: 0, y: 0, autoAlpha: 0 });
      all.forEach((el, i) => {
        tweens.push(
          gsap.to(el, {
            motionPath: { path, autoRotate: i === 0 },
            duration: dur,
            ease: custom ? 'sine.inOut' : 'none',
            repeat: -1,
            repeatDelay: custom ? 0.3 : 0,
            delay: i * 0.07,
            onStart: () => {
              gsap.set(el, { autoAlpha: i === 0 ? 1 : Math.max(0.15, 1 - i * 0.13) });
            },
          })
        );
      });
    };

    const defaultPath = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return false;
      const a = Math.min(w * 0.36, h * 0.7);
      const p: { x: number; y: number }[] = [];
      for (let i = 0; i <= 64; i++) {
        const tt = (i / 64) * TAU;
        const d = 1 + Math.sin(tt) ** 2;
        p.push({ x: w / 2 + (a * Math.cos(tt)) / d, y: h / 2 + (a * 1.4 * Math.sin(tt) * Math.cos(tt)) / d });
      }
      path.setAttribute('d', smooth(p));
      return true;
    };

    const reset = () => {
      custom = false;
      if (defaultPath()) run();
    };
    api.current = { reset };

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      drawing = true;
      pts = [local(e)];
      root.setPointerCapture(e.pointerId);
      stop();
      gsap.set(all, { autoAlpha: 0 });
      path.setAttribute('d', '');
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      const p = local(e);
      const l = pts[pts.length - 1];
      if (Math.hypot(p.x - l.x, p.y - l.y) > 6) {
        pts.push(p);
        path.setAttribute('d', smooth(pts));
      }
    };
    const onUp = () => {
      if (!drawing) return;
      drawing = false;
      if (pts.length > 5) {
        custom = true;
        run();
      } else {
        reset();
      }
    };

    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);

    const ro = new ResizeObserver(() => {
      if (!custom && !drawing) reset();
    });
    ro.observe(root);
    reset();

    return () => {
      stop();
      ro.disconnect();
      api.current = null;
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative size-full cursor-crosshair touch-none">
      <button
        type="button"
        onClick={() => api.current?.reset()}
        className={`absolute left-3 top-3 z-10 ${MINI} ${MINI_OFF}`}
      >
        Reset
      </button>
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <path
          ref={pathRef}
          className="fill-none stroke-border"
          strokeWidth={2}
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} data-dot r={5.5 - i * 0.6} className="invisible fill-primary" />
        ))}
        <polygon ref={shipRef} points="10,0 -7,7 -7,-7" className="invisible fill-foreground" />
      </svg>
    </div>
  );
}