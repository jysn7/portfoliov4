'use client';

import { useState } from 'react';

import Signpost from '@/components/work/Signpost';
import Featured from '@/components/work/featured/Featured';
import ArchiveSection from '@/components/work/archive/ArchiveSection';
import { ARCHIVE_ITEMS } from '@/components/work/data';
import { FEATURED } from '@/lib/featured';
import { scrollToId } from '@/components/work/shared';

export default function WorksPage() {
  const [archiveOpen, setArchiveOpen] = useState(false);

  const openArchive = () => {
    setArchiveOpen(true);
    window.setTimeout(() => scrollToId('archive'), 60);
  };

  const hasArchive = ARCHIVE_ITEMS.length > 0;

  return (
    <main className="relative w-full select-none overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 38rem at 88% 9rem, color-mix(in srgb, var(--foreground) 8%, transparent), transparent 70%), radial-gradient(46rem 34rem at -5% 52rem, color-mix(in srgb, var(--foreground) 5%, transparent), transparent 70%)',
        }}
      />

      <Signpost hasArchive={hasArchive} onFeatured={() => scrollToId('featured')} onArchive={openArchive} />

      <div className="mt-12 md:mt-20">
        <Featured items={FEATURED} />
      </div>

      {hasArchive && (
        <ArchiveSection
          items={ARCHIVE_ITEMS}
          open={archiveOpen}
          onOpen={openArchive}
          onClose={() => setArchiveOpen(false)}
        />
      )}
    </main>
  );
}