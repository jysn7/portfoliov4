'use client';

import Image from 'next/image';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import { Work } from '@/lib/works';

export default function WorkCard({
  project,
  index,
}: {
  project: Work;
  index: number;
}) {
  return (
    <div className="project-content flex flex-col gap-12 w-full">
      
      {/* Mobile title */}
      <div className="md:hidden flex flex-col gap-6 mb-2">
        <span className="text-2xl font-thin text-muted-foreground/40">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <h2 className="text-4xl font-light uppercase tracking-tighter text-foreground">
          {project.title}
        </h2>
      </div>

      {/* Media */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted/10">
        {project.isVideo ? (
          <VideoPlayer src={project.image} />
        ) : (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover hover:scale-105 transition duration-1000"
          />
        )}
      </div>

      {/* Content */}
      <p className="text-xl md:text-2xl text-foreground/90 font-light">
        {project.description}
      </p>

      <div className="pt-12 border-t border-border/50 flex flex-col gap-8">
        
        {/* Tech */}
        <div className="flex flex-wrap gap-3">
          {project.tech.map((tool) => (
            <div key={tool} className="text-xs border border-border px-5 py-2 rounded-full uppercase tracking-widest text-muted-foreground">
              {tool}
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4">
          {project.hasGithub && project.githubUrl && (
            <Link href={project.githubUrl} target="_blank" className="border border-border px-6 py-4 rounded-full text-xs uppercase hover:bg-foreground hover:text-background transition">
              Code
            </Link>
          )}

          {project.hasDemo && project.demoUrl && (
            <Link href={project.demoUrl} target="_blank" className="bg-foreground text-background px-8 py-4 rounded-full text-xs uppercase">
              Live Demo
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}