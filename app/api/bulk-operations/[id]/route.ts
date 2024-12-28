import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/bulk-operations/[id] - Get details of a specific bulk operation
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the operation details
    const { data: operation, error: operationError } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('id', await params.id)
      .eq('user_id', user.id)
      .single();

    if (operationError) {
      console.error('Error fetching bulk operation:', operationError);
      return NextResponse.json(
        { error: 'Failed to fetch bulk operation' },
        { status: 500 }
      );
    }

    if (!operation) {
      return NextResponse.json(
        { error: 'Bulk operation not found' },
        { status: 404 }
      );
    }

    // Get the recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('bulk_recipients')
      .select('*')
      .eq('bulk_operation_id', await params.id)
      .order('created_at', { ascending: true });

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError);
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...operation,
      recipients
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/bulk-operations/[id] - Update status of a bulk operation
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Only allow updating specific fields
    const allowedUpdates = [
      'status',
      'processed_count',
      'success_count',
      'error_count',
      'completed_at'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const { data: operation, error } = await supabase
      .from('bulk_operations')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bulk operation:', error);
      return NextResponse.json(
        { error: 'Failed to update bulk operation' },
        { status: 500 }
      );
    }

    return NextResponse.json(operation);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 