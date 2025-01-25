import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient } from '@/lib/docusign/navigator-client';
import type { NavigatorAgreement } from '@/lib/docusign/navigator-client';

/**
 * Date string converter for relative dates in filters
 * 
 * Current support:
 * - 'now' -> current date
 * - 'now+Xdays' -> X days in future (e.g., 'now+30days')
 * - 'now-Xdays' -> X days in past (e.g., 'now-7days')
 * 
 * To expand functionality in the future:
 * 1. For quarters/years, create a DATE_PATTERNS map:
 *    const DATE_PATTERNS = {
 *      'q_start': () => getQuarterStart(new Date()),
 *      'q_end': () => getQuarterEnd(new Date()),
 *      'y_start': () => new Date(new Date().getFullYear(), 0, 1),
 *      'next_q': () => getQuarterStart(addMonths(new Date(), 3))
 *    }
 * 
 * 2. For more complex ranges, use a range resolver:
 *    const RANGE_PATTERNS = {
 *      'this_quarter': () => ({ from: DATE_PATTERNS.q_start(), to: DATE_PATTERNS.q_end() }),
 *      'next_quarter': () => ({ from: DATE_PATTERNS.next_q_start(), to: DATE_PATTERNS.next_q_end() })
 *    }
 * 
 * 3. Update the AI instructions in chat/route.ts to use the new patterns
 */
function convertDateString(dateStr: string): string {
  if (!dateStr) return dateStr;
  if (dateStr === 'now') return new Date().toISOString();
  
  // Match both 'now+Xdays' and 'now-Xdays'
  const daysMatch = dateStr.match(/^now([+-]\d+)days$/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]); // will handle both + and -
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
  return dateStr;
}

export async function POST(request: Request) {
  console.log('🔍 Navigator analyze endpoint called');
  
  try {
    // Get authenticated user with explicit cookie handling
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    }, {
      cookieOptions: {
        // Add secure cookie options for production
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      }
    });
    
    // Add more detailed session logging
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Navigator Auth Details:', {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id,
      env: process.env.NODE_ENV,
      cookieHeader: request.headers.get('cookie'),
      allHeaders: Object.fromEntries(request.headers.entries())
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return new Response(JSON.stringify({ error: 'Session error', details: sessionError }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!session?.user) {
      console.error('No authenticated user found');
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log request body
    const body = await request.json();
    console.log('Analyze Request Body:', {
      query: body.query,
      hasFilters: !!body.filters
    });
    
    let { query, dateRange, expirationDateRange, parties, categories, types, provisions } = body;

    // Convert any relative dates
    if (dateRange) {
      dateRange.from = convertDateString(dateRange.from);
      dateRange.to = convertDateString(dateRange.to);
    }
    if (expirationDateRange) {
      expirationDateRange.from = convertDateString(expirationDateRange.from);
      expirationDateRange.to = convertDateString(expirationDateRange.to);
    }

    // Initialize Navigator client
    console.log('🔄 Initializing Navigator client');
    const navigatorClient = new NavigatorClient(supabase);

    // Get all agreements first
    console.log('📊 Fetching agreements from Navigator API...');
    let allAgreements: any[] = [];
    let pageToken: string | undefined;
    
    do {
      const options = pageToken ? { ctoken: pageToken } : undefined;
      const agreements = await navigatorClient.getAgreements(session.user.id, options);
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
      patterns = await navigatorClient.analyzePatterns(session.user.id);
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
          categories,
          types,
          provisions
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