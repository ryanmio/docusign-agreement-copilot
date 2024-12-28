import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get recent webhook events
    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({ 
      events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch webhook events',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 