import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has connected DocuSign
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .single();

    if (credentialsError || !credentials) {
      return NextResponse.json(
        { error: 'Please connect your DocuSign account first' },
        { status: 400 }
      );
    }

    const docusign = new DocuSignEnvelopes(supabase);
    const template = await docusign.getTemplate(user.id, params.id);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json(
      { error: 'Failed to get template' },
      { status: 500 }
    );
  }
} 