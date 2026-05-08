// app/api/portal/update-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const user = await getCurrentUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isPremium) {
      return NextResponse.json({ error: 'Premium feature required' }, { status: 403 });
    }

    const { customUsername } = await request.json();

    if (!customUsername || customUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (customUsername.length > 30) {
      return NextResponse.json({ error: 'Username must be less than 30 characters' }, { status: 400 });
    }

    // Allow letters, numbers, dots, and underscores
    if (!/^[a-zA-Z0-9_.]+$/.test(customUsername)) {
      return NextResponse.json({
        error: 'Username can only contain letters, numbers, dots (.), and underscores (_)'
      }, { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        name: customUsername,
        id: { not: user.id }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Update user's name (custom username)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: customUsername }
    });

    return NextResponse.json({
      success: true,
      customUsername: updatedUser.name,
      publicUrl: `/view/${updatedUser.name}`
    });
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}