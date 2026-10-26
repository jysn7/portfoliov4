import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import type { CaseView } from '@/lib/featured';
import { FOCUS, pad } from '@/components/work/shared';

export default function FeaturedCard({
  item,
  index,
  className,
  onOpen,
  btnRef,
  imgRef,
}: {
  item: CaseView;
  index: number;
  className: string;
  onOpen: () => void;
  btnRef: (el: HTMLButtonElement | null) => void;
  imgRef: (el: HTMLSpanElement | null) => void;
}) {
  return (
    <li data-feat className={className}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={`Open the ${item.title} case study`}
        onClick={onOpen}
        className={`group block w-full text-left ${FOCUS} focus-visible:outline-offset-8`}
      >
        {/* meta row */}
        <span className="flex items-baseline justify-between font-pixel text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">{pad(index + 1)}</span>
          <span className="truncate text-right">
            {[item.category.toLowerCase(), item.year].filter(Boolean).join(' · ')}
          </span>
        </span>

        {/* image — the aspect wrapper is INSIDE this box and must contain the image;
            the parent `className` no longer carries the aspect, so keep it here */}
        <span
          ref={imgRef}
          className="relative mt-3 block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-1 group-hover:border-foreground/40 group-hover:shadow-[8px_8px_0_var(--primary)]"
        >
          {item.image ? (
            <span data-feat-img className="absolute inset-0 block">
              <Image
                src={item.image}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.05]"
              />
            </span>
          ) : null}

          {/* arrow pill */}
          <span
            aria-hidden
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-foreground/20 bg-background/80 text-foreground backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"
          >
            <ArrowUpRight size={16} strokeWidth={1.75} />
          </span>
        </span>

        {/* title */}
        <span className="mt-5 block font-display font-soft text-[clamp(1.75rem,3vw,2.5rem)] leading-none tracking-[-0.03em] text-foreground">
          {item.title}
        </span>

        {/* description */}
        <span className="mt-2 line-clamp-2 block max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </span>

        {/* tags + read-more row */}
        <span className="mt-4 flex items-center justify-between gap-4 font-pixel text-xs text-muted-foreground">
          <span className="truncate">{item.tags.slice(0, 3).join(', ')}</span>

          <span className="group/read relative shrink-0 inline-flex items-center gap-1.5 text-foreground">
            <span className="relative">
              read case study
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-30 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 group-hover/read:scale-x-100"
              />
            </span>
            <ArrowUpRight
              size={12}
              strokeWidth={1.75}
              aria-hidden
              className="translate-y-0.5 -translate-x-0.5 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-hover:translate-x-0 group-hover/read:translate-y-0 group-hover/read:translate-x-0"
            />
          </span>
        </span>
      </button>
    </li>
  );
}