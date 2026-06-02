import { NextResponse } from 'next/server';

export function proxy(request: any) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (
    pathname.startsWith('/api/auth/signup') || 
    pathname.startsWith('/api/auth/login') ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/products') || pathname.startsWith('/api/')) {
    const sessionCookie = request.cookies.get('mock_session');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};