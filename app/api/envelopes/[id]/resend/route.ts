import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';

interface Recipient {
  email: string;
  name: string;
  routing_order?: number;
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
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
      .eq('id', context.params.id)
      .eq('user_id', user.id)
      .single();

    if (envelopeError || !envelope) {
      return NextResponse.json(
        { error: 'Envelope not found' },
        { status: 404 }
      );
    }

    // Check if envelope can be resent
    if (envelope.status === 'completed' || envelope.status === 'voided') {
      return NextResponse.json(
        { error: 'Cannot resend completed or voided envelopes' },
        { status: 400 }
      );
    }

    // Create new envelope with same content
    const docusign = new DocuSignEnvelopes();

    // Get original documents
    const originalDocs = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);
    const documents = await Promise.all(
      originalDocs.envelopeDocuments.map(async (doc: any) => {
        const content = await docusign.downloadDocument(user.id, envelope.docusign_envelope_id, doc.documentId);
        // Convert blob to base64
        const buffer = await content.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        
        return {
          name: doc.name,
          documentBase64: base64,
          fileExtension: doc.name.split('.').pop() || 'pdf',
        };
      })
    );

    const docusignResponse = await docusign.createEnvelope(user.id, {
      emailSubject: envelope.subject,
      emailBlurb: envelope.message || undefined,
      documents,
      recipients: envelope.recipients.map((recipient: Recipient) => ({
        email: recipient.email,
        name: recipient.name,
        recipientId: Math.random().toString(36).substring(7),
        routingOrder: recipient.routing_order || 1,
      })),
    });

    // Update envelope in database
    const { error: updateError } = await supabase
      .from('envelopes')
      .update({
        docusign_envelope_id: docusignResponse.envelopeId,
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.params.id);

    if (updateError) {
      throw new Error('Failed to update envelope');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resending envelope:', error);
    return NextResponse.json(
      { error: 'Failed to resend envelope' },
      { status: 500 }
    );
  }
} 