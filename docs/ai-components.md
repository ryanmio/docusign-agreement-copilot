# AI-Ready Components

This document lists the components that are ready for use by the AI model in generating UI and functionality using Vercel's AI SDK.

## Components and Tools

### BulkOperationView

A component that displays the progress and status of a bulk document sending operation with real-time updates.

#### Tool Definition

```typescript
// ai/tools.ts
export const bulkOperationTool = createTool({
  description: 'Display progress and status of a bulk document sending operation',
  parameters: z.object({
    operationId: z.string().describe('The ID of the bulk operation to display'),
    showBackButton: z.boolean().optional().describe('Whether to show a back button')
  }),
  execute: async function ({ operationId, showBackButton = false }) {
    return { operationId, showBackButton };
  },
});

export const tools = {
  displayBulkOperation: bulkOperationTool,
};
```

#### Component Usage

```tsx
import { BulkOperationView } from '@/components/bulk-operation-view';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayBulkOperation') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <BulkOperationView {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Real-time progress updates via Supabase subscriptions
- Progress bar showing completion status
- Detailed recipient table with status indicators
- Error handling and loading states
- Responsive design with mobile support

**Use Cases:**
- Displaying status of bulk document sending operations
- Monitoring recipient progress
- Debugging failed sendings
- Real-time operation monitoring

**Technical Details:**
- Uses Supabase real-time subscriptions
- Requires authentication context
- Auto-refreshes without page reload
- Typescript support with proper type definitions

### PDFViewer

A component that displays PDF documents with built-in viewer controls.

#### Tool Definition

```typescript
// ai/tools.ts
export const pdfViewerTool = createTool({
  description: 'Display a PDF document with viewer controls',
  parameters: z.object({
    url: z.string().describe('The URL of the PDF document to display')
  }),
  execute: async function ({ url }) {
    return { url };
  },
});
```

#### Component Usage

```tsx
import PDFViewer from '@/components/pdf-viewer';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayPdfViewer') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId} className="h-[750px] border border-gray-300 rounded-lg">
        <PDFViewer {...result} />
      </div>
    );
  }
})}
```

**Features:**
- PDF document rendering
- Built-in zoom controls
- Error handling for failed loads
- Responsive design
- Download option

### DocumentDetails

A component that displays detailed information about a document envelope including status, timeline, and recipients.

#### Tool Definition

```typescript
// ai/tools.ts
export const documentDetailsTool = createTool({
  description: 'Display detailed information about a document envelope',
  parameters: z.object({
    envelopeId: z.string().describe('The ID of the envelope to display details for'),
    showActions: z.boolean().optional().describe('Whether to show action buttons like void and resend')
  }),
  execute: async function ({ envelopeId, showActions = true }) {
    return { envelopeId, showActions };
  },
});
```

#### Component Usage

```tsx
import { DocumentView } from '@/components/document-view';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayDocumentDetails') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <DocumentView {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Document status display
- Timeline view
- Recipients list with status
- Document preview with PDF viewer
- Action buttons (void/resend) when enabled
- Error handling and success notifications
- Responsive layout

## Database Schema Dependencies

Components may depend on specific database tables and schemas. Here are the current dependencies:

### BulkOperationView Dependencies

**bulk_operations table:**
- id: string
- name: string
- created_at: timestamp
- processed_count: number
- total_count: number
- success_count: number
- error_count: number

**bulk_recipients table:**
- id: string
- bulk_operation_id: string (foreign key to bulk_operations.id)
- name: string
- email: string
- status: string
- docusign_envelope_id: string
- error_message: string 

### DocumentDetails Dependencies

**envelopes table:**
- id: string
- subject: string
- message: string
- status: string
- created_at: string
- updated_at: string
- completed_at: string
- docusign_envelope_id: string

**recipients table:**
- id: string
- envelope_id: string (foreign key to envelopes.id)
- name: string
- email: string
- status: string 