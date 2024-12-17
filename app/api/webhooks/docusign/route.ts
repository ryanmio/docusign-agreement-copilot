import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Received DocuSign webhook');
    const payload = await request.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Extract envelope data
    const envelopeId = payload.data?.envelopeId;
    const status = payload.data?.envelopeSummary?.status?.toLowerCase();
    const recipients = payload.data?.envelopeSummary?.recipients?.signers;

    console.log('Processing webhook:', {
      envelopeId,
      status,
      recipientCount: recipients?.length
    });

    if (envelopeId && status) {
      console.log('Updating envelope status:', { envelopeId, status });
      const { error: updateError } = await supabase
        .from('envelopes')
        .update({ 
          status: status,
          updated_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('docusign_envelope_id', envelopeId);

      if (updateError) {
        console.error('Error updating envelope:', updateError);
      }

      // Update recipient status if available
      if (recipients?.length > 0) {
        for (const recipient of recipients) {
          if (recipient.email) {
            console.log('Updating recipient:', { email: recipient.email, status: recipient.status });
            const { data: envelope } = await supabase
              .from('envelopes')
              .select('id')
              .eq('docusign_envelope_id', envelopeId)
              .single();

            if (envelope) {
              const { error: recipientError } = await supabase
                .from('recipients')
                .update({
                  status: recipient.status?.toLowerCase(),
                  completed_at: recipient.status === 'completed' ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                })
                .eq('envelope_id', envelope.id)
                .eq('email', recipient.email);

              if (recipientError) {
                console.error('Error updating recipient:', recipientError);
              }
            }
          }
        }
      }
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'docusign',
        event_type: payload.event,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging webhook event:', logError);
    }

    console.log('Webhook processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing DocuSign webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 