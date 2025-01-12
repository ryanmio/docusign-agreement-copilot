import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient } from '@/lib/docusign/navigator-client';
import type { NavigatorAgreement } from '@/lib/docusign/navigator-client';
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

    console.log('🔍 Debug: Fetching agreements for user:', session.user.id);

    // Test basic agreement fetching
    const agreements = await navigatorClient.getAgreements(session.user.id, {
      from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      to_date: new Date().toISOString()
    });

    console.log('📊 Debug: Raw Agreement Data Sample:', 
      agreements.items?.[0] ? JSON.stringify(agreements.items[0], null, 2) : 'No agreements'
    );

    // Analyze patterns
    const patterns = await navigatorClient.analyzePatterns(session.user.id, {
      from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to_date: new Date().toISOString()
    });

    // Validate key data structures we need for demo features
    const dataValidation = {
      provisions: {
        hasExpirationDates: agreements.items?.some((a: NavigatorAgreement) => a.provisions?.expiration_date),
        hasEffectiveDates: agreements.items?.some((a: NavigatorAgreement) => a.provisions?.effective_date),
        hasRenewalInfo: agreements.items?.some((a: NavigatorAgreement) => 
          a.provisions?.renewal_type || a.provisions?.renewal_notice_period
        ),
        allProvisionFields: agreements.items?.[0]?.provisions ? Object.keys(agreements.items[0].provisions) : []
      },
      parties: {
        hasPartyNames: agreements.items?.some((a: NavigatorAgreement) => 
          a.parties?.some((p: { name_in_agreement: string }) => p.name_in_agreement)
        ),
        totalParties: agreements.items?.reduce((sum: number, a: NavigatorAgreement) => 
          sum + (a.parties?.length || 0), 0
        ),
        samplePartyFields: agreements.items?.[0]?.parties?.[0] ? Object.keys(agreements.items[0].parties[0]) : []
      },
      metadata: {
        hasCreationInfo: agreements.items?.some((a: NavigatorAgreement) => 
          a.metadata?.created_at && a.metadata?.created_by
        ),
        allMetadataFields: agreements.items?.[0]?.metadata ? Object.keys(agreements.items[0].metadata) : []
      },
      types: {
        uniqueTypes: Array.from(new Set(agreements.items?.map((a: NavigatorAgreement) => a.type) || [])),
        uniqueCategories: Array.from(new Set(agreements.items?.map((a: NavigatorAgreement) => a.category) || []))
      }
    };

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

    const response = {
      summary: {
        totalAgreements: agreements.items?.length || 0,
        status: agreements.items?.length ? '✅ Found agreements' : '⚠️ No agreements found',
        message: agreements.items?.length 
          ? 'Navigator is working and found agreements'
          : 'Navigator is working but no agreements found - try uploading some documents',
        debug: {
          accountId: navigatorClient.accountId,
          baseUrl: navigatorClient.navigatorBasePath,
          hasValidToken: !!navigatorClient.accessToken
        }
      },
      dataValidation,
      patterns: {
        dayOfWeek: {
          hasTuesdayPattern: patterns.byDayOfWeek['Tuesday'] > 1 ? '✅ Yes' : '❌ No',
          distribution: Object.entries(patterns.byType)
            .map(([type, count]) => `${type}: ${count} agreements`)
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
    };

    console.log('📝 Debug: Final Response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Navigator debug error:', error);
    return NextResponse.json({
      status: '❌ Error',
      message: error.message,
      help: 'Check console for detailed error stack',
      timestamp: new Date().toLocaleString()
    }, { status: 500 });
  }
} 