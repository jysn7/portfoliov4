'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const paragraphs = gsap.utils.toArray<HTMLParagraphElement>(
        '.about-text p'
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Header reveal
      tl.from(headerRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: "power3.out",
      });

      // Border fade in
      tl.fromTo(
        headerRef.current,
        { borderColor: "transparent" },
        {
          borderColor: "rgba(255,255,255,0.1)",
          duration: 1,
          ease: "power2.out",
        },
        "-=0.6"
      );

      // Paragraphs
      tl.from(paragraphs, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.18,
        ease: "power3.out",
      }, "-=0.4");

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="lg:col-span-5 px-4 sm:px-0 flex flex-col pt-2"
    >
      <h2
        ref={headerRef}
        className="
          text-xs md:text-sm
          uppercase tracking-[0.3em]
          font-semibold
          border-b border-border
          pb-6 mb-10 md:mb-12
          text-muted-foreground
          text-right md:text-left
        "
      >
        About Me
      </h2>

      <div className="about-text flex flex-col gap-8 md:gap-10 text-sm md:text-base font-light text-foreground leading-[1.8] tracking-wide">
        <p>
          I am currently in my third year pursuing a{' '}
          <span className="font-semibold text-foreground">
            Bachelor of Computer Science
          </span>
          . My focus is entirely dedicated to the web platform, bridging the gap
          between complex architectural logic and seamless user experiences.
        </p>

        <p>
          My primary expertise lies in{' '}
          <span className="font-semibold text-foreground">
            modern web development frameworks
          </span>{' '}
          and{' '}
          <span className="font-semibold text-foreground">
            serverless architectures
          </span>
          . I have built several full-stack applications, and I find immense
          satisfaction in exploring new technologies and refining UI states.
        </p>

        <p>
          Outside of writing code, I pursue creative hobbies: I design, do
          photography, practice cinematography, write screenplays, make music,
          and draw and paint.
        </p>
      </div>
    </div>
  );
}