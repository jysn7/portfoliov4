import type { ReactNode } from 'react';

/* section heading, same pattern as the rest of the site */
export default function SectionHead({ title, note, aside }: { title: string; note?: string; aside?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-14">
      <div>
        <h2
          data-head
          className="font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground"
        >
          {title}
        </h2>
        {note && (
          <p data-head className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            {note}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}