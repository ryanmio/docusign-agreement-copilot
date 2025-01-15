import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Button } from "@/components/ui/button";
import { ChatEntryInput } from "@/components/chat-entry-input";
import { StarterBubbles } from "@/components/starter-bubbles";
import { CapabilitiesSection } from "@/components/capabilities-section";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F8F7FF] to-[#F0EDFF] flex flex-col">
      {!user && (
        <div className="w-full">
          <div className="container mx-auto px-4 py-4 flex justify-end">
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/preview">Preview Components</a>
              </Button>
              <Button className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white" asChild>
                <a href="/auth/connect">Connect to DocuSign</a>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center min-h-[calc(100vh-64px)] justify-between py-8">
          <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-4xl font-semibold text-[#130032]">Agreement Copilot</h1>
              <p className="text-lg text-muted-foreground">
                Exploring next-gen agreement interfaces for AI agents
              </p>
            </div>

            <div className="w-full space-y-6">
              <ChatEntryInput />
              <StarterBubbles />
              <CapabilitiesSection />
            </div>
          </div>

          <footer className="text-center text-sm text-muted-foreground max-w-xl">
            A real-world demonstration of generative user interface components enabling AI agents to dynamically render and chain agreement workflows
          </footer>
        </div>
      </main>
    </div>
  );
}
