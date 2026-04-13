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

    console.log(`Updating ${target} settings:`, settings);

    let updateData: any = {};

    if (target === 'public') {
      if (settings.templateId !== undefined) updateData.publicTemplateId = settings.templateId;
      if (settings.primaryColor !== undefined) updateData.publicPrimaryColor = settings.primaryColor;
      if (settings.backgroundType !== undefined) updateData.publicBackgroundType = settings.backgroundType;
      if (settings.gradientStart !== undefined) updateData.publicGradientStart = settings.gradientStart;
      if (settings.gradientEnd !== undefined) updateData.publicGradientEnd = settings.gradientEnd;
      if (settings.backgroundImage !== undefined) updateData.publicBackgroundImage = settings.backgroundImage;
      if (settings.textColor !== undefined) updateData.publicTextColor = settings.textColor;
      if (settings.fontFamily !== undefined) updateData.publicFontFamily = settings.fontFamily;
      console.log('Updated public settings:', updateData);
    } else if (target === 'admin') {
      if (settings.templateId !== undefined) updateData.adminTemplateId = settings.templateId;
      if (settings.primaryColor !== undefined) updateData.adminPrimaryColor = settings.primaryColor;
      if (settings.backgroundType !== undefined) updateData.adminBackgroundType = settings.backgroundType;
      if (settings.gradientStart !== undefined) updateData.adminGradientStart = settings.gradientStart;
      if (settings.gradientEnd !== undefined) updateData.adminGradientEnd = settings.gradientEnd;
      if (settings.backgroundImage !== undefined) updateData.adminBackgroundImage = settings.backgroundImage;
      if (settings.textColor !== undefined) updateData.adminTextColor = settings.textColor;
      if (settings.fontFamily !== undefined) updateData.adminFontFamily = settings.fontFamily;
      console.log('Updated admin settings:', updateData);
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