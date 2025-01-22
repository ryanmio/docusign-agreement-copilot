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

    // If using template, get template details first
    let templateRoles: { roleName: string }[] = [];
    if (templateId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      const template = await docusign.getTemplate(user.id, templateId);
      templateRoles = template.roles;
      
      if (!templateRoles || templateRoles.length === 0) {
        throw new Error('Template has no roles defined');
      }
    }

    // Process each recipient
    for (const recipient of recipients) {
      try {
        // Create envelope for recipient
        const envelopeArgs = templateId ? {
          templateId,
          templateRoles: [{
            email: recipient.email,
            name: recipient.name,
            // Use the first role from the template if available, otherwise fallback to 'signer'
            roleName: templateRoles[0]?.roleName || 'signer'
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

        // Store envelope in database with retry logic
        let envelopeData = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries && !envelopeData) {
          try {
            // First try to find existing envelope
            const { data: existingEnvelope, error: findError } = await supabase
              .from('envelopes')
              .select('id')
              .eq('docusign_envelope_id', envelope.envelopeId)
              .single();

            if (existingEnvelope) {
              envelopeData = existingEnvelope;
            } else {
              // If not found, create it
              const { data: newEnvelope, error: createError } = await supabase
                .from('envelopes')
                .insert({
                  user_id: user.id,
                  docusign_envelope_id: envelope.envelopeId,
                  subject: `${operationName} - Please sign this document`,
                  message: 'Please sign this document at your earliest convenience.',
                  status: 'sent',
                  metadata: {
                    bulk_operation_id: operationId,
                    template_id: templateId || null,
                  },
                })
                .select('id')
                .single();

              if (createError) {
                if (retryCount === maxRetries - 1) {
                  throw new Error(`Failed to store envelope after ${maxRetries} attempts: ${createError.message}`);
                }
                // If error is due to concurrent insert, we'll retry
                retryCount++;
                continue;
              }
              
              envelopeData = newEnvelope;
            }
          } catch (error) {
            if (retryCount === maxRetries - 1) {
              throw error;
            }
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }

        if (!envelopeData) {
          throw new Error('Failed to store or retrieve envelope after multiple attempts');
        }

        // Store recipient with retry
        const { error: recipientError } = await supabase
          .from('recipients')
          .insert({
            envelope_id: envelopeData.id,
            email: recipient.email,
            name: recipient.name,
            status: 'sent',
            routing_order: 1,
          });

        if (recipientError) {
          throw new Error(`Failed to store recipient: ${recipientError.message}`);
        }

        // Update bulk recipient status
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