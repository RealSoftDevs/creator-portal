// app/api/portal/appearance/route.ts
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

    const body = await request.json();
    const {
      templateId,
      primaryColor,
      textColor,
      fontFamily,
      backgroundType,
      gradientStart,
      gradientEnd,
      backgroundImage,
      target = 'public'
    } = body;

    console.log('🎨 Saving appearance settings:', { target, templateId, backgroundType, gradientStart, gradientEnd, backgroundImage });

    let updateData: any = {};

    if (target === 'public') {
      updateData = {
        templateId: templateId || 'template1',
        primaryColor: primaryColor || '#f5f5f5',
        textColor: textColor || '#1a1a1a',
        fontFamily: fontFamily || 'font-sans',
        backgroundType: backgroundType || 'image',
        gradientStart: gradientStart || '#fb923c',
        gradientEnd: gradientEnd || '#fde047',
        backgroundImage: backgroundImage || '/images/default-bg.jpg',
      };
    } else {
      // Admin settings
      if (!user.isPremium) {
        return NextResponse.json({ error: 'Premium feature required' }, { status: 403 });
      }
      updateData = {
        adminTemplateId: templateId || 'template1',
        adminPrimaryColor: primaryColor || '#f5f5f5',
        adminTextColor: textColor || '#1a1a1a',
        adminFontFamily: fontFamily || 'font-sans',
        adminBackgroundType: backgroundType || 'image',
        adminGradientStart: gradientStart || '#fb923c',
        adminGradientEnd: gradientEnd || '#fde047',
        adminBackgroundImage: backgroundImage || '/images/default-bg.jpg',
      };
    }

    const updatedPortal = await prisma.portal.update({
      where: { userId: user.id },
      data: updateData
    });

    console.log('✅ Appearance saved successfully for:', target);
    console.log('Updated settings:', updateData);

    return NextResponse.json({
      success: true,
      portal: updatedPortal,
      target
    });
  } catch (error) {
    console.error('Appearance update error:', error);
    return NextResponse.json({ error: 'Failed to update appearance' }, { status: 500 });
  }
}