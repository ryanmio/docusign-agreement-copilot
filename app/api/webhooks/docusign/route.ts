import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = createServerComponentClient({ cookies });

    // Verify webhook authenticity
    // TODO: Implement HMAC verification when DocuSign Connect is configured

    // Extract envelope data
    const envelopeId = payload.envelopeId;
    const status = payload.status;
    const recipients = payload.recipients;

    // Update document status in database
    await supabase
      .from('documents')
      .update({ 
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('docusign_envelope_id', envelopeId);

    // Log the webhook event
    await supabase
      .from('webhook_events')
      .insert({
        provider: 'docusign',
        event_type: status,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing DocuSign webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 