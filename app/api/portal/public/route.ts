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

    // Return the user's preferred name
    const displayName = portal.user.name || portal.slug;

    // IMPORTANT: Use MAIN fields, NOT public prefixed fields
    return NextResponse.json({
      title: portal.title,
      bio: portal.bio,
      userName: displayName,
      slug: portal.slug,
      links: portal.links,
      products: portal.products,
      templateId: portal.templateId || 'template1',
      primaryColor: portal.primaryColor || '#f5f5f5',
      backgroundType: portal.backgroundType || 'image',  // ← Use main field
      gradientStart: portal.gradientStart,
      gradientEnd: portal.gradientEnd,
      backgroundImage: portal.backgroundImage,  // ← Use main field
      textColor: portal.textColor,
      fontFamily: portal.fontFamily || 'font-sans'
    });
    
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}