declare module '@/components/document-view' {
  interface Recipient {
    id: string;
    name: string;
    email: string;
    status: string;
  }

  interface Document {
    documentId: string;
    name: string;
  }

  interface Envelope {
    id: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    recipients: Recipient[];
  }

  interface DocumentViewProps {
    envelopeId: string;
    envelope: Envelope;
    documents: { envelopeDocuments: Document[] };
    showActions?: boolean;
  }

  const DocumentView: React.FC<DocumentViewProps>;
  export default DocumentView;
} 