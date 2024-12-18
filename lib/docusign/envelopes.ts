import { DocuSignClient } from './client';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateEnvelopeOptions, TemplateRole, ListTemplatesResponse, TemplateResponse } from '@/types/envelopes';

interface CreateEnvelopeDocument {
  name: string;
  fileExtension: string;
  documentBase64: string;
}

interface CreateEnvelopeRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder: number;
}

export class DocuSignEnvelopes {
  private client: DocuSignClient;

  constructor(supabase: SupabaseClient) {
    this.client = new DocuSignClient(supabase);
  }

  async createEnvelope(userId: string, options: CreateEnvelopeOptions) {
    const client = await this.client.getClient(userId);

    const envelopeDefinition = {
      emailSubject: options.emailSubject,
      emailBlurb: options.emailBlurb,
      status: "sent",
      documents: options.documents.map((doc, index) => ({
        documentBase64: doc.documentBase64,
        name: doc.name,
        fileExtension: doc.fileExtension,
        documentId: (index + 1).toString(),
      })),
      recipients: {
        signers: options.recipients.map((recipient, index) => ({
          email: recipient.email,
          name: recipient.name,
          recipientId: (index + 1).toString(),
          routingOrder: recipient.routingOrder || 1,
          tabs: {
            signHereTabs: [{
              documentId: "1",
              pageNumber: "1",
              xPosition: "100",
              yPosition: "100",
              scale: 1,
            }],
          },
        })),
      },
    };

    console.log('Creating envelope with:', {
      ...envelopeDefinition,
      documents: envelopeDefinition.documents.map(d => ({ ...d, documentBase64: '(content)' }))
    });

    const response = await fetch(`${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes`, {
      method: 'POST',
      headers: {
        ...client.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to create envelope: ${errorData}`);
    }

    const data = await response.json();
    console.log('DocuSign Create Envelope Response:', data);

    return {
      envelopeId: data.envelopeId,
    };
  }

  async getEnvelope(userId: string, envelopeId: string) {
    const client = await this.client.getClient(userId);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}`,
      {
        headers: client.headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get envelope');
    }

    return response.json();
  }

  async listDocuments(userId: string, envelopeId: string) {
    const client = await this.client.getClient(userId);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/documents`,
      {
        headers: client.headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list documents');
    }

    return response.json();
  }

  async downloadDocument(userId: string, envelopeId: string, documentId: string) {
    const client = await this.client.getClient(userId);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
      {
        headers: client.headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  }

  async voidEnvelope(userId: string, envelopeId: string, voidReason: string) {
    const client = await this.client.getClient(userId);

    // First, check if the envelope exists and can be voided
    const envelopeStatus = await this.getEnvelope(userId, envelopeId);
    const voidableStatuses = ['sent', 'delivered', 'created'];
    
    if (!voidableStatuses.includes(envelopeStatus.status)) {
      throw new Error(`Cannot void envelope in status: ${envelopeStatus.status}. Envelope must be in one of these states: ${voidableStatuses.join(', ')}`);
    }

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}`,
      {
        method: 'PUT',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'voided',
          voidedReason: voidReason,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign Void Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to void envelope: ${errorData}`);
    }

    return await response.json();
  }

  async listTemplates(userId: string, options?: { 
    searchText?: string;
    folder?: string;
    shared?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    console.log('DocuSignEnvelopes.listTemplates - Getting client for user:', userId);
    const client = await this.client.getClient(userId);
    const searchText = options?.searchText ? `search_text=${encodeURIComponent(options.searchText)}` : '';
    const folder = options?.folder ? `folder=${encodeURIComponent(options.folder)}` : '';
    const shared = options?.shared !== undefined ? `shared=${options.shared}` : '';
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 100;
    const startPosition = (page - 1) * pageSize;

    const queryParams = [
      searchText,
      folder,
      shared,
      `start_position=${startPosition}`,
      `count=${pageSize}`,
    ].filter(Boolean).join('&');

    const url = `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/templates?${queryParams}`;
    console.log('DocuSignEnvelopes.listTemplates - Fetching templates:', {
      url,
      accountId: client.accountId,
      options
    });

    const response = await fetch(url, {
      headers: client.headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSignEnvelopes.listTemplates - API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: client.headers,
      });
      throw new Error(`Failed to list templates: ${errorData}`);
    }

    const data = await response.json();
    console.log('DocuSignEnvelopes.listTemplates - Raw response:', data);

    // Map DocuSign response to our expected format
    const templates = (data.envelopeTemplates || []).map(template => ({
      templateId: template.templateId,
      name: template.name,
      description: template.description,
      shared: template.shared === 'true',
      created: template.created,
      lastModified: template.lastModified,
      roles: [], // We'll need to fetch roles separately if needed
    }));

    const result = {
      templates,
      resultSetSize: parseInt(data.resultSetSize) || 0,
      totalSetSize: parseInt(data.totalSetSize) || 0,
      startPosition: parseInt(data.startPosition) || 0,
    };

    console.log('DocuSignEnvelopes.listTemplates - Mapped response:', result);

    return result;
  }

  async getTemplate(userId: string, templateId: string) {
    const client = await this.client.getClient(userId);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/templates/${templateId}`,
      {
        headers: client.headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to get template: ${errorData}`);
    }

    const data = await response.json();
    console.log('DocuSignEnvelopes.getTemplate - Raw response:', data);

    // Map DocuSign response to our expected format
    const template = {
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      shared: data.shared === 'true',
      created: data.created,
      lastModified: data.lastModified,
      roles: (data.recipients?.signers || []).map((signer: any) => ({
        roleName: signer.roleName,
        name: signer.name || '',
        signingOrder: signer.routingOrder,
        defaultRecipient: signer.email ? {
          email: signer.email,
          name: signer.name,
        } : undefined,
      })),
    };

    console.log('DocuSignEnvelopes.getTemplate - Mapped response:', template);

    return template;
  }

  async createEnvelopeFromTemplate(userId: string, templateId: string, {
    emailSubject,
    emailBlurb,
    roles,
  }: {
    emailSubject: string;
    emailBlurb?: string;
    roles: TemplateRole[];
  }) {
    const client = await this.client.getClient(userId);

    const envelopeDefinition = {
      emailSubject,
      emailBlurb,
      templateId,
      templateRoles: roles.map(role => ({
        email: role.email,
        name: role.name,
        roleName: role.roleName,
        routingOrder: role.routingOrder || 1,
      })),
      status: "sent",
    };

    console.log('Creating envelope from template:', {
      ...envelopeDefinition,
      templateId,
      roleCount: roles.length,
    });

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelopeDefinition),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to create envelope from template: ${errorData}`);
    }

    const data = await response.json();
    console.log('DocuSign Create Envelope From Template Response:', data);

    return {
      envelopeId: data.envelopeId,
    };
  }
} 