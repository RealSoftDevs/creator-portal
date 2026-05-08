// lib/cache.ts
'use server';

import { unstable_cache } from 'next/cache';
import { revalidatePath } from 'next/cache';

// Cache durations
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Cache keys
export const CACHE_KEYS = {
  PORTAL_PUBLIC: 'portal-public',
  PRODUCTS: 'products',
  LINKS: 'links',
};

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: number = CACHE_DURATIONS.MEDIUM
): Promise<T> {
  return unstable_cache(
    async () => fetchFn(),
    [key],
    { revalidate: duration }
  )();
}

// Simple revalidation without revalidateTag
export async function revalidateCache(key: string) {
  'use server';
  console.log(`Cache revalidation requested for: ${key}`);
  // Use revalidatePath instead if needed
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Error revalidating:', error);
  }
}

// For revalidating multiple keys
export async function revalidateMultipleCache(keys: string[]) {
  'use server';
  console.log(`Cache revalidation requested for keys: ${keys.join(', ')}`);
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Error revalidating:', error);
  }
}