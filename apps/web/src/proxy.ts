import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/', '/products', '/reviews'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('seapedia-auth');
  const activeRoleCookie = request.cookies.get('seapedia-active-role');
  const hasActiveRole = activeRoleCookie && activeRoleCookie.value !== '';

  // Auth pages logic
  if (['/login', '/register'].includes(pathname)) {
    if (authCookie) {
      if (!hasActiveRole) return NextResponse.redirect(new URL('/select-role', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Dashboard protection
  if (pathname.startsWith('/dashboard')) {
    if (!authCookie) return NextResponse.redirect(new URL('/login', request.url));
    if (!hasActiveRole) return NextResponse.redirect(new URL('/select-role', request.url));
    
    // Strict Admin check
    if (pathname.startsWith('/dashboard/admin') && activeRoleCookie.value !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }

  // Select-role protection
  if (pathname === '/select-role') {
    if (!authCookie) return NextResponse.redirect(new URL('/login', request.url));
    if (hasActiveRole) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
