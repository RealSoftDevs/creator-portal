// app/hooks/useAuth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/user/status');

      if (res.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
        if (redirectTo && pathname !== redirectTo && !pathname?.startsWith('/view')) {
          router.push(redirectTo);
        }
      } else {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      if (redirectTo && pathname !== redirectTo) {
        router.push(redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname, redirectTo]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, user, refetch: checkAuth };
}