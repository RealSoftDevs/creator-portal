import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Await the params (Next.js 15+ requires this)
    const params = await context.params;
    const slug = params.slug;
    
    console.log('Fetching portal with slug:', slug);
    
    const portal = await prisma.portal.findUnique({
      where: { slug: slug },
      include: {
        user: true,
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log('Portal found:', portal ? 'Yes' : 'No');
    
    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      title: portal.title,
      bio: portal.bio,
      userName: portal.user.name,
      links: portal.links
    });
    
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: 'Server error: ' + (error as Error).message }, { status: 500 });
  }
}