import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getAuthSecret } from '@/lib/env';

const nextAuthSecret = getAuthSecret();

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: nextAuthSecret,
  });

  if (!token || (pathname.startsWith('/admin') && token.role !== 'admin')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*'],
};
