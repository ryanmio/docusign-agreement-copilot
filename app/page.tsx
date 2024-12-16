import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-24">
      {session ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Agreement Copilot</h1>
          <p className="text-xl text-gray-600 mb-8">
            Start analyzing your agreements with AI-powered insights
          </p>
          <Link
            href="/documents"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg"
          >
            View Documents
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Agreement Copilot</h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered agreement analysis and management
          </p>
          <Link
            href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
