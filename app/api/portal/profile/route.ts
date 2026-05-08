// app/api/portal/profile/route.ts
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

    const { displayName, title, bio, avatarUrl } = await request.json();

    const updatedPortal = await prisma.portal.update({
      where: { userId: user.id },
      data: {
        displayName: displayName || undefined,
        title: title || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      }
    });

    return NextResponse.json({
      success: true,
      portal: updatedPortal
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}