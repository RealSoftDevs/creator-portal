import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Dummy products for display only (not saved to DB)
const getDummyProducts = () => [
  {
    id: 'dummy1',
    title: 'Summer Fashion Dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    buyLink: 'https://amazon.com',
    price: '$49.99',
    platform: 'amazon',
    isDummy: true
  },
  {
    id: 'dummy2',
    title: 'Designer Handbag',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    buyLink: 'https://myntra.com',
    price: '$129.99',
    platform: 'myntra',
    isDummy: true
  },
  {
    id: 'dummy3',
    title: 'Sunglasses',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    buyLink: 'https://amazon.com',
    price: '$89.99',
    platform: 'amazon',
    isDummy: true
  },
  {
    id: 'dummy4',
    title: 'Casual Sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    buyLink: 'https://flipkart.com',
    price: '$79.99',
    platform: 'flipkart',
    isDummy: true
  }
];

// Store dummy state per user (temporary, resets on server restart)
const userDummyState = new Map<string, Set<string>>();

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
      return NextResponse.json({ products: getDummyProducts() });
    }

    let products = await prisma.product.findMany({
      where: { portalId: user.portal.id },
      orderBy: { order: 'asc' }
    });

    // Get deleted dummy IDs for this user
    const deletedDummyIds = userDummyState.get(userId) || new Set();

    // Filter out deleted dummies
    const availableDummies = getDummyProducts().filter(
      dummy => !deletedDummyIds.has(dummy.id)
    );

    // Return dummies only if user has no real products
    if (products.length === 0 && availableDummies.length > 0) {
      return NextResponse.json({ products: availableDummies, isDummy: true });
    }

    return NextResponse.json({ products, isDummy: false });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ products: getDummyProducts() });
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

    // Handle dummy product deletion
    if (id.startsWith('dummy')) {
      const deletedDummyIds = userDummyState.get(userId) || new Set();
      deletedDummyIds.add(id);
      userDummyState.set(userId, deletedDummyIds);
      return NextResponse.json({ success: true, isDummy: true });
    }

    // Delete real product from database
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}