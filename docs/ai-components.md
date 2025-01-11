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

### EnvelopeList

A component that displays a list of envelopes with filtering and pagination capabilities.

#### Tool Definition

```typescript
displayEnvelopeList: tool({
  description: 'Display a list of envelopes with filtering and pagination',
  parameters: z.object({
    status: z.enum(['created', 'sent', 'delivered', 'signed', 'completed', 'declined', 'voided', 'error'])
      .optional()
      .describe('Filter envelopes by status'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    showStatusFilter: z.boolean().optional().describe('Whether to show the status filter')
  }),
  execute: async ({ status, page, showStatusFilter }) => {
    // Implementation details...
  }
})
```

#### Component Usage

```typescript
<EnvelopeList
  initialStatus={status}
  initialPage={page}
  showStatusFilter={true}
  onEnvelopeClick={(envelopeId) => {
    // Handle envelope selection
  }}
/>
```

**Features:**
- Real-time envelope list with pagination
- Status filtering (created, sent, delivered, signed, completed, declined, voided, error)
- Loading states and error handling
- Responsive design with mobile support
- Interactive envelope selection

**Use Cases:**
- Viewing all envelopes
- Filtering envelopes by status
- Monitoring document progress
- Quick access to envelope details

**Technical Details:**
- Uses Supabase for data fetching
- Requires authentication context
- Auto-refreshes on filter/page changes
- TypeScript support with proper type definitions

### TemplateSelector

A component that allows users to browse and select DocuSign templates.

#### Tool Definition

```typescript
displayTemplateSelector: tool({
  description: 'Display a template selector with search capabilities',
  parameters: z.object({
    preselectedId: z.string().optional().describe('Optional template ID to preselect'),
    showSearch: z.boolean().optional().describe('Whether to show the search input')
  }),
  execute: async ({ preselectedId, showSearch }) => {
    // Implementation details...
  }
})
```

#### Component Usage

```typescript
<TemplateSelector
  value={selectedTemplateId}
  onChange={(templateId) => {
    // Handle template selection
  }}
/>
```

**Features:**
- Template listing with search
- Real-time search filtering
- Loading states and error handling
- Selection handling
- Debug information in development
- Responsive design

**Use Cases:**
- Selecting templates for new documents
- Browsing available templates
- Quick template lookup
- Template management

**Technical Details:**
- Uses DocuSign API for template fetching
- Requires DocuSign authentication
- Real-time search updates
- TypeScript support with proper type definitions

**Example Chat Interactions:**

For Envelopes:
```
User: Show me my documents
Assistant: Here are your envelopes:
[EnvelopeList component displays]

User: Show me my completed documents
Assistant: Here are your completed envelopes:
[EnvelopeList component displays with status filter set to 'completed']
```

For Templates:
```
User: I want to select a template
Assistant: Here are your available templates:
[TemplateSelector component displays]

User: Show me my templates
Assistant: Here are your templates:
[TemplateSelector component displays with search enabled]
```

### TemplatePreview

A component that displays detailed information about a DocuSign template including its name, description, and required roles.

#### Tool Definition

```typescript
previewTemplate: tool({
  description: 'Display a preview of a DocuSign template with its details and required roles',
  parameters: z.object({
    templateId: z.string().describe('The ID of the template to preview'),
    showBackButton: z.boolean().optional().describe('Whether to show the back button')
  }),
  execute: async ({ templateId, showBackButton }) => {
    // Implementation details...
  }
})
```

#### Component Usage

```tsx
import { TemplatePreview } from '@/components/template-preview';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'previewTemplate') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <TemplatePreview {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Template name and description display
- Required signers list with role information
- Proceed to Recipients button
- Optional back button
- Clean, modern UI design
- Responsive layout

**Use Cases:**
- Previewing template details before sending
- Confirming template selection
- Reviewing required signers
- Multi-step document sending flow

**Technical Details:**
- Uses DocuSign API for template data
- Requires authentication context
- TypeScript support with proper type definitions
- Integrates with multi-step sending flow

**Example Chat Interactions:**
```
User: I want to send our vendor renewal agreement
Assistant: Here's a preview of the vendor renewal template:
[TemplatePreview component displays with template details]

User: Show me the details of the offboarding template
Assistant: Here's the employee offboarding template:
[TemplatePreview component displays with offboarding template details]
```

### PriorityDashboard

A component that displays urgent agreements requiring attention, categorized by priority level.

#### Tool Definition

```typescript
displayPriorityDashboard: tool({
  description: 'Display a dashboard of prioritized agreements requiring attention',
  parameters: z.object({
    showBackButton: z.boolean().optional().describe('Whether to show a back button')
  }),
  execute: async ({ showBackButton }) => {
    const docusign = new DocuSignEnvelopes(supabase);
    const envelopes = await docusign.listStatusChanges(session.user.id);
    
    // Group envelopes by priority
    const prioritizedEnvelopes = categorizePriorities(envelopes);
    
    return {
      showBackButton: showBackButton ?? false,
      prioritizedEnvelopes
    };
  }
})
```

#### Component Usage

```tsx
import { PriorityDashboard } from '@/components/priority-dashboard';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayPriorityDashboard') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <PriorityDashboard {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Three priority sections: Urgent, Today, and This Week
- Quick actions for each agreement (view, sign, remind)
- Real-time status updates
- Efficient envelope fetching using DocuSign API
- Mobile responsive design
- Error handling and loading states

**Use Cases:**
- Morning document review
- Identifying urgent agreements
- Quick access to pending tasks
- Prioritized workflow management

**Technical Details:**
- Uses DocuSign's `listStatusChanges` endpoint
- Integrates with existing DocuSign envelope handling
- Requires authentication context
- TypeScript support with proper type definitions

