import { Button } from "@/components/ui/button"

export function ChatHeader() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex flex-col items-center mx-auto">
          <h1 className="text-2xl font-semibold text-[#130032]">Agreement Copilot</h1>
        </div>
        <div className="absolute right-4 flex gap-2">
          <Button variant="outline">Log in</Button>
          <Button className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white">Sign up</Button>
        </div>
      </div>
    </header>
  )
}

