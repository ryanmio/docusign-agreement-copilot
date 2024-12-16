import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EnvelopeList } from '@/components/envelope-list';
import { Alert } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <a
          href="/documents/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          New Document
        </a>
      </div>

      {userError && (
        <Alert variant="destructive" className="mb-4">
          Error loading user data. Please try again.
        </Alert>
      )}

      <EnvelopeList />
    </main>
  );
} 