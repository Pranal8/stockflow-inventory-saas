import { NextResponse } from 'next/server';

// 💡 We use pure runtime objects to bypass NextRequest compile-time import breaks entirely
export function proxy(request: any) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. ALWAYS ALLOW AUTHENTICATION ENDPOINTS TO PASS THROUGH CLEANLY
  if (
    pathname.startsWith('/api/auth/signup') || 
    pathname.startsWith('/api/auth/login') ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  // 2. Protect dashboard and product routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/products') || pathname.startsWith('/api/')) {
    const sessionCookie = request.cookies.get('mock_session');

    // If no session token is found, redirect them to login cleanly
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