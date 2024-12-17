import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignClient } from '@/lib/docusign/client';

export async function GET(request: NextRequest) {
  console.log('DocuSign callback received');
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('Callback params:', { code: code?.substring(0, 10) + '...', error, errorDescription });

  if (error) {
    console.error('DocuSign OAuth Error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  }

  if (!code) {
    console.log('No authorization code received');
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', 
      process.env.NEXT_PUBLIC_BASE_URL)
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('Auth check:', { userId: user?.id, error: userError });

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.redirect(
        new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL)
      );
    }

    console.log('Exchanging code for token...');
    const docusign = new DocuSignClient();
    await docusign.exchangeCodeForToken(code, user.id);
    console.log('Token exchange successful');

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