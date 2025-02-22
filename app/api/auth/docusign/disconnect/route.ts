import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('api_credentials')
      .delete()
      .match({ 
        user_id: user.id,
        provider: 'docusign'
      });

    if (error) {
      console.error('Error deleting credentials:', error);
      return NextResponse.json(
        { error: 'Failed to delete credentials' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting DocuSign:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect DocuSign' },
      { status: 500 }
    );
  }
} 