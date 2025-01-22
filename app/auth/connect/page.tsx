'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import DocuSignConnect from '@/components/docusign-connect';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function ConnectPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [docusignStatusLoaded, setDocusignStatusLoaded] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      }
    });

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('Initial user check:', user?.id);
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Check DocuSign connection status when user is logged in
  useEffect(() => {
    if (user) {
      setDocusignStatusLoaded(false);
      console.log('Checking DocuSign status for user:', user.id);
      fetch('/api/auth/docusign/status')
        .then(res => res.json())
        .then(data => {
          console.log('DocuSign status:', data);
          setIsConnected(data.connected);
          setDocusignStatusLoaded(true);
        })
        .catch(error => {
          console.error(error);
          setDocusignStatusLoaded(true);
        });
    }
  }, [user]);

  // Construct auth callback URL
  const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_BASE_URL);
  callbackUrl.searchParams.set('next', '/auth/connect');
  if (redirect) {
    callbackUrl.searchParams.set('redirect', redirect);
  }

  console.log('Callback URL:', callbackUrl.toString());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F8F7FF] to-[#F0EDFF] py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F8F7FF] to-[#F0EDFF] py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
          {!user ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-[#130032]">
                  Get Started
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create an account or sign in to get started with Agreement Copilot
                </p>
              </div>

              <Auth
                supabaseClient={supabase as any}
                appearance={{ 
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#4C00FF',
                        brandAccent: '#3D00CC',
                      },
                    },
                  },
                  className: {
                    divider: 'hidden',
                    container: 'space-y-4',
                    button: 'bg-[#4C00FF] hover:bg-[#4C00FF]/90',
                    anchor: 'text-xs text-gray-500 hover:text-gray-800',
                  },
                }}
                showLinks={true}
                providers={[]}
                view="sign_up"
                redirectTo={callbackUrl.toString()}
              />
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-[#130032]">
                  Connect Docusign
                </h1>
                <p className="text-sm text-muted-foreground">
                  Now, connect your Docusign account to start managing agreements
                </p>
              </div>

              <DocuSignConnect />

              {docusignStatusLoaded && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => router.push(redirect ? `/${redirect}` : '/chat')}
                    className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 