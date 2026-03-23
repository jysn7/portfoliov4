'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { works, Category } from '@/lib/works';
import WorksHeader from '@/components/works/WorksHeader';
import TitlesSpine from '@/components/works/TitlesSpine';
import WorkCard from '@/components/works/WorkCard';

gsap.registerPlugin(ScrollTrigger);

export default function WorksPage() {
  const scope = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState<Category | "All">("All");

  const filterOptions: (Category | "All")[] = ["All", "Web", "Game", "3d", "Experimental"];

  const filteredWorks =
    activeFilter === "All"
      ? works
      : works.filter((w) => w.category === activeFilter);

  useEffect(() => {
    if (!titleContainerRef.current) return;

    const titles = titleContainerRef.current.children;
    const activeTitle = titles[activeIdx] as HTMLElement;

    if (activeTitle) {
      const scrollTo =
        activeTitle.offsetTop -
        window.innerHeight / 2 +
        activeTitle.offsetHeight / 2;

      gsap.to(titleContainerRef.current, {
        y: -Math.max(0, scrollTo),
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, [activeIdx]);

  // Scroll triggers
  useEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.getAll().forEach((st) => st.kill());

      const projects = gsap.utils.toArray<HTMLElement>('.project-content');

      projects.forEach((project, i) => {
        ScrollTrigger.create({
          trigger: project,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveIdx(i),
          onEnterBack: () => setActiveIdx(i),
        });
      });

      ScrollTrigger.create({
        trigger: ".works-grid",
        start: "top 180px",
        end: "bottom bottom",
        pin: ".titles-spine-wrapper",
        pinSpacing: false,
      });
    }, scope);

    return () => ctx.revert();
  }, [filteredWorks.length]);

  return (
    <main ref={scope} className="w-full select-none overflow-x-hidden">
      <div className="max-w-350 mx-auto pt-75 pl-22 pr-12">

        <WorksHeader
          activeFilter={activeFilter}
          setActiveFilter={(f) => {
            setActiveFilter(f);
            setActiveIdx(0);
          }}
          filterOptions={filterOptions}
        />

        <div className="works-grid flex flex-col md:flex-row w-full">

          <TitlesSpine
            works={filteredWorks}
            activeIdx={activeIdx}
            titleContainerRef={titleContainerRef}
          />

          <div className="w-full md:w-1/2 flex flex-col gap-y-[10vh] pb-[40vh]">
            {filteredWorks.map((project, i) => (
              <WorkCard key={project.id} project={project} index={i} />
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}