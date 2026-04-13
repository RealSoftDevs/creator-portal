import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ message: 'Database connected', userCount: count });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}