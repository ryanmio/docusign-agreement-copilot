/**
 * Chat API Route Handler with AI Tools Integration
 * 
 * This file contains the server-side implementation of the chat API endpoint and its associated tools.
 * These tools are specifically designed for use with the AI chat completion flow using Vercel's AI SDK.
 * 
 * Key Characteristics:
 * - Uses createRouteHandlerClient for server-side Supabase operations
 * - Tools are defined here because they're part of the chat completion flow
 * - Tools are executed during AI streaming responses
 * - Handles authentication and session management for the chat context
 * 
 * Flow:
 * 1. User sends message to this API route
 * 2. Route handler calls OpenAI with available tools
 * 3. AI model chooses which tools to call during chat completion
 * 4. Results stream back to the client
 * 
 * This is different from the client-side tools in ai/tools.ts which are for direct UI interactions
 * outside of the chat flow.
 * 
 * Note on Tool Duplication:
 * Some tools (like displayDocumentDetails) exist in both this file and ai/tools.ts.
 * This is intentional because they serve different purposes:
 * - Tools here: Called by the AI during chat completion, using server-side auth
 * - Tools in tools.ts: Called directly by UI components, using client-side auth
 * They may have similar names and purposes but operate in different contexts with different auth methods.
 */

import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { cookies } from 'next/headers';
import { create, all } from 'mathjs';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import { NavigatorClient } from '@/lib/docusign/navigator-client';

// Create a math instance with all functions
const math = create(all);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Configure marked to preserve anchor tags
marked.use({
  extensions: [{
    name: 'docusign-anchors',
    level: 'inline',
    start(src: string) { return src.match(/<</)?.index; },
    tokenizer(src: string) {
      const rule = /^<<([^>]+)>>/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'html',
          raw: match[0],
          text: `<pre class="docusign-anchor">&lt;&lt;${match[1]}&gt;&gt;</pre>`
        };
      }
    }
  }]
});

interface EnvelopeRecipient {
  email: string;
  name: string;
  status: string;
}

interface Envelope {
  envelopeId: string;
  status: string;
  emailSubject: string;
  sentDateTime?: string;
  lastModifiedDateTime?: string;
  recipients: EnvelopeRecipient[];
  purgeState?: 'unpurged' | 'documents_and_metadata_queued' | 'documents_queued' | 'metadata_queued' | 'purged';
  expireAfter?: string;
  metadata?: {
    expirationDate?: string;
    [key: string]: any;
  };
}

