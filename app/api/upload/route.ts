// app/api/upload/route.ts - Ensure proper Cloudinary URL format
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const compressionLevel = (formData.get('compression') as string) || 'medium';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 IMAGE UPLOAD TO CLOUDINARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 File name: ${file.name}`);
    console.log(`📊 Original size: ${(file.size / 1024).toFixed(2)} KB`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize image locally before uploading
    const startCompression = Date.now();
    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    const compressionTime = Date.now() - startCompression;
    const optimizedSizeKB = optimizedBuffer.length / 1024;
    const compressionRatio = ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(1);

    console.log(`✅ Local compression: ${compressionRatio}% saved in ${compressionTime}ms`);
    console.log(`📊 Compressed size: ${optimizedSizeKB.toFixed(2)} KB`);

    // Upload to Cloudinary
    const uploadStart = Date.now();
    const base64Image = optimizedBuffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64Image}`;

    // Generate a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const publicId = `creator-portal/products/${timestamp}_${randomId}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: publicId,
      folder: 'creator-portal/products',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      eager: [
        { width: 400, height: 400, crop: 'fill', quality: 'auto' },
        { width: 200, height: 200, crop: 'fill', quality: 'auto' }
      ],
      eager_async: true,
    });

    const uploadTime = Date.now() - uploadStart;

    console.log(`✅ Cloudinary upload: ${uploadTime}ms`);
    console.log(`🖼️ Public ID: ${result.public_id}`);
    console.log(`🔗 URL: ${result.secure_url}`);
    console.log(`📏 Final dimensions: ${result.width}x${result.height}`);
    console.log(`📊 Final size: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Return the Cloudinary URL
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      originalSize: (file.size / 1024).toFixed(2),
      optimizedSize: (result.bytes / 1024).toFixed(2),
      compression: `${compressionRatio}%`,
      totalTime: Date.now() - startTime,
      format: result.format,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed: ' + (error as Error).message
    }, { status: 500 });
  }
}