import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 IMAGE UPLOAD & COMPRESSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 File name: ${file.name}`);
    console.log(`📏 File type: ${file.type}`);
    console.log(`📊 Original size: ${(file.size / 1024).toFixed(2)} KB (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original image dimensions
    const originalMetadata = await sharp(buffer).metadata();
    console.log(`📐 Original dimensions: ${originalMetadata.width}x${originalMetadata.height}`);

    // COMPRESSION HAPPENS HERE
    const startTime = Date.now();

    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,           // 80% quality - reduces size significantly
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    const endTime = Date.now();
    const compressionTime = endTime - startTime;

    // Get optimized image dimensions
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    // Calculate compression ratio
    const originalSizeKB = file.size / 1024;
    const optimizedSizeKB = optimizedBuffer.length / 1024;
    const compressionRatio = ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(1);
    const sizeSavedKB = (file.size - optimizedBuffer.length) / 1024;

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ COMPRESSION RESULTS:`);
    console.log(`📏 Optimized dimensions: ${optimizedMetadata.width}x${optimizedMetadata.height}`);
    console.log(`📊 Optimized size: ${optimizedSizeKB.toFixed(2)} KB (${(optimizedSizeKB / 1024).toFixed(2)} MB)`);
    console.log(`💾 Size saved: ${sizeSavedKB.toFixed(2)} KB`);
    console.log(`📉 Compression ratio: ${compressionRatio}%`);
    console.log(`⏱️ Compression time: ${compressionTime}ms`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Visual comparison bar
    const barLength = 30;
    const originalBar = Math.round((originalSizeKB / (originalSizeKB + optimizedSizeKB)) * barLength);
    const optimizedBar = barLength - originalBar;
    console.log(`📊 Size comparison:`);
    console.log(`   Original:  ${'█'.repeat(originalBar)} ${originalSizeKB.toFixed(0)}KB`);
    console.log(`   Optimized: ${'█'.repeat(optimizedBar)} ${optimizedSizeKB.toFixed(0)}KB`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Convert to base64 (temporary - should use cloud storage in production)
    const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64Image,
      originalSize: originalSizeKB.toFixed(2),
      optimizedSize: optimizedSizeKB.toFixed(2),
      compression: `${compressionRatio}%`,
      originalDimensions: `${originalMetadata.width}x${originalMetadata.height}`,
      optimizedDimensions: `${optimizedMetadata.width}x${optimizedMetadata.height}`,
      compressionTime: `${compressionTime}ms`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}