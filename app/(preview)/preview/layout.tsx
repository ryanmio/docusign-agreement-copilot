export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="ds-container py-12">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1>Generative UI Components</h1>
            <p className="max-w-3xl">
              Preview of all Agreement Copilot agent tools. The model can render each tool independently or in sequence to create complex workflows.
            </p>
          </div>
          <div className="ds-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 