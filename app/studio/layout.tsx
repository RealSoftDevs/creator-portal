// app/studio/layout.tsx
'use client';

import { Suspense, lazy } from 'react';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy load heavy components
const LinksSection = lazy(() => import('./components/LinksSection'));
const GallerySection = lazy(() => import('./components/GallerySection'));
const StatsCard = lazy(() => import('./components/StatsCard'));
const PreviewCard = lazy(() => import('./components/PreviewCard'));

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  );
}