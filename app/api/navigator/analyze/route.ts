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
    const agreements = await navigatorClient.getAgreements(user.id);
    console.log('📊 Navigator API response:', {
      hasItems: !!agreements.items,
      itemCount: agreements.items?.length || 0,
      metadata: agreements.response_metadata
    });

    const agreementItems = agreements.items || [];
    
    // Filter results by criteria
    let filteredItems = agreementItems;
    
    // Apply date range filter if specified
    if (dateRange?.from && dateRange?.to) {
      console.log('🔍 Filtering by date range:', dateRange);
      filteredItems = filteredItems.filter((agreement: NavigatorAgreement) => {
        const effectiveDate = agreement.provisions?.effective_date;
        if (!effectiveDate) return false;
        const date = new Date(effectiveDate);
        return date >= new Date(dateRange.from) && date <= new Date(dateRange.to);
      });
    } else if (query.toLowerCase().includes('last 6 months')) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filteredItems = filteredItems.filter((agreement: NavigatorAgreement) => {
        const effectiveDate = agreement.provisions?.effective_date;
        if (!effectiveDate) return false;
        const date = new Date(effectiveDate);
        return date >= sixMonthsAgo && date <= new Date();
      });
    }

    if (types?.length) {
      console.log('🔍 Filtering by types:', types);
      filteredItems = filteredItems.filter((agreement: NavigatorAgreement) =>
        types.includes(agreement.type)
      );
    }
    
    if (parties?.length) {
      console.log('🔍 Filtering by parties:', parties);
      filteredItems = filteredItems.filter((agreement: NavigatorAgreement) => 
        agreement.parties.some(p => parties.includes(p.name_in_agreement))
      );
    }

    if (categories?.length) {
      console.log('🔍 Filtering by categories:', categories);
      filteredItems = filteredItems.filter((agreement: NavigatorAgreement) =>
        categories.includes(agreement.category)
      );
    }

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
      agreements: agreementItems, // Send ALL agreements
      patterns,
      metadata: {
        totalAgreements: agreementItems.length,
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