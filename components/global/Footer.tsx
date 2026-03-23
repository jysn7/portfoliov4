'use client';

import Link from 'next/link';

const navItems = [
  { name: 'Works', href: '/works' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

const socials = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/jayson-baloyi-2a01512b0' },
  { name: 'GitHub', href: 'https://github.com/jysn7' },
  { name: 'Instagram', href: 'https://instagram.com/amant.dur' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-background pt-32 pb-12 px-6 md:px-12 border-t border-border mt-40">
      <div className="max-w-350 mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-20">
        
        <div className="flex pl-18 md:pl-0 flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground ml-1">
            Web Designer & Developer
          </p>
          <h2 className="text-[15vw] md:text-[10vw] leading-[0.75] tracking-tighter uppercase font-medium">
            Jayson <br /> Baloyi
          </h2>
        </div>

        <div className="flex gap-20 md:gap-32 mb-4">
          
          {/* Navigation */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Menu</p>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="text-sm font-light tracking-widest hover:text-muted-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Connect</p>
            <div className="flex flex-col gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-light tracking-widest hover:text-muted-foreground transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-350 items-center mx-auto mt-24 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between gap-4 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
        <span>Johannesburg, South Africa</span>
        <span>© 2026 All Rights Reserved</span>
      </div>
    </footer>
  );
}