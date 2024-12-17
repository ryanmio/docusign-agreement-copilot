import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all credentials for the user
    const { data: credentials } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .order('created_at', { ascending: false });

    console.log('Found credentials:', credentials?.length);

    if (credentials && credentials.length > 1) {
      // Keep the most recent one and delete the rest
      const [latest, ...oldOnes] = credentials;
      const oldIds = oldOnes.map(c => c.id);

      const { error: deleteError } = await supabase
        .from('api_credentials')
        .delete()
        .in('id', oldIds);

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to clean up' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Cleaned up duplicate credentials',
        deleted: oldIds.length,
        kept: latest.id
      });
    }

    return NextResponse.json({
      message: 'No cleanup needed',
      count: credentials?.length || 0
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 