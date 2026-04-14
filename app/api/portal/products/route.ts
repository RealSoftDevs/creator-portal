import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portal: true }
    });
    
    if (!user || !user.portal) {
      return NextResponse.json({ products: [] });
    }
    
    let products = await prisma.product.findMany({
      where: { portalId: user.portal.id },
      orderBy: { order: 'asc' }
    });
    
    // Add dummy products if none exist
    if (products.length === 0) {
      const dummyProducts = [
        { title: "Summer Fashion Dress", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop", buyLink: "https://amazon.com", price: "", platform: "amazon" },
        { title: "Designer Handbag", imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", buyLink: "https://myntra.com", price: "", platform: "myntra" },
        { title: "Sunglasses", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", buyLink: "https://amazon.com", price: "", platform: "amazon" },
        //{ title: "Casual Sneakers", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", buyLink: "https://flipkart.com", price: "", platform: "flipkart" }
        //{ title: "Casual Sneakers", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", buyLink: "https://flipkart.com", price: "₹79.99", platform: "flipkart" }
      ];
      
      for (const dummy of dummyProducts) {
        await prisma.product.create({
          data: { ...dummy, portalId: user.portal.id }
        });
      }
      
      products = await prisma.product.findMany({
        where: { portalId: user.portal.id },
        orderBy: { order: 'asc' }
      });
    }
    
    return NextResponse.json({ products });
    
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portal: true }
    });
    
    if (!user || !user.portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }
    
    const { title, imageUrl, buyLink, price, platform } = await request.json();
    
    const product = await prisma.product.create({
      data: {
        title,
        imageUrl,
        buyLink,
        price,
        platform,
        portalId: user.portal.id
      }
    });
    
    return NextResponse.json({ product });
    
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}