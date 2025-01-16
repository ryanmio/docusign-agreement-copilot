'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import PDFViewer from '@/components/pdf-viewer';
import { mockPdfUrl } from '@/lib/preview-data';

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

interface DocumentViewPreviewProps {
  envelopeId: string;
  envelope: Envelope;
  documents: { envelopeDocuments: Document[] };
  showActions?: boolean;
}

export function DocumentViewPreview({
  envelopeId,
  envelope,
  documents,
  showActions = true,
}: DocumentViewPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState(envelope.status);

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this envelope? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess('Envelope voided successfully');
    setStatus('voided');
    setLoading(false);
  };

  const handleResend = async () => {
    if (!confirm('Are you sure you want to resend this envelope?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess('Envelope resent successfully');
    setStatus('sent');
    setLoading(false);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      voided: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{envelope?.subject}</h1>
          <p className="text-gray-500 mt-1">{envelope?.message}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
          {showActions && (
            <>
              {status !== 'completed' && status !== 'voided' && (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Resend'}
                </button>
              )}
              {status !== 'voided' && (
                <button
                  onClick={handleVoid}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Void'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Document Viewer */}
          {documents?.envelopeDocuments?.map((doc) => (
            <div key={doc.documentId} className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{doc.name}</h2>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  onClick={() => alert('Download functionality disabled in preview')}
                >
                  Download
                </button>
              </div>
              <PDFViewer url={mockPdfUrl} />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Created</span>
                <span className="text-gray-500">{formatDate(envelope?.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Last Updated</span>
                <span className="text-gray-500">{formatDate(envelope?.updated_at)}</span>
              </div>
              {envelope?.completed_at && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Completed</span>
                  <span className="text-gray-500">{formatDate(envelope?.completed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recipients</h2>
            <div className="space-y-4">
              {envelope?.recipients?.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{recipient.name}</div>
                    <div className="text-gray-500">{recipient.email}</div>
                  </div>
                  <div className="text-sm">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(recipient.status || 'pending')}`}>
                      {recipient.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 