import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';

export const tools = {
  displayBulkOperation: {
    name: 'displayBulkOperation',
    description: 'Display progress and status of a bulk document sending operation',
    parameters: {
      type: 'object',
      properties: {
        operationId: {
          type: 'string',
          description: 'The ID of the bulk operation to display'
        },
        showBackButton: {
          type: 'boolean',
          description: 'Whether to show a back button'
        }
      },
      required: ['operationId']
    },
    execute: async (args: { operationId: string; showBackButton?: boolean }) => {
      return {
        operationId: args.operationId,
        showBackButton: args.showBackButton ?? false
      };
    }
  },
  displayPdfViewer: {
    name: 'displayPdfViewer',
    description: 'Display a PDF document with viewer controls',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the PDF document to display'
        }
      },
      required: ['url']
    },
    execute: async (args: { url: string }) => {
      return {
        url: args.url
      };
    }
  },
  displayDocumentDetails: {
    name: 'displayDocumentDetails',
    description: 'Display detailed information about a document envelope',
    parameters: {
      type: 'object',
      properties: {
        envelopeId: {
          type: 'string',
          description: 'The ID of the envelope to display details for'
        },
        showActions: {
          type: 'boolean',
          description: 'Whether to show action buttons like void and resend'
        }
      },
      required: ['envelopeId']
    },
    execute: async (args: { envelopeId: string; showActions?: boolean }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch envelope data
      const { data: envelope, error: envelopeError } = await supabase
        .from('envelopes')
        .select('*, recipients(*)')
        .eq('id', args.envelopeId)
        .single();

      if (envelopeError) {
        throw new Error('Error loading envelope details');
      }

      // Fetch documents
      const docusign = new DocuSignEnvelopes(supabase);
      const documents = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);

      return { 
        envelopeId: args.envelopeId, 
        showActions: args.showActions ?? true,
        envelope,
        documents
      };
    }
  }
}; 