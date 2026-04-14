import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user to check premium status
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is premium
    if (!user.isPremium) {
      return NextResponse.json({
        error: 'Premium feature. Upgrade to get a custom URL!'
      }, { status: 403 });
    }

    const { username } = await request.json();
    
    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }
    
    // Check if username is already taken
    const existing = await prisma.user.findFirst({
      where: { 
        name: username,
        NOT: { id: userId }
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    
    // Update user name
    await prisma.user.update({
      where: { id: userId },
      data: { name: username }
    });
    
    return NextResponse.json({ success: true, username });
    
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}