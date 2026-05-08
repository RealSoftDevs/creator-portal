// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const imageCache = new Map<string, { data: Buffer; type: string; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('w') || '400';
  const quality = searchParams.get('q') || '75';

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const cacheKey = `${imageUrl}-${width}-${quality}`;

  // Check cache
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(cached.data);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': cached.type,
        'Cache-Control': 'public, max-age=604800',
      },
    });
  }

  try {
    // Fetch image from source
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CreatorPortal/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Cache the image
    imageCache.set(cacheKey, {
      data: imageBuffer,
      type: contentType,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (imageCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          imageCache.delete(key);
        }
      }
    }

    // Return the image as Uint8Array
    const uint8Array = new Uint8Array(imageBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}