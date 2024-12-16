declare module 'docusign-esign' {
  export class ApiClient {
    constructor(config: { basePath: string; oAuthBasePath: string });
    setAccessToken(token: string): void;
    addDefaultHeader(header: string, value: string): void;
  }

  export class EnvelopesApi {
    constructor(apiClient: ApiClient);
    createEnvelope(accountId: string, options: { envelopeDefinition: any }): Promise<{ envelopeId: string }>;
    getEnvelope(accountId: string, envelopeId: string): Promise<any>;
    listDocuments(accountId: string, envelopeId: string): Promise<{ envelopeDocuments: any[] }>;
    getDocument(accountId: string, envelopeId: string, documentId: string): Promise<any>;
    update(accountId: string, envelopeId: string, options: { status: string; voidedReason?: string }): Promise<void>;
  }
} 