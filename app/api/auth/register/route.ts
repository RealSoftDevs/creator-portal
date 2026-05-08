// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, createToken } from '@/lib/auth';
import { defaultConfig } from '@/lib/defaults';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 NEW USER REGISTRATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User email: ${email}`);

    // Check if user exists (including soft-deleted or regular)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { portal: true }
    });

    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      return NextResponse.json({
        error: 'An account with this email already exists. Please login instead.'
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const slug = email.split('@')[0] + Math.floor(Math.random() * 1000);

    console.log(`Generated slug: ${slug}`);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        isPremium: false, // Explicitly set to false for new users
        portal: {
          create: {
            slug: slug,
            // Public settings
            templateId: defaultConfig.templateId,
            primaryColor: defaultConfig.primaryColor,
            backgroundType: defaultConfig.backgroundType,
            backgroundImage: defaultConfig.backgroundImage,
            gradientStart: defaultConfig.gradientStart,
            gradientEnd: defaultConfig.gradientEnd,
            textColor: defaultConfig.textColor,
            fontFamily: defaultConfig.fontFamily,
            // Admin settings (dark theme)
            adminTemplateId: defaultConfig.adminTemplateId,
            adminPrimaryColor: defaultConfig.adminPrimaryColor,
            adminBackgroundType: defaultConfig.adminBackgroundType,
            adminGradientStart: defaultConfig.adminGradientStart,
            adminGradientEnd: defaultConfig.adminGradientEnd,
            adminBackgroundImage: defaultConfig.adminBackgroundImage,
            adminTextColor: defaultConfig.adminTextColor,
            adminFontFamily: defaultConfig.adminFontFamily,
          }
        }
      },
      include: { portal: true }
    });

    console.log(`✅ User created with ID: ${user.id}`);
    console.log(`✅ Portal created with ID: ${user.portal?.id}`);
    console.log(`   Background Type: ${user.portal?.backgroundType}`);
    console.log(`   Background Image: ${user.portal?.backgroundImage}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}