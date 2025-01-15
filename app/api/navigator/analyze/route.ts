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
    
    const { query, dateRange, parties, categories, types, provisions } = body;

    // Initialize Navigator client
    console.log('🔄 Initializing Navigator client');
    const navigatorClient = new NavigatorClient(supabase);

    // Construct filter parameters
    const options: {
      from_date?: string;
      to_date?: string;
      agreement_type?: string;
    } = {};
    
    // If no date range specified and query mentions "last 6 months",
    // add a default date range
    if (!dateRange && query.toLowerCase().includes('last 6 months')) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      options.from_date = sixMonthsAgo.toISOString();
      options.to_date = new Date().toISOString();
    } else if (dateRange) {
      if (dateRange.from) options.from_date = dateRange.from;
      if (dateRange.to) options.to_date = dateRange.to;
    }

    if (types?.length) {
      options.agreement_type = types[0]; // Navigator API only supports one type filter
    }

    console.log('🔍 Constructed filter options:', options);

    // Get agreements with filters
    console.log('📊 Fetching agreements from Navigator API...');
    const agreements = await navigatorClient.getAgreements(user.id, options);
    console.log('📊 Navigator API response:', {
      hasItems: !!agreements.items,
      itemCount: agreements.items?.length || 0,
      metadata: agreements.response_metadata
    });

    const agreementItems = agreements.items || [];

    // Filter results by additional criteria not supported by the API
    let filteredItems = agreementItems;
    
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

    console.log('📊 Post-filter results:', {
      originalCount: agreementItems.length,
      filteredCount: filteredItems.length
    });

    // Analyze patterns if requested
    let patterns = null;
    if (query.toLowerCase().includes('pattern') || query.toLowerCase().includes('trend')) {
      console.log('📈 Analyzing patterns...');
      patterns = await navigatorClient.analyzePatterns(user.id, {
        from_date: options.from_date || new Date(0).toISOString(),
        to_date: options.to_date || new Date().toISOString()
      });
      console.log('📈 Pattern analysis complete:', { 
        hasPatterns: !!patterns,
        patternTypes: patterns ? Object.keys(patterns) : [] 
      });
    }

    const response = {
      agreements: filteredItems,
      patterns,
      metadata: {
        totalAgreements: filteredItems.length,
        appliedFilters: {
          ...options,
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