import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }
    
    const portal = await prisma.portal.findUnique({
      where: { slug: slug },
      include: {
        user: true,
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        products: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    // Return PUBLIC settings (not admin settings)
    return NextResponse.json({
      title: portal.title,
      bio: portal.bio,
      userName: portal.user.name,
      links: portal.links,
      products: portal.products,
      // Public settings from database
      templateId: portal.publicTemplateId || 'template1',
      primaryColor: portal.publicPrimaryColor || '#000000',
      backgroundType: portal.publicBackgroundType || 'color',
      gradientStart: portal.publicGradientStart,
      gradientEnd: portal.publicGradientEnd,
      backgroundImage: portal.publicBackgroundImage,
      textColor: portal.publicTextColor,
      fontFamily: portal.publicFontFamily || 'font-sans'
    });
    
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}