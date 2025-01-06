export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F3F0]">
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#130032]">Components</h1>
              <p className="text-[#130032]/70">
                Preview of all available DocuSign Agreement Copilot components.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 