'use client';

import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';

export default function Portfolio() {
  return (
    <main className="flex-1 w-full max-w-350 mx-auto flex flex-col z-10 relative">
      <Hero />

      <div className="grid pl-18 md:pl-22 grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 mt-32 md:mt-48 lg:mt-64 pb-12">
        <Contact />
        <About />
      </div>
    </main>
  );
}