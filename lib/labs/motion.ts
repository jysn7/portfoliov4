import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Flip } from 'gsap/dist/Flip';
import { Draggable } from 'gsap/dist/Draggable';
import { InertiaPlugin } from 'gsap/dist/InertiaPlugin';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip, Draggable, InertiaPlugin, MotionPathPlugin);
}

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const t = (s: number) => (reduced() ? 0 : s);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const pad = (n: number) => String(n).padStart(2, '0');