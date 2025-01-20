import { Inter } from 'next/font/google';
import './globals.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Header from '../components/Header';
import { Session, User } from '@supabase/supabase-js';

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
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => {
      const store = cookies();
      return store;
    }
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        <script 
          src="https://js-d.docusign.com/bundle.js" 
          data-integration-key={process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID}
          data-allow-silent-authentication="true"
          data-require-script="true"
          async
          defer
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header session={session} user={user} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
