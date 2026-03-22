export interface GalleryItem {
  title: string;
  category: string;
  medium: string;
  status: string;
  image: string;
  isVideo?: boolean;
}

export const projectItems: GalleryItem[] = [
  // PHOTOGRAPHY SECTION
  { 
    title: "Echoes of the Aisle", 
    category: "Photography", 
    medium: "Digital / Film Aesthetic", 
    status: "Cape Town", 
    image: "/gallery/g1.jpg" 
  },
  { 
    title: "The Silent Watcher", 
    category: "Photography", 
    medium: "Digital / Natural", 
    status: "Pretoria", 
    image: "/gallery/g3.jpg" 
  },
  { 
    title: "Stone Solitude", 
    category: "Photography", 
    medium: "B&W Digital", 
    status: "Studio", 
    image: "/gallery/g4.jpg" 
  },
  { 
    title: "Vertical Zen", 
    category: "Photography", 
    medium: "Macro", 
    status: "Sandton", 
    image: "/gallery/g5.jpg" 
  },
  { 
    title: "Split Symmetry", 
    category: "Photography", 
    medium: "Digital / Wide", 
    status: "Studio", 
    image: "/gallery/g7.jpg" 
  },
  { 
    title: "Cargo of Memories", 
    category: "Photography", 
    medium: "Digital / Street", 
    status: "Braam", 
    image: "/gallery/g8.jpg" 
  },

  // ART SECTION (Drawings d1-d4)
  { 
    title: "Crown of Texture", 
    category: "Drawing", 
    medium: "Graphite", 
    status: "Studio", 
    image: "/gallery/art/d1.jpg" 
  },
  { 
    title: "Playful Defiance", 
    category: "Drawing", 
    medium: "Graphite", 
    status: "Studio", 
    image: "/gallery/art/d2.jpg" 
  },
  { 
    title: "Retro Nostalgia", 
    category: "Drawing", 
    medium: "Graphite", 
    status: "Studio", 
    image: "/gallery/art/d3.jpg" 
  },
  { 
    title: "Eastern Grace", 
    category: "Drawing", 
    medium: "Graphite", 
    status: "Studio", 
    image: "/gallery/art/d4.jpg" 
  },
  
  // ART VIDEOS (d5-d8)
  { 
    title: "Brief Interruption", 
    category: "Experimental", 
    medium: "Motion Portrait", 
    status: "Studio", 
    image: "/gallery/art/d6.mp4", 
    isVideo: true 
  },
  { 
    title: "Visceral Release", 
    category: "Experimental", 
    medium: "Digital Animation", 
    status: "Studio", 
    image: "/gallery/art/d8.mp4", 
    isVideo: true 
  }
];