interface ListStatusChangesResponse {
  envelopes: Envelope[];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    console.log('Chat route called');
    const { messages } = await req.json();
    console.log('Received messages:', JSON.stringify(messages, null, 2));
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => {
        const store = cookies();
        return store;
      }
    });
    
    // Get session before starting stream
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    const result = streamText({
      model: openai('gpt-4o'),
      maxSteps: 10,
      experimental_toolCallStreaming: true,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that helps users manage their Docusign documents and agreements.

          IMPORTANT RULES FOR TOOL USAGE:
          1. Always explain what you're going to do BEFORE calling any tool
          2. After a tool displays information or UI, DO NOT describe what was just shown
          3. Only provide next steps or ask for specific actions
          4. Never repeat information that a tool has displayed

          When users ask about documents or envelopes, use displayDocumentDetails
          When users want to view a PDF, use displayPdfViewer
          When users ask about bulk operations, use displayBulkOperation
          When users want to see their envelopes, use displayEnvelopeList
          When users ask about priorities, use displayPriorityDashboard (which will list the priorities – do not write them out in the chat!)
          When users want to send a reminder for a document, use sendReminder
          
          When users request a custom contract (not using a template), follow these EXACT steps:
          1. First, understand the user's requirements and extract key details like:
          - Contract type and purpose
          - Number and roles of signing parties
          - Key terms, conditions, and requirements
          - Any urgency or deadline requirements
          
          2. Generate the contract content in markdown format. The contract should:
          - Have a clear title
          - Include all necessary sections (parties, terms, conditions, etc.)
          - Use appropriate legal language and structure
          - Include a signature section with Docusign anchor tags
          - IMPORTANT: DO NOT output the contract content in chat messages
          
          3. IMPORTANT - Signature Anchor Tags:
          - Use <<SIGNERn_HERE>> where n is the signer number (1-based)
          - Use <<DATE_HERE>> for date fields
          - Example for a two-party contract:
          
          First Party:                          Second Party:
          <<SIGNER1_HERE>>                     <<SIGNER2_HERE>>
          ________________                     ________________
          Name:                                Name:
          Title:                               Title:
          Date: <<DATE_HERE>>                  Date: <<DATE_HERE>>
          
          - For contracts with different numbers of signers, adjust accordingly
          - You can add additional fields like name, title, etc.
          - The signature block format is flexible as long as anchor tags are correct
          - Use appropriate spacing/alignment for the number of signers
          
          4. Call displayContractPreview with these EXACT parameters:
          - markdown: The generated contract content
          - mode: "preview"
          - Say "I've prepared a contract based on your requirements. Please review it below:"
          
          5. Wait for the user to review and edit if needed
          - If user wants to edit, they will use the UI
          - When confirmed, the tool will return { completed: true, markdown: "edited content" }
          - DO NOT proceed until user confirms and the tool returns { completed: true }
          
          6. After contract is confirmed (when { completed: true } is returned):
          - Say "Now I'll collect the signer information. Please fill in the form below:"
          - Call collectContractSigners with the roles array matching the number of signers
          - The form will return { completed: false } while waiting for submission
          - DO NOT ask for information again or retry while completed is false
          - When the form is submitted, it will return { completed: true, recipients: [...] }
          - Only after completed: true, proceed to sending the envelope
          - DO NOT try to collect signer info via chat
          
          7. After signers form is submitted:
          - Show summary and ask for confirmation:
             "I'll send this contract to:
             - [Role 1]: [Name] ([Email])
             - [Role 2]: [Name] ([Email])
             Is this correct? Please confirm by saying 'send' or go back by saying 'edit signers'."
          
          8. Only after 'send' confirmation:
          - Call sendCustomEnvelope with:
             - markdown: the confirmed contract content
             - recipients: the collected signer information
             - expirationHours: if urgency was determined
           - Wait for success response
           - DO NOT try to send without explicit confirmation

          When users want to sign a document:
          1. First try using the embedded signing view by calling signDocument
          2. Only if that fails (returns an error), provide the signing URL as a clickable link
          3. Never show both the embedded view and URL at the same time
          
          When users ask any mathematical questions or need calculations:
          1. Call calculateMath tool with EXACTLY these parameters:
          - expression: preserve original format with currency symbols (e.g., "$150,000 * 0.05" not "150000 * 0.05")
          - showSteps: true (ALWAYS set this to true)
          - context: description of the calculation (ALWAYS include for currency calculations)
          2. DO NOT send any chat messages with the result. Let the tool's UI handle displaying the result
          3. Examples:
          - Input: "(34*10 + 5) / 2"
               Call: calculateMath({ expression: "(34*10 + 5) / 2", showSteps: true })
             - Input: "Calculate 5% of $150,000"
               Call: calculateMath({ expression: "$150,000 * 0.05", showSteps: true, context: "Calculating 5% of $150,000" })
             - Input: "What's 8% tax on $200"
               Call: calculateMath({ expression: "$200 * 0.08", showSteps: true, context: "Calculating 8% tax on $200" })

          For sending templates, follow this EXACT flow:
          1. When user wants to send a template:
             - Say "I'll show you the available templates."
             - Call displayTemplateSelector 
             - Do not repeat or describe the templates, let the UI handle that
             - Wait for user to select a template, unless they have already told you which template they want, in which case you should find it and proceed.
          
          2. After user selects a template:
             - Say "Let me pull up the template details."
             - Call previewTemplate with the selected templateId
             - Use the roles from the response for the next step
          
          3. For collecting recipients:
             - Say "Please fill in the recipient information in the form below."
             - Call collectTemplateRecipients with roles from previewTemplate
             - Wait for the form to be submitted (completed: true)
          
          4. After recipients form is submitted:
             - Call getTemplateTabs for each role
             - If fields found, ask which to prefill
             - If no fields, proceed to confirmation
          
          5. Show summary and ask for confirmation:
             "I'll send the [Template Name] to:
             - [Role 1]: [Name] ([Email])
             - [Role 2]: [Name] ([Email])
             [If prefilled values:]
             With the following prefilled values:
             - [Field 1]: [Value]
             - [Field 2]: [Value]
             Is this correct? Please confirm by saying 'send' or go back by saying 'edit recipients'."
          
          6. Only after 'send' confirmation:
             - Use sendTemplate with all collected info
          
          IMPORTANT: Never try to collect recipient or signer information through chat messages. Always use the appropriate form tool.
          
          When users ask about agreement patterns, insights, or analysis:
          1. Use the navigatorAnalysis tool to analyze agreements based on natural language queries
          2. You can analyze:
             - Agreement patterns by day, category, or type
             - Relationships between parties
             - Common provisions and terms
             - Upcoming renewals and deadlines
          3. Examples of queries and how to handle them:
             - "Show me all agreements from 2024"
               -> navigatorAnalysis({ query, filters: { dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-12-31T23:59:59Z" } } })
             - "Show me agreements from the last 7 days"
               -> navigatorAnalysis({ query, filters: { dateRange: { from: "now-7days", to: "now" } } })
             - "Find agreements with Acme Corp"
               -> navigatorAnalysis({ query, filters: { parties: ["Acme Corp"] } })
             - "Show me agreements expiring in the next 30 days"
               -> navigatorAnalysis({ query, filters: { expirationDateRange: { from: "now", to: "now+30days" } } })
             - "Show me agreements that expired in the last month"
               -> navigatorAnalysis({ query, filters: { expirationDateRange: { from: "now-30days", to: "now" } } })
          4. Date filtering works on:
             - agreement.provisions.effective_date for dateRange filters
             - agreement.provisions.expiration_date for expirationDateRange filters
          5. For renewal queries:
             - Always use expirationDateRange instead of dateRange
             - Calculate appropriate date ranges based on the query
             - Consider urgency (e.g., "soon" = next 30 days)
             - Show expiration dates prominently in results
          6. All filtering happens client-side in the NavigatorAnalysis component
          7. After analysis:
             - DO NOT repeat or describe the results shown in the UI
             - Only provide insights or suggest next steps based on the findings

          When users want to visualize agreement data:
          1. Use the chartAnalysis tool to show interactive charts
          2. Currently only pie charts are supported. If the user requests a different chart type, tell them that is still in development and offer pie instead.
          3. You can analyze these dimensions:
             - category (agreement categories)
             - party_name (first party on agreements)
             - type (agreement types)
             - status (agreement statuses)
             - jurisdiction (agreement jurisdictions)
          4. With these metrics:
             - count (number of agreements)
             - value (total annual value)
             - avg_value (average annual value)
          5. Examples of queries and how to handle them:
             - "Show me a pie chart of agreements by category"
               -> chartAnalysis({ dimension: "category", metric: "count", chartType: "pie" })
             - "Show total value by party"
               -> chartAnalysis({ dimension: "party_name", metric: "value", chartType: "pie" })
          6. After showing the chart:
             - DO NOT describe what the chart shows
             - Only suggest next steps or other analyses to try
          
          Docusign should always be written as Docusign, not DocuSign.
          If a tool call fails, inform the user and suggest retrying or contacting support.`
        },
        ...messages
      ],
      tools: {
        calculateMath: tool({
          description: 'Perform mathematical calculations, especially for contract values and financial computations',
          parameters: z.object({
            expression: z.string().describe('The mathematical expression to evaluate'),
            showSteps: z.boolean().optional().describe('Whether to show calculation steps'),
            context: z.string().optional().describe('Additional context about the calculation')
          }),
          execute: async ({ expression, showSteps, context }) => {
            console.log('Starting calculateMath execution:', { expression, showSteps, context });
            try {
              // Clean up the expression
              let cleanExpression = expression
                .replace(/\$|,/g, '') // Remove currency symbols and commas
                .replace(/(\d+)%/g, '($1/100)') // Convert percentages to decimals
                .replace(/(\d+)\s+(\d+)/g, '$1 * $2'); // Add multiplication operator for implicit multiplication
              
              console.log('Cleaned expression:', cleanExpression);

              // Evaluate the expression
              const result = math.evaluate(cleanExpression);
              console.log('Calculation result:', result);

              // Generate steps if requested
              const steps = showSteps ? [
                context ? `Context: ${context}` : null,
                `Original expression: ${expression}`,
                `Cleaned expression: ${cleanExpression}`,
                `Result: ${result}`
              ].filter((step): step is string => step !== null) : undefined;

              console.log('Generated steps:', steps);

              return {
                state: 'result',
                result: {
                  expression,
                  result,
                  steps,
                  completed: true
                }
              };
            } catch (error) {
              console.error('Error in calculateMath:', error);
              return {
                state: 'error',
                result: {
                  expression,
                  error: error instanceof Error ? error.message : 'Failed to calculate expression',
                  completed: true
                }
              };
            }
          }
        }),
        chartAnalysis: tool({
          description: 'Display an interactive pie chart analyzing agreements by a dimension and metric. Use this when the user wants to visualize agreement data.\n\nSupported dimensions:\n- category (agreement categories)\n- party_name (first party on each agreement)\n- type (agreement types)\n- status (agreement statuses)\n- jurisdiction (agreement jurisdictions)\n\nSupported metrics:\n- count (number of agreements)\n- value (total annual value)\n- avg_value (average annual value)',
          parameters: z.object({
            dimension: z.enum(['category', 'party_name', 'jurisdiction', 'type', 'status'])
              .describe('The dimension to analyze (e.g. category, party_name)'),
            metric: z.enum(['count', 'value', 'avg_value'])
              .describe('The metric to measure (e.g. count, value, avg_value)'),
            chartType: z.enum(['pie']).default('pie')
              .describe('The type of chart to display (currently only pie charts are supported)')
          }),
          execute: async (params) => {
            const { dimension, metric, chartType } = params;
            return {
              dimension,
              metric,
              chartType,
              completed: false
            }
          }
        }),
        navigatorAnalysis: tool({
          description: 'Analyze agreements using natural language queries. Convert user questions into Navigator API calls and display results.',
          parameters: z.object({
            query: z.string().describe('The natural language query from the user'),
            filters: z.object({
              dateRange: z.object({
                from: z.string().optional(),
                to: z.string().optional()
              }).optional(),
              expirationDateRange: z.object({
                from: z.string().optional(),
                to: z.string().optional()
              }).optional(),
              parties: z.array(z.string()).optional(),
              categories: z.array(z.string()).optional(),
              types: z.array(z.string()).optional(),
              provisions: z.record(z.any()).optional()
            }).optional()
          }),
          execute: async ({ query, filters }) => {
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Extract party names from query if present
              if (query.toLowerCase().includes('party') || query.toLowerCase().includes('with')) {
                const partyMatches = query.match(/(?:with|party\s+name\s+)(\w+)/i);
                if (partyMatches && partyMatches[1]) {
                  filters = filters || {};
                  filters.parties = [partyMatches[1]];
                }
              }

              // Initialize Navigator client and get agreements
              const navigatorClient = new NavigatorClient(supabase);
              let allAgreements: any[] = [];
              let pageToken: string | undefined;
              
              do {
                const options = pageToken ? { ctoken: pageToken } : undefined;
                const agreements = await navigatorClient.getAgreements(session.user.id, options);
                allAgreements = [...allAgreements, ...(agreements.items || [])];
                pageToken = agreements.response_metadata?.page_token_next;
              } while (pageToken);

              // Analyze patterns if requested
              let patterns = null;
              if (query.toLowerCase().includes('pattern') || query.toLowerCase().includes('trend')) {
                patterns = await navigatorClient.analyzePatterns(session.user.id);
              }

              const response = {
                agreements: allAgreements,
                patterns,
                metadata: {
                  totalAgreements: allAgreements.length,
                  appliedFilters: {
                    from_date: filters?.dateRange?.from,
                    to_date: filters?.dateRange?.to,
                    expiration_from: filters?.expirationDateRange?.from,
                    expiration_to: filters?.expirationDateRange?.to,
                    parties: filters?.parties,
                    categories: filters?.categories,
                    types: filters?.types,
                    provisions: filters?.provisions
                  }
                }
              };

              return {
                state: 'result',
                result: {
                  query,
                  result: response,
                  completed: true
                }
              };
            } catch (error) {
              console.error('Navigator analysis error:', error);
              return {
                state: 'error',
                result: {
                  query,
                  error: error instanceof Error ? error.message : 'Failed to analyze agreements',
                  completed: true
                }
              };
            }
          }
        }),
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
            console.log('[API] Starting displayDocumentDetails execution:', { envelopeId, showActions });
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              console.log('[API] Getting user session');
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              console.log('[API] Session data:', { userId: session?.user?.id });
              if (sessionError) {
                console.error('[API] Session error:', sessionError);
                return {
                  state: 'error',
                  error: 'Authentication error'
                };
              }

              if (!session?.user) {
                console.error('[API] No user found in session');
                return {
                  state: 'error',
                  error: 'User not authenticated'
                };
              }

              // Fetch envelope data
              console.log('[API] Fetching envelope data:', { envelopeId, userId: session.user.id });
              const { data: envelopes, error: envelopeError } = await supabase
                .from('envelopes')
                .select('*, recipients(*)')
                .eq('docusign_envelope_id', envelopeId)
                .eq('user_id', session.user.id);

              console.log('[API] Envelope query result:', { hasEnvelopes: !!envelopes, envelopeCount: envelopes?.length, error: envelopeError });

              if (envelopeError) {
                console.error('[API] Error loading envelope:', envelopeError);
                return {
                  state: 'error',
                  error: 'Error loading envelope details'
                };
              }

              if (!envelopes || envelopes.length === 0) {
                console.error('[API] No envelope found with Docusign ID:', envelopeId);
                return {
                  state: 'error',
                  error: 'This envelope is not available or you don\'t have permission to view it'
                };
              }

              const envelope = envelopes[0];
              console.log('[API] Envelope data loaded:', { id: envelope.id, status: envelope.status });

              // Fetch documents
              console.log('[API] Fetching documents:', { docusignEnvelopeId: envelope.docusign_envelope_id });
              const docusign = new DocuSignEnvelopes(supabase);
              const documents = await docusign.listDocuments(session.user.id, envelope.docusign_envelope_id);
              console.log('[API] Documents loaded:', documents);

              return { 
                envelope,
                documents,
                envelopeId, 
                showActions: showActions ?? true
              };
            } catch (error) {
              console.error('[API] Error in displayDocumentDetails:', error);
              return {
                state: 'error',
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
              };
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
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Fetch templates from Docusign
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
          description: 'Display a preview of a Docusign template with its details and required roles',
          parameters: z.object({
            templateId: z.string().describe('The ID of the template to preview'),
            showBackButton: z.boolean().optional().describe('Whether to show the back button')
          }),
          execute: async ({ templateId, showBackButton }) => {
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Get template details from Docusign
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
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
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
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Get envelopes from Docusign
              const docusign = new DocuSignEnvelopes(supabase);
              const ninetyDaysAgo = new Date();
              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

              const { envelopes } = await docusign.listStatusChanges(session.user.id, {
                from_date: ninetyDaysAgo.toISOString(),
                include: ['recipients', 'expiration', 'purge_state'],
                status: ['sent', 'delivered', 'declined', 'voided']
              });

              console.log('Raw envelope data:', JSON.stringify(envelopes[0], null, 2));

              // Helper to extract recipients from envelope
              const getRecipients = (envelope: any) => {
                // Docusign might return recipients in different formats
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
                  return envelope.recipients.map((r: { email: string; name: string; status: string }) => ({
                    email: r.email,
                    name: r.name,
                    status: r.status
                  }));
                }

                return [];
              };

              // Log ALL envelopes and their states
              console.log('Total envelopes received:', envelopes.length);
              envelopes.forEach(env => {
                console.log('Envelope:', {
                  id: env.envelopeId,
                  subject: env.emailSubject,
                  status: env.status,
                  purgeState: env.purgeState
                });
              });

              // Filter out purged envelopes first
              const activeEnvelopes = envelopes.filter(env => !env.purgeState || env.purgeState === 'unpurged');
              console.log('Active envelopes after purge filtering:', activeEnvelopes.length);

              // Helper to determine urgency reason
              const getUrgencyReason = (envelope: any) => {
                if (envelope.status === 'declined') return 'Document was declined';
                if (envelope.status === 'voided') return 'Document was voided';

                // DEMO OVERRIDE: Temporary hack for demo purposes only
                // TODO: Replace with real Navigator integration
                // Proper implementation would:
                // 1. Query Navigator API for agreement.provisions.expiration_date
                // 2. Merge with Docusign envelope status
                const demoExpirationMap: Record<string, string> = {
                  'GlobalTech - Renewal - 2025-01-07': '2025-01-26',
                  'FastComm Vendor Renewal Agreement - February 2025': '2025-01-25',
                  'FastComm - Check-in - 2023-12-26': '2025-01-30',
                  'AcmeCorp - Renewal - 2025-01-15': '2025-01-31',
                  'Weekly Team Review - 2025-01-14': '2025-02-01',
                };
                
                let expirationDate = demoExpirationMap[envelope.emailSubject] || 
                  envelope.metadata?.expirationDate;

                // Calculate expiration from expireAfter + sentDateTime as fallback
                if (!expirationDate && envelope.expireAfter && envelope.sentDateTime) {
                  const days = parseInt(envelope.expireAfter);
                  const sentDate = new Date(envelope.sentDateTime);
                  expirationDate = new Date(sentDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
                }

                if (expirationDate) {
                  const hoursUntilExpiration = Math.floor((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60));
                  
                  if (hoursUntilExpiration <= 48) {
                    return `Expires in ${hoursUntilExpiration} hours`;
                  }
                  if (hoursUntilExpiration <= 168) { // 7 days
                    const days = Math.floor(hoursUntilExpiration / 24);
                    return days <= 1 ? `Expires in ${hoursUntilExpiration} hours` : `Expires in ${days} days`;
                  }
                }

                // Simplified stalled check
                const lastModified = envelope.lastModifiedDateTime ? new Date(envelope.lastModifiedDateTime) : null;
                if (lastModified && (Date.now() - lastModified.getTime()) > 7 * 24 * 60 * 60 * 1000) {
                  return 'No activity for 7+ days';
                }

                return 'Awaiting action';
              };

              // Categorize envelopes
              const urgentEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];
              const upcomingEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];
              const stalledEnvelopes: Array<{
                envelopeId: string;
                subject: string;
                status: string;
                recipients: Array<{
                  email: string;
                  name: string;
                  status: string;
                }>;
                urgencyReason: string;
              }> = [];

              activeEnvelopes.forEach(envelope => {
                console.log('\n--- Processing Envelope ---');
                console.log('Envelope:', {
                  id: envelope.envelopeId,
                  subject: envelope.emailSubject,
                  status: envelope.status,
                  metadata: envelope.metadata,
                  sentDateTime: envelope.sentDateTime,
                  lastModifiedDateTime: envelope.lastModifiedDateTime
                });

                const urgencyReason = getUrgencyReason(envelope);
                const priorityEnvelope = {
                  envelopeId: envelope.envelopeId,
                  subject: envelope.emailSubject,
                  status: envelope.status,
                  recipients: getRecipients(envelope),
                  urgencyReason
                };

                // Simplified categorization
                if (['declined', 'voided'].includes(envelope.status)) {
                  console.log('Categorizing as URGENT - Status is:', envelope.status);
                  urgentEnvelopes.push(priorityEnvelope);
                } else if (urgencyReason.includes('Expires in')) {
                  const match = urgencyReason.match(/(\d+)\s+(hours|days)/);
                  if (match) {
                    const value = parseInt(match[1]);
                    const unit = match[2];
                    const hours = unit === 'hours' ? value : value * 24;
                    
                    if (hours <= 48) {
                      console.log('Categorizing as NEEDS ATTENTION - Expires in less than 48 hours');
                      urgentEnvelopes.push(priorityEnvelope);
                    } else if (hours <= 168) { // 7 days
                      console.log('Categorizing as UPCOMING - Expires in less than 7 days');
                      upcomingEnvelopes.push(priorityEnvelope);
                    }
                  }
                } else if (urgencyReason.includes('No activity')) {
                  console.log('Categorizing as STALLED - No activity for 7+ days');
                  stalledEnvelopes.push(priorityEnvelope);
                }
              });

              console.log('\n--- Final Categorization ---');
              console.log('Urgent Envelopes:', urgentEnvelopes.length);
              console.log('Upcoming Envelopes:', upcomingEnvelopes.length);
              console.log('Stalled Envelopes:', stalledEnvelopes.length);

              // Limit to 5 items per section for demo
              const sections = [
                {
                  title: 'Needs Attention',
                  type: 'urgent',
                  envelopes: urgentEnvelopes.slice(0, 5)
                },
                {
                  title: 'Upcoming',
                  type: 'today',
                  envelopes: upcomingEnvelopes.slice(0, 5)
                },
                {
                  title: 'Stalled',
                  type: 'thisWeek',
                  envelopes: stalledEnvelopes.slice(0, 5)
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
            expirationHours: z.number().min(1).max(720).optional().describe('Optional expiration time in hours'),
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
          execute: async ({ templateId, subject, message, recipients, prefillData, expirationHours }) => {
            console.log('Starting sendTemplate execution:', { templateId, recipients, prefillData, expirationHours });
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Calculate expiration date if provided
              const expirationDateTime = expirationHours 
                ? new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()
                : undefined;

              // Send the template using Docusign
              const docusign = new DocuSignEnvelopes(supabase);
              const docusignResponse = await docusign.createEnvelopeFromTemplate(
                session.user.id,
                templateId,
                {
                  emailSubject: subject,
                  emailBlurb: message,
                  roles: recipients,
                  prefillData,
                  expirationDateTime
                }
              );

              // Store envelope in database
              const { data: envelope, error: envelopeError } = await supabase
                .from('envelopes')
                .upsert({
                  user_id: session.user.id,
                  docusign_envelope_id: docusignResponse.envelopeId,
                  subject: "Custom Contract",
                  message,
                  status: 'sent',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  metadata: {
                    is_custom: true,
                  },
                }, {
                  onConflict: 'docusign_envelope_id',
                  ignoreDuplicates: false
                })
                .select()
                .single();

              if (envelopeError) {
                console.error('Database error:', envelopeError);
                return {
                  success: true,
                  warning: 'Envelope created in Docusign but failed to store in database',
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
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
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
        collectTemplateRecipients: tool({
          description: 'Display a form to collect recipient information. The form will return { completed: true, recipients: [...] } when submitted.',
          parameters: z.object({
            roles: z.array(z.object({
              roleName: z.string().describe('The name of the role')
            })).describe('The roles that need recipients'),
            templateName: z.string().describe('The name of the template being sent')
          }),
          execute: async ({ roles, templateName }) => {
            console.log('Executing collectTemplateRecipients:', { roles, templateName });
            return {
              roles,
              completed: false,
              goBack: false,
              recipients: [],
              templateName
            };
          }
        }),
        signDocument: tool({
          description: 'Generate an embedded signing view for a document that needs to be signed. Use this when a user needs to sign a document or envelope.',
          parameters: z.object({
            envelopeId: z.string().describe('The ID of the envelope to sign'),
            returnUrl: z.string().optional().describe('Optional return URL after signing')
          }),
          execute: async ({ envelopeId, returnUrl }, { toolCallId }) => {
            console.log('Starting signDocument execution:', { envelopeId, toolCallId });
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              console.log('Auth session check:', {
                hasSession: !!session,
                userId: session?.user?.id,
                error: sessionError
              });

              if (sessionError || !session?.user) {
                console.error('Authentication error:', sessionError);
                return {
                  error: 'User not authenticated',
                  completed: true,
                  status: 'error'
                };
              }

              // Verify envelope exists and belongs to user
              const { data: envelope, error: envelopeError } = await supabase
                .from('envelopes')
                .select('*')
                .eq('docusign_envelope_id', envelopeId)
                .eq('user_id', session.user.id)
                .single();

              console.log('Envelope verification:', {
                envelopeId,
                found: !!envelope,
                error: envelopeError,
                userId: session.user.id
              });

              if (envelopeError || !envelope) {
                console.error('Envelope error:', envelopeError);
                return {
                  error: 'Envelope not found or access denied',
                  completed: true,
                  status: 'error'
                };
              }

              // Get signing URL using existing Docusign client
              const docusign = new DocuSignEnvelopes(supabase);
              const signingUrl = await docusign.getSigningUrl(
                session.user.id, 
                envelopeId,
                returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/documents/${envelope.id}`
              );

              console.log('Generated signing URL for envelope:', envelopeId);

              return {
                envelopeId,
                signingUrl,
                mode: 'focused',
                status: 'ready',
                completed: false,
                embeddedViewShown: true
              };
            } catch (error) {
              console.error('Error in signDocument:', error);
              return {
                error: error instanceof Error ? error.message : 'Failed to generate signing URL',
                status: 'error',
                completed: true,
                showEmbeddedView: false
              };
            }
          }
        }),
        sendReminder: tool({
          description: 'Send a reminder for a Docusign envelope',
          parameters: z.object({
            envelopeId: z.string().describe('The ID of the envelope to send reminder for'),
            message: z.string().optional().describe('Optional custom reminder message')
          }),
          execute: async ({ envelopeId, message }) => {
            console.log('Starting sendReminder execution:', { envelopeId, message });
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Send reminder using Docusign client
              const docusign = new DocuSignEnvelopes(supabase);
              const result = await docusign.sendReminder(session.user.id, envelopeId, message);

              return {
                success: true,
                envelopeId,
                recipientCount: result.recipientCount || 1
              };
            } catch (error) {
              console.error('Error in sendReminder:', error);
              return {
                success: false,
                envelopeId,
                error: error instanceof Error ? error.message : 'Failed to send reminder'
              };
            }
          }
        }),
        displayContractPreview: tool({
          description: 'Display a contract in markdown format for preview and editing. Use this after generating contract content to show it to the user.',
          parameters: z.object({
            markdown: z.string().describe('The contract content in markdown format with Docusign anchor tags'),
            mode: z.enum(['preview', 'edit']).default('preview').describe('The initial display mode')
          }),
          execute: async ({ markdown, mode }) => {
            return {
              markdown,
              mode,
              completed: false
            };
          }
        }),
        collectContractSigners: tool({
          description: 'Collect signer information for a custom generated contract. Returns { completed: true, recipients: [...] } when form is submitted, { completed: false } while waiting.',
          parameters: z.object({
            roles: z.array(z.object({
              roleName: z.string().describe('The name of the role')
            })).describe('The roles needed to sign the contract (e.g. ["Employee", "Employer"])')
          }),
          execute: async ({ roles }) => {
            console.log('Starting collectContractSigners execution:', { roles });
            
            // Return initial state to show form
            const result = {
              roles,
              completed: false,
              goBack: false,
              recipients: []
            };
            
            console.log('Returning collectContractSigners result:', result);
            return result;
          }
        }),
        sendCustomEnvelope: tool({
          description: 'Send a custom contract as a Docusign envelope',
          parameters: z.object({
            markdown: z.string().describe('The contract content in markdown format'),
            recipients: z.array(z.object({
              email: z.string(),
              name: z.string(),
              roleName: z.string()
            })).describe('The recipients to send the contract to'),
            message: z.string().optional().describe('Optional email message'),
            expirationHours: z.number().min(1).max(720).optional().describe('Optional expiration time in hours')
          }),
          execute: async ({ markdown, recipients, message, expirationHours }) => {
            console.log('Starting sendCustomEnvelope execution:', { recipients, expirationHours });
            try {
              const cookieStore = await cookies();
              const supabase = createRouteHandlerClient({ 
                cookies: () => {
                  const store = cookies();
                  return store;
                }
              });
              
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session?.user) {
                throw new Error('User not authenticated');
              }

              // Calculate expiration date if provided
              const expirationDateTime = expirationHours 
                ? new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()
                : undefined;

              // Preprocess markdown to protect anchor tags
              const preprocessedMarkdown = markdown.replace(
                /<<([^>]+)>>/g,
                '<span class="docusign-anchor"><<$1>></span>'
              );

              // Convert markdown to HTML
              const rawHtml = await marked.parse(preprocessedMarkdown, {
                async: true,
                breaks: true,
                gfm: true
              });

              // Log the HTML to verify anchor tags are preserved
              console.log('HTML before final wrapping:', rawHtml);

              // Before PDF generation, prepare the HTML
              const finalHtml = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.6;
                        padding: 20mm;
                        margin: 0;
                      }
                      h1 { font-size: 18px; margin-bottom: 20px; }
                      h2 { font-size: 14px; margin-top: 20px; }
                      p { margin: 10px 0; }
                      .docusign-anchor { 
                        display: inline;
                        font-family: monospace;
                        white-space: pre;
                        /* Use minimal styling to ensure tag preservation */
                        color: #f8f8f8;  /* Very light gray, almost white */
                        font-size: 9px;  /* Slightly larger to ensure clarity */
                      }
                    </style>
                  </head>
                  <body>${rawHtml}</body>
                </html>
              `;

              // Log the final HTML to verify everything is intact
              console.log('Final HTML structure (without content):', finalHtml.replace(rawHtml, '[CONTENT]'));

              // Launch browser
              const browser = await puppeteer.launch({ headless: true });
              try {
                const page = await browser.newPage();
                
                // Set content and log any errors
                await page.setContent(finalHtml).catch((err: Error) => {
                  console.error('Error setting page content:', err);
                  throw err;
                });

                // Add a check to verify anchor tags in final DOM
                const anchorTagsPresent = await page.evaluate(() => {
                  const anchors = document.querySelectorAll('.docusign-anchor');
                  return Array.from(anchors).map(a => a.textContent);
                });
                console.log('Anchor tags in final DOM:', anchorTagsPresent);

                // Generate PDF with logging
                console.log('Generating PDF...');
                const pdfBuffer = await page.pdf({
                  format: 'A4',
                  printBackground: true,
                  margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                  }
                }).catch((err: Error) => {
                  console.error('Error generating PDF:', err);
                  throw err;
                });
                console.log('PDF generated successfully');

                // Convert to base64 (hide from logs)
                const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
                
                // Send envelope using Docusign (with cleaner logging)
                const docusign = new DocuSignEnvelopes(supabase);
                const envelopeDefinition = {
                  emailSubject: "Custom Contract",
                  emailBlurb: message,
                  expirationDateTime,
                  documents: [{
                    name: 'Contract.pdf',
                    fileExtension: 'pdf',
                    documentId: '1'
                  }],
                  recipients: {
                    signers: recipients.map((recipient, i) => ({
                      email: recipient.email,
                      name: recipient.name,
                      recipientId: (i + 1).toString(),
                      routingOrder: i + 1,
                      tabs: {
                        signHereTabs: [{
                          anchorString: `<<SIGNER${i + 1}_HERE>>`,
                          anchorUnits: "pixels",
                          anchorXOffset: "0",
                          anchorYOffset: "0",
                          anchorIgnoreIfNotPresent: false,
                          anchorMatchWholeWord: true
                        }],
                        dateSignedTabs: [{
                          anchorString: "<<DATE_HERE>>",
                          anchorUnits: "pixels",
                          anchorXOffset: "0",
                          anchorYOffset: "0",
                          anchorIgnoreIfNotPresent: false,
                          anchorMatchWholeWord: true
                        }]
                      }
                    }))
                  },
                  status: "sent"
                };

                // Log envelope definition without base64 content
                console.log('Sending envelope definition:', JSON.stringify(envelopeDefinition, null, 2));

                // Create actual envelope with base64 content (not logged)
                const docusignResponse = await docusign.createEnvelope(session.user.id, {
                  ...envelopeDefinition,
                  documents: [{
                    ...envelopeDefinition.documents[0],
                    documentBase64: pdfBase64
                  }]
                });

                // Store envelope in database
                const { data: envelope, error: envelopeError } = await supabase
                  .from('envelopes')
                  .upsert({
                    user_id: session.user.id,
                    docusign_envelope_id: docusignResponse.envelopeId,
                    subject: "Custom Contract",
                    message,
                    status: 'sent',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    metadata: {
                      is_custom: true,
                    },
                  }, {
                    onConflict: 'docusign_envelope_id',
                    ignoreDuplicates: false
                  })
                  .select()
                  .single();

                if (envelopeError) {
                  console.error('Database error:', envelopeError);
                  return {
                    success: true,
                    warning: 'Envelope created in Docusign but failed to store in database',
                    envelopeId: docusignResponse.envelopeId,
                    status: 'sent'
                  };
                }

                // Store recipients
                const { error: recipientsError } = await supabase
                  .from('recipients')
                  .insert(
                    recipients.map((recipient, i) => ({
                      envelope_id: envelope.id,
                      email: recipient.email,
                      name: recipient.name,
                      routing_order: i + 1,
                      metadata: {
                        role_name: recipient.roleName,
                      },
                    }))
                  );

                if (recipientsError) {
                  console.error('Recipients storage error:', recipientsError);
                  return {
                    success: true,
                    warning: 'Envelope created but recipient details not stored',
                    envelopeId: envelope.docusign_envelope_id,
                    status: 'sent'
                  };
                }

                return {
                  success: true,
                  envelopeId: envelope.docusign_envelope_id,
                  status: 'sent'
                };
              } finally {
                await browser.close();
              }
            } catch (error) {
              console.error('Error in sendCustomEnvelope:', error);
              throw error;
            }
          }
        })
      }
    });

    console.log('Streaming response');
    const response = result.toDataStreamResponse();
    
    // Add required headers for streaming in Edge runtime
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    
    return new Response(response.body, {
      headers,
      status: 200,
    });
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