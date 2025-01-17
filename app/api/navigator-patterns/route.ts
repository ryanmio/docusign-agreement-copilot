import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NavigatorClient } from '@/lib/docusign/navigator-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const navigatorClient = new NavigatorClient(supabase);

    // Get agreements from the last 90 days for pattern analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const agreements = await navigatorClient.getAgreements(session.user.id);

    // Initialize pattern tracking
    const dayCategory: Record<string, Record<string, number>> = {};
    const categoryTotals: Record<string, number> = {};

    // Process each agreement
    for (const agreement of agreements.items) {
      if (!agreement.category || !agreement.metadata?.created_at) continue;

      const day = new Date(agreement.metadata.created_at)
        .toLocaleDateString('en-US', { weekday: 'long' });
      const category = agreement.category;

      // Initialize day if needed
      if (!dayCategory[day]) {
        dayCategory[day] = {};
      }

      // Initialize category for this day if needed
      if (!dayCategory[day][category]) {
        dayCategory[day][category] = 0;
      }

      // Track totals
      dayCategory[day][category]++;
      categoryTotals[category] = (categoryTotals[category] || 0) + 1;
    }

    // Find significant patterns
    const patterns: Array<{
      day: string;
      category: string;
      count: number;
      percentage: number;
    }> = [];

    // For each day and category combination
    Object.entries(dayCategory).forEach(([day, categories]) => {
      Object.entries(categories).forEach(([category, count]) => {
        const totalForCategory = categoryTotals[category];
        const percentage = (count / totalForCategory) * 100;

        // Only include if this represents a significant pattern (>25% of category on this day)
        if (percentage > 25) {
          patterns.push({
            day,
            category,
            count,
            percentage
          });
        }
      });
    });

    // Sort by percentage descending
    patterns.sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      dayCategory,
      topPatterns: patterns.slice(0, 5), // Top 5 patterns
      metadata: {
        timeframe: {
          from: ninetyDaysAgo.toISOString(),
          to: new Date().toISOString()
        },
        totalAgreements: agreements.items.length
      }
    });

  } catch (error: any) {
    console.error('Navigator patterns error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to analyze patterns',
      details: error.cause || error.stack,
      help: 'Ensure you have agreements uploaded to Navigator',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 