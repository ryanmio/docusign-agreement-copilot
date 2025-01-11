import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient } from '@/lib/docusign/navigator-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const navigatorClient = new NavigatorClient(supabase);

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Test basic agreement fetching
    const agreements = await navigatorClient.getAgreements(session.user.id, {
      from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      to_date: new Date().toISOString()
    });

    // Analyze patterns
    const patterns = await navigatorClient.analyzePatterns(session.user.id, {
      from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to_date: new Date().toISOString()
    });

    // Format dates for readability
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Count urgent agreements
    const urgentAgreements = (agreements.items || []).filter((a: any) => 
      a.provisions?.expiration_date && 
      new Date(a.provisions.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    return NextResponse.json({
      summary: {
        totalAgreements: agreements.items?.length || 0,
        status: agreements.items?.length ? '✅ Found agreements' : '⚠️ No agreements found',
        message: agreements.items?.length 
          ? 'Navigator is working and found agreements'
          : 'Navigator is working but no agreements found - try uploading some documents'
      },
      patterns: {
        dayOfWeek: {
          hasTuesdayPattern: patterns.byDayOfWeek['Tuesday'] > 1 ? '✅ Yes' : '❌ No',
          distribution: Object.entries(patterns.byType)
            .map(([day, count]) => `${day}: ${count} agreements`)
            .join('\n')
        },
        agreementTypes: Object.entries(patterns.byType)
          .map(([type, count]) => `${type}: ${count} agreements`)
          .join('\n'),
        categories: Object.entries(patterns.byCategory)
          .map(([category, count]) => `${category}: ${count} agreements`)
          .join('\n')
      },
      urgentItems: {
        count: urgentAgreements.length,
        status: urgentAgreements.length ? '🚨 Found urgent items' : '✅ No urgent items',
        items: urgentAgreements.map((a: any) => ({
          type: a.type,
          expiresOn: formatDate(a.provisions.expiration_date)
        }))
      },
      apiResponse: {
        timestamp: new Date().toLocaleString(),
        responseTime: agreements.response_metadata?.response_duration_ms + 'ms'
      }
    });

  } catch (error: any) {
    console.error('Navigator debug error:', error);
    return NextResponse.json({
      status: '❌ Error',
      message: error.message,
      help: 'Check console for detailed error stack',
      timestamp: new Date().toLocaleString()
    }, { status: 500 });
  }
} 