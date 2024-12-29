# AI-Ready Components

This document lists the components that are ready for use by the AI model in generating UI and functionality using Vercel's AI SDK.

## Components and Tools

### BulkOperationView

A component that displays the progress and status of a bulk document sending operation with real-time updates.

#### Tool Definition

```typescript
displayBulkOperation: tool({
  description: 'Display progress and status of a bulk document sending operation',
  parameters: z.object({
    operationId: z.string().describe('The ID of the bulk operation to display'),
    showBackButton: z.boolean().optional().describe('Whether to show a back button')
  }),
  execute: async ({ operationId, showBackButton }) => {
    return {
      operationId,
      showBackButton: showBackButton ?? false
    };
  }
})
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
displayPdfViewer: tool({
  description: 'Display a PDF document with viewer controls',
  parameters: z.object({
    url: z.string().describe('The URL of the PDF document to display')
  }),
  execute: async ({ url }) => {
    return { url };
  }
})
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
displayDocumentDetails: tool({
  description: 'Display detailed information about a document envelope',
  parameters: z.object({
    envelopeId: z.string().describe('The ID of the envelope to display details for'),
    showActions: z.boolean().optional().describe('Whether to show action buttons like void and resend')
  }),
  execute: async ({ envelopeId, showActions }) => {
    // Fetch envelope data from Supabase
    const { data: envelopes } = await supabase
      .from('envelopes')
      .select('*, recipients(*)')
      .eq('id', envelopeId)
      .eq('user_id', session.user.id);

    // Fetch documents from DocuSign
    const docusign = new DocuSignEnvelopes(supabase);
    const documents = await docusign.listDocuments(session.user.id, envelope.docusign_envelope_id);

    return { 
      envelopeId, 
      showActions: showActions ?? true,
      envelope: envelopes[0],
      documents
    };
  }
})
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
- Authentication-aware with user-specific data

### TemplateSelector

A component that displays a list of DocuSign templates with search functionality.

#### Tool Definition

```typescript
displayTemplateSelector: tool({
  description: 'Display a template selector with search capabilities',
  parameters: z.object({
    preselectedId: z.string().optional().describe('Optional template ID to preselect'),
    showSearch: z.boolean().optional().describe('Whether to show the search input')
  }),
  execute: async ({ preselectedId, showSearch }) => {
    return {
      selectedTemplateId: preselectedId,
      showSearch: showSearch ?? true
    };
  }
})
```

#### Component Usage

```tsx
import { TemplateSelector } from '@/components/template-selector';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayTemplateSelector') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <TemplateSelector 
          value={result.selectedTemplateId}
          onChange={(templateId) => {
            // Handle template selection
            console.log('Selected template:', templateId);
          }}
        />
      </div>
    );
  }
})}
```

**Features:**
- Template listing with search
- Real-time search filtering
- Loading states
- Error handling
- Selection handling
- Debug information in development
- Responsive design

**Use Cases:**
- Selecting templates for new documents
- Viewing available templates
- Searching through templates
- Starting document workflows

**Technical Details:**
- Uses DocuSign templates API
- Requires authentication context
- Auto-refreshes on search
- TypeScript support with proper type definitions

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
- user_id: string (foreign key to auth.users.id)
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