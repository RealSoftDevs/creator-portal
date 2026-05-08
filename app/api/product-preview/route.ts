// app/api/product-preview/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log('🔍 Fetching product preview for:', url);

  try {
    // Use a more reliable approach - fetch the page directly
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract product information
    let title = '';
    let price = '';
    let imageUrl = '';

    // Extract title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/\s*[|:]\s*Amazon\..*$/, '')
        .replace(/\s*[|:]\s*Buy Online.*$/, '')
        .replace(/\s*[|:]\s*Price.*$/, '')
        .trim();
      if (title.length > 200) title = title.substring(0, 197) + '...';
    }

    // Extract price from various patterns
    const pricePatterns = [
      /"price":\s*"([\d,]+)"/,
      /<span class="a-price-whole">([\d,]+)<\/span>/,
      /"priceAmount":\s*"([\d,]+)"/,
      /₹([\d,]+)(?:\.\d{2})?/,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        price = `₹${match[1].replace(/,/g, '')}`;
        break;
      }
    }

    // Extract image URL - This is the critical part
    const imagePatterns = [
      // Amazon high-res images
          /"hiRes":"(https:[^"]+)"/,
          /"large":"(https:[^"]+)"/,
          /"mainUrl":"(https:[^"]+)"/,
          // OG image
          /<meta\s+property="og:image"\s+content="([^"]+)"/,
          // Amazon image IDs
          /data-old-hires="(https:[^"]+\.jpg)"/,
          /data-a-dynamic-image="{[^"]*"(https:[^"]+\.jpg)"/,
          // Standard img tags
          /<img[^>]+src="(https:[^"]+\.jpg)"/i,
          /<img[^>]+src="(https:[^"]+\.jpeg)"/i,
          /<img[^>]+src="(https:[^"]+\.png)"/i,
    ];

    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let imgUrl = match[1].replace(/\\/g, '');
        // Remove size constraints to get original image
        imgUrl = imgUrl.replace(/\._SX\d+_\./, '.');
        imgUrl = imgUrl.replace(/\._SY\d+_\./, '.');
        imgUrl = imgUrl.replace(/\._AC_\./, '.');
        imageUrl = imgUrl;
        console.log('✅ Image found:', imageUrl.substring(0, 100));
        break;
      }
    }

    // If no image found, try a second pass with different patterns
    if (!imageUrl) {
      const fallbackPatterns = [
        /"image":"(https:[^"]+)"/,
        /"imgUrl":"(https:[^"]+)"/,
        /<link[^>]+href="(https:[^"]+\.jpg)"[^>]+as="image"/,
      ];

      for (const pattern of fallbackPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          imageUrl = match[1].replace(/\\/g, '');
          console.log('✅ Fallback image found:', imageUrl.substring(0, 100));
          break;
        }
      }
    }

    const result = {
      title: title || '',
      description: '',
      price: price || '',
      imageUrl: imageUrl || ''
    };

    console.log('📦 Result:', {
      hasTitle: !!result.title,
      hasPrice: !!result.price,
      hasImage: !!result.imageUrl
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching product preview:', error);
    return NextResponse.json({
      title: '',
      description: '',
      price: '',
      imageUrl: ''
    });
  }
}