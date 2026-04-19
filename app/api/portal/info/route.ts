// app/api/portal/info/route.ts
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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 INFO API - All Background Fields');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('MAIN backgroundType:', user.portal.backgroundType);
    console.log('MAIN backgroundImage:', user.portal.backgroundImage);
    console.log('MAIN primaryColor:', user.portal.primaryColor);
    console.log('PUBLIC backgroundType:', user.portal.publicBackgroundType);
    console.log('PUBLIC backgroundImage:', user.portal.publicBackgroundImage);
    console.log('ADMIN backgroundType:', user.portal.adminBackgroundType);
    console.log('ADMIN backgroundImage:', user.portal.adminBackgroundImage);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Return ALL portal settings - use MAIN fields for public page
    return NextResponse.json({
      slug: user.portal.slug,
      title: user.portal.title,
      bio: user.portal.bio,
      userName: user.name,
      // MAIN fields (used for public page)
      templateId: user.portal.templateId,
      primaryColor: user.portal.primaryColor,
      backgroundType: user.portal.backgroundType,
      backgroundImage: user.portal.backgroundImage,
      gradientStart: user.portal.gradientStart,
      gradientEnd: user.portal.gradientEnd,
      textColor: user.portal.textColor,
      fontFamily: user.portal.fontFamily,
      // Admin settings (for studio display)
      adminTemplateId: user.portal.adminTemplateId,
      adminPrimaryColor: user.portal.adminPrimaryColor,
      adminBackgroundType: user.portal.adminBackgroundType,
      adminGradientStart: user.portal.adminGradientStart,
      adminGradientEnd: user.portal.adminGradientEnd,
      adminBackgroundImage: user.portal.adminBackgroundImage,
      adminTextColor: user.portal.adminTextColor,
      adminFontFamily: user.portal.adminFontFamily
    });
    
  } catch (error) {
    console.error('Portal info error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}