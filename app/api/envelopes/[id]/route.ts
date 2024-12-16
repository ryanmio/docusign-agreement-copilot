import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      .select('*, recipients(*)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (envelopeError || !envelope) {
      return NextResponse.json(
        { error: 'Envelope not found' },
        { status: 404 }
      );
    }

    // Get envelope details from DocuSign
    const docusign = new DocuSignEnvelopes();
    const docusignEnvelope = await docusign.getEnvelope(user.id, envelope.docusign_envelope_id);

    // Get documents list
    const documents = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);

    return NextResponse.json({
      ...envelope,
      docusign_status: docusignEnvelope.status,
      documents: documents.envelopeDocuments,
    });
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const docusign = new DocuSignEnvelopes();
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