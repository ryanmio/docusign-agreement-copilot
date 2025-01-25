/**
 * Client-Side UI Tools Implementation
 * 
 * This file contains tools that are used directly by UI components for immediate interactions,
 * outside of the AI chat completion flow.
 * 
 * Key Characteristics:
 * - Uses createClientComponentClient for client-side Supabase operations
 * - Tools are called directly by UI components
 * - Immediate execution and response (no streaming)
 * - Used for direct user interactions like displaying data or forms
 * 
 * These tools are different from the ones in app/api/chat/route.ts which are:
 * - Used in the AI chat completion flow
 * - Called by the AI model during chat streaming
 * - Part of the server-side route handler
 * 
 * Example Usage:
 * - Displaying document details directly in a component
 * - Showing template selectors
 * - Managing form state for recipient collection
 * 
 * Note on Tool Duplication:
 * Some tools (like displayDocumentDetails) exist in both this file and route.ts.
 * This is intentional because they serve different purposes:
 * - Tools here: Called directly by UI components when they need to display or interact with data
 * - Tools in route.ts: Same functionality but called by the AI during chat conversations
 * The duplication is necessary because they operate in different contexts (client vs server)
 * and use different authentication methods (client vs route handler).
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';
import { create, all } from 'mathjs';

// Create a math instance with all functions
const math = create(all);

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
  purgeState?: 'unpurged' | 'documents_and_metadata_queued' | 'documents_queued' | 'metadata_queued' | 'purged';
}

interface PrioritySection {
  title: string;
  envelopes: PriorityEnvelope[];
  type: 'urgent' | 'today' | 'thisWeek';
}

interface CalculateMathParams {
  expression: string;
  showSteps?: boolean;
  context?: string;
}

interface CalculateMathResult {
  expression: string;
  result?: number;
  steps?: string[];
  error?: string;
  completed: boolean;
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
    description: 'Display a preview of a Docusign template with its details and required roles',
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
  collectTemplateRecipients: {
    description: 'Collect recipient information for sending a Docusign template',
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
      console.log('Starting collectTemplateRecipients execution:', { templateId, roles });
      return {
        templateId,
        roles,
        mode: 'collect',
        showBackButton: showBackButton ?? false,
        requireConfirmation: true
      };
    }
  },
  collectContractSigners: {
    description: 'Collect signer information for a custom generated contract',
    parameters: z.object({
      roles: z.array(z.object({
        roleName: z.string()
      })).describe('The roles needed to sign the contract (e.g. ["Signer 1", "Signer 2"])'),
      showBackButton: z.boolean().optional().describe('Whether to show a back button')
    }),
    execute: async ({ roles, showBackButton }: { 
      roles: Array<{ roleName: string }>;
      showBackButton?: boolean;
    }) => {
      console.log('Starting collectContractSigners execution:', { roles });
      return {
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

      const result = await response.json();
      
      console.log('ENVELOPE_FLOW: sendTemplate received response:', {
        resultShape: {
          hasEnvelopeWithId: !!result.envelope?.id,
          hasDirectId: !!result.id,
          hasEnvelopeId: !!result.envelopeId
        },
        fullResult: result,
        timestamp: new Date().toISOString()
      });
      
      // Handle different response formats
      let envelopeId;
      if (result.envelope?.id) {
        // Response with warning but has envelope
        envelopeId = result.envelope.id;
        console.log('ENVELOPE_FLOW: Using envelope.id from warning response:', {
          envelopeId,
          timestamp: new Date().toISOString()
        });
      } else if (result.id) {
        // Happy path - full envelope record
        envelopeId = result.id;
        console.log('ENVELOPE_FLOW: Using direct id from success response:', {
          envelopeId,
          timestamp: new Date().toISOString()
        });
      } else if (result.envelopeId) {
        // Database error case - just DocuSign ID
        console.log('ENVELOPE_FLOW: Got DocuSign ID, querying database:', {
          docusignEnvelopeId: result.envelopeId,
          timestamp: new Date().toISOString()
        });
        
        // Query the database to get our record
        const { data: envelope, error } = await supabase
          .from('envelopes')
          .select('id')
          .eq('docusign_envelope_id', result.envelopeId)
          .single();
          
        if (envelope?.id) {
          envelopeId = envelope.id;
          console.log('ENVELOPE_FLOW: Found database ID:', {
            envelopeId,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error('ENVELOPE_FLOW: Failed to find in database:', {
            error,
            docusignEnvelopeId: result.envelopeId,
            timestamp: new Date().toISOString()
          });
          throw new Error('Failed to find envelope in database');
        }
      } else {
        console.error('ENVELOPE_FLOW: Invalid response format:', {
          result,
          timestamp: new Date().toISOString()
        });
        throw new Error('Invalid response format from server');
      }

      console.log('ENVELOPE_FLOW: Final ID being returned to component:', {
        envelopeId,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        envelopeId,
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
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { envelopes } = await docusign.listStatusChanges(user.id, {
        from_date: ninetyDaysAgo.toISOString(),
        include: ['recipients', 'expiration', 'purge_state'],
        status: ['sent', 'delivered', 'declined', 'voided']
      });

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
        // Only show envelopes that are not being purged
        if (envelope.purgeState && envelope.purgeState !== 'unpurged') {
          console.log('Skipping envelope due to purge state:', {
            id: envelope.envelopeId,
            subject: envelope.emailSubject,
            status: envelope.status,
            purgeState: envelope.purgeState
          });
          return;
        }

        const priorityEnvelope: PriorityEnvelope = {
          envelopeId: envelope.envelopeId,
          subject: envelope.emailSubject,
          status: envelope.status,
          expirationDate: envelope.metadata?.expirationDate,
          recipients: envelope.recipients.map(r => ({
            email: r.email,
            name: r.name,
            status: r.status
          })),
          urgencyReason: getUrgencyReason(envelope),
          purgeState: envelope.purgeState
        };

        // DEMO OVERRIDE: Temporary hack for demo purposes only
        const demoExpirationMap: Record<string, string> = {
          'GlobalTech - Renewal - 2025-01-07': '2025-01-26',
          'FastComm Vendor Renewal Agreement - February 2025': '2025-01-25',
          'FastComm - Check-in - 2023-12-26': '2025-01-30',
          'AcmeCorp - Renewal - 2025-01-15': '2025-01-31',
          'Weekly Team Review - 2025-01-14': '2025-02-01',
        };

        // Get expiration date from metadata or demo map
        let expirationDate = demoExpirationMap[envelope.emailSubject] || envelope.metadata?.expirationDate;

        // Calculate expiration from expireAfter + sentDateTime as fallback
        if (!expirationDate && envelope.expireAfter && envelope.sentDateTime) {
          const days = parseInt(envelope.expireAfter);
          const sentDate = new Date(envelope.sentDateTime);
          expirationDate = new Date(sentDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
        }

        // Categorize based on status and expiration
        if (
          envelope.status === 'voided' || 
          envelope.status === 'declined' ||
          (expirationDate && new Date(expirationDate).getTime() - new Date().getTime() <= 48 * 60 * 60 * 1000)
        ) {
          urgentEnvelopes.push(priorityEnvelope);
        } else if (
          expirationDate && 
          new Date(expirationDate).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000
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
          envelopes: urgentEnvelopes.slice(0, 10)
        },
        {
          title: 'Today',
          type: 'today',
          envelopes: todayEnvelopes.slice(0, 10)
        },
        {
          title: 'This Week',
          type: 'thisWeek',
          envelopes: thisWeekEnvelopes.slice(0, 10)
        }
      ];

      return {
        sections,
        showBackButton: showBackButton ?? false
      };
    }
  },
  sendReminder: {
    name: 'sendReminder',
    description: 'Send a reminder for a Docusign envelope',
    parameters: z.object({
      envelopeId: z.string().describe('The ID of the envelope to send reminder for'),
      message: z.string().optional().describe('Optional custom reminder message')
    }),
    execute: async ({ envelopeId, message }: { envelopeId: string; message?: string }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // Send reminder using DocuSign client
        const docusign = new DocuSignEnvelopes(supabase);
        const result = await docusign.sendReminder(user.id, envelopeId, message);

        return {
          success: true,
          envelopeId,
          recipientCount: result.recipientCount || 1
        };
      } catch (error) {
        console.error('Error sending reminder:', error);
        return {
          success: false,
          envelopeId,
          error: error instanceof Error ? error.message : 'Failed to send reminder'
        };
      }
    }
  },
  calculateMath: {
    name: 'calculateMath',
    description: 'Perform mathematical calculations, especially for contract values and financial computations. Supports basic arithmetic, percentages, and currency calculations.',
    parameters: z.object({
      expression: z.string().describe('The mathematical expression to evaluate'),
      showSteps: z.boolean().optional().describe('Whether to show calculation steps'),
      context: z.string().optional().describe('Additional context about the calculation')
    }),
    execute: async ({ expression, showSteps, context }: CalculateMathParams): Promise<CalculateMathResult> => {
      console.log('Starting calculateMath execution:', { expression, showSteps, context });
      try {
        // Clean up the expression
        const cleanExpression = expression
          .replace(/\$|,/g, '') // Remove currency symbols and commas
          .replace(/(\d+)%/g, '($1/100)'); // Convert percentages to decimals

        // Evaluate the expression
        const result = math.evaluate(cleanExpression);

        // Generate steps if requested
        const steps = showSteps ? [
          context ? `Context: ${context}` : null,
          `Original expression: ${expression}`,
          `Cleaned expression: ${cleanExpression}`,
          `Result: ${result}`
        ].filter((step): step is string => step !== null) : undefined;

        return {
          expression,
          result,
          steps,
          completed: true
        };
      } catch (error) {
        console.error('Error in calculateMath:', error);
        return {
          expression,
          error: error instanceof Error ? error.message : 'Failed to calculate expression',
          completed: true
        };
      }
    }
  },
  displayContractPreview: {
    name: 'displayContractPreview',
    description: 'Display a contract in markdown format for preview and editing. Use this after generating contract content to show it to the user.',
    parameters: z.object({
      markdown: z.string().describe('The contract content in markdown format with Docusign anchor tags'),
      mode: z.enum(['preview', 'edit']).default('preview').describe('The initial display mode')
    }),
    execute: async ({ markdown, mode }: { markdown: string; mode: 'preview' | 'edit' }) => {
      return {
        markdown,
        mode,
        completed: false
      };
    }
  },
  chartAnalysis: {
    name: 'chartAnalysis',
    description: 'Display an interactive pie chart analyzing agreements by a dimension and metric',
    parameters: z.object({
      dimension: z.enum(['category', 'party_name', 'jurisdiction', 'type', 'status'])
        .describe('The dimension to analyze (e.g. category, party_name)'),
      metric: z.enum(['value', 'count', 'avg_value'])
        .describe('The metric to measure (e.g. value, count)')
    }),
    execute: async ({ dimension, metric }: { 
      dimension: 'category' | 'party_name' | 'jurisdiction' | 'type' | 'status';
      metric: 'value' | 'count' | 'avg_value';
    }) => {
      return {
        dimension,
        metric,
        completed: false
      };
    }
  },
  navigatorAnalysis: {
    name: 'navigatorAnalysis',
    description: 'Analyze agreements using natural language queries. Convert user questions into Navigator API calls and display results.',
    parameters: z.object({
      query: z.string().describe('The natural language query from the user'),
      filters: z.object({
        dateRange: z.object({
          from: z.string().optional(),
          to: z.string().optional()
        }).optional(),
        parties: z.array(z.string()).optional(),
        categories: z.array(z.string()).optional(),
        types: z.array(z.string()).optional(),
        provisions: z.record(z.any()).optional()
      }).optional(),
      isDebug: z.boolean().optional().describe('Whether to show debug information')
    }),
    execute: async ({ query, filters, isDebug = false }: { query: string; filters?: Record<string, any>; isDebug?: boolean }) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Construct API call parameters
      const apiCall = {
        endpoint: '/api/navigator/analyze',
        params: {
          query,
          ...filters
        }
      };

      try {
        // Make the API call
        const response = await fetch(apiCall.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiCall.params),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze agreements');
        }

        const result = await response.json();

        return {
          query,
          apiCall: isDebug ? apiCall : undefined,
          result,
          isDebug
        };
      } catch (error) {
        console.error('Navigator analysis error:', error);
        return {
          query,
          apiCall: isDebug ? apiCall : undefined,
          error: error instanceof Error ? error.message : 'Failed to analyze agreements',
          isDebug
        };
      }
    }
  },
  createEnvelopeWithExpiration: {
    name: 'createEnvelopeWithExpiration',
    description: 'Create a DocuSign envelope with an expiration date. The expiration date should be set when urgent responses are needed.',
    parameters: z.object({
      emailSubject: z.string(),
      emailBlurb: z.string().optional(),
      expirationHours: z.number().min(1).max(720), // Max 30 days
      templateId: z.string().optional(),
      templateRoles: z.array(z.object({
        email: z.string(),
        name: z.string(),
        roleName: z.string()
      })).optional()
    }),
    execute: async (params: {
      emailSubject: string;
      emailBlurb?: string;
      expirationHours: number;
      templateId?: string;
      templateRoles?: Array<{
        email: string;
        name: string;
        roleName: string;
      }>;
    }) => {
      try {
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('Not authenticated');

        const docusign = new DocuSignEnvelopes(supabase);
        const expirationDate = new Date(Date.now() + params.expirationHours * 60 * 60 * 1000);

        const result = await docusign.createEnvelope(user.id, {
          emailSubject: params.emailSubject,
          emailBlurb: params.emailBlurb,
          status: 'sent',
          expirationDateTime: expirationDate.toISOString(),
          templateId: params.templateId,
          templateRoles: params.templateRoles
        });

        return {
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create envelope'
        };
      }
    }
  }
} as const; 