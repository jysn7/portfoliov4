'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BODY, MINI, MINI_ON, MINI_OFF, FOCUS, TAU } from '@/lib/labs/constants';
import { useTokens, fitCanvas } from '@/lib/labs/tokens';
import { useOnScreen } from '@/lib/labs/hooks';

type Wave = 'sine' | 'triangle' | 'square' | 'sawtooth';
const WAVES: { id: Wave; label: string }[] = [
  { id: 'sine', label: 'Sine' },
  { id: 'triangle', label: 'Tri' },
  { id: 'square', label: 'Square' },
  { id: 'sawtooth', label: 'Saw' },
];
const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
const KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];

export function TinySynth() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokens = useTokens(rootRef);
  const visible = useOnScreen(rootRef);
  const audio = useRef<{ ctx: AudioContext; master: GainNode; an: AnalyserNode } | null>(null);
  const keyRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ripples = useRef<{ x: number; r: number; a: number }[]>([]);
  const wave = useRef<Wave>('triangle');
  const [waveUi, setWaveUi] = useState<Wave>('triangle');

  const ensure = () => {
    if (!audio.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.2;
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      master.connect(an);
      an.connect(ctx.destination);
      audio.current = { ctx, master, an };
    }
    if (audio.current.ctx.state === 'suspended') void audio.current.ctx.resume();
    return audio.current;
  };

  const play = (i: number) => {
    const { ctx, master } = ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave.current;
    osc.frequency.value = NOTES[i];
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(1, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 1);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    const el = keyRefs.current[i];
    if (el) {
      gsap.fromTo(
        el,
        { y: 5, scale: 0.94 },
        { y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' }
      );
    }
    ripples.current.push({ x: (i + 0.5) / NOTES.length, r: 0, a: 1 });
  };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!root || !canvas || !host) return;

    let ctx: CanvasRenderingContext2D | null = null;
    let w = 0;
    let h = 0;
    const data = new Uint8Array(512);

    const resize = () => {
      const nw = host.clientWidth;
      const nh = host.clientHeight;
      if (!nw || !nh) return;
      w = nw;
      h = nh;
      ctx = fitCanvas(canvas, w, h);
    };

    const tick = (_: number, delta: number) => {
      if (!visible.current || !ctx || !w) return;
      const dt = Math.min(delta, 50) / 1000;
      const tk = tokens.current;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      ripples.current = ripples.current.filter((r) => r.a > 0);
      ripples.current.forEach((r) => {
        ctx!.globalAlpha = Math.max(0, r.a);
        ctx!.strokeStyle = tk.primary;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(r.x * w, mid, r.r, 0, TAU);
        ctx!.stroke();
        r.r += dt * 180;
        r.a -= dt * 1.1;
      });
      ctx.globalAlpha = 1;

      ctx.beginPath();
      if (audio.current) {
        audio.current.an.getByteTimeDomainData(data);
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * w;
          const y = mid + ((data[i] - 128) / 128) * mid * 0.9;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
      } else {
        ctx.moveTo(0, mid);
        ctx.lineTo(w, mid);
      }
      ctx.strokeStyle = tk.fg;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, [tokens, visible]);

  useEffect(
    () => () => {
      audio.current?.ctx.close().catch(() => {});
      audio.current = null;
    },
    []
  );

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label="Tiny synth. Press the keys A to K to play."
      onKeyDown={(e) => {
        if (e.repeat) return;
        const i = KEYS.indexOf(e.key.toLowerCase());
        if (i >= 0) {
          e.preventDefault();
          play(i);
        }
      }}
      className="relative flex size-full flex-col outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-foreground"
    >
      <div className="relative min-h-0 flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      </div>

      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        {WAVES.map((wv) => (
          <button
            key={wv.id}
            type="button"
            aria-pressed={waveUi === wv.id}
            onClick={() => {
              wave.current = wv.id;
              setWaveUi(wv.id);
            }}
            className={`${MINI} ${waveUi === wv.id ? MINI_ON : MINI_OFF}`}
          >
            {wv.label}
          </button>
        ))}
      </div>

      <div className="grid h-28 grid-cols-8 gap-2 border-t border-border p-3 md:h-36" style={BODY}>
        {NOTES.map((_, i) => (
          <button
            key={i}
            ref={(el) => {
              keyRefs.current[i] = el;
            }}
            type="button"
            aria-label={`Play note ${i + 1}`}
            onPointerDown={() => play(i)}
            className={`flex items-end justify-center rounded-lg border border-border bg-background pb-2 text-xs uppercase text-muted-foreground transition-colors duration-200 hover:border-foreground ${FOCUS}`}
          >
            {KEYS[i]}
          </button>
        ))}
      </div>
    </div>
  );
}