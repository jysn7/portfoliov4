'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Github, Linkedin, Instagram, Twitter, MessageCircle, Mail } from 'lucide-react';

export default function ContactPage() {
  const scope = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.4 } });

      const formElements = formRef.current?.children;

      tl.fromTo(titleRef.current, 
        { y: 80, opacity: 0 }, 
        { y: 0, opacity: 1, delay: 0.1 }
      )
      .fromTo(leftColRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0 },
        "-=1.1"
      );

      if (formElements && formElements.length > 0) {
        tl.fromTo(formElements, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.1 }, 
          "-=1.2"
        );
      }
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={scope} className="w-full select-none overflow-x-hidden">
      <div className="max-w-350 mx-auto pt-75 pl-22 pr-6 pb-40">
        
        {/* Header */}
        <div className="max-w-full flex flex-col gap-12 mb-24 border-b border-border pb-20 relative">
          <h1 ref={titleRef} className="text-5xl md:text-[8rem] font-thin tracking-tighter uppercase leading-none text-foreground">
            Contact
          </h1>
          
          <div className="max-w-xl">
            <p className="text-sm text-foreground font-extralight italic tracking-widest leading-relaxed">
              have a project in mind or just want to chat? 
              drop a message below. i usually respond 
              faster than a compiler error.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-20">
          
          {/* Left Column */}
          <div ref={leftColRef} className="w-full md:w-1/3 flex flex-col gap-16">
            
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.5em]">Connect</span>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'email', icon: Mail, val: 'jysnbly7@gmail.com' },
                    { label: 'linkedin', icon: Linkedin, val: 'jayson-baloyi' },
                    { label: 'instagram', icon: Instagram, val: '@amant.dur' },
                    { label: 'twitter', icon: Twitter, val: '@jyysn7' },
                    { label: 'whatsapp', icon: MessageCircle, val: '+27 78 034 5709' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 group cursor-pointer">
                      <item.icon size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-xs tracking-widest text-foreground/70 group-hover:text-foreground transition-all">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.5em]">Location</span>
                <p className="text-xs tracking-widest text-foreground font-light">johannesburg, south africa</p>
              </div>
            </div>

            {/* Map */}
            <div className="w-full aspect-video bg-muted/10 border border-border  overflow-hidden  transition-all duration-1000">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114964.38271708293!2d28.10660235!3d-25.74786765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95619cae60f215%3A0x1d3780c1df07270f!2sPretoria!5e0!3m2!1sen!2sza!4v1711220000000!5m2!1sen!2sza"
                className="w-full h-full opacity-40 hover:opacity-100 transition-opacity"
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Right Column */}
          <form 
            ref={formRef}
            className="w-full md:w-1/2 flex flex-col gap-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-4">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.3em] ml-1">name</label>
              <input 
                type="text" 
                placeholder="your name"
                className="bg-transparent border border-border rounded-lg px-6 py-5 text-xs tracking-widest focus:outline-none focus:border-foreground transition-all placeholder:opacity-20"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.3em] ml-1">email</label>
              <input 
                type="email" 
                placeholder="email@address.com"
                className="bg-transparent border border-border rounded-lg px-6 py-5 text-xs tracking-widest focus:outline-none focus:border-foreground transition-all placeholder:opacity-20"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs text-muted-foreground uppercase tracking-[0.3em] ml-1">message</label>
              <textarea 
                rows={6}
                placeholder="tell me about the project"
                className="bg-transparent border border-border rounded-lg px-6 py-5 text-xs tracking-widest focus:outline-none focus:border-foreground transition-all placeholder:opacity-20 resize-none"
              />
            </div>

            <div className="pt-6">
                <button 
                    type="submit"
                    className="group relative flex items-center gap-8 py-4 bg-foreground px-10 border border-border rounded-lg overflow-hidden transition-all duration-700 hover:border-foreground active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-foreground translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />

                    <span className="relative z-10 text-xs text-background uppercase tracking-[0.5em] transition-colors duration-500 group-hover:text-background">
                    send message
                    </span>

                    <div className="relative z-10 w-0 h-px bg-background transition-all duration-500 group-hover:w-6" />
                </button>
                </div>
          </form>
        </div>

      </div>
    </main>
  );
}