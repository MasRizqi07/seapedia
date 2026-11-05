import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/seller', '/driver', '/buyer', '/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('seapedia-auth');
  const activeRoleCookie = request.cookies.get('seapedia-active-role');
  const activeRole = activeRoleCookie?.value;
  const hasActiveRole = Boolean(activeRole && activeRole.trim() !== '');
  const roleSlug = activeRole ? activeRole.toLowerCase() : 'buyer';

  // 1. Auth pages logic (login / register)
  if (['/login', '/register'].includes(pathname)) {
    if (authCookie) {
      if (!hasActiveRole) {
        return NextResponse.redirect(new URL('/select-role', request.url));
      }
      return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
    }
    return NextResponse.next();
  }

  // 2. Select-role protection
  if (pathname === '/select-role') {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. Central dashboard route redirect
  if (pathname === '/dashboard') {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!hasActiveRole) {
      return NextResponse.redirect(new URL('/select-role', request.url));
    }
    return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
  }

  // 4. Protected role portals
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!hasActiveRole) {
      return NextResponse.redirect(new URL('/select-role', request.url));
    }

    // Role-specific enforcement
    if (pathname.startsWith('/admin') && activeRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
    }
    if (pathname.startsWith('/seller') && activeRole !== 'SELLER') {
      return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
    }
    if (pathname.startsWith('/driver') && activeRole !== 'DRIVER') {
      return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
    }
    if (pathname.startsWith('/buyer') && activeRole !== 'BUYER') {
      return NextResponse.redirect(new URL(`/${roleSlug}`, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