**Example Chat Interactions:**
```
User: What needs my attention?
Assistant: Here are your priorities:
[PriorityDashboard displays with categorized agreements]

User: Show me my urgent documents
Assistant: Here are your urgent agreements:
[PriorityDashboard displays focused on urgent section]
```

### ContractPreview

A component that displays and allows editing of AI-generated contracts in markdown format.

#### Tool Definition

```typescript
displayContractPreview: tool({
  description: 'Display a contract in markdown format for preview and editing. Use this after generating contract content to show it to the user.',
  parameters: z.object({
    markdown: z.string().describe('The contract content in markdown format with DocuSign anchor tags'),
    mode: z.enum(['preview', 'edit']).default('preview').describe('The initial display mode')
  }),
  execute: async ({ markdown, mode }) => {
    return {
      markdown,
      mode,
      completed: false
    };
  }
})
```

#### Component Usage

```tsx
import { MarkdownEditor } from '@/components/markdown-editor';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'displayContractPreview') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <MarkdownEditor {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Live markdown preview
- Edit mode with syntax highlighting
- DocuSign anchor tag preservation
- Mobile-responsive design
- Error handling for invalid markdown
- Real-time preview updates

**Use Cases:**
- Previewing AI-generated contracts
- Editing contract content
- Verifying DocuSign anchor tags
- Fine-tuning contract language

**Technical Details:**
- Uses marked library for markdown rendering
- Preserves DocuSign anchor tags during conversion
- Supports both preview and edit modes
- TypeScript support with proper type definitions

### CollectContractSigners

A component that collects signer information for custom generated contracts.

#### Tool Definition

```typescript
collectContractSigners: tool({
  description: 'Collect signer information for a custom generated contract',
  parameters: z.object({
    roles: z.array(z.object({
      roleName: z.string().describe('The name of the role')
    })).describe('The roles needed to sign the contract (e.g. ["Employee", "Employer"])')
  }),
  execute: async ({ roles }) => {
    return {
      roles,
      completed: false,
      goBack: false,
      recipients: []
    };
  }
})
```

#### Component Usage

```tsx
import { SignerForm } from '@/components/signer-form';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && toolName === 'collectContractSigners') {
    const { result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <SignerForm {...result} />
      </div>
    );
  }
})}
```

**Features:**
- Dynamic form generation based on roles
- Email validation
- Required field handling
- Back button support
- Clean form layout
- Mobile-responsive design

**Use Cases:**
- Collecting signer information for custom contracts
- Validating recipient details
- Multi-step contract sending flow

### SendCustomEnvelope

A tool for sending custom-generated contracts as DocuSign envelopes.

#### Tool Definition

```typescript
sendCustomEnvelope: tool({
  description: 'Send a custom contract as a DocuSign envelope',
  parameters: z.object({
    markdown: z.string().describe('The contract content in markdown format'),
    recipients: z.array(z.object({
      email: z.string(),
      name: z.string(),
      roleName: z.string()
    })).describe('The recipients to send the contract to'),
    message: z.string().optional().describe('Optional email message')
  }),
  execute: async ({ markdown, recipients, message }) => {
    // Implementation converts markdown to PDF and sends via DocuSign
    return {
      success: true,
      envelopeId: 'envelope-id',
      status: 'sent'
    };
  }
})
```

**Features:**
- Markdown to PDF conversion
- DocuSign anchor tag preservation
- Proper recipient routing
- Email notification support
- Error handling and validation
- Database record creation
- Real-time status tracking after sending
- Recipient progress monitoring
- Automatic status updates
- Integration with EnvelopeSuccess component

**Technical Details:**
- Uses Puppeteer for PDF generation
- Preserves DocuSign anchor tags
- Creates proper envelope definition
- Stores envelope and recipient records
- Supports custom email messages

**Example Chat Interactions:**
```
User: Create a consulting agreement for Acme Corp
Assistant: I'll help you create a consulting agreement. Let me generate that for you...
[ContractPreview component displays with generated agreement]

User: Looks good, let's send it
Assistant: I'll collect the signer information...
[CollectContractSigners component displays]

User: [After filling in signers]
Assistant: Great! Sending the agreement now...
[SendCustomEnvelope processes the request]
[EnvelopeSuccess component appears showing real-time status]

User: Has anyone signed yet?
Assistant: Let me check the status:
[EnvelopeSuccess component shows current signing progress]
```

### EnvelopeSuccess

A component that displays real-time status tracking for sent envelopes, including recipient progress.

#### Tool Definition
This component is used automatically after successful envelope creation by both `sendTemplate` and `sendCustomEnvelope` tools.

#### Component Usage

```tsx
import { EnvelopeSuccess } from '@/components/envelope-success';

// In your page component:
{message.toolInvocations?.map(toolInvocation => {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === 'result' && (toolName === 'sendTemplate' || toolName === 'sendCustomEnvelope')) {
    const { result } = toolInvocation;
    if (result.success) {
      return (
        <div key={toolCallId}>
          <EnvelopeSuccess envelopeId={result.envelopeId} />
        </div>
      );
    }
  }
})}
```

**Features:**
- Real-time status updates via polling
- Success header with checkmark
- Overall envelope status display
- Individual recipient status tracking
- Status-based color coding
- Automatic updates until completion

**Technical Details:**
- Polls envelope status every 5 seconds
- Stops polling on final states (completed, declined, voided)
- Uses Supabase for real-time data
- Integrates with DocuSign webhook updates
- Proper error handling and loading states

**Example Chat Interactions:**
```
User: Send the contract to alice@example.com
Assistant: I'll generate and send the contract...
[Contract generation and sending process]
[EnvelopeSuccess component displays with real-time status]

User: What's the status of that contract?
Assistant: Here's the current status:
[EnvelopeSuccess component shows latest state]
```

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