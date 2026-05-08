// app/api/portal/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received update data:', body); // Debug log

    const { title, description, imageUrl, buyLink, price, platform, category } = body;

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id, portal: { userId } }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description: description || null,
        imageUrl,
        buyLink,
        price: price || null,
        platform: platform || 'custom',
        category: category || 'misc'
      }
    });

    console.log('Updated product category:', updatedProduct.category); // Debug log

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}