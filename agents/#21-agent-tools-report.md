# DocuSign Agent Tools Implementation Report

## Executive Summary
Based on analysis of Stripe's agent toolkit, we've identified key patterns and best practices for building our DocuSign agent tools. The Stripe toolkit demonstrates how to create a robust, type-safe, and developer-friendly agent toolkit specifically designed for the Vercel AI SDK.

## Key Architecture Decisions

### 1. Core Structure
```typescript
class DocuSignAgentToolkit {
  private _docusign: DocuSignAPI;
  tools: {[key: string]: CoreTool};

  constructor({
    accessToken,
    configuration: Configuration
  }) {
    this._docusign = new DocuSignAPI(accessToken, configuration.context);
    this.tools = {};
    
    // Register allowed tools
    tools.filter(tool => isToolAllowed(tool, configuration))
         .forEach(tool => {
           this.tools[tool.method] = DocuSignTool(/*...*/);
         });
  }
}
```

### 2. Type System
```typescript
type Resource = 
  | 'envelopes'
  | 'templates'
  | 'documents'
  | 'recipients'
  | 'bulk_send';

type Permission = 'create' | 'read' | 'update' | 'void';

type Actions = {
  [K in Resource]?: {
    [K in Permission]?: boolean;
  };
};

type Configuration = {
  actions?: Actions;
  context?: {
    account?: string;
    baseUrl?: string;
  };
};
```

## Tool Implementation Pattern

### Tool Structure
```typescript
type Tool = {
  method: string;      // Method name (e.g., 'createEnvelope')
  name: string;        // Display name
  description: string; // Prompt template
  parameters: any;     // Zod schema
  actions: {           // Required permissions
    [resource: string]: {
      [action: string]: boolean;
    };
  };
};
```

### Parameter Validation
```typescript
import { z } from 'zod';

export const createEnvelopeParameters = z.object({
  templateId: z.string().describe('The template ID to use'),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.string()
  })).describe('List of recipients'),
  emailSubject: z.string().optional()
    .describe('Custom email subject')
});
```

## Core Tools Required

### 1. Template Operations
- `listTemplates`: Browse available templates
- `getTemplate`: Get template details
- `createFromTemplate`: Create envelope from template

### 2. Envelope Operations
- `createEnvelope`: Create new envelope
- `voidEnvelope`: Void sent envelope
- `getEnvelopeStatus`: Check envelope status
- `listEnvelopes`: List recent envelopes

### 3. Document Operations
- `addDocument`: Add document to envelope
- `listDocuments`: List envelope documents
- `downloadDocument`: Get signed documents

### 4. Recipient Operations
- `addRecipient`: Add recipient to envelope
- `updateRecipient`: Update recipient details
- `deleteRecipient`: Remove recipient

### 5. Bulk Operations
- `createBulkSend`: Create bulk send
- `addToBulkSend`: Add recipient to bulk
- `startBulkSend`: Initiate bulk send

## Integration with Vercel AI SDK

### 1. Setup Pattern
```typescript
const toolkit = new DocuSignAgentToolkit({
  accessToken: process.env.DOCUSIGN_ACCESS_TOKEN,
  configuration: {
    actions: {
      templates: { read: true },
      envelopes: { create: true, void: true }
    }
  }
});

const tools = toolkit.getTools();
```

### 2. Streaming Support
```typescript
middleware: toolkit.middleware({
  transform: async (chunk, controller) => {
    if (chunk.type === 'finish') {
      // Handle completion
    }
    controller.enqueue(chunk);
  }
})
```

## Tool Documentation Pattern

### Clear Prompts
```typescript
export const createEnvelopePrompt = `
This tool will create a new envelope in DocuSign.

It takes the following arguments:
- templateId (str): The template ID to use
- recipients (array): List of recipients with:
  - email (str): Recipient's email
  - name (str): Recipient's name
  - role (str): Role in template
- emailSubject (str, optional): Custom email subject
`;
```

## Security Considerations

1. Permission Model
   - Granular action control
   - Resource-level permissions
   - Context isolation

2. API Access
   - JWT authentication
   - Scoped access tokens
   - Rate limiting

3. Validation
   - Input sanitization
   - Parameter validation
   - Error boundaries

## Implementation Plan

## Stripe Agent Tools Research Notes

## Recommended DocuSign Agent Tools

### Core Document Operations
1. `displayDocumentDetails`
   - Purpose: Show envelope and document details
   - Parameters:
     - envelopeId: string
     - showActions: boolean
   - Use case: Document status and management

2. `displayPdfViewer`
   - Purpose: Preview document content
   - Parameters:
     - url: string
   - Use case: Document review and verification

3. `signDocument`
   - Purpose: Generate signing session
   - Parameters:
     - envelopeId: string
     - returnUrl?: string
   - Use case: Document signing flow

4. `sendReminder`
   - Purpose: Send signing reminders
   - Parameters:
     - envelopeId: string
     - message?: string
   - Use case: Follow-up on pending signatures

### Template Operations
5. `displayTemplateSelector`
   - Purpose: Browse and select templates
   - Parameters:
     - preselectedId?: string
     - showSearch?: boolean
   - Use case: Template selection

6. `previewTemplate`
   - Purpose: View template details
   - Parameters:
     - templateId: string
   - Use case: Template review

7. `sendTemplate`
   - Purpose: Send template-based envelope
   - Parameters:
     - templateId: string
     - subject: string
     - recipients: Array<Recipient>
   - Use case: Template-based sending

8. `getTemplateTabs`
   - Purpose: Get template form fields
   - Parameters:
     - templateId: string
     - roleName: string
   - Use case: Field management

### Recipient Management
9. `collectRecipients`
   - Purpose: Gather recipient information
   - Parameters:
     - roles: Array<Role>
     - mode: 'template' | 'custom'
   - Use case: Recipient collection
   - Note: Combines template and custom collection

### Custom Document Operations
10. `displayContractPreview`
    - Purpose: Preview custom contracts
    - Parameters:
      - markdown: string
      - mode: 'preview' | 'edit'
    - Use case: Custom contract review

11. `sendCustomEnvelope`
    - Purpose: Send custom document
    - Parameters:
      - markdown: string
      - recipients: Array<Recipient>
      - message?: string
    - Use case: Custom document sending

### Bulk Operations
12. `displayBulkOperation`
    - Purpose: Show bulk send status
    - Parameters:
      - operationId: string
    - Use case: Bulk send tracking

13. `createBulkSend`
    - Purpose: Initialize bulk send
    - Parameters:
      - templateId: string
      - recipients: Array<BulkRecipient>
    - Use case: Bulk sending setup

14. `startBulkSend`
    - Purpose: Begin bulk operation
    - Parameters:
      - operationId: string
    - Use case: Bulk send execution

### List Operations
15. `listEnvelopes`
    - Purpose: Browse envelopes
    - Parameters:
      - status?: EnvelopeStatus
      - page?: number
      - filters?: EnvelopeFilters
    - Use case: Envelope management

### Implementation Notes

1. Common Patterns
   - All tools use Zod validation
   - Consistent error handling
   - Clear permission requirements
   - TypeScript type safety

2. Excluded Tools
   - Navigator analysis (app-specific)
   - Priority dashboard (UI feature)
   - Math calculations (not core)

3. Additions Needed
   - Envelope search
   - Advanced filtering
   - Batch operations
   - Status webhooks

4. Security Focus
   - Permission-based access
   - Input validation
   - Rate limiting
   - Audit logging
