import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DocuSignConnect from '@/components/docusign-connect';

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <DocuSignConnect />
        </div>
      </div>
    </div>
  );
} 