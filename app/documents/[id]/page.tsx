import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/pdf-viewer'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading viewer...</div>
});

export const revalidate = 0;

export default async function DocumentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get envelope details
  const { data: envelope, error: envelopeError } = await supabase
    .from('envelopes')
    .select(`
      *,
      recipients (*)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (envelopeError) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Error loading envelope details. Please try again.
        </Alert>
      </main>
    );
  }

  // Get document list from DocuSign
  const docusign = new DocuSignEnvelopes();
  let documents;
  try {
    documents = await docusign.listDocuments(user.id, envelope.docusign_envelope_id);
  } catch (error) {
    console.error('Error fetching documents:', error);
  }

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
            <h1 className="text-3xl font-bold">{envelope.subject}</h1>
            <p className="text-gray-500 mt-1">{envelope.message}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(envelope.status)}`}>
            {envelope.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Document Viewer */}
            {documents?.envelopeDocuments?.map((doc: any) => (
              <div key={doc.documentId} className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{doc.name}</h2>
                  <a
                    href={`/api/envelopes/${envelope.id}/documents/${doc.documentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Download
                  </a>
                </div>
                <PDFViewer url={`/api/envelopes/${envelope.id}/documents/${doc.documentId}`} />
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
                  <span className="text-gray-500">{formatDate(envelope.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Updated</span>
                  <span className="text-gray-500">{formatDate(envelope.updated_at)}</span>
                </div>
                {envelope.completed_at && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Completed</span>
                    <span className="text-gray-500">{formatDate(envelope.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recipients */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recipients</h2>
              <div className="space-y-4">
                {envelope.recipients?.map((recipient: any) => (
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