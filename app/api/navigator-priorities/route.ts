import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient, NavigatorAgreement } from '@/lib/docusign/navigator-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create Supabase client with awaited cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Initialize Navigator client
    const navigatorClient = new NavigatorClient(supabase);

    // Get agreements from the last 30 days and upcoming 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Log authentication state before making request
    console.log('🔐 Debug: Authentication state:', {
      hasSession: !!session,
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });

    const agreements = await navigatorClient.getAgreements(session.user.id);

    // Filter for agreements with expiration dates
    const priorityAgreements = agreements.items.filter((agreement: NavigatorAgreement) => 
      agreement.provisions?.expiration_date &&
      new Date(agreement.provisions.expiration_date) > new Date() &&
      new Date(agreement.provisions.expiration_date) <= thirtyDaysFromNow
    );

    return NextResponse.json({
      items: priorityAgreements,
      metadata: {
        total: priorityAgreements.length,
        timeframe: {
          from: thirtyDaysAgo.toISOString(),
          to: thirtyDaysFromNow.toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('Navigator priorities error:', error);
    
    // Enhanced error response
    return NextResponse.json({
      error: error.message || 'Failed to fetch priorities',
      details: error.cause || error.stack,
      help: 'Try disconnecting and reconnecting DocuSign to refresh the token',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 