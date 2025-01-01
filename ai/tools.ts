import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';

// Add types for priority dashboard
interface PriorityEnvelope {
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
}

interface PrioritySection {
  title: string;
  envelopes: PriorityEnvelope[];
  type: 'urgent' | 'today' | 'thisWeek';
}

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
  },
  displayTemplateSelector: {
    name: 'displayTemplateSelector',
    description: 'Display a template selector with search capabilities',
    parameters: {
      type: 'object',
      properties: {
        preselectedId: {
          type: 'string',
          description: 'Optional template ID to preselect'
        },
        showSearch: {
          type: 'boolean',
          description: 'Whether to show the search input'
        }
      }
    },
    execute: async (args: { preselectedId?: string; showSearch?: boolean }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch templates from DocuSign
      const docusign = new DocuSignEnvelopes(supabase);
      const { templates } = await docusign.listTemplates(user.id);

      return {
        selectedTemplateId: args.preselectedId,
        showSearch: args.showSearch ?? true,
        templates
      };
    }
  },
  previewTemplate: {
    description: 'Display a preview of a DocuSign template with its details and required roles',
    parameters: z.object({
      templateId: z.string().describe('The ID of the template to preview'),
      showBackButton: z.boolean().optional().describe('Whether to show the back button')
    }),
    execute: async ({ templateId, showBackButton }: { 
      templateId: string; 
      showBackButton?: boolean 
    }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get template details from DocuSign
      const docusign = new DocuSignEnvelopes(supabase);
      const template = await docusign.getTemplate(user.id, templateId);

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
    }
  },
  collectRecipients: {
    description: 'Display a form to collect recipient information for a template',
    parameters: z.object({
      templateId: z.string().describe('The ID of the template to collect recipients for'),
      roles: z.array(z.object({
        roleName: z.string()
      })).describe('The roles required by the template'),
      showBackButton: z.boolean().optional().describe('Whether to show a back button')
    }),
    execute: async ({ templateId, roles, showBackButton }: { 
      templateId: string; 
      roles: Array<{ roleName: string }>;
      showBackButton?: boolean;
    }) => {
      console.log('Starting collectRecipients execution:', { templateId, roles });
      return {
        templateId,
        roles,
        mode: 'collect',
        showBackButton: showBackButton ?? false,
        requireConfirmation: true
      };
    }
  },
  sendTemplate: {
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
    execute: async ({ templateId, subject, message, recipients }: { 
      templateId: string;
      subject: string;
      message?: string;
      recipients: Array<{
        email: string;
        name: string;
        roleName: string;
      }>;
    }) => {
      console.log('Starting sendTemplate execution:', { templateId, recipients });
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Send the template using the API
      const response = await fetch(`/api/templates/${templateId}/envelopes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message,
          roles: recipients
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send template');
      }

      const envelope = await response.json();
      return {
        success: true,
        envelopeId: envelope.id,
        status: 'sent'
      };
    }
  },
  displayPriorityDashboard: {
    name: 'displayPriorityDashboard',
    description: 'Display a dashboard of priority agreements requiring attention',
    parameters: z.object({
      showBackButton: z.boolean().optional().describe('Whether to show a back button')
    }),
    execute: async ({ showBackButton }: { showBackButton?: boolean }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get envelopes from DocuSign
      const docusign = new DocuSignEnvelopes(supabase);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { envelopes } = await docusign.listStatusChanges(user.id, {
        from_date: thirtyDaysAgo.toISOString(),
        include: ['recipients', 'expiration'],
        status: ['sent', 'delivered', 'declined', 'voided']
      });

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
      const urgentEnvelopes: PriorityEnvelope[] = [];
      const todayEnvelopes: PriorityEnvelope[] = [];
      const thisWeekEnvelopes: PriorityEnvelope[] = [];

      envelopes.forEach(envelope => {
        const priorityEnvelope: PriorityEnvelope = {
          envelopeId: envelope.envelopeId,
          subject: envelope.emailSubject,
          status: envelope.status,
          expirationDate: envelope.expirationDateTime,
          recipients: envelope.recipients.map(r => ({
            email: r.email,
            name: r.name,
            status: r.status
          })),
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
      const sections: PrioritySection[] = [
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
    }
  }
}; 