import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: envelope, error: envelopeError } = await supabase
      .from('envelopes')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (envelopeError || !envelope) {
      return NextResponse.json(
        { error: 'Envelope not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(envelope);
  } catch (error) {
    console.error('Error fetching envelope:', error);
    return NextResponse.json(
      { error: 'Failed to fetch envelope' },
      { status: 500 }
    );
  }
}

const voidEnvelopeSchema = z.object({
  reason: z.string().min(1, 'Void reason is required'),
});

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get envelope from database
    const { data: envelope, error: envelopeError } = await supabase
      .from('envelopes')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (envelopeError || !envelope) {
      return NextResponse.json(
        { error: 'Envelope not found' },
        { status: 404 }
      );
    }

    const json = await request.json();
    const { reason } = voidEnvelopeSchema.parse(json);

    // Void envelope in DocuSign
    const docusign = new DocuSignEnvelopes(supabase);
    await docusign.voidEnvelope(user.id, envelope.docusign_envelope_id, reason);

    // Update status in database
    const { error: updateError } = await supabase
      .from('envelopes')
      .update({ status: 'voided' })
      .eq('id', params.id);

    if (updateError) {
      throw new Error('Failed to update envelope status');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voiding envelope:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to void envelope' },
      { status: 500 }
    );
  }
} 