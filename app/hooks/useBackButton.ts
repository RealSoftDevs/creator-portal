'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useBackButton(onBack?: () => void, isActive: boolean = true) {
  const pathname = usePathname();
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

      console.log('🔙 Physical back button pressed on:', pathname);

      // Check if we're in a modal (theme editor)
      // Modal is detected by checking if onBack handler exists and isActive is true
      if (onBack && typeof onBack === 'function') {
        console.log('📱 Closing modal (theme editor)');
        onBack();
      }
      else if (pathname === '/studio') {
        console.log('📱 Navigating from Studio to Dashboard');
        window.location.href = '/dashboard';
      }
      else if (pathname === '/dashboard') {
        if (window.confirm('Do you want to exit the app?')) {
          console.log('📱 Exiting app');
          window.history.back();
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      }
      else if (pathname === '/') {
        window.history.back();
      }
      else {
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
  }, [isActive, onBack, pathname]);
}