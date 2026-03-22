export default function Footer() {
  return (
    <footer className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mt-24 md:mt-32 border-t border-neutral-900 pt-12 gap-8 md:gap-0 z-20 relative">
      <div className="flex items-center gap-3 text-xs md:text-sm font-extralight text-neutral-600 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <span className="text-lg">©</span> Jayson Baloyi
        </span>
      </div>

      <div className="flex gap-10 text-neutral-500 uppercase tracking-widest text-[10px]">
        <a href="#" className="hover:text-neutral-200 transition-colors">
          LinkedIn
        </a>
        <a href="#" className="hover:text-neutral-200 transition-colors">
          GitHub
        </a>
        <a href="#" className="hover:text-neutral-200 transition-colors">
          Twitter
        </a>
      </div>
    </footer>
  );
}