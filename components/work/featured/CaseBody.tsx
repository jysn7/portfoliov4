import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import type { CaseView } from '@/lib/featured';
import { FOCUS, pad } from '../shared';

function splitGallery<T>(gallery: T[]) {
  const pairA = gallery.slice(0, 2);
  const pairB = gallery.slice(2, 4);
  return { pairA, pairB };
}

type Section = { id: string; label: string };

export default function CaseBody({
  c,
  next,
  total,
  heroRef,
  heroInnerRef,
  onGo,
}: {
  c: CaseView;
  next: CaseView | null;
  total: number;
  heroRef: RefObject<HTMLDivElement | null>;
  heroInnerRef: RefObject<HTMLDivElement | null>;
  onGo: (dir: number) => void;
}) {
  const meta = (
    [
      ['role', c.role],
      ['client', c.client],
      ['timeline', c.timeline],
      ['status', c.status],
      ['year', c.year != null ? String(c.year) : undefined],
    ].filter(([, v]) => v) as [string, string][]
  ).slice(0, 4);
  const overview = c.overview.length ? c.overview : [c.description].filter(Boolean);
  const { pairA, pairB } = splitGallery(c.gallery);

  const sections = useMemo<Section[]>(() => {
    const s: Section[] = [];
    if (overview.length) s.push({ id: 'overview', label: 'overview' });
    if (c.highlights.length) s.push({ id: 'highlights', label: 'highlights' });
    if (c.challenge || c.solution) s.push({ id: 'thinking', label: 'the thinking' });
    if (c.results.length) s.push({ id: 'results', label: 'results' });
    if (c.tags.length) s.push({ id: 'built', label: 'built with' });
    return s;
  }, [overview.length, c.highlights.length, c.challenge, c.solution, c.results.length, c.tags.length]);

  const sectionIds = useMemo(() => new Set(sections.map((s) => s.id)), [sections]);

  const tocRef = useRef<HTMLElement>(null);
  const activeIdRef = useRef<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const root = tocRef.current?.closest('[data-cs-overlay]') as HTMLElement | null;
    if (!root || sections.length === 0) return;

    const els = sections
      .map((s) => document.getElementById(`cs-${s.id}`))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const setActive = (id: string) => {
      if (activeIdRef.current === id) return;
      activeIdRef.current = id;
      tocRef.current?.querySelectorAll<HTMLElement>('[data-toc-item]').forEach((el) => {
        el.dataset.active = el.dataset.tocId === id ? 'true' : 'false';
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^cs-/, '');
          if (sectionIds.has(id)) setActive(id);
        }
      },
      { root, rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.6, 1] }
    );
    els.forEach((el) => io.observe(el));

    setActive(sections[0].id);
    return () => io.disconnect();
  }, [sections, sectionIds]);

  const scrollToSection = (id: string) => {
    const root = tocRef.current?.closest('[data-cs-overlay]') as HTMLElement | null;
    const el = document.getElementById(`cs-${id}`);
    if (!el || !root) return;
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top: top - 80, behavior: 'smooth' });
  };

  const Pair = ({ images, alt }: { images: string[]; alt: string }) => {
    if (!images.length) return null;
    return (
      <div className="my-12 grid gap-5 md:grid-cols-2">
        {images.map((src, k) => (
          <div
            key={k}
            data-cs
            className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted transition-shadow duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:shadow-[8px_8px_0_var(--primary)]"
          >
            <Image
              src={src}
              alt={`${alt} ${k + 1}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    );
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <h3 data-cs className="mb-4 font-pixel text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
      {children}
    </h3>
  );

  return (
    <div className="w-full px-6 md:px-12">
      {/* hero — full-bleed width, no center constraint */}
      <header className="pt-10 md:pt-14">
        <p data-cs className="flex flex-wrap items-center gap-3">
          {c.category && (
            <span className="rounded-full bg-primary px-3 py-1 font-pixel text-xs text-primary-foreground">
              {c.category}
            </span>
          )}
          {c.year != null && <span className="font-pixel text-xs text-muted-foreground">{c.year}</span>}
        </p>
        <h2
          data-cs
          className="mt-4 font-display font-soft text-[clamp(2.5rem,6.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-foreground"
        >
          {c.title}
        </h2>
        <p data-cs className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground md:text-lg">
          {c.description}
        </p>

        <div ref={heroRef} className="mt-10 aspect-[16/10] w-full md:aspect-[2/1]">
          <div
            ref={heroInnerRef}
            className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-muted"
          >
            {c.image ? (
              <Image src={c.image} alt={`${c.title} preview`} fill priority sizes="100vw" className="object-cover" />
            ) : null}
          </div>
        </div>
      </header>

      {/* blog layout: sticky TOC on the left, content flows to the right edge */}
      <div className="mt-14 grid w-full gap-10 md:mt-20 md:grid-cols-[180px_minmax(0,1fr)] md:gap-16">
        {/* TOC */}
        <aside
          ref={tocRef}
          aria-label="Case study sections"
          className="hidden self-start md:sticky md:top-24 md:block"
        >
          <p className="mb-4 font-pixel text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            contents
          </p>
          <nav>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    data-toc-item
                    data-toc-id={s.id}
                    data-active={s.id === activeIdRef.current ? 'true' : 'false'}
                    onClick={() => scrollToSection(s.id)}
                    className="group flex w-full items-center gap-2 py-1 text-left font-pixel text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground data-[active=true]:text-foreground"
                  >
                    <span
                      aria-hidden
                      className="h-px w-4 bg-muted-foreground/40 transition-all duration-300 group-data-[active=true]:w-8 group-data-[active=true]:bg-foreground"
                    />
                    <span className="tracking-[0.2em]">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {meta.length > 0 && (
            <dl className="mt-10 space-y-4">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-pixel text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>

        {/* main content — flows to the right edge, no centering */}
        <div className="min-w-0">
          {overview.length > 0 && (
            <section id="cs-overview" className="scroll-mt-24">
              <Label>overview</Label>
              <div data-cs className="space-y-5">
                {overview.map((p, k) => (
                  <p key={k} className="max-w-[68ch] text-base leading-relaxed text-foreground md:text-lg">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {c.highlights.length > 0 && (
            <section id="cs-highlights" className="mt-16 scroll-mt-24">
              <Label>highlights</Label>
              <ol className="space-y-8">
                {c.highlights.map((h, k) => (
                  <li key={k} data-cs className="group grid gap-2 md:grid-cols-[2.5rem_minmax(0,1fr)] md:gap-4">
                    <span className="font-pixel text-sm tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                      {pad(k + 1)}
                    </span>
                    <div>
                      <h4 className="font-display font-soft text-2xl tracking-[-0.02em] text-foreground">
                        {h.title}
                      </h4>
                      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Pair images={pairA} alt={`${c.title} preview`} />

          {(c.challenge || c.solution) && (
            <section id="cs-thinking" className="mt-16 scroll-mt-24">
              <Label>the thinking</Label>
              <div className="space-y-8">
                {c.challenge && (
                  <div data-cs>
                    <p className="font-pixel text-sm text-foreground">the challenge</p>
                    <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                      {c.challenge}
                    </p>
                  </div>
                )}
                {c.solution && (
                  <div data-cs>
                    <p className="font-pixel text-sm text-foreground">the approach</p>
                    <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                      {c.solution}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {c.results.length > 0 && (
            <section id="cs-results" className="mt-16 scroll-mt-24">
              <Label>results</Label>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
                {c.results.map((r, k) => (
                  <div key={k} data-cs>
                    <p className="font-display font-soft text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[-0.04em] text-foreground">
                      {r.value}
                    </p>
                    {r.label && <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <Pair images={pairB} alt={`${c.title} preview`} />

          {c.tags.length > 0 && (
            <section id="cs-built" className="mt-16 scroll-mt-24">
              <Label>built with</Label>
              <ul data-cs className="flex flex-wrap gap-2">
                {c.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-border/70 bg-transparent px-4 py-1.5 font-pixel text-xs text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(c.href || c.repo) && (
            <section className="mt-16">
              <div data-cs className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {c.href && (
                  <a
                    href={c.href}
                    target={/^https?:/.test(c.href) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-5 rounded-full bg-foreground py-2 pl-7 pr-2 text-background transition-colors duration-300 hover:bg-primary hover:text-primary-foreground ${FOCUS}`}
                  >
                    <span className="font-pixel text-sm">visit project</span>
                    <span className="grid size-11 place-items-center rounded-full bg-background text-foreground transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
                      <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
                    </span>
                  </a>
                )}
                {c.repo && (
                  <a
                    href={c.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group font-pixel text-sm text-foreground ${FOCUS}`}
                  >
                    <span className="relative inline-block">
                      view the code
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-30 bg-foreground/30 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 group-hover:bg-foreground"
                      />
                    </span>
                  </a>
                )}
              </div>
            </section>
          )}

          {next && total > 1 && (
            <section className="mt-16 pb-16">
              <button
                type="button"
                data-cs
                onClick={() => onGo(1)}
                className={`group relative block w-full overflow-hidden rounded-2xl bg-foreground/90 text-background transition-colors duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:bg-foreground ${FOCUS}`}
              >
                <span className="relative flex items-end justify-between gap-6 px-6 py-8 md:px-10 md:py-12">
                  <span className="min-w-0">
                    <span className="block text-left font-pixel text-[11px] uppercase tracking-[0.35em] text-background/60">
                      next project
                    </span>
                    <span className="mt-3 block truncate font-display font-soft text-[clamp(2rem,5vw,4rem)] leading-none tracking-[-0.04em] text-left text-background transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-1">
                      {next.title}
                    </span>
                    {next.description && (
                      <span className="mt-3 block max-w-[52ch] truncate text-sm text-background/70">
                        {next.description}
                      </span>
                    )}
                  </span>

                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-background/30 bg-transparent text-background transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-45 group-hover:border-background group-hover:bg-background group-hover:text-foreground md:size-14">
                    <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
                  </span>
                </span>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}