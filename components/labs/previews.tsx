'use client';

import type { ReactNode } from 'react';
import { HEADING } from '@/lib/labs/constants';
import { TAU } from '@/lib/labs/constants';

const PV = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" className="size-full" aria-hidden>
    {children}
  </svg>
);

export function PreviewThrow() {
  const tiles: [number, number, number, string, string, string][] = [
    [16, 18, -10, 'L', 'fill-foreground', 'fill-background'],
    [60, 54, 8, 'A', 'fill-primary', 'fill-primary-foreground'],
    [104, 16, -6, 'B', 'fill-card stroke-foreground', 'fill-foreground'],
    [106, 68, 10, '!', 'fill-foreground', 'fill-background'],
    [22, 70, 5, 'S', 'fill-muted', 'fill-foreground'],
  ];
  return (
    <PV>
      {tiles.map(([x, y, r, ch, box, txt]) => (
        <g key={ch} transform={`translate(${x} ${y}) rotate(${r} 17 17)`}>
          <rect width="34" height="34" rx="8" strokeWidth="1.5" className={box} />
          <text x="17" y="25" textAnchor="middle" fontSize="20" fontWeight="600" className={txt} style={HEADING}>
            {ch}
          </text>
        </g>
      ))}
    </PV>
  );
}

export function PreviewShuffle() {
  const fills = ['fill-foreground', 'fill-primary', 'fill-card stroke-border', 'fill-muted'];
  return (
    <PV>
      {Array.from({ length: 12 }).map((_, i) => {
        const c = i % 4;
        const r = Math.floor(i / 4);
        return (
          <rect
            key={i}
            x={22 + c * 32}
            y={18 + r * 30}
            width="24"
            height="24"
            rx="6"
            strokeWidth="1.5"
            className={fills[(i * 3 + r) % 4]}
          />
        );
      })}
    </PV>
  );
}

export function PreviewPit() {
  return (
    <PV>
      <line x1="8" y1="106" x2="152" y2="106" strokeWidth="2" className="stroke-border" />
      <g strokeWidth="2" strokeLinejoin="round" className="stroke-foreground">
        <circle cx="34" cy="90" r="15" className="fill-foreground" />
        <rect x="56" y="78" width="28" height="28" rx="5" className="fill-primary" />
        <circle cx="102" cy="93" r="12" className="fill-card" />
        <polygon points="120,106 148,106 134,80" className="fill-foreground" />
        <circle cx="68" cy="60" r="11" className="fill-primary" />
        <rect x="100" y="56" width="20" height="20" rx="4" transform="rotate(22 110 66)" className="fill-card" />
        <circle cx="36" cy="62" r="9" className="fill-card" />
      </g>
    </PV>
  );
}

export function PreviewFlow() {
  return (
    <PV>
      {[28, 44, 60, 76, 92].map((y, i) => (
        <path
          key={y}
          d={`M6 ${y} C44 ${y - 36} 76 ${y + 30} 110 ${y - 6} S148 ${y - 30} 156 ${y - 14}`}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeOpacity={i === 2 ? 1 : 0.55}
          className={`fill-none ${i === 2 ? 'stroke-primary' : 'stroke-foreground'}`}
        />
      ))}
    </PV>
  );
}

export function PreviewWave() {
  const ys = [66, 52, 70, 56];
  const rot = [-8, 6, -6, 8];
  return (
    <PV>
      <path d="M8 96 Q 28 80 48 96 T 88 96 T 128 96 T 160 96" strokeWidth="2" strokeLinecap="round" className="fill-none stroke-border" />
      {Array.from('Wave').map((ch, i) => {
        const x = 28 + i * 34;
        return (
          <text
            key={i}
            x={x}
            y={ys[i]}
            textAnchor="middle"
            fontSize="40"
            fontWeight="600"
            transform={`rotate(${rot[i]} ${x} ${ys[i] - 12})`}
            className={i === 2 ? 'fill-primary' : 'fill-foreground'}
            style={HEADING}
          >
            {ch}
          </text>
        );
      })}
    </PV>
  );
}

