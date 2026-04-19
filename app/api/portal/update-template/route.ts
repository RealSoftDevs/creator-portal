// app/api/portal/update-template/route.ts (Make sure this is correct)
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

    const body = await request.json();
    const { target = 'public', ...settings } = body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 UPDATE TEMPLATE - Saving to:', target);
    console.log('Settings:', settings);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let updateData: any = {};

    if (target === 'public') {
      if (settings.templateId !== undefined) updateData.templateId = settings.templateId;
      if (settings.primaryColor !== undefined) updateData.primaryColor = settings.primaryColor;
      if (settings.backgroundType !== undefined) updateData.backgroundType = settings.backgroundType;
      if (settings.gradientStart !== undefined) updateData.gradientStart = settings.gradientStart;
      if (settings.gradientEnd !== undefined) updateData.gradientEnd = settings.gradientEnd;
      if (settings.backgroundImage !== undefined) updateData.backgroundImage = settings.backgroundImage;
      if (settings.textColor !== undefined) updateData.textColor = settings.textColor;
      if (settings.fontFamily !== undefined) updateData.fontFamily = settings.fontFamily;

      console.log('✅ Updated PUBLIC settings with gradient:', {
        backgroundType: settings.backgroundType,
        gradientStart: settings.gradientStart,
        gradientEnd: settings.gradientEnd
      });
    } else if (target === 'admin') {
      if (settings.templateId !== undefined) updateData.adminTemplateId = settings.templateId;
      if (settings.primaryColor !== undefined) updateData.adminPrimaryColor = settings.primaryColor;
      if (settings.backgroundType !== undefined) updateData.adminBackgroundType = settings.backgroundType;
      if (settings.gradientStart !== undefined) updateData.adminGradientStart = settings.gradientStart;
      if (settings.gradientEnd !== undefined) updateData.adminGradientEnd = settings.gradientEnd;
      if (settings.backgroundImage !== undefined) updateData.adminBackgroundImage = settings.backgroundImage;
      if (settings.textColor !== undefined) updateData.adminTextColor = settings.textColor;
      if (settings.fontFamily !== undefined) updateData.adminFontFamily = settings.fontFamily;
    }

    const updatedPortal = await prisma.portal.update({
      where: { id: user.portal.id },
      data: updateData
    });

    return NextResponse.json({ success: true, portal: updatedPortal });

  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}