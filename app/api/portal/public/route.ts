import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const username = searchParams.get('username');

    let portal = null;

    // Try to find by username first (premium custom URL)
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

    // If not found by username, try by slug (free tier)
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

    // Return the user's preferred name (custom username if set, otherwise use name)
    const displayName = portal.user.name || portal.slug;

    return NextResponse.json({
      title: portal.title,
      bio: portal.bio,
      userName: displayName,
      slug: portal.slug,
      links: portal.links,
      products: portal.products,
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