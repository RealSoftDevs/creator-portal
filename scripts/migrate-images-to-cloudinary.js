// scripts/migrate-images-to-cloudinary.js
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  console.log('🚀 Starting image migration to Cloudinary...');
  
  // Get all products with local images
  const products = await prisma.product.findMany({
    where: {
      imageUrl: {
        not: null,
      }
    }
  });
  
  let migrated = 0;
  let failed = 0;
  
  for (const product of products) {
    const imageUrl = product.imageUrl;
    
    // Skip if already Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      console.log(`⏭️ Skipping ${product.id} - already on Cloudinary`);
      continue;
    }
    
    // Skip if base64 (temporary)
    if (imageUrl.startsWith('data:image')) {
      console.log(`⏭️ Skipping ${product.id} - base64 image (will be re-uploaded when edited)`);
      continue;
    }
    
    try {
      console.log(`📤 Uploading image for product: ${product.title}`);
      
      let imageBuffer;
      
      // Check if local file
      if (imageUrl.startsWith('/')) {
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        if (fs.existsSync(filePath)) {
          imageBuffer = fs.readFileSync(filePath);
        }
      } 
      // External URL
      else if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
      
      if (imageBuffer) {
        const base64 = imageBuffer.toString('base64');
        const dataURI = `data:image/jpeg;base64,${base64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'creator-portal/products',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' }
          ]
        });
        
        // Update product with Cloudinary URL
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: result.secure_url }
        });
        
        console.log(`✅ Migrated: ${product.title} -> ${result.secure_url}`);
        migrated++;
      } else {
        console.log(`❌ Could not load image for: ${product.title}`);
        failed++;
      }
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.title}:`, error.message);
      failed++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Migration Complete!`);
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await prisma.$disconnect();
}

// Run migration
migrateImages().catch(console.error);