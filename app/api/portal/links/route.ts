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
      return NextResponse.json({ links: [] });
    }
    
    const links = await prisma.link.findMany({
      where: { portalId: user.portal.id },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json({ links });
    
  } catch (error) {
    console.error('Links API error:', error);
    return NextResponse.json({ links: [] });
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
    
    const { title, url, order, iconUrl, platform } = await request.json();
    
    console.log('Creating link:', { title, url, iconUrl, platform });
    
    const link = await prisma.link.create({
      data: {
        title,
        url,
        order: order || 0,
        portalId: user.portal.id,
        imageUrl: iconUrl || null,  // Store custom icon in imageUrl field
        // You can add a platform field if needed
      }
    });
    
    return NextResponse.json({ link });
    
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Failed to create link: ' + (error as Error).message }, { status: 500 });
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
    
    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete link error:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}