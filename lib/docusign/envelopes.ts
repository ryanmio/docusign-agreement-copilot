import { DocuSignClient } from './client';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateEnvelopeOptions, TemplateRole, ListTemplatesResponse, TemplateResponse } from '@/types/envelopes';

interface TabDefinition {
  textTabs?: Array<{
    tabLabel: string;
    value: string;
  }>;
  numberTabs?: Array<{
    tabLabel: string;
    value: string;
  }>;
  numericalTabs?: Array<{
    tabLabel: string;
    value: string;
    numericalValue: string;
  }>;
  dateTabs?: Array<{
    tabLabel: string;
    value: string;
  }>;
  currencyTabs?: Array<{
    tabLabel: string;
    value: string;
  }>;
}

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
    tabs?: TabDefinition;
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

interface TemplateTab {
  tabLabel: string;
  tabType: 'text' | 'number' | 'date';
  required: boolean;
  documentId: string;
  recipientId: string;
  pageNumber: string;
}

interface ListStatusChangesOptions {
  from_date: string;
  include?: string[];
  status?: string[];
}

interface EnvelopeRecipient {
  email: string;
  name: string;
  status: string;
}

interface Envelope {
  envelopeId: string;
  status: string;
  emailSubject: string;
  expirationDateTime?: string;
  recipients: EnvelopeRecipient[];
}

