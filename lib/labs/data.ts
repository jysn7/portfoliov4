import type { ComponentType } from 'react';
import { Throwables } from '@/components/labs/experiments/Throwables';
import { FlipShuffle } from '@/components/labs/experiments/FlipShuffle';
import { PhysicsPit } from '@/components/labs/experiments/PhysicsPit';
import { FlowField } from '@/components/labs/experiments/FlowField';
import { WaveType } from '@/components/labs/experiments/WaveType';
import { PathFollower } from '@/components/labs/experiments/PathFollower';
import { HoloCard } from '@/components/labs/experiments/HoloCard';
import { RotaryShapes } from '@/components/labs/experiments/RotaryShapes';
import { VelocityMarquee } from '@/components/labs/experiments/VelocityMarquee';
import { TinySynth } from '@/components/labs/experiments/TinySynth';
import {
  PreviewThrow,
  PreviewShuffle,
  PreviewPit,
  PreviewFlow,
  PreviewWave,
  PreviewPath,
  PreviewHolo,
  PreviewRotary,
  PreviewMarquee,
  PreviewSynth,
} from '@/components/labs/previews';

export type Lab = {
  id: string;
  title: string;
  kind: string;
  libs: string[];
  description: string;
  hint: string;
  Demo: ComponentType;
  Preview: ComponentType;
};

export const LABS: Lab[] = [
  {
    id: 'throw',
    title: 'Throwables',
    kind: 'GSAP',
    libs: ['Draggable', 'InertiaPlugin'],
    description:
      'Tiles with real momentum. Fling one and it coasts, tilts with your hand and settles against the walls.',
    hint: 'Drag and throw, or double-click to scatter.',
    Demo: Throwables,
    Preview: PreviewThrow,
  },
  {
    id: 'shuffle',
    title: 'Shuffle',
    kind: 'GSAP',
    libs: ['Flip'],
    description:
      'Twelve cards that keep their identity while the layout changes underneath them.',
    hint: 'Switch layouts, then shuffle.',
    Demo: FlipShuffle,
    Preview: PreviewShuffle,
  },
  {
    id: 'pit',
    title: 'The Pit',
    kind: 'Physics',
    libs: ['matter-js', 'GSAP ticker'],
    description:
      'A tiny physics sandbox. Drop shapes, drag them around, flip gravity and watch the pile reorganise.',
    hint: 'Click empty space to drop a shape.',
    Demo: PhysicsPit,
    Preview: PreviewPit,
  },
  {
    id: 'flow',
    title: 'Flow Field',
    kind: 'Canvas',
    libs: ['Canvas 2D', 'GSAP ticker'],
    description:
      'Hundreds of particles riding an invisible current that your cursor pushes against.',
    hint: 'Move through it, click to stir.',
    Demo: FlowField,
    Preview: PreviewFlow,
  },
  {
    id: 'wave',
    title: 'Wave Type',
    kind: 'Type',
    libs: ['quickSetter', 'GSAP ticker'],
    description:
      'Type that behaves like water. Tune the amplitude and speed, and hover for extra swell.',
    hint: 'Drag the sliders.',
    Demo: WaveType,
    Preview: PreviewWave,
  },
  {
    id: 'path',
    title: 'Draw a Path',
    kind: 'SVG',
    libs: ['MotionPathPlugin'],
    description:
      'Sketch any line and a little ship with a trail follows it, steering by the curve.',
    hint: 'Draw anywhere on the canvas.',
    Demo: PathFollower,
    Preview: PreviewPath,
  },
  {
    id: 'holo',
    title: 'Holo Card',
    kind: '3D',
    libs: ['quickTo', 'CSS 3D'],
    description:
      'A business card with depth: layered parallax, a moving sheen and a flip to the back.',
    hint: 'Hover to tilt, click to flip.',
    Demo: HoloCard,
    Preview: PreviewHolo,
  },
  {
    id: 'rotary',
    title: 'Rotary',
    kind: 'GSAP',
    libs: ['Draggable', 'InertiaPlugin'],
    description:
      'Three knobs with weight. Each one rotates, coasts and drives a live shape.',
    hint: 'Turn the knobs.',
    Demo: RotaryShapes,
    Preview: PreviewRotary,
  },
  {
    id: 'marquee',
    title: 'Velocity Marquee',
    kind: 'Type',
    libs: ['ScrollTrigger'],
    description:
      'Rows of type that speed up, skew and reverse with how hard you scroll the page.',
    hint: 'Scroll the page and watch the rows.',
    Demo: VelocityMarquee,
    Preview: PreviewMarquee,
  },
  {
    id: 'synth',
    title: 'Tiny Synth',
    kind: 'Audio',
    libs: ['Web Audio API'],
    description:
      'Eight pentatonic keys, four waveforms and a live oscilloscope. Every sound is generated in the browser.',
    hint: 'Click the keys, or focus it and press A to K.',
    Demo: TinySynth,
    Preview: PreviewSynth,
  },
];

export const FILTERS = ['All', ...Array.from(new Set(LABS.map((l) => l.kind)))];