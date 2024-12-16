export type EnvelopeStatus = 
  | 'created'
  | 'sent'
  | 'delivered'
  | 'signed'
  | 'completed'
  | 'declined'
  | 'voided'
  | 'error';

export interface Recipient {
  email: string;
  name: string;
  routingOrder?: number;
}

export interface Document {
  name: string;
  content: string; // base64 encoded
  fileExtension: string;
}

export interface CreateEnvelopePayload {
  subject: string;
  message?: string;
  documents: Document[];
  recipients: Recipient[];
}

export interface EnvelopeResponse {
  id: string;
  docusignEnvelopeId: string;
  subject: string;
  message?: string;
  status: EnvelopeStatus;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  completedAt?: string;
  completed_at?: string;
  metadata: Record<string, any>;
}

export interface RecipientResponse {
  id: string;
  envelopeId: string;
  email: string;
  name: string;
  status?: string;
  signingUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  routingOrder: number;
}

export interface EnvelopeWithRecipientsResponse extends EnvelopeResponse {
  recipients: RecipientResponse[];
}

export interface EnvelopeListResponse {
  envelopes: EnvelopeResponse[];
  count: number;
}

export interface EnvelopeDocumentResponse {
  id: string;
  name: string;
  type: string;
  uri: string;
} 