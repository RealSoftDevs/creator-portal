// app/studio/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div><p className="text-white/70">Redirecting to dashboard...</p></div>
    </div>
  );
}