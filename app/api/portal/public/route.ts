// app/api/portal/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const slug = searchParams.get('slug');

  try {
    let portal;

    if (username) {
      // Find by custom username - CASE INSENSITIVE
      portal = await prisma.portal.findFirst({
        where: {
          OR: [
            { user: { name: { mode: 'insensitive', equals: username } } },
            { slug: { mode: 'insensitive', equals: username } }
          ]
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              isPremium: true
            }
          },
          links: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          products: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } else if (slug) {
      portal = await prisma.portal.findUnique({
        where: { slug },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              isPremium: true
            }
          },
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

    // Transform response with additional fields
    const response = {
      id: portal.id,
      slug: portal.slug,
      title: portal.title,
      bio: portal.bio,
      displayName: portal.displayName || portal.user?.name || portal.title,
      avatarUrl: portal.avatarUrl,
      userName: portal.user?.name || portal.slug,
      links: portal.links,
      products: portal.products,
      templateId: portal.templateId,
      primaryColor: portal.primaryColor,
      backgroundImage: portal.backgroundImage,
      backgroundType: portal.backgroundType,
      gradientStart: portal.gradientStart,
      gradientEnd: portal.gradientEnd,
      textColor: portal.textColor,
      fontFamily: portal.fontFamily,
      isPremium: portal.user?.isPremium || false,
      customUsername: portal.user?.name
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching portal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}