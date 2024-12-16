import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // If user is not signed in and the current path is not / or /auth/login,
  // redirect the user to /auth/login
  if (!session && !['/auth/login', '/'].includes(req.nextUrl.pathname)) {
    const redirectUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and the current path is /auth/login,
  // redirect the user to /documents
  if (session && req.nextUrl.pathname === '/auth/login') {
    const redirectUrl = new URL('/documents', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/documents',
    '/settings',
    '/auth/login',
    '/documents/:path*',
    '/settings/:path*',
  ],
};
