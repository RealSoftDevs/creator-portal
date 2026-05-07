// app/api/product-preview/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ProductPreview {
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  platform: string;
  url: string;
}

function detectPlatform(url: string): string {
  if (url.includes('amazon') || url.includes('amzn')) return 'amazon';
  if (url.includes('myntra')) return 'myntra';
  if (url.includes('flipkart')) return 'flipkart';
  if (url.includes('etsy')) return 'etsy';
  return 'custom';
}

function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /[?&]asin=([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function followRedirects(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);
    return response.url;
  } catch (error) {
    console.error('Redirect follow error:', error);
    return url;
  }
}

// Extract image URL from Amazon HTML
function extractAmazonImageUrl(html: string): string {
  // Priority patterns for highest quality images
  const patterns = [
    /"hiRes":"([^"]+)"/,
    /"large":"([^"]+)"/,
    /"main":"([^"]+)"/,
    /data-a-dynamic-image='{[^}]*"([^"]+)"[^}]*}'/,
    /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/,
    /<img[^>]*class="a-dynamic-image"[^>]*src="([^"]+)"/,
    /<meta property="og:image" content="([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let imageUrl = match[1].replace(/\\/g, '');
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      // Remove size parameters to get original image
      imageUrl = imageUrl.replace(/\._[^_.]+\./g, '.');
      imageUrl = imageUrl.replace(/\._AC_[^.]*\./g, '.');
      imageUrl = imageUrl.replace(/\._SL\d+_\./g, '.');
      imageUrl = imageUrl.replace(/\._UX\d+_\./g, '.');
      imageUrl = imageUrl.replace(/\._UY\d+_\./g, '.');
      // Filter out bad images
      if (!imageUrl.includes('gif') && !imageUrl.includes('pixel') && !imageUrl.includes('grey')) {
        return imageUrl;
      }
    }
  }
  return '';
}

// Fetch Amazon product with multiple user agents
async function fetchAmazonProduct(asin: string): Promise<Partial<ProductPreview>> {
  const url = `https://www.amazon.in/dp/${asin}`;

  // Different user agents to avoid blocking
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  for (const userAgent of userAgents) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
      });

      const html = await response.text();

      // Extract title
      let title = '';
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/ : Amazon\.in.*$/, '')
          .replace(/ \| Amazon\.in.*$/, '')
          .replace(/ - Amazon\.in.*$/, '')
          .trim();
        if (title.length > 120) title = title.substring(0, 117) + '...';
      }

      // Extract image URL
      let imageUrl = extractAmazonImageUrl(html);

      // If we found an image, also get description and price
      if (imageUrl) {
        // Extract description
        let description = '';
        const descPatterns = [
          /<div[^>]*id="productDescription"[^>]*>([\s\S]*?)<\/div>/,
          /<div[^>]*id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/,
          /<meta name="description" content="([^"]+)"/,
        ];

        for (const pattern of descPatterns) {
          const match = html.match(pattern);
          if (match) {
            description = match[1]
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (description && description.length > 50) {
              if (description.length > 500) description = description.substring(0, 497) + '...';
              break;
            }
          }
        }

        // Extract price
        let price = '';
        const priceMatch = html.match(/<span class="a-price-whole">([^<]+)<\/span>/);
        if (priceMatch) {
          price = `₹${priceMatch[1].replace(/[^0-9]/g, '')}`;
        }

        return { title, description, imageUrl, price };
      }
    } catch (error) {
      console.error(`Fetch failed for user agent: ${userAgent}`, error);
      continue;
    }
  }

  return {};
}

// Fetch via proxy as fallback
async function fetchViaProxy(url: string): Promise<Partial<ProductPreview>> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.ok) {
      const html = await response.text();

      let title = '';
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      if (titleMatch) {
        title = titleMatch[1].replace(/ : Amazon\.in.*$/, '').trim();
        if (title.length > 120) title = title.substring(0, 117) + '...';
      }

      let imageUrl = extractAmazonImageUrl(html);

      let description = '';
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      if (descMatch) {
        description = descMatch[1];
        if (description.length > 500) description = description.substring(0, 497) + '...';
      }

      return { title, description, imageUrl };
    }
  } catch (error) {
    console.error('Proxy fetch error:', error);
  }

  return {};
}

