import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_ROUTES: Record<string, string> = {
  student: '/dashboard/student',
  verifier: '/dashboard/verifier',
  recruiter: '/dashboard/recruiter',
  admin: '/dashboard/admin',
};

const PROTECTED_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token && userRole) {
    const route = ROLE_ROUTES[userRole] || '/dashboard/student';
    return NextResponse.redirect(new URL(route, request.url));
  }

  if (isProtected && userRole) {
    const rolePrefix = `/dashboard/${userRole}`;
    const allowedPrefixes = [rolePrefix];

    if (userRole === 'admin') {
      allowedPrefixes.push('/dashboard/student', '/dashboard/verifier', '/dashboard/recruiter');
    }

    const isAllowed = allowedPrefixes.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[userRole] || '/dashboard/student', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
