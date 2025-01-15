import { Button } from "@/components/ui/button"

export function AuthHeader() {
  return (
    <header className="w-full">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <div className="flex gap-2">
          <Button variant="outline">Preview Components</Button>
          <Button className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white">Connect to DocuSign</Button>
        </div>
      </div>
    </header>
  )
}

