import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { cookies } from 'next/headers';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log('Chat route called');
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    const result = streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that helps users manage their DocuSign documents and agreements.
          When users ask about documents or envelopes, use the displayDocumentDetails tool to show them.
          When users want to view a PDF, use the displayPdfViewer tool.
          When users ask about bulk operations, use the displayBulkOperation tool.
          When users want to see or select templates, use the displayTemplateSelector tool.
          When users want to see their envelopes or documents, use the displayEnvelopeList tool.

          For sending templates, follow this flow:
          1. When users want to send a template, use previewTemplate to show available templates
          2. After template selection, show preview and get confirmation
          3. When confirmed, use collectRecipients to gather recipient information
          4. After recipients are collected, use sendTemplate to send the envelope with:
             - A clear subject line (e.g. "Please sign: [Template Name]")
             - The collected recipient information with proper role assignment
             - The template ID

          When collecting recipient information:
          - If the user provides an email and name but no role, use "Signer" as the default role
          - Format the recipient data as { email, name, roleName }
          - Validate that the email is properly formatted
          - Ensure the name is provided

          Always use the appropriate tool to display information rather than just describing it.
          Guide the user through each step clearly.`
        },
        ...messages
      ],
      tools: {
        displayBulkOperation: tool({
          description: 'Display progress and status of a bulk document sending operation',
          parameters: z.object({
            operationId: z.string().describe('The ID of the bulk operation to display'),
            showBackButton: z.boolean().optional().describe('Whether to show a back button')
          }),
          execute: async ({ operationId, showBackButton }) => {
            console.log('Executing displayBulkOperation:', { operationId, showBackButton });
            return {
              operationId,
              showBackButton: showBackButton ?? false
            };
          }
        }),
        displayPdfViewer: tool({
          description: 'Display a PDF document with viewer controls',
          parameters: z.object({
            url: z.string().describe('The URL of the PDF document to display')
          }),
          execute: async ({ url }) => {
            console.log('Executing displayPdfViewer:', { url });
            return { url };
          }
        }),
        displayDocumentDetails: tool({
          description: 'Display detailed information about a document envelope',
          parameters: z.object({
            envelopeId: z.string().describe('The ID of the envelope to display details for'),
            showActions: z.boolean().optional().describe('Whether to show action buttons like void and resend')
          }),
          execute: async ({ envelopeId, showActions }) => {
            console.log('Starting displayDocumentDetails execution:', { envelopeId, showActions });
            try {
              console.log('Creating Supabase client');
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              console.log('Getting user session');
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              console.log('Session data:', { userId: session?.user?.id });
              if (sessionError) {
                console.error('Session error:', sessionError);
                throw sessionError;
              }

              if (!session?.user) {
                console.error('No user found in session');
                throw new Error('User not authenticated');
              }

              // Fetch envelope data
              console.log('Fetching envelope data:', { envelopeId, userId: session.user.id });
              const { data: envelopes, error: envelopeError } = await supabase
                .from('envelopes')
                .select('*, recipients(*)')
                .eq('id', envelopeId)
                .eq('user_id', session.user.id);

              if (envelopeError) {
                console.error('Error loading envelope:', envelopeError);
                throw new Error('Error loading envelope details');
              }

              if (!envelopes || envelopes.length === 0) {
                console.error('No envelope found with ID:', envelopeId);
                throw new Error(`No envelope found with ID: ${envelopeId}`);
              }

              const envelope = envelopes[0];
              console.log('Envelope data loaded:', { id: envelope.id, status: envelope.status });

              // Fetch documents
              console.log('Fetching documents:', { docusignEnvelopeId: envelope.docusign_envelope_id });
              const docusign = new DocuSignEnvelopes(supabase);
              const documents = await docusign.listDocuments(session.user.id, envelope.docusign_envelope_id);
              console.log('Documents loaded:', documents);

              const result = { 
                envelopeId, 
                showActions: showActions ?? true,
                envelope,
                documents
              };
              console.log('displayDocumentDetails result:', result);
              return result;
            } catch (error) {
              console.error('Error in displayDocumentDetails:', error);
              throw error;
            }
          }
        }),
        displayTemplateSelector: tool({
          description: 'Display a template selector with search capabilities',
          parameters: z.object({
            preselectedId: z.string().optional().describe('Optional template ID to preselect'),
            showSearch: z.boolean().optional().describe('Whether to show the search input')
          }),
          execute: async ({ preselectedId, showSearch }) => {
            console.log('Starting displayTemplateSelector execution:', { preselectedId, showSearch });
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Fetch templates from DocuSign
              const docusign = new DocuSignEnvelopes(supabase);
              const { templates } = await docusign.listTemplates(session.user.id);

              return {
                selectedTemplateId: preselectedId,
                showSearch: showSearch ?? true,
                templates
              };
            } catch (error) {
              console.error('Error in displayTemplateSelector:', error);
              throw error;
            }
          }
        }),
        previewTemplate: tool({
          description: 'Display a preview of a DocuSign template with its details and required roles',
          parameters: z.object({
            templateId: z.string().describe('The ID of the template to preview'),
            showBackButton: z.boolean().optional().describe('Whether to show the back button')
          }),
          execute: async ({ templateId, showBackButton }) => {
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Get template details from DocuSign
              const docusign = new DocuSignEnvelopes(supabase);
              const template = await docusign.getTemplate(session.user.id, templateId);

              return {
                templateId,
                templateName: template.name,
                description: template.description || '',
                roles: template.roles.map(role => ({
                  roleId: role.roleName,
                  roleName: role.roleName
                })),
                showBackButton: showBackButton ?? false
              };
            } catch (error) {
              console.error('Error in previewTemplate:', error);
              throw error;
            }
          }
        }),
        displayEnvelopeList: tool({
          description: 'Display a list of envelopes with filtering and pagination',
          parameters: z.object({
            status: z.enum(['created', 'sent', 'delivered', 'signed', 'completed', 'declined', 'voided', 'error']).optional().describe('Filter envelopes by status'),
            page: z.number().min(1).optional().describe('Page number for pagination'),
            showStatusFilter: z.boolean().optional().describe('Whether to show the status filter')
          }),
          execute: async ({ status, page, showStatusFilter }) => {
            console.log('Starting displayEnvelopeList execution:', { status, page, showStatusFilter });
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Fetch envelopes from Supabase
              const query = supabase
                .from('envelopes')
                .select('*', { count: 'exact' })
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

              if (status) {
                query.eq('status', status);
              }

              const limit = 10;
              const from = ((page || 1) - 1) * limit;
              const to = from + limit - 1;

              const { data: envelopes, error: envelopesError, count } = await query
                .range(from, to);

              if (envelopesError) {
                throw new Error('Error loading envelopes');
              }

              return {
                envelopes: envelopes || [],
                count: count || 0,
                initialStatus: status || '',
                initialPage: page || 1,
                showStatusFilter: showStatusFilter ?? true
              };
            } catch (error) {
              console.error('Error in displayEnvelopeList:', error);
              throw error;
            }
          }
        }),
        sendTemplate: tool({
          description: 'Send a template with collected recipient information',
          parameters: z.object({
            templateId: z.string().describe('The ID of the template to send'),
            subject: z.string().describe('Email subject for the envelope'),
            message: z.string().optional().describe('Optional email message'),
            recipients: z.array(z.object({
              email: z.string(),
              name: z.string(),
              roleName: z.string()
            })).describe('The recipients to send the template to')
          }),
          execute: async ({ templateId, subject, message, recipients }) => {
            console.log('Starting sendTemplate execution:', { templateId, recipients });
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Send the template using DocuSign
              const docusign = new DocuSignEnvelopes(supabase);
              const docusignResponse = await docusign.createEnvelopeFromTemplate(
                session.user.id,
                templateId,
                {
                  emailSubject: subject,
                  emailBlurb: message,
                  roles: recipients
                }
              );

              // Store envelope in database
              const { data: envelope, error: envelopeError } = await supabase
                .from('envelopes')
                .insert({
                  user_id: session.user.id,
                  docusign_envelope_id: docusignResponse.envelopeId,
                  subject,
                  message,
                  status: 'sent',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  metadata: {
                    template_id: templateId,
                  },
                })
                .select()
                .single();

              if (envelopeError) {
                console.error('Database error:', envelopeError);
                return {
                  success: true,
                  warning: 'Envelope created in DocuSign but failed to store in database',
                  envelopeId: docusignResponse.envelopeId
                };
              }

              // Store recipients
              const { error: recipientsError } = await supabase
                .from('recipients')
                .insert(
                  recipients.map(role => ({
                    envelope_id: envelope.id,
                    email: role.email,
                    name: role.name,
                    routing_order: 1,
                    metadata: {
                      role_name: role.roleName,
                    },
                  }))
                );

              if (recipientsError) {
                console.error('Recipients storage error:', recipientsError);
                return {
                  success: true,
                  warning: 'Envelope created but recipient details not stored',
                  envelope
                };
              }

              return {
                success: true,
                envelopeId: envelope.id,
                status: 'sent'
              };
            } catch (error) {
              console.error('Error in sendTemplate:', error);
              throw error;
            }
          }
        })
      }
    });

    console.log('Streaming response');
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        details: error.details || error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 