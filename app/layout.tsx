import { Inter } from 'next/font/google';
import './globals.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Header from '../components/Header';
import { Session, User } from '@supabase/supabase-js';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agreement Copilot',
  description: 'An experiment in generative interfaces: AI agents that build UIs and agreement workflows on demand. Using Docusign APIs to demonstrate how agents can replace static, pre-built interfaces with dynamic, intent-driven experiences.',
  metadataBase: new URL('https://docusign-agreement-copilot.vercel.app'),
  openGraph: {
    title: 'Agreement Copilot',
    description: 'AI agents that build UIs and agreement workflows on demand. Turning Docusign from a destination into an invisible layer.',
    url: 'https://docusign-agreement-copilot.vercel.app',
    siteName: 'Agreement Copilot',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Agreement Copilot Interface',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
