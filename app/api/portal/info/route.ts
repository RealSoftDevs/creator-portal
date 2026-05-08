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
    console.log('📡 USER PREMIUM STATUS:', user.isPremium);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Return ALL portal settings
    return NextResponse.json({
      id: user.portal.id,
      slug: user.portal.slug,
      title: user.portal.title,
      bio: user.portal.bio,
      displayName: user.portal.displayName,
      avatarUrl: user.portal.avatarUrl,
      userName: user.name,
      templateId: user.portal.templateId,
      primaryColor: user.portal.primaryColor,
      backgroundImage: user.portal.backgroundImage,
      backgroundType: user.portal.backgroundType,
      gradientStart: user.portal.gradientStart,
      gradientEnd: user.portal.gradientEnd,
      textColor: user.portal.textColor,
      fontFamily: user.portal.fontFamily,
      isPremium: user.isPremium,  // Make sure this is included
      customUsername: user.name,
      // Admin settings
      adminTemplateId: user.portal.adminTemplateId,
      adminPrimaryColor: user.portal.adminPrimaryColor,
      adminBackgroundType: user.portal.adminBackgroundType,
      adminGradientStart: user.portal.adminGradientStart,
      adminGradientEnd: user.portal.adminGradientEnd,
      adminBackgroundImage: user.portal.adminBackgroundImage,
      adminTextColor: user.portal.adminTextColor,
      adminFontFamily: user.portal.adminFontFamily,
    });
    
  } catch (error) {
    console.error('Portal info error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}