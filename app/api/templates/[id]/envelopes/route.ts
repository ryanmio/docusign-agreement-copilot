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
  prefillData: z.record(z.string(), z.record(z.string(), z.object({
    value: z.string(),
    type: z.enum(['text', 'number', 'date'])
  }))).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    // Check if user has connected DocuSign
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .single();

    if (credentialsError || !credentials) {
      return NextResponse.json(
        { error: 'Please connect your Docusign account first' },
        { status: 400 }
      );
    }

    const json = await request.json();
    const payload = createFromTemplateSchema.parse(json);

    const docusign = new DocuSignEnvelopes(supabase);
    
    // Create envelope from template
    let docusignResponse;
    try {
      console.log('Creating envelope from template:', { 
        templateId: params.id,
        subject: payload.subject,
        recipientCount: payload.roles.length
      });
      
      docusignResponse = await docusign.createEnvelopeFromTemplate(
        user.id,
        params.id,
        {
          emailSubject: payload.subject,
          emailBlurb: payload.message,
          roles: payload.roles,
          prefillData: payload.prefillData,
        }
      );

      console.log('DocuSign response:', {
        envelopeId: docusignResponse.envelopeId,
        success: !!docusignResponse.envelopeId
      });

    } catch (error) {
      console.error('Docusign API Error:', error);
      return NextResponse.json(
        { error: 'Failed to create envelope in Docusign' },
        { status: 400 }
      );
    }

    // Store envelope in database
    try {
      console.log('Storing envelope in database:', {
        userId: user.id,
        envelopeId: docusignResponse.envelopeId
      });

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
        console.error('Database error:', { error: envelopeError, envelopeId: docusignResponse.envelopeId });
        // Even if database storage fails, the envelope was created in DocuSign
        return NextResponse.json(
          { 
            warning: 'Envelope created in Docusign but failed to store in database',
            envelopeId: docusignResponse.envelopeId 
          },
          { status: 200 }
        );
      }

      console.log('Storing recipients:', {
        envelopeId: envelope.id,
        recipientCount: payload.roles.length
      });

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
        console.error('Recipients storage error:', { error: recipientsError, envelopeId: envelope.id });
        return NextResponse.json(
          { 
            warning: 'Envelope created but recipient details not stored',
            envelope 
          },
          { status: 200 }
        );
      }

      console.log('Successfully created and stored envelope:', {
        envelopeId: envelope.id,
        docusignEnvelopeId: docusignResponse.envelopeId,
        recipientsStored: true
      });

      // Add this critical log
      console.log('ENVELOPE_DEBUG:', {
        returnedToClient: envelope,
        docusignResponse,
        whatClientSees: docusignResponse.envelopeId
      });

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