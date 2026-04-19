// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache for 1 hour
const CACHE_MAX_AGE = 3600;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }
  
  // Check if it's a local file
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Serve local file
    let filePath: string;
    
    if (url.match(/^[A-Za-z]:\\/)) {
      // Windows absolute path - extract filename and serve from public/images
      const fileName = path.basename(url);
      filePath = path.join(process.cwd(), 'public', 'images', fileName);
    } else if (url.startsWith('/')) {
      filePath = path.join(process.cwd(), 'public', url);
    } else {
      filePath = path.join(process.cwd(), 'public', url);
    }
    
    try {
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = getContentType(ext);
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
          },
        });
      }
    } catch (error) {
      console.error('Local file error:', error);
    }
  }
  
  // For remote URLs, proxy with caching
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CreatorOS-ImageProxy/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    // Return a default image on error
    const defaultImagePath = path.join(process.cwd(), 'public', 'images', 'default-bg.jpg');
    if (fs.existsSync(defaultImagePath)) {
      const defaultBuffer = fs.readFileSync(defaultImagePath);
      return new NextResponse(defaultBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    return NextResponse.json({ error: 'Failed to load image' }, { status: 404 });
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'image/jpeg';
}