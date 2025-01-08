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
import DocuSignConnectPreview from '@/components/preview/docusign-connect';
import { EnvelopeSuccessPreview } from '@/components/preview/envelope-success';
import { ReminderConfirmationPreview } from '@/components/preview/reminder-confirmation';

function ComponentSection({
  title,
  description,
  children,
  props,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  props: { name: string; type: string; description: string; required?: boolean }[];
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#130032]">{title}</h2>
        <p className="text-[#130032]/70">{description}</p>
      </div>
      <Card className="p-6 bg-white shadow-sm border-[#CBC2FF]/20">
        {children}
      </Card>
      <div className="overflow-hidden rounded-lg border border-[#CBC2FF]/20">
        <table className="w-full bg-white text-sm">
          <thead className="bg-[#F8F3F0]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[#130032]">Prop</th>
              <th className="px-4 py-3 text-left font-medium text-[#130032]">Type</th>
              <th className="px-4 py-3 text-left font-medium text-[#130032]">Description</th>
              <th className="px-4 py-3 text-left font-medium text-[#130032]">Required</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr key={prop.name} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F8F3F0]/50'}>
                <td className="px-4 py-3 font-mono text-sm">{prop.name}</td>
                <td className="px-4 py-3 font-mono text-sm text-[#4C00FF]">{prop.type}</td>
                <td className="px-4 py-3">{prop.description}</td>
                <td className="px-4 py-3">{prop.required ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function PreviewPage() {
  return (
    <div className="divide-y divide-[#CBC2FF]/30 px-8">
      <div className="py-12">
        <ComponentSection
          title="Loading States"
          description="Used during API calls and tool processing"
          props={[
            {
              name: 'label',
              type: 'string',
              description: 'Optional loading message',
              required: false
            }
          ]}
        >
          <div className="flex justify-center gap-24">
            <LoadingSpinner label="Processing..." />
            <LoadingSpinner label="Thinking..." />
          </div>
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Template Selector"
          description="Used to select DocuSign templates"
          props={[
            {
              name: 'value',
              type: 'string',
              description: 'Selected template ID',
              required: true
            },
            {
              name: 'onChange',
              type: '(value: string) => void',
              description: 'Selection handler',
              required: true
            }
          ]}
        >
          <TemplateSelector
            value={mockTemplates[0].templateId}
            onChange={(value) => console.log('Selected template:', value)}
          />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Priority Dashboard"
          description="Shows urgent items needing attention"
          props={[
            {
              name: 'sections',
              type: 'PrioritySection[]',
              description: 'Dashboard sections with envelopes',
              required: true
            },
            {
              name: 'onAction',
              type: '(envelopeId: string, action: string) => Promise<void>',
              description: 'Action handler',
              required: true
            }
          ]}
        >
          <PriorityDashboard
            sections={mockPriorityDashboard.sections}
            toolCallId="preview"
            onAction={async (envelopeId, action) => {
              console.log('Action:', action, 'on envelope:', envelopeId);
            }}
          />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Template Preview"
          description="Displays template details and roles"
          props={[
            {
              name: 'templateId',
              type: 'string',
              description: 'Template identifier',
              required: true
            },
            {
              name: 'templateName',
              type: 'string',
              description: 'Template name',
              required: true
            },
            {
              name: 'description',
              type: 'string',
              description: 'Template description',
              required: true
            },
            {
              name: 'roles',
              type: 'Array<{ roleName: string, roleId: string }>',
              description: 'Template roles',
              required: true
            }
          ]}
        >
          <TemplatePreview {...mockTemplatePreview} />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Recipient Form"
          description="Collects recipient information"
          props={[
            {
              name: 'roles',
              type: 'Array<{ roleName: string }>',
              description: 'Required roles',
              required: true
            },
            {
              name: 'onSubmit',
              type: '(recipients: RecipientData[]) => Promise<void>',
              description: 'Submit handler',
              required: true
            },
            {
              name: 'onBack',
              type: '() => void',
              description: 'Optional back handler',
              required: false
            }
          ]}
        >
          <RecipientForm
            roles={mockRecipientRoles}
            toolCallId="preview"
            onSubmit={async (recipients) => {
              console.log('Recipients:', recipients);
            }}
            onBack={() => console.log('Back clicked')}
          />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="PDF Viewer"
          description="Displays PDF documents"
          props={[
            {
              name: 'url',
              type: 'string',
              description: 'PDF document URL',
              required: true
            }
          ]}
        >
          <div className="w-full h-[800px] border border-gray-200 rounded-lg">
            <PDFViewer url={mockPdfUrl} />
          </div>
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Math Result"
          description="Displays calculation results with steps"
          props={[
            {
              name: 'expression',
              type: 'string',
              description: 'Math expression',
              required: true
            },
            {
              name: 'result',
              type: 'number | string',
              description: 'Calculation result',
              required: true
            },
            {
              name: 'steps',
              type: 'string[]',
              description: 'Optional calculation steps',
              required: false
            },
            {
              name: 'error',
              type: 'string',
              description: 'Optional error message',
              required: false
            }
          ]}
        >
          <MathResult {...mockMathResult} />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Envelope Success"
          description="Shows envelope status and recipient progress after sending"
          props={[
            {
              name: 'envelopeId',
              type: 'string',
              description: 'DocuSign envelope identifier',
              required: true
            }
          ]}
        >
          <EnvelopeSuccessPreview />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="DocuSign Connect"
          description="Connect and disconnect your DocuSign account"
          props={[
            {
              name: '-',
              type: '-',
              description: 'No props required - Handles authentication internally',
              required: false
            }
          ]}
        >
          <div className="max-w-2xl">
            <DocuSignConnectPreview />
          </div>
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Reminder Confirmation"
          description="Shows success or error state after sending a reminder"
          props={[
            {
              name: 'success',
              type: 'boolean',
              description: 'Whether the reminder was sent successfully',
              required: true
            },
            {
              name: 'envelopeId',
              type: 'string',
              description: 'ID of the envelope the reminder was sent for',
              required: true
            },
            {
              name: 'error',
              type: 'string',
              description: 'Error message if the reminder failed',
              required: false
            },
            {
              name: 'recipientCount',
              type: 'number',
              description: 'Number of recipients the reminder was sent to',
              required: false
            }
          ]}
        >
          <ReminderConfirmationPreview />
        </ComponentSection>
      </div>

      <div className="py-12">
        <ComponentSection
          title="Bulk Operations List"
          description="Displays list of bulk operations"
          props={[
            {
              name: '-',
              type: '-',
              description: 'No props required - Fetches data internally',
              required: false
            }
          ]}
        >
          <BulkOperationsList />
        </ComponentSection>
      </div>
    </div>
  );
} 