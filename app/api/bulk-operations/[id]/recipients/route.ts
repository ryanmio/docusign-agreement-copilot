import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// PATCH /api/bulk-operations/[id]/recipients - Update recipient statuses
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns the bulk operation
    const { data: operation, error: operationError } = await supabase
      .from('bulk_operations')
      .select('id')
      .eq('id', context.params.id)
      .eq('user_id', user.id)
      .single();

    if (operationError || !operation) {
      return NextResponse.json(
        { error: 'Bulk operation not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request body - expected array of updates' },
        { status: 400 }
      );
    }

    // Process each recipient update
    const updatePromises = updates.map(async (update) => {
      const { id, status, docusign_envelope_id, error_message } = update;
      
      if (!id) {
        return {
          success: false,
          error: 'Missing recipient ID'
        };
      }

      const { error } = await supabase
        .from('bulk_recipients')
        .update({
          status,
          docusign_envelope_id,
          error_message,
          updated_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .eq('bulk_operation_id', context.params.id);

      return {
        id,
        success: !error,
        error: error?.message
      };
    });

    const results = await Promise.all(updatePromises);

    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    // Update bulk operation status
    if (successCount > 0 || errorCount > 0) {
      const { data: stats, error: statsError } = await supabase
        .from('bulk_recipients')
        .select('status')
        .eq('bulk_operation_id', context.params.id);

      if (!statsError && stats) {
        const totalProcessed = stats.filter(r => r.status !== null).length;
        const totalSuccess = stats.filter(r => r.status === 'completed').length;
        const totalError = stats.filter(r => r.status === 'error').length;
        const isCompleted = totalProcessed === stats.length;

        await supabase
          .from('bulk_operations')
          .update({
            status: isCompleted ? 'completed' : 'processing',
            processed_count: totalProcessed,
            success_count: totalSuccess,
            error_count: totalError,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', context.params.id);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: successCount,
        error: errorCount
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 