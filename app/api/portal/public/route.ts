// app/api/portal/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// app/api/portal/public/route.ts
// app/api/portal/public/route.ts - Ensure gradients are returned
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const username = searchParams.get('username');

    let portal = null;

    if (username) {
      portal = await prisma.portal.findFirst({
        where: {
          user: {
            name: {
              equals: username,
              mode: 'insensitive'
            }
          }
        },
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
    }

    if (!portal && slug) {
      portal = await prisma.portal.findUnique({
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
    }

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const displayName = portal.user.name || portal.slug;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 PUBLIC API - Returning Settings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('backgroundType:', portal.backgroundType);
    console.log('gradientStart:', portal.gradientStart);
    console.log('gradientEnd:', portal.gradientEnd);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      title: portal.title,
      bio: portal.bio,
      userName: displayName,
      slug: portal.slug,
      links: portal.links,
      products: portal.products,
      templateId: portal.templateId || 'template1',
      primaryColor: portal.primaryColor || '#f5f5f5',
      backgroundType: portal.backgroundType || 'gradient',
      gradientStart: portal.gradientStart || '#fb923c',
      gradientEnd: portal.gradientEnd || '#fde047',
      backgroundImage: portal.backgroundImage,
      textColor: portal.textColor || '#1a1a1a',
      fontFamily: portal.fontFamily || 'font-sans',
      isPremium: portal.user.isPremium,
      customUsername: portal.user.name !== portal.slug ? portal.user.name : null
    });
    
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}