import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname === '/pending-approval' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const user = cookie ? verifySessionToken(cookie.value) : null;

  // Block unverified PROVIDERs from all pages except public ones
  if (user?.role === 'PROVIDER' && user.is_verified === false) {
    return NextResponse.redirect(new URL('/pending-approval', request.url));
  }

  // Admin area: only ADMIN can access
  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Dashboard + notifications require an authenticated user
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/notifications')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
