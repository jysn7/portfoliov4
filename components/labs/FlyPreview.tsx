'use client';

import type { RefObject } from 'react';
import { LABS } from '@/lib/labs/data';

export function FlyPreview({
  flyId,
  flyRef,
}: {
  flyId: string;
  flyRef: RefObject<HTMLDivElement | null>;
}) {
  const FlyPreview = (LABS.find((l) => l.id === flyId) ?? LABS[0]).Preview;
  return (
    <div
      ref={flyRef}
      aria-hidden
      className="pointer-events-none invisible absolute left-0 top-0 z-20 overflow-hidden rounded-lg border border-border bg-card"
    >
      <FlyPreview />
    </div>
  );
}