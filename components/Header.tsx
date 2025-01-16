'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';

export default function Header({ session: initialSession }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Hide the header on the homepage
  if (pathname === '/') return null;

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Agreement Copilot
        </Link>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <Menu className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border rounded-md">
              {session ? (
                <>
                  <div className="px-2 py-1.5 text-sm text-gray-600 border-b">
                    {session.user.email}
                  </div>
                  <DropdownMenuItem asChild className="focus:bg-gray-50">
                    <Link href="/settings">
                      Docusign Integration
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="focus:bg-gray-50">
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild className="focus:bg-gray-50">
                  <Link href="/auth/connect">
                    Sign In
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 