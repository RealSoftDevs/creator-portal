import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, createToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Registration attempt for:', email);
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    const hashedPassword = await hashPassword(password);
    const slug = email.split('@')[0] + Math.floor(Math.random() * 1000);
    
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        portal: {
          create: {
            slug: slug
          }
        }
      },
      include: { portal: true }
    });
    
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
    
    console.log('Registration successful for:', email);
    return response;
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Something went wrong: ' + (error as Error).message }, { status: 500 });
  }
}