import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DocuSignClient } from '@/lib/docusign/client';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL));
  }

  const docusign = new DocuSignClient();
  const authUrl = docusign.getAuthorizationUrl();

  return NextResponse.redirect(authUrl);
} 