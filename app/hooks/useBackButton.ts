// app/hooks/useBackButton.ts
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useBackButton(onBack?: () => void, isActive: boolean = true) {
  const pathname = usePathname();
  const router = useRouter();
  const isHandling = useRef(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isActive) return;

    if (initialLoad.current) {
      initialLoad.current = false;
      window.history.pushState(null, '', window.location.href);
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();

      if (isHandling.current) return;
      isHandling.current = true;

      if (onBack && typeof onBack === 'function') {
        onBack();
      } else if (pathname === '/studio') {
        router.push('/dashboard');
      } else if (pathname === '/dashboard') {
        if (window.confirm('Do you want to exit the app?')) {
          window.history.back();
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      } else {
        window.history.back();
      }

      setTimeout(() => {
        isHandling.current = false;
      }, 500);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      isHandling.current = false;
    };
  }, [isActive, onBack, pathname, router]);
}