// Generate fallback info when fetching fails
function generateFallbackInfo(url: string, platform: string): Partial<ProductPreview> {
  // Try to extract product name from URL
  let productName = '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    for (const part of pathParts) {
      if (part && part.length > 5 && !part.includes('dp') && !part.includes('product') && !part.includes('ref')) {
        productName = decodeURIComponent(part.replace(/-/g, ' '));
        if (productName.length > 60) {
          productName = productName.substring(0, 57) + '...';
        }
        break;
      }
    }
  } catch {
    // Use default
  }

  const asin = extractAsin(url);
  const title = productName || (asin ? `Product (ASIN: ${asin})` : `Product on ${platform}`);

  return {
    title: title,
    description: `View this product on ${platform}. Click to edit product details.`,
    imageUrl: `/api/image-proxy?url=${encodeURIComponent('https://placehold.co/400x400?text=' + encodeURIComponent(title))}`,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Follow redirects for short links
    const finalUrl = await followRedirects(url);
    console.log(`Fetching product info for: ${finalUrl}`);

    const platform = detectPlatform(finalUrl);
    let previewData: Partial<ProductPreview> = { platform, url: finalUrl };

    if (platform === 'amazon') {
      const asin = extractAsin(finalUrl);

      if (asin) {
        // Try direct fetch first
        let result = await fetchAmazonProduct(asin);

        // If no image, try proxy
        if (!result.imageUrl) {
          console.log('Direct fetch: No image, trying proxy...');
          const proxyResult = await fetchViaProxy(finalUrl);
          result = { ...result, ...proxyResult };
        }

        if (result.title || result.description || result.imageUrl) {
          previewData = { ...previewData, ...result };
        } else {
          previewData = { ...previewData, ...generateFallbackInfo(finalUrl, platform) };
        }
      } else {
        previewData = { ...previewData, ...generateFallbackInfo(finalUrl, platform) };
      }
    } else {
      const result = await fetchViaProxy(finalUrl);
      if (result.title || result.description || result.imageUrl) {
        previewData = { ...previewData, ...result };
      } else {
        previewData = { ...previewData, ...generateFallbackInfo(finalUrl, platform) };
      }
    }

    // Process image URL through proxy if it's from Amazon
    if (previewData.imageUrl && (previewData.imageUrl.includes('amazon') || previewData.imageUrl.includes('media-amazon'))) {
      previewData.imageUrl = `/api/image-proxy?url=${encodeURIComponent(previewData.imageUrl)}`;
    }

    // Ensure all fields have values
    if (!previewData.title || previewData.title === '') {
      previewData.title = `Product on ${platform}`;
    }

    if (!previewData.description || previewData.description === '') {
      previewData.description = `View this product on ${platform}. Click to edit product details.`;
    }

    if (!previewData.imageUrl || previewData.imageUrl === '') {
      previewData.imageUrl = `/api/image-proxy?url=${encodeURIComponent('https://placehold.co/400x400?text=' + encodeURIComponent(previewData.title))}`;
    }

    return NextResponse.json(previewData);

  } catch (error) {
    console.error('Preview error:', error);

    const platform = detectPlatform(url);
    let fallbackTitle = `Product on ${platform}`;

    try {
      const hostname = new URL(url).hostname;
      fallbackTitle = hostname.replace('www.', '').split('.')[0];
      fallbackTitle = fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
    } catch {
      // Use default
    }

    return NextResponse.json({
      title: fallbackTitle,
      description: `Click to edit product details.`,
      imageUrl: `/api/image-proxy?url=${encodeURIComponent('https://placehold.co/400x400?text=' + encodeURIComponent(fallbackTitle))}`,
      platform: detectPlatform(url),
      url,
    });
  }
}