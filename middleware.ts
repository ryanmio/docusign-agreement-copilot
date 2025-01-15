import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Allow homepage, preview page, and public files access without auth
  if (
    req.nextUrl.pathname === '/' || 
    req.nextUrl.pathname === '/preview' ||
    req.nextUrl.pathname.startsWith('/VENDOR-RENEWAL-AcmeCorp-2023-01-15.pdf')
  ) {
    return res;
  }

  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const connectUrl = new URL('/auth/connect', req.url);
    if (req.nextUrl.pathname !== '/') {
      connectUrl.searchParams.set('redirect', req.nextUrl.pathname.slice(1));
    }
    return NextResponse.redirect(connectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/webhooks/** (webhook endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/** (auth endpoints)
     */
    '/((?!api/webhooks|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}; 