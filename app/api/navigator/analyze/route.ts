import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient } from '@/lib/docusign/navigator-client';
import type { NavigatorAgreement } from '@/lib/docusign/navigator-client';

export async function POST(request: Request) {
  console.log('🔍 Navigator analyze endpoint called');
  
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('👤 User auth check:', { 
      userId: user?.id,
      authenticated: !!user 
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { query, dateRange, expirationDateRange, parties, categories, types, provisions } = body;

    // Initialize Navigator client
    console.log('🔄 Initializing Navigator client');
    const navigatorClient = new NavigatorClient(supabase);

    // Get all agreements first
    console.log('📊 Fetching agreements from Navigator API...');
    let allAgreements: any[] = [];
    let pageToken: string | undefined;
    
    do {
      const options = pageToken ? { ctoken: pageToken } : undefined;
      const agreements = await navigatorClient.getAgreements(user.id, options);
      allAgreements = [...allAgreements, ...(agreements.items || [])];
      pageToken = agreements.response_metadata?.page_token_next;
      
      console.log('📊 Fetched page of agreements:', {
        pageSize: agreements.items?.length || 0,
        totalSoFar: allAgreements.length,
        hasNextPage: !!pageToken
      });
    } while (pageToken);

    const agreementItems = allAgreements;
    
    // Analyze patterns if requested
    let patterns = null;
    if (query.toLowerCase().includes('pattern') || query.toLowerCase().includes('trend')) {
      console.log('📈 Analyzing patterns...');
      patterns = await navigatorClient.analyzePatterns(user.id);
      console.log('📈 Pattern analysis complete:', { 
        hasPatterns: !!patterns,
        patternTypes: patterns ? Object.keys(patterns) : [] 
      });
    }

    const response = {
      agreements: allAgreements,
      patterns,
      metadata: {
        totalAgreements: allAgreements.length,
        appliedFilters: {
          from_date: dateRange?.from,
          to_date: dateRange?.to,
          expiration_from: expirationDateRange?.from,
          expiration_to: expirationDateRange?.to,
          parties,
          categories
        }
      }
    };

    console.log('✅ Sending successful response:', {
      agreementCount: response.agreements.length,
      hasPatterns: !!response.patterns,
      metadata: response.metadata
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Navigator analysis error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to analyze agreements'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 