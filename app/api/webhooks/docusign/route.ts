import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { EnvelopeStatus } from '@/types/envelopes';

export const dynamic = 'force-dynamic';

// Map DocuSign status to our envelope status
const mapDocuSignStatus = (status: string): EnvelopeStatus => {
  const statusMap: Record<string, EnvelopeStatus> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'completed': 'completed',
    'declined': 'declined',
    'voided': 'voided',
  };
  return statusMap[status.toLowerCase()] || 'error';
};

export async function POST(request: NextRequest) {
  try {
    console.log('Received DocuSign webhook');
    const payload = await request.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Extract envelope data
    const envelopeId = payload.data?.envelopeId;
    const rawStatus = payload.data?.envelopeSummary?.status?.toLowerCase();
    const recipients = payload.data?.envelopeSummary?.recipients?.signers;

    console.log('Processing webhook:', {
      envelopeId,
      rawStatus,
      recipientCount: recipients?.length
    });

    if (envelopeId && rawStatus) {
      const status = mapDocuSignStatus(rawStatus);
      console.log('Mapped status:', { rawStatus, mappedStatus: status });

      // First verify the envelope exists
      const { data: existingEnvelope, error: findError } = await supabase
        .from('envelopes')
        .select('id, status')
        .eq('docusign_envelope_id', envelopeId)
        .single();

      if (findError) {
        console.error('Error finding envelope:', findError);
        throw findError;
      }

      console.log('Found envelope:', existingEnvelope);

      // Prepare update data
      const updateData = {
        status: status,
        updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      console.log('Updating envelope with data:', updateData);

      // Simple update with proper status
      const { data: updatedEnvelope, error: updateError } = await supabase
        .from('envelopes')
        .update(updateData)
        .eq('docusign_envelope_id', envelopeId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating envelope:', updateError);
        throw updateError;
      }

      console.log('Update successful:', updatedEnvelope);

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
              const recipientStatus = recipient.status?.toLowerCase();
              const { error: recipientError } = await supabase
                .from('recipients')
                .update({
                  status: recipientStatus,
                  completed_at: recipientStatus === 'completed' ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                })
                .eq('envelope_id', envelope.id)
                .eq('email', recipient.email);

              if (recipientError) {
                console.error('Error updating recipient:', recipientError);
                throw recipientError;
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
      throw logError;
    }

    console.log('Webhook processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing DocuSign webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 