interface ListStatusChangesResponse {
  envelopes: Envelope[];
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
    prefillData,
  }: {
    emailSubject: string;
    emailBlurb?: string;
    roles: TemplateRole[];
    prefillData?: Record<string, Record<string, { value: string; type: 'text' | 'number' | 'date' }>>;
  }) {
    console.log('Creating envelope from template:', {
      templateId,
      emailSubject,
      roles,
      prefillData
    });

    const client = await this.client.getClient(userId);

    const envelopeDefinition: EnvelopeDefinition = {
      emailSubject,
      emailBlurb,
      status: 'sent',
      templateId,
      templateRoles: roles.map(role => {
        console.log('Processing role for envelope:', {
          roleName: role.roleName,
          prefillData: prefillData?.[role.roleName]
        });

        const roleTabs = prefillData?.[role.roleName];
        const tabs: TabDefinition = {};

        if (roleTabs) {
          console.log('Processing tabs for role:', {
            roleName: role.roleName,
            tabs: roleTabs
          });

          Object.entries(roleTabs).forEach(([tabLabel, { value, type }]) => {
            console.log('Processing tab:', {
              tabLabel,
              value,
              type
            });

            switch (type) {
              case 'text':
                if (!tabs.textTabs) tabs.textTabs = [];
                tabs.textTabs.push({ tabLabel, value });
                break;
              case 'number':
                if (!tabs.numericalTabs) tabs.numericalTabs = [];
                tabs.numericalTabs.push({ 
                  tabLabel, 
                  value,
                  numericalValue: value
                });
                break;
              case 'date':
                if (!tabs.dateTabs) tabs.dateTabs = [];
                tabs.dateTabs.push({ tabLabel, value });
                break;
            }
          });
        }

        console.log('Final tabs for role:', {
          roleName: role.roleName,
          tabs
        });

        return {
          email: role.email,
          name: role.name,
          roleName: role.roleName,
          routingOrder: role.routingOrder,
          tabs: Object.keys(tabs).length > 0 ? tabs : undefined,
        };
      }),
    };

    console.log('Final envelope definition:', envelopeDefinition);

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
      throw new Error(`Failed to create envelope from template: ${errorData}`);
    }

    const data = await response.json();
    return {
      envelopeId: data.envelopeId,
    };
  }

  async getTemplateRecipientTabs(userId: string, templateId: string, roleName: string): Promise<TemplateTab[]> {
    console.log('Starting getTemplateRecipientTabs:', { userId, templateId, roleName });
    const client = await this.client.getClient(userId);
    
    // First get template details to find recipient ID
    console.log('Fetching template details...');
    const templateResponse = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/templates/${templateId}`,
      {
        method: 'GET',
        headers: client.headers,
      }
    );

    if (!templateResponse.ok) {
      const errorData = await templateResponse.text();
      console.error('Template details error:', {
        status: templateResponse.status,
        statusText: templateResponse.statusText,
        error: errorData
      });
      throw new Error(`Failed to get template details: ${errorData}`);
    }

    const templateData = await templateResponse.json();
    console.log('Template data:', {
      templateId: templateData.templateId,
      recipients: templateData.recipients,
      signers: templateData.recipients?.signers
    });

    const recipient = templateData.recipients?.signers?.find(
      (signer: any) => signer.roleName === roleName
    );

    if (!recipient) {
      console.error('Could not find recipient:', {
        roleName,
        availableRoles: templateData.recipients?.signers?.map((s: any) => s.roleName)
      });
      throw new Error(`Could not find recipient with role name: ${roleName}`);
    }

    console.log('Found recipient:', {
      roleName,
      recipientId: recipient.recipientId
    });

    // Now get the tabs using the recipient ID
    console.log('Fetching tabs for recipient...');
    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/templates/${templateId}/recipients/${recipient.recipientId}/tabs`,
      {
        method: 'GET',
        headers: client.headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tabs fetch error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to get template tabs: ${errorData}`);
    }

    const data = await response.json();
    console.log('Raw tabs data:', data);
    const tabs: TemplateTab[] = [];

    // Map DocuSign tab types to our simplified types
    const processTab = (tab: any, type: 'text' | 'number' | 'date') => {
      console.log('Processing tab:', { label: tab.tabLabel, type, required: tab.required });
      if (tab.tabLabel) {
        tabs.push({
          tabLabel: tab.tabLabel,
          tabType: type,
          required: tab.required === 'true',
          documentId: tab.documentId,
          recipientId: tab.recipientId,
          pageNumber: tab.pageNumber,
        });
      }
    };

    // Process all tab types
    if (data.textTabs) {
      data.textTabs.forEach((tab: any) => processTab(tab, 'text'));
    }
    if (data.numberTabs) {
      data.numberTabs.forEach((tab: any) => processTab(tab, 'number'));
    }
    if (data.numericalTabs) {
      data.numericalTabs.forEach((tab: any) => processTab(tab, 'number'));
    }
    if (data.currencyTabs) {
      data.currencyTabs.forEach((tab: any) => processTab(tab, 'number'));
    }
    if (data.formulaTabs) {
      data.formulaTabs.forEach((tab: any) => processTab(tab, 'number'));
    }
    if (data.dateTabs) {
      data.dateTabs.forEach((tab: any) => processTab(tab, 'date'));
    }
    if (data.dateSignedTabs) {
      data.dateSignedTabs.forEach((tab: any) => processTab(tab, 'date'));
    }
    if (data.titleTabs) {
      data.titleTabs.forEach((tab: any) => processTab(tab, 'text'));
    }
    if (data.companyTabs) {
      data.companyTabs.forEach((tab: any) => processTab(tab, 'text'));
    }
    if (data.fullNameTabs) {
      data.fullNameTabs.forEach((tab: any) => processTab(tab, 'text'));
    }

    console.log('Final processed tabs:', tabs);
    return tabs;
  }

  async listStatusChanges(
    userId: string,
    options: ListStatusChangesOptions
  ): Promise<ListStatusChangesResponse> {
    const client = await this.client.getClient(userId);

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.from_date) {
      queryParams.append('from_date', options.from_date);
    }
    if (options.include?.length) {
      queryParams.append('include', options.include.join(','));
    }
    if (options.status?.length) {
      queryParams.append('status', options.status.join(','));
    }

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes?${queryParams.toString()}`,
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
      throw new Error(`Failed to list envelope status changes: ${errorData}`);
    }

    return response.json();
  }
} 