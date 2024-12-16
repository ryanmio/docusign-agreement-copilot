import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all credentials for this user
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id);

    if (credentialsError) {
      return NextResponse.json({ error: credentialsError.message }, { status: 500 });
    }

    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      credentials,
      tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 