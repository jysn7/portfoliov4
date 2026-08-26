'use client';

import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';

export default function Portfolio() {
  return (
    <main className="flex-1 w-full max-w-350 mx-auto flex flex-col z-10 relative">
      <Hero />
      <Contact />
      <About />
    </main>
  );
}