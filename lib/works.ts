export type Category = "All" | "Web" | "Game" | "3d" | "Experimental";

export interface Work {
  id: string;
  title: string;
  description: string;
  image: string; // Can also be a video URL
  tech: string[];
  category: Category;

  hasGithub: boolean;
  githubUrl?: string;

  hasDemo: boolean;
  demoUrl?: string;

  isVideo?: boolean; // plays video if true
}

export const works: Work[] = [
  {
    id: "mono-studios-new",
    title: "Monostudios",
    description:
      "A modern web design agency website built to showcase services, selected work, and client case studies. The site features interactive sections, smooth scrolling transitions, and carefully crafted responsive layouts to deliver a polished, high-end user experience across all devices.",
    image: "/works/mono.png",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "kith",
    title: "Kith",
    description:
      "A full-stack, multi-vendor (C2C) marketplace platform designed to support independent sellers and buyers. The application focuses on scalability, clean UI patterns, and efficient data handling, providing a seamless browsing and purchasing experience.",
    image: "/works/kith.png",
    tech: ["Next.js", "TailwindCSS", "Supabase"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "edition",
    title: "Edition",
    description:
      "A full-stack blogging platform built with a strong emphasis on clean typography, dynamic content management, and performance. The platform supports markdown-based writing, responsive layouts, and smooth animations, delivering a refined reading and publishing experience.",
    image: "/works/edition.png",
    tech: ["Next.js", "Sanity.io", "GSAP", "CSS"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "plumbco-new",
    title: "Plumbco",
    description:
      "A professional plumbing services website designed to clearly present the company’s services, expertise, and customer testimonials. The site features a clean, modern interface with intuitive navigation and responsive layouts to ensure accessibility across all devices.",
    image: "/works/plumbco.png",
    tech: ["Next.js", "GSAP", "CSS"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "canvas-coat",
    title: "Canvas & Coat",
    description:
      "A painting services website created to highlight the company’s offerings, craftsmanship, and customer feedback. The design focuses on visual clarity, smooth interactions, and responsive layouts, providing a seamless user experience on both desktop and mobile.",
    image: "/works/canvas.png",
    tech: ["Next.js", "GSAP", "CSS"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "portfolio",
    title: "Personal Portfolio v1",
    description:
      "A typography-first portfolio exploring layout, motion, and modern frontend structure. Built with performance and accessibility in mind.",
    image: "/works/port.png",
    tech: ["Next.js", "TypeScript", "Tailwind", "GSAP"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    demoUrl: "https://jysn7.vercel.app",
    isVideo: false,
  },
  {
    id: "social",
    title: "Rabbit",
    description:
      "A real-time social platform with likes, comments, and notifications powered by Firebase.",
    image: "/works/Rabbit.png",
    tech: ["React", "Firebase", "Tailwind", "Vite"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    demoUrl: "https://rabbiit.vercel.app",
    isVideo: false,
  },
  {
    id: "soultrace",
    title: "Soultrace Henna",
    description: "A booking platform for henna artists and clients.",
    image: "/works/soultrace.png",
    tech: ["React", "Tailwind", "Nextjs"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    demoUrl: "https://soultrace.vercel.app",
    isVideo: false,
  },
  {
    id: "wordle",
    title: "Letterle",
    description:
      "A custom Wordle-style game focusing on state management and UI feedback.",
    image: "/works/Letter.png",
    tech: ["React", "TypeScript", "Zustand", "Tailwind"],
    category: "Web",
    hasGithub: false,
    hasDemo: true,
    isVideo: false,
  },
  {
    id: "street",
    title: "Low Poly Street",
    description:
      "A 3D low-poly scene of a street corner created in Blender, showcasing modeling, texturing, and lighting skills.",
    image: "/works/street.png",
    tech: ["Blender"],
    category: "3d",
    hasGithub: false,
    hasDemo: false,
    isVideo: false,
  },
  {
    id: "plushie",
    title: "Plushie",
    description:
      "A 3D plushie model created in Blender, showcasing texturing, hair particles and rendering skills.",
    image: "/works/plush.png",
    tech: ["Blender"],
    category: "3d",
    hasGithub: false,
    hasDemo: false,
    isVideo: false,
  },
  {
    id: "mira",
    title: "Mira Model",
    description:
      "A 3D character model created in Blender, showcasing texturing, animation and rendering skills.",
    image: "/works/mira-run.mp4",
    tech: ["Blender"],
    category: "3d",
    hasGithub: false,
    hasDemo: false,
    isVideo: true,
  },
  {
    id: "redhood",
    title: "Red Hood Game",
    description:
      "A 2D platformer game with basic mechanics, multiple levels, and a coin system.",
    image: "/works/RedHood.mp4",
    tech: ["Godot", "C#", "Aseprite"],
    category: "Game",
    hasGithub: false,
    hasDemo: false,
    isVideo: true,
  },
  {
    id: "frogknight",
    title: "Frog Knight Game",
    description:
      "A 2D platformer game with basic mechanics, multiple levels, and a coin system.",
    image: "/works/FrogKnight.mp4",
    tech: ["Godot", "C#", "Aseprite"],
    category: "Game",
    hasGithub: false,
    hasDemo: false,
    isVideo: true,
  },
  {
    id: "self-car",
    title: "Self Driving Car",
    description:
      "A self-driving car using reinforcement learning (ANN) to navigate a track, implemented entirely in Javascript.",
    image: "/works/self-driving-ann.mp4",
    tech: ["Javascript"],
    category: "Experimental",
    hasGithub: false,
    hasDemo: false,
    isVideo: true,
  },
  {
    id: "snake",
    title: "Snake AI",
    description:
      "A snake game where an AI learns to play via reinforcement learning and GNN, implemented entirely in Javascript.",
    image: "/works/snake-cnn.mp4",
    tech: ["Javascript"],
    category: "Experimental",
    hasGithub: false,
    hasDemo: false,
    isVideo: true,
  },
];
