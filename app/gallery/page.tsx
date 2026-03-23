'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Volume2, VolumeX } from 'lucide-react';
import { projectItems, GalleryItem } from '@/lib/gallery';

gsap.registerPlugin(ScrollTrigger);

function VideoPlayer({ src }: { src: string }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full group/video bg-muted/5">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-auto block transition-transform duration-1000 scale-[1.02] group-hover/video:scale-100"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover/video:opacity-100 transition-opacity duration-300"
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
}

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const leftColumn = projectItems.filter((_, i) => i % 2 === 0);
  const rightColumn = projectItems.filter((_, i) => i % 2 !== 0);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(rightColRef.current, 
          { y: "5vh" }, 
          {
            y: "-15vh",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            }
          }
        );

        gsap.to(leftColRef.current, {
          y: "5vh",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="w-full max-w-350 mx-auto pt-75 pl-18 md:pl-22 pr-12 select-none">
      <div className="flex flex-col gap-4 mb-32 border-b border-border pb-6 md:pb-12">
        <h1 className="text-6xl md:text-[8rem] font-thin tracking-tighter uppercase leading-none text-foreground">
          Gallery
        </h1>
        <div className="flex justify-between flex-col md:flex-row items-start md:items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.5em]">
            Art Collection
          </p>
          <span className="text-sm tracking-[0.2em] opacity-40 text-foreground ">@amant.dur</span>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-col md:flex-row gap-16 md:gap-24 mb-60">
        <div ref={leftColRef} className="flex-1 flex flex-col gap-24 md:gap-40">
          {leftColumn.map((item, i) => (
            <PhotoCard key={i} item={item} index={i * 2} />
          ))}
        </div>

        <div ref={rightColRef} className="flex-1 flex flex-col gap-24 md:gap-40 md:mt-32">
          {rightColumn.map((item, i) => (
            <PhotoCard key={i} item={item} index={(i * 2) + 1} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PhotoCard({ item, index }: { item: GalleryItem, index: number }) {
  return (
    <div className="flex flex-col gap-6 group">
      <div className="flex items-start gap-4 md:gap-6">
        <div className="pt-1">
          <span className="text-sm md:text-xl font-thin opacity-30 tracking-tighter text-foreground">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="relative w-full overflow-hidden bg-muted/5">
            {item.isVideo ? (
              <VideoPlayer src={item.image} />
            ) : (
              <Image 
                src={item.image} 
                alt={item.title} 
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto block transition-all duration-1000 ease-in-out scale-[1.02] group-hover:scale-100"
                priority={index < 4}
              />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-2xl md:text-3xl font-light uppercase tracking-tight leading-none text-foreground">
                {item.title}
              </h2>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.3em]">
                {item.status}
              </span>
            </div>
            
            <div className="flex flex-col w-full border-t border-border/40">
              <div className="flex justify-between items-center py-4 border-b border-border/40">
                <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 text-muted-foreground">Category</span>
                <span className="text-[10px] uppercase tracking-widest text-foreground">{item.category}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-border/40">
                <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 text-muted-foreground">Medium</span>
                <span className="text-[10px] uppercase tracking-widest text-foreground">{item.medium}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}