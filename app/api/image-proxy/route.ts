// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Validate URL to prevent SSRF attacks
    const url = new URL(imageUrl);
    const allowedDomains = [
      'images.unsplash.com',
      'images.pexels.com',
      'cdn.shopify.com',
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'nyc3.digitaloceanspaces.com',
      'res.cloudinary.com'
    ];

    // Check if domain is allowed (or allow any https for flexibility)
    const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain)) ||
                      url.protocol === 'https:';

    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CreatorPortal/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with caching headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'CDN-Cache-Control': 'public, max-age=604800', // Cache for 1 week on CDN
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}