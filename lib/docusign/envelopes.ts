import { DocuSignClient } from './client';

interface CreateEnvelopeOptions {
  emailSubject: string;
  emailBlurb?: string;
  documents: Array<{
    name: string;
    fileExtension: string;
    documentBase64: string;
  }>;
  recipients: Array<{
    email: string;
    name: string;
    recipientId: string;
    routingOrder: number;
  }>;
}

export class DocuSignEnvelopes {
  private client: DocuSignClient;
  private accountId: string;
  private basePath: string;

  constructor() {
    this.client = new DocuSignClient();
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
    this.basePath = 'https://demo.docusign.net/restapi/v2.1';
  }

  private async getHeaders(userId: string) {
    const token = await this.client.getValidToken(userId);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public async createEnvelope(userId: string, options: CreateEnvelopeOptions) {
    const headers = await this.getHeaders(userId);
    
    const response = await fetch(
      `${this.basePath}/accounts/${this.accountId}/envelopes`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          emailSubject: options.emailSubject,
          emailBlurb: options.emailBlurb,
          documents: options.documents,
          recipients: {
            signers: options.recipients,
          },
          status: 'sent',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create envelope');
    }

    return response.json();
  }

  public async getEnvelope(userId: string, envelopeId: string) {
    const headers = await this.getHeaders(userId);
    
    const response = await fetch(
      `${this.basePath}/accounts/${this.accountId}/envelopes/${envelopeId}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get envelope');
    }

    return response.json();
  }

  public async listEnvelopes(userId: string, fromDate?: Date) {
    const headers = await this.getHeaders(userId);
    const queryParams = new URLSearchParams();
    
    if (fromDate) {
      queryParams.append('from_date', fromDate.toISOString());
    }
    
    const response = await fetch(
      `${this.basePath}/accounts/${this.accountId}/envelopes?${queryParams}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list envelopes');
    }

    return response.json();
  }

  public async getEnvelopeDocument(
    userId: string,
    envelopeId: string,
    documentId: string
  ) {
    const headers = await this.getHeaders(userId);
    
    const response = await fetch(
      `${this.basePath}/accounts/${this.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get envelope document');
    }

    return response.blob();
  }
} 