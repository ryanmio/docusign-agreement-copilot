'use client';

import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TemplateSelector } from '@/components/template-selector';
import { PriorityDashboard } from '@/components/priority-dashboard';
import { TemplatePreview } from '@/components/template-preview';
import { RecipientForm } from '@/components/recipient-form';
import PDFViewer from '@/components/pdf-viewer';
import { MathResult } from '@/components/math-result';
import { BulkOperationsList } from '@/components/bulk-operations-list';
import {
  mockTemplates,
  mockPriorityDashboard,
  mockRecipientRoles,
  mockTemplatePreview,
  mockMathResult,
  mockPdfUrl
} from '@/lib/preview-data';

function ComponentSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#130032]">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <Card className="p-6 bg-white shadow-sm">
        {children}
      </Card>
    </section>
  );
}

function PropsList({ items }: { items: string[] }) {
  return (
    <div className="text-sm space-y-2 mt-4 text-gray-600">
      <p>Props:</p>
      <ul className="list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="space-y-12">
      <ComponentSection
        title="Loading States"
        description="Used during API calls and tool processing"
      >
        <div className="space-y-4">
          <LoadingSpinner label="Processing..." />
          <PropsList items={[
            'label?: string - Optional loading message'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Template Selector"
        description="Used to select DocuSign templates"
      >
        <div className="space-y-4">
          <TemplateSelector
            value={mockTemplates[0].templateId}
            onChange={(value) => console.log('Selected template:', value)}
          />
          <PropsList items={[
            'value: string - Selected template ID',
            'onChange: (value: string) => void - Selection handler'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Priority Dashboard"
        description="Shows urgent items needing attention"
      >
        <div className="space-y-4">
          <PriorityDashboard
            sections={mockPriorityDashboard.sections}
            toolCallId="preview"
            onAction={async (envelopeId, action) => {
              console.log('Action:', action, 'on envelope:', envelopeId);
            }}
          />
          <PropsList items={[
            'sections: PrioritySection[] - Dashboard sections with envelopes',
            'onAction: (envelopeId: string, action: string) => Promise<void> - Action handler'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Template Preview"
        description="Displays template details and roles"
      >
        <div className="space-y-4">
          <TemplatePreview {...mockTemplatePreview} />
          <PropsList items={[
            'templateId: string - Template identifier',
            'templateName: string - Template name',
            'description: string - Template description',
            'roles: Array<{ roleName: string, roleId: string }> - Template roles'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Recipient Form"
        description="Collects recipient information"
      >
        <div className="space-y-4">
          <RecipientForm
            roles={mockRecipientRoles}
            toolCallId="preview"
            onSubmit={async (recipients) => {
              console.log('Recipients:', recipients);
            }}
            onBack={() => console.log('Back clicked')}
          />
          <PropsList items={[
            'roles: Array<{ roleName: string }> - Required roles',
            'onSubmit: (recipients: RecipientData[]) => Promise<void> - Submit handler',
            'onBack?: () => void - Optional back handler'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="PDF Viewer"
        description="Displays PDF documents"
      >
        <div className="space-y-4">
          <div className="w-full h-[800px] border border-gray-200 rounded-lg">
            <PDFViewer url={mockPdfUrl} />
          </div>
          <PropsList items={[
            'url: string - PDF document URL'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Math Result"
        description="Displays calculation results with steps"
      >
        <div className="space-y-4">
          <MathResult {...mockMathResult} />
          <PropsList items={[
            'expression: string - Math expression',
            'result: number | string - Calculation result',
            'steps?: string[] - Optional calculation steps',
            'error?: string - Optional error message'
          ]} />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Bulk Operations List"
        description="Displays list of bulk operations"
      >
        <div className="space-y-4">
          <BulkOperationsList />
          <PropsList items={[
            'No props required - Fetches data internally'
          ]} />
        </div>
      </ComponentSection>
    </div>
  );
} 