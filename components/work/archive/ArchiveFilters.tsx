import { FOCUS } from '../shared';

export default function ArchiveFilters({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (f: string) => void;
}) {
  return (
    <div role="group" aria-label="Filter the archive" className="mb-6 flex flex-wrap gap-2 md:mb-10">
      {options.map((f) => {
        const on = active === f;
        return (
          <button
            key={f}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f)}
            className={`h-10 rounded-full px-5 font-pixel text-xs transition-colors duration-200 ${FOCUS} ${
              on ? 'bg-foreground text-background' : 'bg-muted text-foreground hover:bg-foreground hover:text-background'
            }`}
          >
            {f.toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}