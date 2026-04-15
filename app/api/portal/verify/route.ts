import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ ownsPortal: false }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ ownsPortal: false }, { status: 401 });
    }
    
    const portal = await prisma.portal.findUnique({
      where: { userId }
    });
    
    return NextResponse.json({ 
      ownsPortal: !!portal,
      slug: portal?.slug 
    });
    
  } catch (error) {
    return NextResponse.json({ ownsPortal: false }, { status: 500 });
  }
}