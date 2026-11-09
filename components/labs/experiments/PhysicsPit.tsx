'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Body as MatterBody } from 'matter-js';
import { MINI, MINI_ON, MINI_OFF, clamp } from '@/lib/labs/constants';
import { useTokens, fitCanvas } from '@/lib/labs/tokens';
import { useOnScreen } from '@/lib/labs/hooks';

export function PhysicsPit() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tokens = useTokens(rootRef);
  const visible = useOnScreen(rootRef);
  const api = useRef<{ flip: () => boolean; clear: () => void } | null>(null);
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 size-full touch-pan-y';
    root.prepend(canvas);

    let cancelled = false;
    let dispose = () => {};

    (async () => {
      const mod = await import('matter-js');
      if (cancelled) return;
      const M = (mod as unknown as { default?: typeof mod }).default ?? mod;
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Query } = M;

      const engine = Engine.create();
      engine.gravity.y = 1;
      const shapes: MatterBody[] = [];
      let walls: MatterBody[] = [];
      let ctx: CanvasRenderingContext2D | null = null;
      let w = 0;
      let h = 0;
      const inks = ['fg', 'primary', 'card'] as const;

      let mouse: ReturnType<typeof Mouse.create> | null = null;
      if (window.matchMedia('(pointer: fine)').matches) {
        mouse = Mouse.create(canvas);
        const m = mouse as unknown as { mousewheel: EventListener };
        canvas.removeEventListener('mousewheel', m.mousewheel);
        canvas.removeEventListener('DOMMouseScroll', m.mousewheel);
        Composite.add(
          engine.world,
          MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.18, render: { visible: false } },
          })
        );
      }

      const buildWalls = () => {
        if (walls.length) Composite.remove(engine.world, walls);
        const th = 200;
        walls = [
          Bodies.rectangle(w / 2, h + th / 2, w * 3, th, { isStatic: true }),
          Bodies.rectangle(w / 2, -th / 2, w * 3, th, { isStatic: true }),
          Bodies.rectangle(-th / 2, h / 2, th, h * 4, { isStatic: true }),
          Bodies.rectangle(w + th / 2, h / 2, th, h * 4, { isStatic: true }),
        ];
        Composite.add(engine.world, walls);
      };

      const spawn = (x: number, y: number) => {
        const scale = w > 700 ? 1.45 : 1;
        const r = (12 + Math.random() * 14) * scale;
        const o = { restitution: 0.5, friction: 0.15, frictionAir: 0.005 };
        const k = Math.floor(Math.random() * 3);
        const b =
          k === 0
            ? Bodies.circle(x, y, r, o)
            : k === 1
              ? Bodies.rectangle(x, y, r * 2, r * 2, { ...o, chamfer: { radius: 5 } })
              : Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 3), r * 1.15, o);
        Body.setAngle(b, Math.random() * Math.PI);
        b.plugin.ink = inks[Math.floor(Math.random() * inks.length)];
        shapes.push(b);
        Composite.add(engine.world, b);
        if (shapes.length > 110) {
          const old = shapes.shift();
          if (old) Composite.remove(engine.world, old);
        }
      };

      const resize = () => {
        const nw = root.clientWidth;
        const nh = root.clientHeight;
        if (!nw || !nh) return;
        const first = !w;
        w = nw;
        h = nh;
        ctx = fitCanvas(canvas, w, h);
        if (mouse) mouse.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        buildWalls();
        if (first) {
          const n = clamp(Math.round((w * h) / 18000), 14, 44);
          for (let i = 0; i < n; i++) spawn(20 + Math.random() * (w - 40), 20 + Math.random() * h * 0.4);
        }
      };

      const draw = () => {
        if (!ctx) return;
        const tk = tokens.current;
        const fill = { fg: tk.fg, primary: tk.primary, card: tk.card };
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tk.fg;
        shapes.forEach((b) => {
          ctx!.beginPath();
          if (b.circleRadius) {
            ctx!.arc(b.position.x, b.position.y, b.circleRadius, 0, Math.PI * 2);
          } else {
            const v = b.vertices;
            ctx!.moveTo(v[0].x, v[0].y);
            for (let i = 1; i < v.length; i++) ctx!.lineTo(v[i].x, v[i].y);
            ctx!.closePath();
          }
          ctx!.fillStyle = fill[b.plugin.ink as keyof typeof fill];
          ctx!.fill();
          ctx!.stroke();
          if (b.circleRadius) {
            ctx!.beginPath();
            ctx!.moveTo(b.position.x, b.position.y);
            ctx!.lineTo(
              b.position.x + Math.cos(b.angle) * b.circleRadius,
              b.position.y + Math.sin(b.angle) * b.circleRadius
            );
            ctx!.stroke();
          }
        });
      };

      const tick = () => {
        if (!visible.current || !w) return;
        Engine.update(engine, Math.min(gsap.ticker.deltaRatio(60) * 16.667, 33));
        draw();
      };

      const onDown = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        const p = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (Query.point(shapes, p).length) return;
        spawn(p.x, p.y);
      };
      canvas.addEventListener('pointerdown', onDown);

      const ro = new ResizeObserver(resize);
      ro.observe(root);
      resize();
      gsap.ticker.add(tick);

      api.current = {
        flip: () => {
          engine.gravity.y = engine.gravity.y > 0 ? -0.8 : 1;
          return engine.gravity.y < 0;
        },
        clear: () => {
          shapes.splice(0).forEach((b) => Composite.remove(engine.world, b));
        },
      };

      dispose = () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        canvas.removeEventListener('pointerdown', onDown);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    })();

    return () => {
      cancelled = true;
      dispose();
      api.current = null;
      canvas.remove();
    };
  }, [tokens, visible]);

  return (
    <div ref={rootRef} className="relative size-full">
      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
        <button
          type="button"
          aria-pressed={inverted}
          onClick={() => setInverted(api.current?.flip() ?? false)}
          className={`${MINI} ${inverted ? MINI_ON : MINI_OFF}`}
        >
          Flip gravity
        </button>
        <button type="button" onClick={() => api.current?.clear()} className={`${MINI} ${MINI_OFF}`}>
          Clear
        </button>
      </div>
    </div>
  );
}