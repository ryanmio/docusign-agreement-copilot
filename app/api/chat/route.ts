import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';

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
          Always use the appropriate tool to display information rather than just describing it.`
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
            console.log('Executing displayDocumentDetails:', { envelopeId, showActions });
            try {
              const supabase = createClientComponentClient();
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                throw new Error('User not authenticated');
              }

              // Fetch envelope data
              const { data: envelope, error: envelopeError } = await supabase
                .from('envelopes')
                .select('*, recipients(*)')
                .eq('id', envelopeId)
                .single();

              if (envelopeError) {
                console.error('Error loading envelope:', envelopeError);
                throw new Error('Error loading envelope details');
              }

              // Fetch documents
              const docusign = new DocuSignEnvelopes(supabase);
              const documents = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);

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
        })
      }
    });

    console.log('Streaming response');
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 