import { AuthHeader } from "@/components/auth-header"
import { ChatEntryInput } from "@/components/chat-entry-input"
import { StarterBubbles } from "@/components/starter-bubbles"
import { CapabilitiesSection } from "@/components/capabilities-section"

export function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthHeader />
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
  )
}

