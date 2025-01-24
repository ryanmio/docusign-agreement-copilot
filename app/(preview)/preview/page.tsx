'use client';

import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TemplateSelector } from '@/components/template-selector';
import { TemplateSelectorPreview } from '@/components/preview/template-selector';
import { PriorityDashboard } from '@/components/priority-dashboard';
import { TemplatePreview } from '@/components/template-preview';
import { RecipientForm } from '@/components/recipient-form';
import PDFViewer from '@/components/pdf-viewer';
import { MathResult } from '@/components/math-result';
import { BulkOperationsList } from '@/components/bulk-operations-list';
import { BulkOperationsListPreview } from '@/components/preview/bulk-operations-list';
import { AgreementChartPreview } from '@/components/chart-pie-interactive-preview';
import {
  mockTemplates,
  mockPriorityDashboard,
  mockRecipientRoles,
  mockTemplatePreview,
  mockMathResult,
  mockPdfUrl,
  mockContractMarkdown,
  mockDocumentView
} from '@/lib/preview-data';
import DocuSignConnectPreview from '@/components/preview/docusign-connect';
import { EnvelopeSuccessPreview } from '@/components/preview/envelope-success';
import { ReminderConfirmationPreview } from '@/components/preview/reminder-confirmation';
import { BulkOperationViewPreview } from '@/components/preview/bulk-operation-view';
import { MarkdownEditor } from '@/components/markdown-editor';
import { DocumentViewPreview } from '@/components/preview/document-view';
import { useState, useEffect } from 'react';

function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="absolute -top-3 right-0 px-3 py-1 text-sm text-[#4C00FF] bg-white border border-[#CBC2FF]/40 rounded-md hover:bg-[#F8F3F0] transition-colors"
    >
      Back to Top ↑
    </button>
  );
}

