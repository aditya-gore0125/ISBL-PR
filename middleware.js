import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET must be set in production.');
}

if (!nextAuthSecret) {
  console.warn('NEXTAUTH_SECRET is not set; admin authentication may not work correctly.');
}

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
