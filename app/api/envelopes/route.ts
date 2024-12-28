import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createEnvelopeSchema, listEnvelopesSchema } from '@/lib/validations/envelope';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const payload = createEnvelopeSchema.parse(json);

    // Check if user has connected DocuSign
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .single();

    if (credentialsError || !credentials) {
      return NextResponse.json(
        { error: 'Please connect your DocuSign account first' },
        { status: 400 }
      );
    }

    const docusign = new DocuSignEnvelopes(supabase);
    
    // Create envelope in DocuSign
    const docusignResponse = await docusign.createEnvelope(user.id, {
      emailSubject: payload.subject,
      emailBlurb: payload.message,
      documents: payload.documents.map((doc, index) => ({
        name: doc.name,
        fileExtension: doc.fileExtension,
        documentBase64: doc.content,
        documentId: `${index + 1}`,
      })),
      recipients: {
        signers: payload.recipients.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
          recipientId: Math.random().toString(36).substring(7),
          routingOrder: recipient.routingOrder || 1,
        })),
      },
      status: 'sent',
    });

    // Store envelope in database
    const { data: envelope, error: envelopeError } = await supabase
      .from('envelopes')
      .insert({
        user_id: user.id,
        docusign_envelope_id: docusignResponse.envelopeId,
        subject: payload.subject,
        message: payload.message,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (envelopeError) {
      console.error('Database error:', envelopeError);
      throw new Error('Failed to store envelope');
    }

    // Log the response for debugging
    console.log('DocuSign Response:', docusignResponse);
    console.log('Database Envelope:', envelope);

    // Store recipients
    const { error: recipientsError } = await supabase
      .from('recipients')
      .insert(
        payload.recipients.map(recipient => ({
          envelope_id: envelope.id,
          email: recipient.email,
          name: recipient.name,
          routing_order: recipient.routingOrder || 1,
        }))
      );

    if (recipientsError) {
      throw new Error('Failed to store recipients');
    }

    return NextResponse.json(envelope);
  } catch (error) {
    console.error('Error creating envelope:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Enhanced error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Detailed error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = listEnvelopesSchema.parse({
      status: searchParams.get('status') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
    });

    // Build query
    let query = supabase
      .from('envelopes')
      .select('*, recipients(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.fromDate) {
      query = query.gte('created_at', params.fromDate);
    }

    if (params.toDate) {
      query = query.lte('created_at', params.toDate);
    }

    // Add pagination with default values
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: envelopes, error: envelopesError, count } = await query;

    if (envelopesError) {
      throw new Error('Failed to fetch envelopes');
    }

    return NextResponse.json({
      envelopes,
      count: count || 0,
    });
  } catch (error) {
    console.error('Error fetching envelopes:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch envelopes' },
      { status: 500 }
    );
  }
} 