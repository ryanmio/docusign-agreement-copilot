import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DocuSignClient } from '@/lib/docusign/client';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL));
    }

    const docusign = new DocuSignClient(supabase);
    const authUrl = docusign.getAuthorizationUrl();
    
    console.log('DocuSign Auth Debug:');
    console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('Auth URL:', authUrl);
    console.log('Client ID:', process.env.DOCUSIGN_CLIENT_ID);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('DocuSign auth error:', error);
    return NextResponse.redirect(new URL('/settings?error=Failed to connect to DocuSign', process.env.NEXT_PUBLIC_BASE_URL));
  }
} 