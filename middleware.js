import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getAuthSecret } from '@/lib/env';

const nextAuthSecret = getAuthSecret();

export async function middleware(request) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: nextAuthSecret,
  });

  if (!token || token.role !== 'admin') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
