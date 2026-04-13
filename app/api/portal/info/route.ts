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
    
    // Return ALL portal settings
    return NextResponse.json({
      slug: user.portal.slug,
      title: user.portal.title,
      bio: user.portal.bio,
      userName: user.name,  // Add this line
      // Public settings
      templateId: user.portal.publicTemplateId,
      primaryColor: user.portal.publicPrimaryColor,
      backgroundType: user.portal.publicBackgroundType,
      gradientStart: user.portal.publicGradientStart,
      gradientEnd: user.portal.publicGradientEnd,
      backgroundImage: user.portal.publicBackgroundImage,
      textColor: user.portal.publicTextColor,
      fontFamily: user.portal.publicFontFamily,
      // Admin settings (for premium users)
      adminTemplateId: user.portal.adminTemplateId,
      adminPrimaryColor: user.portal.adminPrimaryColor,
      adminBackgroundType: user.portal.adminBackgroundType,
      adminGradientStart: user.portal.adminGradientStart,
      adminGradientEnd: user.portal.adminGradientEnd,
      adminBackgroundImage: user.portal.adminBackgroundImage,
      adminTextColor: user.portal.adminTextColor,
      adminFontFamily: user.portal.adminFontFamily
    });;
    
  } catch (error) {
    console.error('Portal info error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}