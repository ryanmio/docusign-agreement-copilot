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
          anchorString?: string;
          anchorUnits?: string;
          anchorXOffset?: string;
          anchorYOffset?: string;
          documentId?: string;
          pageNumber?: string;
          xPosition?: string;
          yPosition?: string;
          scale?: number;
        }>;
        dateSignedTabs?: Array<{
          anchorString?: string;
          anchorUnits?: string;
          anchorXOffset?: string;
          anchorYOffset?: string;
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
  expirationDateTime?: string;
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
  enableEmbeddedSigning?: boolean;
  expirationDateTime?: string;
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
  sentDateTime?: string;
  lastModifiedDateTime?: string;
  recipients: EnvelopeRecipient[];
  purgeState?: 'unpurged' | 'documents_and_metadata_queued' | 'documents_queued' | 'metadata_queued' | 'purged';
  expireAfter?: string;
  metadata?: {
    expirationDate?: string;
    [key: string]: any;
  };
  expirationDateTime?: string;
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
    console.log('Creating envelope with args:', JSON.stringify(args, null, 2));
    const client = await this.client.getClient(userId);

    const envelopeDefinition: EnvelopeDefinition = {
      emailSubject: args.emailSubject,
      emailBlurb: args.emailBlurb,
      status: args.status,
      ...(args.expirationDateTime ? { expirationDateTime: args.expirationDateTime } : {}),
    };

    if (args.templateId) {
      envelopeDefinition.templateId = args.templateId;
      envelopeDefinition.templateRoles = args.templateRoles?.map(role => ({
        ...role,
        ...(args.enableEmbeddedSigning ? {
          clientUserId: role.email,
          embeddedRecipientStartURL: 'SIGN_AT_DOCUSIGN',
          suppressEmails: true
        } : {})
      }));
    } else {
      if (args.recipients?.signers) {
        envelopeDefinition.recipients = {
          signers: args.recipients.signers.map((signer, index) => ({
            ...signer,
            ...(args.enableEmbeddedSigning ? {
              clientUserId: signer.email,
              embeddedRecipientStartURL: 'SIGN_AT_DOCUSIGN',
              suppressEmails: true
            } : {}),
            tabs: {
              signHereTabs: [{
                anchorString: `<<SIGNER${index + 1}_HERE>>`,
                anchorUnits: 'pixels',
                anchorXOffset: '0',
                anchorYOffset: '0',
                documentId: '1'
              }],
              dateSignedTabs: [{
                anchorString: '<<DATE_HERE>>',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
                anchorYOffset: '0'
              }]
            }
          }))
        };
      }
      envelopeDefinition.documents = args.documents;
    }

    console.log('Sending envelope definition:', JSON.stringify(envelopeDefinition, null, 2));

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
    const envelopeId = data.envelopeId;

    // Store the envelope in our database
    const { data: envelope, error: dbError } = await this.client.supabase
      .from('envelopes')
      .upsert({
        user_id: userId,
        docusign_envelope_id: envelopeId,
        subject: args.emailSubject,
        message: args.emailBlurb || null,
        status: 'sent'
      }, {
        onConflict: 'docusign_envelope_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store envelope in database:', dbError);
      throw new Error(`Failed to store envelope: ${dbError.message}`);
    }

    // Store recipients with initial 'sent' status
    const { error: recipientsError } = await this.client.supabase
      .from('recipients')
      .upsert(
        args.templateId
          ? args.templateRoles?.map(role => ({
              envelope_id: envelope.id,
              email: role.email,
              name: role.name,
              status: 'sent',
              routing_order: role.routingOrder || 1,
              metadata: {
                role_name: role.roleName,
              },
            }))
          : args.recipients?.signers.map((signer, i) => ({
              envelope_id: envelope.id,
              email: signer.email,
              name: signer.name,
              status: 'sent',
              routing_order: signer.routingOrder || i + 1,
              metadata: {
                role_name: `Signer ${i + 1}`,
              },
            })),
        {
          onConflict: 'envelope_id,email',
          ignoreDuplicates: false
        }
      );

    if (recipientsError) {
      console.error('Recipients storage error:', recipientsError);
      return {
        success: true,
        warning: 'Envelope created but recipient details not stored',
        envelopeId: envelope.id,
        status: 'sent'
      };
    }

    return {
      success: true,
      envelopeId: envelope.id,
      status: 'sent'
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
    expirationDateTime,
  }: {
    emailSubject: string;
    emailBlurb?: string;
    roles: TemplateRole[];
    prefillData?: Record<string, Record<string, { value: string; type: 'text' | 'number' | 'date' }>>;
    expirationDateTime?: string;
  }) {
    console.log('Creating envelope from template:', {
      templateId,
      emailSubject,
      roles,
      prefillData,
      expirationDateTime
    });

    const client = await this.client.getClient(userId);

    const envelopeDefinition: EnvelopeDefinition = {
      emailSubject,
      emailBlurb,
      status: 'sent',
      templateId,
      ...(expirationDateTime ? { expirationDateTime } : {}),
      templateRoles: roles.map(role => {
        const roleTabs = prefillData?.[role.roleName];
        const tabs: TabDefinition = {};

        if (roleTabs) {
          Object.entries(roleTabs).forEach(([tabLabel, { value, type }]) => {
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

        // Create recipient without embedded signing settings
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
    const envelopeId = data.envelopeId;

    // Store the envelope in our database
    const { data: envelope, error: dbError } = await this.client.supabase
      .from('envelopes')
      .upsert({
        user_id: userId,
        docusign_envelope_id: envelopeId,
        subject: emailSubject,
        message: emailBlurb || null,
        status: 'sent'
      }, {
        onConflict: 'docusign_envelope_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store envelope in database:', dbError);
      throw new Error(`Failed to store envelope: ${dbError.message}`);
    }

    // Store recipients with initial 'sent' status
    const { error: recipientsError } = await this.client.supabase
      .from('recipients')
      .upsert(
        roles.map(role => ({
          envelope_id: envelope.id,
          email: role.email,
          name: role.name,
          status: 'sent',
          routing_order: role.routingOrder || 1,
          metadata: {
            role_name: role.roleName,
          },
        })),
        {
          onConflict: 'envelope_id,email',
          ignoreDuplicates: false
        }
      );

    if (recipientsError) {
      console.error('Failed to store recipients:', recipientsError);
      throw new Error(`Failed to store recipients: ${recipientsError.message}`);
    }

    return { envelopeId };
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

    // Add custom_fields to include metadata
    queryParams.append('include', 'custom_fields');

    console.log('DocuSign API Request:', {
      url: `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes`,
      params: Object.fromEntries(queryParams.entries())
    });

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

    const data = await response.json();

    // Extract metadata from custom fields
    const envelopes = data.envelopes?.map((env: any) => {
      const metadata: Record<string, any> = {};
      if (env.customFields?.textCustomFields) {
        env.customFields.textCustomFields.forEach((field: any) => {
          metadata[field.name] = field.value;
        });
      }
      return {
        ...env,
        metadata
      };
    }) || [];

    console.log('DocuSign API Response:', {
      totalCount: data.totalCount,
      resultSetSize: data.resultSetSize,
      envelopesCount: envelopes.length,
      envelopes: envelopes.map((env: any) => ({
        id: env.envelopeId,
        subject: env.emailSubject,
        status: env.status,
        purgeState: env.purgeState,
        created: env.createdDateTime,
        metadata: env.metadata
      }))
    });

    return { envelopes };
  }

  async updateRecipientForEmbeddedSigning(userId: string, envelopeId: string, recipientId: string, recipientInfo: any) {
    console.log('Updating recipient for embedded signing:', { envelopeId, recipientId, recipientInfo });
    const client = await this.client.getClient(userId);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/recipients`,
      {
        method: 'PUT',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signers: [{
            recipientId,
            email: recipientInfo.email,
            name: recipientInfo.name,
            clientUserId: recipientInfo.clientUserId,
            routingOrder: recipientInfo.routingOrder,
            tabs: recipientInfo.tabs || {},
            suppressEmails: true
          }]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating recipient:', error);
      throw new Error(`Failed to update recipient: ${error}`);
    }

    return response.json();
  }

  async getSigningUrl(userId: string, envelopeId: string, returnUrl?: string) {
    console.log('Getting signing URL:', { userId, envelopeId, returnUrl });
    const client = await this.client.getClient(userId);

    // First get envelope details to verify recipient
    console.log('Fetching envelope details to verify recipient...');
    const envelopeResponse = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/recipients`,
      {
        headers: client.headers,
      }
    );

    if (!envelopeResponse.ok) {
      const error = await envelopeResponse.text();
      console.error('Error fetching envelope recipients:', error);
      throw new Error(`Failed to fetch envelope recipients: ${error}`);
    }

    const recipientData = await envelopeResponse.json();
    console.log('Envelope recipients:', recipientData);

    // Get the current user's info
    const userInfo = await this.client.getUserInfo(userId);

    // Find the recipient that matches the current user's email
    const userRecipient = recipientData.signers?.find((signer: any) => 
      signer.email === userInfo.email && signer.status !== 'completed'
    );

    if (!userRecipient) {
      console.error('No matching recipient found:', { userEmail: userInfo.email, recipients: recipientData.signers });
      throw new Error('You are not a recipient of this envelope or have already completed signing');
    }

    console.log('Found recipient:', userRecipient);

    // Update the recipient to enable embedded signing
    const clientUserId = `${userInfo.email}-${Date.now()}`;
    await this.updateRecipientForEmbeddedSigning(userId, envelopeId, userRecipient.recipientId, {
      email: userInfo.email,
      name: userInfo.name,
      clientUserId,
      routingOrder: userRecipient.routingOrder,
      tabs: userRecipient.tabs
    });

    const viewRequest = {
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/documents`,
      authenticationMethod: 'none',
      email: userInfo.email,
      userName: userInfo.name,
      clientUserId,
      frameAncestors: [
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'https://apps-d.docusign.com',
        'https://demo.docusign.net',
        'https://app-d.docusign.com'
      ],
      messageOrigins: [
        'https://apps-d.docusign.com'
      ]
    };

    console.log('Creating recipient view with request:', viewRequest);

    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/views/recipient`,
      {
        method: 'POST',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viewRequest),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error getting signing URL:', error);
      throw new Error(`Failed to get signing URL: ${error}`);
    }

    const data = await response.json();
    console.log('Got signing URL:', data.url);
    return data.url;
  }

  async sendReminder(userId: string, envelopeId: string, message?: string) {
    console.log('Starting sendReminder:', { userId, envelopeId, message });
    const client = await this.client.getClient(userId);
    
    // First check if there are any pending recipients
    console.log('Fetching recipients...');
    const recipientsResponse = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/recipients`,
      {
        headers: client.headers
      }
    );

    if (!recipientsResponse.ok) {
      const error = await recipientsResponse.json();
      console.error('Failed to get recipients:', error);
      throw new Error(error.message || 'Failed to get recipients');
    }

    interface DocuSignRecipient {
      recipientId: string;
      email: string;
      name: string;
      status: string;
    }

    const recipientsData = await recipientsResponse.json();
    console.log('Recipients data:', recipientsData);
    
    const pendingRecipients = recipientsData.signers?.filter((signer: DocuSignRecipient) => {
      const isPending = signer.status !== 'completed' && signer.status !== 'declined';
      console.log('Recipient status check:', { email: signer.email, status: signer.status, isPending });
      return isPending;
    }) || [];

    console.log('Pending recipients:', pendingRecipients);

    if (pendingRecipients.length === 0) {
      console.log('No pending recipients found');
      throw new Error('No pending recipients to remind');
    }

    // First get envelope details to update subject
    console.log('Fetching envelope details...');
    const envelopeResponse = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}`,
      {
        headers: client.headers
      }
    );

    if (!envelopeResponse.ok) {
      const error = await envelopeResponse.json();
      console.error('Failed to get envelope details:', error);
      throw new Error(error.message || 'Failed to get envelope details');
    }

    const envelopeData = await envelopeResponse.json();
    
    // Update envelope subject
    console.log('Updating envelope subject...');
    const updateResponse = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}`,
      {
        method: 'PUT',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailSubject: `REMINDER: ${envelopeData.emailSubject.replace(/^REMINDER: /, '')}`,
          emailBlurb: message || 'This is a reminder to sign the document at your earliest convenience.'
        })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('Update envelope error:', error);
      throw new Error(error.message || 'Failed to update envelope');
    }

    // Now resend to pending recipients
    console.log('Resending to pending recipients...');
    const response = await fetch(
      `${client.baseUrl}/restapi/v2.1/accounts/${client.accountId}/envelopes/${envelopeId}/recipients?resend_envelope=true`,
      {
        method: 'PUT',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signers: pendingRecipients.map((recipient: DocuSignRecipient) => ({
            recipientId: recipient.recipientId,
            email: recipient.email,
            name: recipient.name
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      throw new Error(error.message || 'Failed to send reminder');
    }

    const result = await response.json();
    console.log('Resend result:', result);

    return {
      success: true,
      recipientCount: pendingRecipients.length
    };
  }
} 