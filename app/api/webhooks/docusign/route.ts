import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Extract envelope data
    const envelopeId = payload.data?.envelopeId;
    const status = payload.data?.envelopeSummary?.status?.toLowerCase();
    const recipients = payload.data?.envelopeSummary?.recipients?.signers;

    if (envelopeId && status) {
      // Update envelope status in database
      await supabase
        .from('envelopes')
        .update({ 
          status: status,
          updated_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('docusign_envelope_id', envelopeId);

      // Update recipient status if available
      if (recipients?.length > 0) {
        for (const recipient of recipients) {
          if (recipient.email) {
            const { data: envelope } = await supabase
              .from('envelopes')
              .select('id')
              .eq('docusign_envelope_id', envelopeId)
              .single();

            if (envelope) {
              await supabase
                .from('recipients')
                .update({
                  status: recipient.status?.toLowerCase(),
                  completed_at: recipient.status === 'completed' ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                })
                .eq('envelope_id', envelope.id)
                .eq('email', recipient.email);
            }
          }
        }
      }
    }

    // Log the webhook event
    await supabase
      .from('webhook_events')
      .insert({
        provider: 'docusign',
        event_type: payload.event,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing DocuSign webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 