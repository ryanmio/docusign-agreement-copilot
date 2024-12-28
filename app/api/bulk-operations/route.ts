import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { DocuSignClient } from '@/lib/docusign/client';

// POST /api/bulk-operations - Create a new bulk operation
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const recipients = JSON.parse(formData.get('recipients') as string);
    const templateId = formData.get('templateId') as string;
    const file = formData.get('file') as File;
    
    if (!name || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!templateId && !file) {
      return NextResponse.json(
        { error: 'Either templateId or file must be provided' },
        { status: 400 }
      );
    }

    // Create bulk operation
    const { data: operation, error: operationError } = await supabase
      .from('bulk_operations')
      .insert({
        user_id: user.id,
        name,
        total_count: recipients.length,
        status: 'created'
      })
      .select()
      .single();

    if (operationError) {
      console.error('Error creating bulk operation:', operationError);
      return NextResponse.json(
        { error: 'Failed to create bulk operation' },
        { status: 500 }
      );
    }

    // Insert recipients
    const recipientsToInsert = recipients.map((recipient: any) => ({
      bulk_operation_id: operation.id,
      email: recipient.email,
      name: recipient.name
    }));

    const { error: recipientsError } = await supabase
      .from('bulk_recipients')
      .insert(recipientsToInsert);

    if (recipientsError) {
      console.error('Error inserting recipients:', recipientsError);
      // Clean up the operation if recipients insert fails
      await supabase
        .from('bulk_operations')
        .delete()
        .eq('id', operation.id);
        
      return NextResponse.json(
        { error: 'Failed to create recipients' },
        { status: 500 }
      );
    }

    // Start processing envelopes in the background
    processEnvelopes(operation.id, templateId, file, recipients, name).catch(console.error);

    return NextResponse.json(operation);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/bulk-operations - List bulk operations for the current user
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: operations, error } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bulk operations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bulk operations' },
        { status: 500 }
      );
    }

    return NextResponse.json(operations);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processEnvelopes(
  operationId: string,
  templateId: string | null,
  file: File | null,
  recipients: any[],
  operationName: string
) {
  const supabase = createRouteHandlerClient({ cookies });
  const docusign = new DocuSignEnvelopes(supabase);

  try {
    // Update operation status to processing
    await supabase
      .from('bulk_operations')
      .update({ status: 'processing' })
      .eq('id', operationId);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process each recipient
    for (const recipient of recipients) {
      try {
        // Create envelope for recipient
        const envelopeArgs = templateId ? {
          templateId,
          templateRoles: [{
            email: recipient.email,
            name: recipient.name,
            roleName: 'signer'
          }],
          emailSubject: `${operationName} - Please sign this document`,
          emailBlurb: 'Please sign this document at your earliest convenience.',
          status: 'sent'
        } : {
          documents: [{
            documentBase64: Buffer.from(await file!.arrayBuffer()).toString('base64'),
            name: file!.name,
            fileExtension: file!.name.split('.').pop() || 'pdf',
            documentId: '1'
          }],
          recipients: {
            signers: [{
              email: recipient.email,
              name: recipient.name,
              recipientId: '1',
              routingOrder: 1
            }]
          },
          emailSubject: `${operationName} - Please sign this document`,
          emailBlurb: 'Please sign this document at your earliest convenience.',
          status: 'sent'
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const envelope = await docusign.createEnvelope(user.id, envelopeArgs);

        // Update recipient status
        await supabase
          .from('bulk_recipients')
          .update({
            status: 'sent',
            docusign_envelope_id: envelope.envelopeId
          })
          .eq('bulk_operation_id', operationId)
          .eq('email', recipient.email);

        successCount++;
      } catch (error) {
        console.error('Error processing recipient:', error);
        
        // Update recipient with error
        await supabase
          .from('bulk_recipients')
          .update({
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Failed to send envelope'
          })
          .eq('bulk_operation_id', operationId)
          .eq('email', recipient.email);

        errorCount++;
      }

      processedCount++;

      // Update operation progress
      await supabase
        .from('bulk_operations')
        .update({
          processed_count: processedCount,
          success_count: successCount,
          error_count: errorCount
        })
        .eq('id', operationId);
    }

    // Update operation status to completed
    await supabase
      .from('bulk_operations')
      .update({
        status: errorCount === recipients.length ? 'failed' : 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', operationId);

  } catch (error) {
    console.error('Error processing bulk operation:', error);
    
    // Update operation status to failed
    await supabase
      .from('bulk_operations')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', operationId);
  }
} 