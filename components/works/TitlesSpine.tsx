'use client';

import { Work } from '@/lib/works';

export default function TitlesSpine({
  works,
  activeIdx,
  titleContainerRef,
}: {
  works: Work[];
  activeIdx: number;
  titleContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="titles-spine-wrapper hidden md:block w-1/2 h-screen overflow-hidden pr-24">
      <div ref={titleContainerRef} className="flex flex-col h-fit">
        {works.map((project, i) => (
          <div
            key={project.id}
            className={`flex flex-col gap-1 py-4 border-b border-border/50 transition-all duration-700 ${
              activeIdx === i ? 'opacity-100 translate-x-4' : 'opacity-20'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {(i + 1).toString().padStart(2, '0')}
            </span>

            <h2 className="text-3xl lg:text-4xl font-light uppercase tracking-tighter text-foreground">
              {project.title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}