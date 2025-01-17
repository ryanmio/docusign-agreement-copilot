import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NavigatorClient } from '@/lib/docusign/navigator-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const navigator = new NavigatorClient(supabase);
    
    // Get last 30 days of agreements
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const patterns = await navigator.analyzePatterns(session.user.id);

    // Also test raw agreements endpoint
    const agreements = await navigator.getAgreements(session.user.id);

    return NextResponse.json({
      status: 'success',
      message: 'Navigator API is accessible',
      patterns,
      agreementCount: agreements.items?.length || 0,
      firstAgreement: agreements.items?.[0] || null,
    });

  } catch (error: any) {
    console.error('Navigator API test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      hint: error.message.includes('403') ? 
        'You may need to re-authenticate with DocuSign to get Navigator API access' :
        'Check if you have Navigator API beta access',
    }, { status: 500 });
  }
} 