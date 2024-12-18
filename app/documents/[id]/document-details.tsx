'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Alert } from '@/components/ui/alert';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import PDFViewer from '@/components/pdf-viewer';

interface DocumentDetailsProps {
  params: { id: string };
}

export default function DocumentDetails({
  params
}: DocumentDetailsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<any>(null);
  const [documents, setDocuments] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: envelopeData, error: envelopeError } = await supabase
        .from('envelopes')
        .select('*, recipients(*)')
        .eq('id', params.id)
        .single();

      if (envelopeError) {
        setError('Error loading envelope details');
        return;
      }

      setEnvelope(envelopeData);

      try {
        const docusign = new DocuSignEnvelopes(supabase);
        const docs = await docusign.listDocuments(user.id, envelopeData.docusign_envelope_id);
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Error loading documents');
      }
    }

    fetchData();
  }, [params.id, supabase, router]);

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this envelope? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/envelopes/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Voided by user',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to void envelope');
      }

      setSuccess('Envelope voided successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void envelope');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!confirm('Are you sure you want to resend this envelope?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/envelopes/${params.id}/resend`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend envelope');
      }

      setSuccess('Envelope resent successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend envelope');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
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
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">{envelope?.subject}</h1>
            <p className="text-gray-500 mt-1">{envelope?.message}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(envelope?.status || 'pending')}`}>
              {envelope?.status}
            </span>
            {envelope?.status !== 'completed' && envelope?.status !== 'voided' && (
              <button
                onClick={handleResend}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Resend'}
              </button>
            )}
            {envelope?.status !== 'voided' && (
              <button
                onClick={handleVoid}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Void'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            {success}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Document Viewer */}
            {documents?.envelopeDocuments?.map((doc: any) => (
              <div key={doc.documentId} className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{doc.name}</h2>
                  <a
                    href={`/api/envelopes/${envelope?.id}/documents/${doc.documentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Download
                  </a>
                </div>
                <PDFViewer url={`/api/envelopes/${envelope?.id}/documents/${doc.documentId}`} />
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
                {envelope?.recipients?.map((recipient: any) => (
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
    </main>
  );
} 