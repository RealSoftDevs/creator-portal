// app/api/portal/sync-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    // Sync: Copy MAIN fields to PUBLIC and ADMIN if they're empty
    const updateData: any = {};

    if (!user.portal.publicBackgroundImage && user.portal.backgroundImage) {
      updateData.publicBackgroundImage = user.portal.backgroundImage;
    }
    if (!user.portal.publicBackgroundType && user.portal.backgroundType) {
      updateData.publicBackgroundType = user.portal.backgroundType;
    }
    if (!user.portal.adminBackgroundImage && user.portal.backgroundImage) {
      updateData.adminBackgroundImage = user.portal.backgroundImage;
    }
    if (!user.portal.adminBackgroundType && user.portal.backgroundType) {
      updateData.adminBackgroundType = user.portal.backgroundType;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.portal.update({
        where: { id: user.portal.id },
        data: updateData
      });
      console.log('✅ Synced background fields:', updateData);
    }

    return NextResponse.json({
      success: true,
      synced: updateData,
      current: {
        main: user.portal.backgroundImage,
        public: user.portal.publicBackgroundImage,
        admin: user.portal.adminBackgroundImage
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}