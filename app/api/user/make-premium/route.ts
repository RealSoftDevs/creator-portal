import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Await cookies() in Next.js 15+
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { email } = await request.json();
    
    const user = await prisma.user.update({
      where: { email: email },
      data: { isPremium: true }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `${email} is now a premium user!` 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: 'User not found or error occurred' 
    }, { status: 404 });
  }
}