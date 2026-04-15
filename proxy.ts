import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes - require authentication
  const protectedRoutes = ['/studio', '/dashboard', '/api/portal', '/api/user'];
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Redirect to login if not authenticated
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Verify token
    const userId = await verifyToken(token);
    if (!userId) {
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/studio/:path*',
    '/dashboard/:path*',
    '/api/portal/:path*',
    '/api/user/:path*',
  ],
};