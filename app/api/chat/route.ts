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
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    const result = streamText({
      model: openai('gpt-4o'),
      maxSteps: 10,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that helps users manage their DocuSign documents and agreements.
          When users ask about documents or envelopes, use the displayDocumentDetails tool to show them.
          When users want to view a PDF, use the displayPdfViewer tool.
          When users ask about bulk operations, use the displayBulkOperation tool.
          When users want to see or select templates, use the displayTemplateSelector tool.
          When users want to see their envelopes or documents, use the displayEnvelopeList tool.
          When users ask about priorities, urgent items, or what needs attention, use the displayPriorityDashboard tool to show them a prioritized view of their agreements.

          For sending templates, follow this EXACT flow:
          1. When users want to send a template, use displayTemplateSelector to show available templates
          2. After template selection, use previewTemplate to show preview and then immediately use collectRecipients with the template roles and name. Say:
             "I've pulled up the [Template Name]. Please fill in the recipient information in the form below."
             IMPORTANT: After the form is submitted (when you receive a tool result with completed: true), proceed to step 3.
          3. After receiving a tool result with completed: true and recipients array, proceed with getTemplateTabs for each role to check available fields.
             If any fillable fields are found, ask for each role:
             "For [Role Name], I found the following fields that can be prefilled:
             [List fields with their types]
             Would you like me to prefill any of these fields? Please specify which ones."
             If no fillable fields are found for any role, proceed to step 4.
          4. After ALL information is collected, show a summary and ask for confirmation:
             "I'll send the [Template Name] to:
             - [Role 1]: [Name] ([Email])
             - [Role 2]: [Name] ([Email])
             [If there are prefilled values, include:]
             With the following prefilled values:
             - [Field 1]: [Value]
             - [Field 2]: [Value]
             Is this correct? Please confirm by saying 'send' or go back by saying 'edit recipients'."
          5. Only after explicit 'send' confirmation, use sendTemplate with:
             - Subject: "Please sign: [Template Name]"
             - The collected recipient information with proper role assignment
             - The template ID
             - Any prefill data collected

          When collecting recipient information:
          - NEVER use example.com email addresses
          - NEVER assume or prefill recipient information
          - Format the recipient data as { email, name, roleName }
          - Validate that the email is properly formatted
          - Ensure the name is provided
          - Ask for each recipient's information separately and clearly
          - Wait for user's response before proceeding

          When handling prefill data:
          - Use getTemplateTabs to get available fields for each role
          - Use the correct tab type (text, number, date) for each field
          - Format dates in ISO format (YYYY-MM-DD)
          - Format numbers without currency symbols or commas (e.g., "105000" not "$105,000")
          - Only prefill fields when explicitly confirmed by the user
          - Structure prefill data as { [roleName]: { [tabLabel]: { value, type } } }
          - When sending template with prefilled values:
            * Remove any currency symbols ($) and commas from number values
            * Include the prefillData parameter in sendTemplate
            * Double check the tab labels match exactly with what DocuSign expects

          For example, if user says "annual fee should be $105,000":
          1. Format as "105000" (remove $ and commas)
          2. Structure as:
             prefillData: {
               "Company Representative": {
                 "Annual Fee": {
                   value: "105000",
                   type: "number"
                 }
               }
             }
          3. Include this prefillData when calling sendTemplate

          Always use the appropriate tool to display information rather than just describing it.
          Guide the user through each step clearly and explicitly ask for confirmation before proceeding to the next step.
          
          IMPORTANT: After calling a tool, always provide a response to the user explaining what was done and what the next step is.
          Never leave a tool call without a following message to the user.
          Never skip steps in the flow - each step requires explicit user input.
          If a tool call fails, inform the user and suggest retrying or contacting support.`
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
                .eq('docusign_envelope_id', envelopeId)
                .eq('user_id', session.user.id);

              if (envelopeError) {
                console.error('Error loading envelope:', envelopeError);
                throw new Error('Error loading envelope details');
              }

              if (!envelopes || envelopes.length === 0) {
                console.error('No envelope found with DocuSign ID:', envelopeId);
                throw new Error(`No envelope found with DocuSign ID: ${envelopeId}`);
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
                  roleName: role.roleName,
                  templateName: template.name
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
        displayPriorityDashboard: tool({
          description: 'Display a dashboard of priority agreements requiring attention',
          parameters: z.object({
            showBackButton: z.boolean().optional().describe('Whether to show a back button')
          }),
          execute: async ({ showBackButton }) => {
            console.log('Starting displayPriorityDashboard execution');
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Get envelopes from DocuSign
              const docusign = new DocuSignEnvelopes(supabase);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

              const { envelopes } = await docusign.listStatusChanges(session.user.id, {
                from_date: thirtyDaysAgo.toISOString(),
                include: ['recipients', 'expiration'],
                status: ['sent', 'delivered', 'declined', 'voided']
              });

              console.log('Raw envelope data:', JSON.stringify(envelopes[0], null, 2));

              // Helper to extract recipients from envelope
              const getRecipients = (envelope: any) => {
                // DocuSign might return recipients in different formats
                if (!envelope.recipients) return [];
                
                // If recipients is an object with signers, carbonCopies etc.
                if (envelope.recipients.signers || envelope.recipients.carbonCopies) {
                  const allRecipients = [
                    ...(envelope.recipients.signers || []),
                    ...(envelope.recipients.carbonCopies || [])
                  ];
                  return allRecipients.map((r: { email: string; name: string; status: string }) => ({
                    email: r.email,
                    name: r.name,
                    status: r.status
                  }));
                }
                
                // If recipients is already an array
                if (Array.isArray(envelope.recipients)) {
                  return envelope.recipients.map(r => ({
                    email: r.email,
                    name: r.name,
                    status: r.status
                  }));
                }

                return [];
              };

              // Helper to determine urgency reason
              const getUrgencyReason = (envelope: any) => {
                if (envelope.status === 'declined') return 'Document was declined';
                if (envelope.status === 'voided') return 'Document was voided';
                
                const expiration = envelope.expirationDate ? new Date(envelope.expirationDate) : null;
                if (expiration) {
                  const hoursUntilExpiration = Math.floor((expiration.getTime() - new Date().getTime()) / (1000 * 60 * 60));
                  if (hoursUntilExpiration <= 48) return `Expires in ${hoursUntilExpiration} hours`;
                }

                return 'Awaiting action';
              };

              // Categorize envelopes
              const urgentEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                expirationDate?: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];
              const todayEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                expirationDate?: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];
              const thisWeekEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                expirationDate?: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];

              envelopes.forEach(envelope => {
                const priorityEnvelope = {
                  envelopeId: envelope.envelopeId,
                  subject: envelope.emailSubject,
                  status: envelope.status,
                  expirationDate: envelope.expirationDateTime,
                  recipients: getRecipients(envelope),
                  urgencyReason: getUrgencyReason(envelope)
                };

                // Categorize based on status and expiration
                if (
                  envelope.status === 'declined' ||
                  envelope.status === 'voided' ||
                  (envelope.expirationDateTime && new Date(envelope.expirationDateTime).getTime() - new Date().getTime() <= 48 * 60 * 60 * 1000)
                ) {
                  urgentEnvelopes.push(priorityEnvelope);
                } else if (
                  envelope.expirationDateTime && 
                  new Date(envelope.expirationDateTime).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000
                ) {
                  todayEnvelopes.push(priorityEnvelope);
                } else {
                  thisWeekEnvelopes.push(priorityEnvelope);
                }
              });

              // Limit to 5 items per section for demo
              const sections = [
                {
                  title: 'Urgent',
                  type: 'urgent',
                  envelopes: urgentEnvelopes.slice(0, 5)
                },
                {
                  title: 'Today',
                  type: 'today',
                  envelopes: todayEnvelopes.slice(0, 5)
                },
                {
                  title: 'This Week',
                  type: 'thisWeek',
                  envelopes: thisWeekEnvelopes.slice(0, 5)
                }
              ];

              return {
                sections,
                showBackButton: showBackButton ?? false
              };
            } catch (error) {
              console.error('Error in displayPriorityDashboard:', error);
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
            })).describe('The recipients to send the template to'),
            prefillData: z.record(z.string(), z.record(z.string(), z.object({
              value: z.string(),
              type: z.enum(['text', 'number', 'date'])
            }))).optional().describe('Prefill data for template fields, keyed by role name and field name')
          }),
          execute: async ({ templateId, subject, message, recipients, prefillData }) => {
            console.log('Starting sendTemplate execution:', { templateId, recipients, prefillData });
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
                  roles: recipients,
                  prefillData
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
        }),
        getTemplateTabs: tool({
          description: 'Get the available tabs (fields) for a template role',
          parameters: z.object({
            templateId: z.string().describe('The ID of the template to get tabs for'),
            roleName: z.string().describe('The role name to get tabs for')
          }),
          execute: async ({ templateId, roleName }) => {
            console.log('Starting getTemplateTabs tool execution:', { templateId, roleName });
            try {
              const cookieStore = cookies();
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                console.error('Authentication error:', sessionError);
                throw new Error('User not authenticated');
              }

              console.log('Getting tabs for user:', session.user.id);
              const docusign = new DocuSignEnvelopes(supabase);
              const tabs = await docusign.getTemplateRecipientTabs(session.user.id, templateId, roleName);
              
              console.log('Retrieved tabs:', tabs);
              const result = {
                tabs: tabs.map(tab => ({
                  label: tab.tabLabel,
                  type: tab.tabType,
                  required: tab.required
                }))
              };
              console.log('Returning result:', result);
              return result;
            } catch (error) {
              console.error('Error in getTemplateTabs tool:', error);
              throw error;
            }
          }
        }),
        collectRecipients: tool({
          description: 'Display a form to collect recipient information. The form will return { completed: true, recipients: [...] } when submitted.',
          parameters: z.object({
            roles: z.array(z.object({
              roleName: z.string().describe('The name of the role')
            })).describe('The roles that need recipients'),
            templateName: z.string().describe('The name of the template being sent')
          }),
          execute: async ({ roles, templateName }) => {
            console.log('Executing collectRecipients:', { roles, templateName });
            return {
              roles,
              completed: false,
              goBack: false,
              recipients: [],
              templateName
            };
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