function ComponentSection({
  id,
  title,
  description,
  children,
  props,
  className,
  skipCard = false,
  usage,
  isFirst = false,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  props: { name: string; type: string; description: string; required?: boolean }[];
  className?: string;
  skipCard?: boolean;
  usage?: {
    howWeUseIt: string;
    howItWorks: string;
  };
  isFirst?: boolean;
}) {
  return (
    <section id={id} className={`relative space-y-6 scroll-mt-6 ${className || ''} ${isFirst ? 'mt-0 pt-0 border-none' : ''}`}>
      {className?.includes('component-section') && !isFirst && <BackToTop />}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#130032]">{title}</h2>
        <p className="text-[#130032]/70">{description}</p>
      </div>
      {skipCard ? children : (
        <Card className="p-6 bg-white shadow-sm border-[#CBC2FF]/20">
          {children}
        </Card>
      )}
      <div className="space-y-6">
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
        {usage && (
          <div className="rounded-lg border border-[#CBC2FF]/20 bg-white overflow-hidden">
            <div className="px-4 py-3 bg-[#F8F3F0] border-b border-[#CBC2FF]/20">
              <h3 className="font-medium text-[#130032]">Implementation Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="font-medium text-[#130032] mb-1">How We Use It</div>
                <p className="text-[#130032]/70">{usage.howWeUseIt}</p>
              </div>
              <div>
                <div className="font-medium text-[#130032] mb-1">How It Works</div>
                <p className="text-[#130032]/70">{usage.howItWorks}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const [editorMode, setEditorMode] = useState<'preview' | 'edit'>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="space-y-32 -mt-8">
      <style jsx global>{`
        .component-section + .component-section {
          position: relative;
          border-top: 1px solid rgba(203, 194, 255, 0.2);
          padding-top: 2rem;
          margin-top: 2rem;
        }
        .section-header {
          font-size: 0.875rem;
          font-weight: 600;
          color: #130032;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin-bottom: 2rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(203, 194, 255, 0.3);
        }
      `}</style>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('click', function(e) {
            if (e.target && e.target.textContent === 'Back to Top ↑') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          });
        `
      }} />
      <div>
        <h2 className="section-header">Setup & Authentication</h2>
        <ComponentSection
          id="docusign-connect"
          title="DocuSign Connect"
          description="Connect and disconnect your DocuSign account"
          className="component-section"
          isFirst={true}
          skipCard={true}
          props={[
            {
              name: '-',
              type: '-',
              description: 'No props required - Handles authentication internally',
              required: false
            }
          ]}
        >
          <div className="flex justify-center w-full">
            <div className="max-w-2xl w-full">
              <DocuSignConnectPreview />
            </div>
          </div>
        </ComponentSection>
      </div>

      <div>
        <h2 className="section-header">Core Agreement Flow</h2>
        <ComponentSection
          id="template-selector"
          title="Template Selector"
          description="Used to select DocuSign templates"
          className="component-section"
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
          usage={{
            howWeUseIt: "When a user asks to send a document, our AI agent analyzes the request and presents relevant templates through this interface. The agent filters and ranks templates based on the conversation context, making it easy to find the right one.",
            howItWorks: "The agent uses semantic search to match the user's request with template metadata. It then renders this component with the filtered templates, letting users confirm or change the selection before proceeding with the workflow."
          }}
        >
          <TemplateSelectorPreview
            key="template-selector"
            value={selectedTemplate}
            onChange={setSelectedTemplate}
          />
        </ComponentSection>

        <ComponentSection
          id="template-preview"
          title="Template Preview"
          description="Displays template details and roles"
          className="component-section"
          skipCard={true}
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

        <ComponentSection
          id="recipient-form"
          title="Recipient Form"
          description="Collects recipient information"
          className="component-section"
          skipCard={true}
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

        <ComponentSection
          id="envelope-success"
          title="Envelope Success"
          description="Shows envelope status and recipient progress after sending"
          className="component-section"
          skipCard={true}
          props={[
            {
              name: 'envelopeId',
              type: 'string',
              description: 'DocuSign envelope identifier',
              required: true
            }
          ]}
        >
          <div className="flex justify-center w-full">
            <EnvelopeSuccessPreview />
          </div>
        </ComponentSection>
      </div>

      <div>
        <h2 className="section-header">Management & Monitoring</h2>
        <ComponentSection
          id="priority-dashboard"
          title="Priority Dashboard"
          description="Shows urgent items needing attention"
          className="component-section"
          skipCard={true}
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
          usage={{
            howWeUseIt: "This is our main dashboard view that the AI agent generates when users ask about urgent tasks or need an overview of their agreements. It organizes envelopes by priority and status, making it easy to spot what needs attention.",
            howItWorks: "The agent analyzes your DocuSign envelopes in real-time, categorizing them by urgency (expiring soon, waiting for others, needs your signature). It then renders this dynamic dashboard with quick actions for each item."
          }}
        >
          <PriorityDashboard
            sections={mockPriorityDashboard.sections}
            toolCallId="preview"
            onAction={async (envelopeId, action) => {
              console.log('Action:', action, 'on envelope:', envelopeId);
            }}
          />
        </ComponentSection>

        <ComponentSection
          id="document-view"
          title="Document View"
          description="Displays envelope documents and details"
          className="component-section"
          skipCard={true}
          props={[
            {
              name: 'envelopeId',
              type: 'string',
              description: 'DocuSign envelope identifier',
              required: true
            },
            {
              name: 'envelope',
              type: 'Envelope',
              description: 'Envelope details including recipients',
              required: true
            },
            {
              name: 'documents',
              type: '{ envelopeDocuments: Document[] }',
              description: 'List of documents in the envelope',
              required: true
            },
            {
              name: 'showActions',
              type: 'boolean',
              description: 'Whether to show action buttons',
              required: false
            }
          ]}
        >
          <DocumentViewPreview {...mockDocumentView} />
        </ComponentSection>

        <ComponentSection
          id="bulk-operations-list"
          title="Bulk Operations List"
          description="Displays list of bulk operations"
          className="component-section"
          props={[
            {
              name: '-',
              type: '-',
              description: 'No props required - Uses mock data internally',
              required: false
            }
          ]}
        >
          <BulkOperationsListPreview />
        </ComponentSection>

        <ComponentSection
          id="bulk-operation-view"
          title="Bulk Operation View"
          description="Shows progress and recipient status for bulk operations"
          className="component-section"
          props={[
            {
              name: 'operationId',
              type: 'string',
              description: 'ID of the bulk operation to display',
              required: true
            },
            {
              name: 'showBackButton',
              type: 'boolean',
              description: 'Whether to show the back button',
              required: false
            }
          ]}
        >
          <BulkOperationViewPreview />
        </ComponentSection>

        <ComponentSection
          id="reminder-confirmation"
          title="Reminder Confirmation"
          description="Shows success or error state after sending a reminder"
          className="component-section"
          skipCard={true}
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
          <div className="flex justify-center w-full">
            <ReminderConfirmationPreview />
          </div>
        </ComponentSection>
      </div>

      <div>
        <h2 className="section-header">Document Tools</h2>
        <ComponentSection
          id="pdf-viewer"
          title="PDF Viewer"
          description="Displays PDF documents"
          className="component-section"
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

        <ComponentSection
          id="markdown-editor"
          title="Markdown Editor"
          description="Preview and edit markdown with signature anchors"
          className="component-section"
          skipCard={true}
          props={[
            {
              name: 'markdown',
              type: 'string',
              description: 'Text in markdown format',
              required: true
            },
            {
              name: 'mode',
              type: "'preview' | 'edit'",
              description: 'Current display mode',
              required: true
            },
            {
              name: 'onEdit',
              type: '(toolCallId: string) => void',
              description: 'Called when edit button is clicked',
              required: false
            },
            {
              name: 'onConfirm',
              type: '(toolCallId: string, markdown: string) => void',
              description: 'Called when content is confirmed',
              required: false
            },
            {
              name: 'onBack',
              type: '(toolCallId: string) => void',
              description: 'Called when back button is clicked',
              required: false
            }
          ]}
        >
          <MarkdownEditor
            key="markdown-editor"
            markdown={mockContractMarkdown}
            mode={editorMode}
            onEdit={(toolCallId) => {
              console.log('Edit clicked', toolCallId);
              setEditorMode('edit');
            }}
            onConfirm={(toolCallId, markdown) => {
              console.log('Confirm clicked', toolCallId, markdown);
              setEditorMode('preview');
            }}
            onBack={(toolCallId) => {
              console.log('Back clicked', toolCallId);
              setEditorMode('preview');
            }}
          />
        </ComponentSection>

        <ComponentSection
          id="math-result"
          title="Math Result"
          description="Displays calculation results with steps"
          className="component-section"
          skipCard={true}
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
          <div className="flex justify-center w-full">
            <MathResult {...mockMathResult} />
          </div>
        </ComponentSection>

        <ComponentSection
          id="agreement-chart"
          title="Agreement Chart"
          description="Interactive pie chart showing agreement value distribution by category"
          className="component-section"
          skipCard={true}
          props={[
            {
              name: 'dimension',
              type: 'string',
              description: 'Dimension to group by (e.g. category, party_name)',
              required: true
            },
            {
              name: 'metric',
              type: 'string',
              description: 'Metric to show (e.g. value, count)',
              required: true
            }
          ]}
        >
          <AgreementChartPreview />
        </ComponentSection>
      </div>

      <div>
        <h2 className="section-header">Utility Components</h2>
        <ComponentSection
          id="loading"
          title="Loading States"
          description="Used during API calls and tool processing"
          className="component-section"
          props={[
            {
              name: 'label',
              type: 'string',
              description: 'Optional loading message',
              required: false
            }
          ]}
          usage={{
            howWeUseIt: "Our AI agent uses this component to show real-time progress during multi-step operations like analyzing agreements, preparing documents, or processing bulk sends. The loading state appears whenever the agent is performing background tasks.",
            howItWorks: "The agent dynamically updates the loading message based on the current operation. For example, when sending an NDA, you'll see messages like 'Analyzing requirements...', 'Preparing template...', and 'Setting up recipients...' as the agent works."
          }}
        >
          <div className="flex justify-center gap-24">
            <LoadingSpinner label="Processing..." />
            <LoadingSpinner label="Thinking..." />
          </div>
        </ComponentSection>
      </div>
    </div>
  );
} 