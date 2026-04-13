import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, createToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for:', email);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { portal: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = await createToken(user.id);
    
    // Create the response with cookie
    const response = NextResponse.json({ 
      success: true, 
      portalSlug: user.portal?.slug,
      redirectTo: '/studio'  // Changed from /admin to /studio
    });
    
    // Set cookie on the response
    response.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax'
    });
    
    console.log('Login successful for:', email);
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong: ' + (error as Error).message }, { status: 500 });
  }
}