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
    console.log(`Using templateId: ${defaultConfig.templateId}`);
    console.log(`Using primaryColor: ${defaultConfig.primaryColor}`);
    console.log(`Using backgroundType: ${defaultConfig.backgroundType || 'color'}`);
    console.log(`Using backgroundImage: ${defaultConfig.backgroundImage || 'none'}`);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`❌ User already exists: ${email}`);
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const slug = email.split('@')[0] + Math.floor(Math.random() * 1000);

    console.log(`Generated slug: ${slug}`);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        portal: {
          create: {
            slug: slug,
            templateId: defaultConfig.templateId,
            primaryColor: defaultConfig.primaryColor,
            backgroundType: defaultConfig.backgroundType || 'image',
            backgroundImage: defaultConfig.backgroundImage,
          }
        }
      },
      include: { portal: true }
    });

    console.log(`✅ User created with ID: ${user.id}`);
    console.log(`✅ Portal created with ID: ${user.portal?.id}`);
    console.log(`   Template: ${user.portal?.templateId}`);
    console.log(`   Primary Color: ${user.portal?.primaryColor}`);
    console.log(`   Background Type: ${user.portal?.backgroundType}`);
    console.log(`   Background Image: ${user.portal?.backgroundImage || 'none'}`);
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
    return NextResponse.json({ error: 'Something went wrong: ' + (error as Error).message }, { status: 500 });
  }
}