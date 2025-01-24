export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="ds-container pt-2 pb-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-[#130032]">Generative UI Components</h1>
            <p className="max-w-3xl text-[#130032]/70">
              Preview of all Agreement Copilot agent tools. The model can render each tool independently or in sequence to create complex workflows.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <div className="sticky top-6 space-y-2 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <div className="font-medium text-[#130032] mb-4">Components</div>
                <nav className="space-y-4">
                  <div>
                    <div className="px-3 py-1 text-sm font-medium text-[#130032]/50">Setup & Authentication</div>
                    <a href="#docusign-connect" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">DocuSign Connect</a>
                  </div>

                  <div>
                    <div className="px-3 py-1 text-sm font-medium text-[#130032]/50">Core Agreement Flow</div>
                    <a href="#template-selector" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Template Selector</a>
                    <a href="#template-preview" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Template Preview</a>
                    <a href="#recipient-form" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Recipient Form</a>
                    <a href="#envelope-success" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Envelope Success</a>
                  </div>

                  <div>
                    <div className="px-3 py-1 text-sm font-medium text-[#130032]/50">Management & Monitoring</div>
                    <a href="#priority-dashboard" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Priority Dashboard</a>
                    <a href="#document-view" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Document View</a>
                    <a href="#bulk-operations-list" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Bulk Operations List</a>
                    <a href="#bulk-operation-view" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Bulk Operation View</a>
                    <a href="#reminder-confirmation" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Reminder Confirmation</a>
                  </div>

                  <div>
                    <div className="px-3 py-1 text-sm font-medium text-[#130032]/50">Document Tools</div>
                    <a href="#pdf-viewer" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">PDF Viewer</a>
                    <a href="#markdown-editor" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Markdown Editor</a>
                    <a href="#math-result" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Math Result</a>
                  </div>

                  <div>
                    <div className="px-3 py-1 text-sm font-medium text-[#130032]/50">Utility Components</div>
                    <a href="#loading" className="block px-3 py-2 text-sm rounded-md hover:bg-[#F8F3F0] text-[#130032]/70 hover:text-[#130032]">Loading States</a>
                  </div>
                </nav>
              </div>
            </div>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 