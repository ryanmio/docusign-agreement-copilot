import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Status check: No user found', userError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    }

    console.log('Status check: Checking credentials for user', user.id);
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('created_at, expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .maybeSingle();

    console.log('Status check: Credentials result', { credentials, credentialsError });

    if (credentialsError && credentialsError.code !== 'PGRST116') {
      console.error('Error fetching credentials:', credentialsError);
      return NextResponse.json(
        { error: 'Failed to fetch credentials' },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    }

    return NextResponse.json(
      {
        connected: !!credentials,
        expires_at: credentials?.expires_at,
        created_at: credentials?.created_at
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
} 