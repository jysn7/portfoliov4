'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const emailAddress = "jysnbly7@gmail.com";

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onMouseEnter = () => {
    gsap.to(emailRef.current, {
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const onMouseLeave = () => {
    gsap.to(emailRef.current, {
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div className="lg:col-span-7 flex flex-col px-6 justify-end items-start lg:items-end order-2 lg:order-1">
      <div className="flex flex-col items-start lg:items-end group">
        <p className="text-[10px] uppercase tracking-[0.4em] mb-4 text-muted-foreground flex items-center gap-2">
          <span className="w-8 h-px bg-border group-hover:w-12 group-hover:bg-foreground transition-all duration-500" />
          {copied ? "Address Copied" : "Want to work?"}
        </p>

        <a
          ref={emailRef}
          href={`mailto:${emailAddress}`}
          onClick={handleCopy}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="
            relative
            text-2xl md:text-5xl lg:text-6xl
            font-light tracking-tighter
            text-foreground
            transition-colors duration-500
            leading-tight
            overflow-hidden
          "
        >
          {/* Main Text Layer */}
          <span className={`block transition-transform duration-500 ${copied ? '-translate-y-full opacity-0' : 'translate-y-0'}`}>
            {emailAddress}
          </span>

          {/* Feedback Layer (Click to Copy) */}
          <span 
            className={`
              absolute inset-0 flex items-center lg:justify-end text-muted-foreground
              transition-transform duration-500 pointer-events-none
              ${copied ? 'translate-y-0' : 'translate-y-full'}
            `}
          >
            Copied to clipboard
          </span>
          
          {/* Minimalist animated underline */}
          <div className="w-full h-px bg-border mt-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-foreground -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-expo" />
          </div>
        </a>
      </div>
    </div>
  );
}