import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DocumentActions } from '@/app/documents/actions';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: envelopes, error: envelopesError } = await supabase
    .from('envelopes')
    .select('*')
    .order('created_at', { ascending: false });

  if (envelopesError) {
    return <div>Error loading documents</div>;
  }

  const formatDate = (date: string) => {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Link
          href="/documents/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          New Document
        </Link>
      </div>

      <div className="space-y-4">
        {envelopes?.map((envelope) => (
          <div key={envelope.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/documents/${envelope.id}`} className="text-xl font-semibold hover:text-blue-500">
                  {envelope.subject}
                </Link>
                <p className="text-gray-500 mt-1">Created: {formatDate(envelope.created_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(envelope.status)}`}>
                  {envelope.status}
                </span>
                <DocumentActions envelope={envelope} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 