const lemn = (tt: number) => {
  const d = 1 + Math.sin(tt) ** 2;
  return { x: 80 + (58 * Math.cos(tt)) / d, y: 60 + (58 * 1.4 * Math.sin(tt) * Math.cos(tt)) / d };
};

export function PreviewPath() {
  const d = Array.from({ length: 65 }, (_, i) => {
    const p = lemn((i / 64) * TAU);
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  const t0 = 1.0;
  const head = lemn(t0);
  const next = lemn(t0 + 0.02);
  const ang = (Math.atan2(next.y - head.y, next.x - head.x) * 180) / Math.PI;
  return (
    <PV>
      <path d={d} strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" className="fill-none stroke-border" />
      {[1, 2, 3, 4].map((k) => {
        const p = lemn(t0 - k * 0.14);
        return <circle key={k} cx={p.x} cy={p.y} r={5 - k * 0.8} className="fill-primary" opacity={1 - k * 0.2} />;
      })}
      <polygon points="9,0 -6,6 -6,-6" transform={`translate(${head.x} ${head.y}) rotate(${ang})`} className="fill-foreground" />
    </PV>
  );
}

export function PreviewHolo() {
  return (
    <PV>
      <g transform="rotate(9 80 60)">
        <rect x="48" y="14" width="56" height="84" rx="8" className="fill-foreground" />
      </g>
      <g transform="rotate(-6 80 60)">
        <rect x="52" y="14" width="56" height="84" rx="8" strokeWidth="1.5" className="fill-card stroke-foreground" />
        <rect x="60" y="22" width="20" height="3" rx="1.5" className="fill-muted" />
        <text x="80" y="64" textAnchor="middle" fontSize="26" fontWeight="600" className="fill-foreground" style={HEADING}>
          JB
        </text>
        <rect x="60" y="82" width="34" height="3" rx="1.5" className="fill-foreground" />
        <rect x="60" y="89" width="22" height="3" rx="1.5" className="fill-muted" />
        <polygon points="92,14 102,14 82,98 72,98" className="fill-foreground" opacity="0.07" />
      </g>
    </PV>
  );
}

export function PreviewRotary() {
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * TAU - Math.PI / 2;
    return `${(80 + Math.cos(a) * 32).toFixed(1)},${(46 + Math.sin(a) * 32).toFixed(1)}`;
  }).join(' ');
  return (
    <PV>
      <polygon points={hex} strokeWidth="2" strokeLinejoin="round" className="fill-primary stroke-foreground" />
      {[44, 80, 116].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="98" r="10" strokeWidth="2" className="fill-card stroke-foreground" />
          <line
            x1={x}
            y1="98"
            x2={x}
            y2="91"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${[-50, 20, 70][i]} ${x} 98)`}
            className="stroke-foreground"
          />
        </g>
      ))}
    </PV>
  );
}

export function PreviewMarquee() {
  const rows: [number, string, number[]][] = [
    [22, 'fill-foreground', [34, 18, 46, 22, 30]],
    [52, 'fill-muted', [22, 40, 16, 38, 26]],
    [82, 'fill-foreground', [44, 16, 30, 28, 24]],
  ];
  return (
    <PV>
      {rows.map(([y, cls, ws]) => {
        let x = 4;
        return (
          <g key={y} transform="skewX(-12)">
            {ws.map((w, i) => {
              const el = <rect key={i} x={x + 22} y={y} width={w} height="16" rx="6" className={cls} />;
              x += w + 8;
              return el;
            })}
          </g>
        );
      })}
    </PV>
  );
}

export function PreviewSynth() {
  const wavePath = Array.from({ length: 41 }, (_, i) => {
    const x = 8 + i * 3.6;
    const y = 38 + Math.sin(i * 0.55) * 18 * Math.sin((i / 40) * Math.PI);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <PV>
      <path d={wavePath} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-foreground" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={13 + i * 17}
          y="72"
          width="14"
          height="32"
          rx="4"
          strokeWidth="1.5"
          className={i === 4 ? 'fill-primary stroke-foreground' : 'fill-card stroke-border'}
        />
      ))}
    </PV>
  );
}