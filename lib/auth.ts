import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import prisma from './prisma';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-this-to-something-secure');

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromToken(token: string | undefined) {
  if (!token) return null;
  const userId = await verifyToken(token);
  if (!userId) return null;
  
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { portal: true }
  });
}