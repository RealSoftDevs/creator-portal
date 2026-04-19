// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { verifyPassword, createToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for:', email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { portal: true }
    });

    if (!user) {
      console.log('❌ Login failed: User not found:', email);
      return NextResponse.json({
        error: 'Account not found. Please check your email or sign up.'
      }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log('❌ Login failed: Invalid password for:', email);
      return NextResponse.json({
        error: 'Incorrect password. Please try again.'
      }, { status: 401 });
    }

    // Check if user has a portal (should have, but just in case)
    if (!user.portal) {
      console.log('⚠️ User has no portal, creating one...');
      // Create portal if missing (fallback)
      const slug = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const portal = await prisma.portal.create({
        data: {
          slug: slug,
          userId: user.id,
          templateId: 'template1',
          primaryColor: '#f5f5f5',
          backgroundType: 'image',
          backgroundImage: '/images/default-bg.jpg',
          gradientStart: '#fb923c',
          gradientEnd: '#fde047',
          textColor: '#1a1a1a',
          fontFamily: 'font-sans',
        }
      });
      console.log('✅ Created new portal for user:', portal.id);
    }

    const token = await createToken(user.id);

    const response = NextResponse.json({
      success: true,
      portalSlug: user.portal?.slug,
      redirectTo: '/studio'
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax'
    });

    console.log('✅ Login successful for:', email);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Something went wrong. Please try again later.'
    }, { status: 500 });
  }
}