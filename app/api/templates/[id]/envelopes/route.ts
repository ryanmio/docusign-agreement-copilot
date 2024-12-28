import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';

const createFromTemplateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().optional(),
  roles: z.array(z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(1, 'Name is required'),
    roleName: z.string().min(1, 'Role name is required'),
    routingOrder: z.number().optional(),
  })),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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

    const json = await request.json();
    const payload = createFromTemplateSchema.parse(json);

    const docusign = new DocuSignEnvelopes(supabase);
    
    // Create envelope from template
    let docusignResponse;
    try {
      docusignResponse = await docusign.createEnvelopeFromTemplate(
        user.id,
        params.id,
        {
          emailSubject: payload.subject,
          emailBlurb: payload.message,
          roles: payload.roles,
        }
      );
    } catch (error) {
      console.error('DocuSign API Error:', error);
      return NextResponse.json(
        { error: 'Failed to create envelope in DocuSign' },
        { status: 400 }
      );
    }

    // Store envelope in database
    try {
      const { data: envelope, error: envelopeError } = await supabase
        .from('envelopes')
        .insert({
          user_id: user.id,
          docusign_envelope_id: docusignResponse.envelopeId,
          subject: payload.subject,
          message: payload.message,
          status: 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            template_id: params.id,
          },
        })
        .select()
        .single();

      if (envelopeError) {
        console.error('Database error:', envelopeError);
        // Even if database storage fails, the envelope was created in DocuSign
        return NextResponse.json(
          { 
            warning: 'Envelope created in DocuSign but failed to store in database',
            envelopeId: docusignResponse.envelopeId 
          },
          { status: 200 }
        );
      }

      // Store recipients
      const { error: recipientsError } = await supabase
        .from('recipients')
        .insert(
          payload.roles.map(role => ({
            envelope_id: envelope.id,
            email: role.email,
            name: role.name,
            routing_order: role.routingOrder || 1,
            metadata: {
              role_name: role.roleName,
            },
          }))
        );

      if (recipientsError) {
        console.error('Recipients storage error:', recipientsError);
        return NextResponse.json(
          { 
            warning: 'Envelope created but recipient details not stored',
            envelope 
          },
          { status: 200 }
        );
      }

      return NextResponse.json(envelope);
    } catch (error) {
      console.error('Database operation error:', error);
      return NextResponse.json(
        { 
          warning: 'Envelope created in DocuSign but database operation failed',
          envelopeId: docusignResponse.envelopeId 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error creating envelope from template:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create envelope from template' },
      { status: 500 }
    );
  }
} 