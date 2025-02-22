import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = createRouteHandlerClient({ cookies });
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

    // Download document from DocuSign
    const docusign = new DocuSignEnvelopes(supabase);
    const document = await docusign.downloadDocument(
      user.id,
      envelope.docusign_envelope_id,
      params.documentId
    );

    // Get document info to set proper content type
    const documents = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);
    const documentInfo = documents.envelopeDocuments?.find(
      (doc: { documentId: string }) => doc.documentId === params.documentId
    );

    if (!documentInfo) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Set content type based on file extension
    const contentType = documentInfo.type || 'application/pdf';
    
    // Create response with proper headers
    const response = new NextResponse(document, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${documentInfo.name}"`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || '*',
      },
    });

    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
} 