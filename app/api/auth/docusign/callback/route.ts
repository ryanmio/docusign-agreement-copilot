import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignClient } from '@/lib/docusign/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('DocuSign OAuth Error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.redirect(
        new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL)
      );
    }

    const docusign = new DocuSignClient();
    await docusign.exchangeCodeForToken(code, user.id);

    return NextResponse.redirect(
      new URL('/settings?success=DocuSign connected successfully', 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  } catch (error) {
    console.error('Error processing DocuSign callback:', error);
    return NextResponse.redirect(
      new URL('/settings?error=Failed to connect DocuSign', 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  }
} 