'use client';

import Hero from '../components/landing/new-hero';
import About from '../components/landing/About';
import Contact from '../components/landing/Contact';
import Projects from '../components/landing/projects';
import Signpost from '../components/landing/signpost';

export default function Portfolio() {
  return (
    <main className="">
      <Hero />
      <About />
      <Projects />
      <Signpost />
    </main>
  );
}