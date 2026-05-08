// app/api/portal/products/route.ts (partial - just remove the cache import if causing issues)
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = await getCurrentUserFromToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { portalId: user.portal?.id },
    orderBy: { order: 'asc' },
  });

  // Add cache headers
  return NextResponse.json(
    { products },
    {
      headers: {
        'Cache-Control': 'private, max-age=60',
        'CDN-Cache-Control': 'public, max-age=300',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = await getCurrentUserFromToken(token);

  if (!user || !user.portal) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      buyLink: body.buyLink,
      price: body.price,
      platform: body.platform,
      category: body.category || 'misc',
      portalId: user.portal.id,
      order: body.order || 0,
    },
  });

  return NextResponse.json({ success: true, product });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = await getCurrentUserFromToken(token);

  if (!user || !user.portal) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await prisma.product.delete({
    where: { id, portalId: user.portal.id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = await getCurrentUserFromToken(token);

  if (!user || !user.portal) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const body = await request.json();

  const product = await prisma.product.update({
    where: { id, portalId: user.portal.id },
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      buyLink: body.buyLink,
      price: body.price,
      platform: body.platform,
      category: body.category || 'misc',
    },
  });

  return NextResponse.json({ success: true, product });
}