import { DocuSignClient } from './client';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateEnvelopeOptions, TemplateRole, ListTemplatesResponse, TemplateResponse } from '@/types/envelopes';

interface EnvelopeDefinition {
  emailSubject: string;
  emailBlurb?: string;
  status: string;
  documents?: Array<{
    documentBase64: string;
    name: string;
    fileExtension: string;
    documentId: string;
  }>;
  recipients?: {
    signers: Array<{
      email: string;
      name: string;
      recipientId: string;
      routingOrder: number;
      tabs?: {
        signHereTabs?: Array<{
          documentId: string;
          pageNumber: string;
          xPosition: string;
          yPosition: string;
          scale: number;
        }>;
      };
    }>;
  };
  templateId?: string;
  templateRoles?: Array<{
    email: string;
    name: string;
    roleName: string;
    routingOrder?: number;
  }>;
}

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

// DocuSign API response types
interface DocuSignTemplateResponse {
  templateId: string;
  name: string;
  description?: string;
  shared: string;
  created: string;
  lastModified: string;
  uri: string;
  emailSubject: string;
  emailBlurb: string;
}

interface DocuSignListTemplatesResponse {
  resultSetSize: string;
  totalSetSize: string;
  startPosition: string;
  endPosition: string;
  envelopeTemplates: DocuSignTemplateResponse[];
}

interface DocuSignTemplateSigner {
  roleName: string;
  name?: string;
  email?: string;
  routingOrder?: number;
}

interface DocuSignTemplateDetailResponse {
  templateId: string;
  name: string;
  description?: string;
  shared: string;
  created: string;
  lastModified: string;
  recipients?: {
    signers?: DocuSignTemplateSigner[];
  };
  emailSubject: string;
  emailBlurb: string;
}

interface CreateEnvelopeArgs {
  templateId?: string;
  templateRoles?: Array<{
    email: string;
    name: string;
    roleName: string;
    routingOrder?: number;
  }>;
  documents?: Array<{
    documentBase64: string;
    name: string;
    fileExtension: string;
    documentId: string;
  }>;
  recipients?: {
    signers: Array<{
      email: string;
      name: string;
      recipientId: string;
      routingOrder: number;
    }>;
  };
  status: string;
  emailSubject: string;
  emailBlurb?: string;
}

export class DocuSignEnvelopes {
  private client: DocuSignClient;

  constructor(supabase: SupabaseClient) {
    this.client = new DocuSignClient(supabase);
  }

  async createEnvelope(userId: string, args: CreateEnvelopeArgs) {
    const client = await this.client.getClient(userId);

    const envelopeDefinition: EnvelopeDefinition = {
      emailSubject: args.emailSubject,
      emailBlurb: args.emailBlurb,
      status: args.status,
    };

    if (args.templateId) {
      envelopeDefinition.templateId = args.templateId;
      envelopeDefinition.templateRoles = args.templateRoles;
    } else {
      envelopeDefinition.documents = args.documents;
      envelopeDefinition.recipients = args.recipients;
    }

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

    const data = await response.json() as DocuSignListTemplatesResponse;
    console.log('DocuSignEnvelopes.listTemplates - Raw response:', data);

    // Map DocuSign response to our expected format
    const templates = (data.envelopeTemplates || []).map(template => ({
      templateId: template.templateId,
      name: template.name,
      description: template.description,
      shared: template.shared === 'true',
      created: template.created,
      lastModified: template.lastModified,
      emailSubject: template.emailSubject,
      emailBlurb: template.emailBlurb,
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

    const data = await response.json() as DocuSignTemplateDetailResponse;
    console.log('DocuSignEnvelopes.getTemplate - Raw response:', data);

    // Map DocuSign response to our expected format
    const template = {
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      shared: data.shared === 'true',
      created: data.created,
      lastModified: data.lastModified,
      emailSubject: data.emailSubject,
      emailBlurb: data.emailBlurb,
      roles: (data.recipients?.signers || []).map(signer => ({
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