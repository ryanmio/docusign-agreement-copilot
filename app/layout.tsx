import { Inter } from 'next/font/google';
import './globals.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Agreement Copilot',
  description: 'AI-powered agreement analysis and management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header session={session} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
