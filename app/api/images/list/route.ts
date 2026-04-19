// app/api/images/list/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const images: { name: string; url: string; size: number }[] = [];

    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          const filePath = path.join(imagesDir, file);
          const stats = fs.statSync(filePath);
          images.push({
            name: file,
            url: `/images/${file}`,
            size: stats.size
          });
        }
      }
    }

    // Sort by name
    images.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ images, count: images.length });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ images: [], count: 0, error: 'Failed to list images' });
  }
}