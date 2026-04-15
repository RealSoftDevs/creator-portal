'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(redirectTo: string = '/login') {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/status');
        
        if (res.status === 401) {
          // Not authenticated
          setIsAuthenticated(false);
          setUser(null);
          if (redirectTo) {
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
        if (redirectTo) {
          router.push(redirectTo);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading, user };
}