// app/api/portal/reset-theme/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  templateId: 'template1',
  primaryColor: '#f5f5f5',
  textColor: '#1a1a1a',
  fontFamily: 'font-sans',
  backgroundType: 'image',
  gradientStart: '#000000',
  gradientEnd: '#ffffff',
  backgroundImage: '/images/default-bg.jpg'
};

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

    // Reset all theme settings to default
    const updatedPortal = await prisma.portal.update({
      where: { id: user.portal.id },
      data: {
        // Main fields (public page)
        templateId: DEFAULT_SETTINGS.templateId,
        primaryColor: DEFAULT_SETTINGS.primaryColor,
        textColor: DEFAULT_SETTINGS.textColor,
        fontFamily: DEFAULT_SETTINGS.fontFamily,
        backgroundType: DEFAULT_SETTINGS.backgroundType,
        gradientStart: DEFAULT_SETTINGS.gradientStart,
        gradientEnd: DEFAULT_SETTINGS.gradientEnd,
        backgroundImage: DEFAULT_SETTINGS.backgroundImage,

        // Admin fields
        adminTemplateId: DEFAULT_SETTINGS.templateId,
        adminPrimaryColor: DEFAULT_SETTINGS.primaryColor,
        adminTextColor: DEFAULT_SETTINGS.textColor,
        adminFontFamily: DEFAULT_SETTINGS.fontFamily,
        adminBackgroundType: DEFAULT_SETTINGS.backgroundType,
        adminGradientStart: DEFAULT_SETTINGS.gradientStart,
        adminGradientEnd: DEFAULT_SETTINGS.gradientEnd,
        adminBackgroundImage: DEFAULT_SETTINGS.backgroundImage,

        // Public fields
        publicTemplateId: DEFAULT_SETTINGS.templateId,
        publicPrimaryColor: DEFAULT_SETTINGS.primaryColor,
        publicTextColor: DEFAULT_SETTINGS.textColor,
        publicFontFamily: DEFAULT_SETTINGS.fontFamily,
        publicBackgroundType: DEFAULT_SETTINGS.backgroundType,
        publicGradientStart: DEFAULT_SETTINGS.gradientStart,
        publicGradientEnd: DEFAULT_SETTINGS.gradientEnd,
        publicBackgroundImage: DEFAULT_SETTINGS.backgroundImage,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Theme reset to default',
      settings: DEFAULT_SETTINGS
    });

  } catch (error) {
    console.error('Reset theme error:', error);
    return NextResponse.json({ error: 'Failed to reset theme' }, { status: 500 });
  }
}