'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function VideoPlayer({ src }: { src: string }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full h-full group/video">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-4 right-4 z-10 p-3 rounded-full bg-background/20 backdrop-blur-md border border-border text-foreground opacity-0 group-hover/video:opacity-100 transition"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}