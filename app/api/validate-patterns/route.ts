import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateTuesdayPattern } from '@/lib/validations/demo-pattern-test';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const results = await validateTuesdayPattern(supabase, user.id);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Pattern validation error:', error);
    return NextResponse.json({ 
      error: 'Validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 