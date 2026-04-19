// app/api/portal/background-check/route.ts
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
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    // Return ALL background-related fields for debugging
    return NextResponse.json({
      main: {
        backgroundType: user.portal.backgroundType,
        backgroundImage: user.portal.backgroundImage,
        primaryColor: user.portal.primaryColor,
      },
      public: {
        backgroundType: user.portal.publicBackgroundType,
        backgroundImage: user.portal.publicBackgroundImage,
      },
      admin: {
        backgroundType: user.portal.adminBackgroundType,
        backgroundImage: user.portal.adminBackgroundImage,
      }
    });

  } catch (error) {
    console.error('Background check error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}