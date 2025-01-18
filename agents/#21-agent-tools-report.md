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

## Implementation Plan

## Recommended DocuSign Agent Tools

### Core Document Operations
1. `displayDocumentDetails`
   - Purpose: Show envelope and document details
   - Parameters:
     - envelopeId: string
     - showActions: boolean
   - Use case: Document status and management
   - Recommended name: `getEnvelopeDetails`

2. `displayPdfViewer`
   - Purpose: Preview document content
   - Parameters:
     - url: string
   - Use case: Document review and verification
   - Recommended name: `previewDocument`

3. `signDocument`
   - Purpose: Generate signing session
   - Parameters:
     - envelopeId: string
     - returnUrl?: string
   - Use case: Document signing flow
   - Recommended name: `createSigningSession`

4. `sendReminder`
   - Purpose: Send signing reminders
   - Parameters:
     - envelopeId: string
     - message?: string
   - Use case: Follow-up on pending signatures
   - Recommended name: Keep as is

### Template Operations
5. `displayTemplateSelector`
   - Purpose: Browse and select templates
   - Parameters:
     - preselectedId?: string
     - showSearch?: boolean
   - Use case: Template selection
   - Recommended name: `listTemplates`

6. `previewTemplate`
   - Purpose: View template details
   - Parameters:
     - templateId: string
   - Use case: Template review
   - Recommended name: Keep as is

7. `sendTemplate`
   - Purpose: Send template-based envelope
   - Parameters:
     - templateId: string
     - subject: string
     - recipients: Array<Recipient>
   - Use case: Template-based sending
   - Recommended name: `createEnvelopeFromTemplate`

8. `getTemplateTabs`
   - Purpose: Get template form fields
   - Parameters:
     - templateId: string
     - roleName: string
   - Use case: Field management
   - Recommended name: `getTemplateFields`

### Recipient Management
9. `collectRecipients`
   - Purpose: Gather recipient information
   - Parameters:
     - roles: Array<Role>
     - mode: 'template' | 'custom'
   - Use case: Recipient collection
   - Note: Combines template and custom collection
   - Recommended name: `defineRecipients`

### Custom Document Operations
10. `displayContractPreview`
    - Purpose: Preview custom contracts
    - Parameters:
      - markdown: string
      - mode: 'preview' | 'edit'
    - Use case: Custom contract review
    - Recommended name: `previewCustomContract`

11. `sendCustomEnvelope`
    - Purpose: Send custom document
    - Parameters:
      - markdown: string
      - recipients: Array<Recipient>
      - message?: string
    - Use case: Custom document sending
    - Recommended name: `createCustomEnvelope`

### Bulk Operations
12. `displayBulkOperation`
    - Purpose: Show bulk send status
    - Parameters:
      - operationId: string
    - Use case: Bulk send tracking
    - Recommended name: `getBulkSendStatus`

13. `createBulkSend`
    - Purpose: Initialize bulk send
    - Parameters:
      - templateId: string
      - recipients: Array<BulkRecipient>
    - Use case: Bulk sending setup
    - Recommended name: Keep as is

14. `startBulkSend`
    - Purpose: Begin bulk operation
    - Parameters:
      - operationId: string
    - Use case: Bulk send execution
    - Recommended name: Keep as is

### List Operations
15. `listEnvelopes`
    - Purpose: Browse envelopes
    - Parameters:
      - status?: EnvelopeStatus
      - page?: number
      - filters?: EnvelopeFilters
    - Use case: Envelope management
    - Recommended name: Keep as is

### Contract Intelligence Operations
16. `navigatorAnalysis`
    - Purpose: Analyze agreements using DocuSign AI
    - Parameters:
      - query: string
      - filters?: {
          dateRange?: DateRange
          parties?: string[]
          categories?: string[]
          types?: string[]
        }
    - Use case: Contract analysis and insights
    - Recommended name: `analyzeContracts`

### Contract Calculation Operations
17. `calculateMath`
    - Purpose: Perform contract-related calculations
    - Parameters:
      - expression: string
      - context: {
          currency?: string
          precision?: number
          type: 'amount' | 'percentage' | 'proration'
        }
    - Use case: Financial calculations in contracts
    - Recommended name: `calculateContractValue`

### Implementation Notes

1. Common Patterns
   - All tools use Zod validation
   - Consistent error handling
   - Clear permission requirements
   - TypeScript type safety

2. Excluded Tools
   - Priority dashboard (UI-specific feature)
   - Any pure UI components without business logic

## Recommended Additional Tools (Hackathon Priority)

### 1. Enhanced Search (Split Approach)

#### A. Navigator Search (Already Implemented)
`analyzeContracts` (formerly `navigatorAnalysis`)
- Purpose: Deep contract content analysis
- Parameters:
  - query: string (natural language)
  - filters?: {
    dateRange?: DateRange
    parties?: string[]
    categories?: string[]
    types?: string[]
    jurisdiction?: string
    value?: { min?: number, max?: number }
  }
- Value: Contract intelligence and pattern analysis
- Already implemented with rich UI

#### B. eSignature Search (New Priority)
`searchEnvelopes`
- Purpose: Envelope and signing workflow search
- Parameters:
  - query: string (simple text search)
  - filters?: {
    status?: EnvelopeStatus[]
    signerEmail?: string
    dueDate?: DateRange
    templateId?: string
    completionProgress?: number
  }
- Value: Quick access to signing workflows
- Implementation: New focused search UI
- Complexity: Medium (2-3 hours)
- Key Differences from Navigator:
  - Simpler UI focused on signing status
  - Real-time envelope tracking
  - Signer-centric filters
  - Template usage tracking

### 2. Template Cloning
`cloneTemplate`
- Purpose: Quick template reuse
- Parameters:
  - templateId: string
  - newName: string
  - recipientRoles?: string[]
- Value: Huge time-saver for template variations
- Implementation: Use existing DocuSign API
- Complexity: Low (1-2 hours)

### 3. Basic Reporting
`generateActivityReport`
- Purpose: Simple activity summary
- Parameters:
  - dateRange: DateRange
  - type: 'completion' | 'pending'
- Value: Quick insights for users
- Implementation: Aggregate existing envelope data
- Complexity: Medium (2-3 hours)

### 4. Batch Reminders
`sendBatchReminders`
- Purpose: Bulk reminder sending
- Parameters:
  - envelopeIds: string[]
  - message?: string
- Value: Efficiency for managing multiple documents
- Implementation: Extend existing reminder tool
- Complexity: Low (1-2 hours)

### 5. `createSigningRoom`
- Purpose: Create a persistent, shared space for multi-party real estate transactions
- Value: High impact - solves coordination complexity
- Complexity: Medium (8-10 hours for full implementation)
- Parameters:
  ```typescript
  {
    type: 'lease' | 'listing' | 'purchase',
    participants: Array<{
      role: 'agent' | 'tenant' | 'landlord' | 'buyer' | 'seller',
      email: string,
      name: string,
      access: 'full' | 'sign-only' | 'view-only'
    }>,
    metadata: {
      property?: {
        address: string,
        unit?: string,
        type: 'residential' | 'commercial',
        details: Record<string, any>
      },
      terms?: {
        startDate?: string,
        duration?: string,
        amount?: number,
        specialConditions?: string[]
      }
    },
    templates?: Array<{
      id: string,
      name: string,
      role: string
    }>
  }
  ```
- Builds on:
  - `createSigningSession` for embedded signing
  - `listEnvelopes` for status tracking
  - `sendReminder` for notifications
  - Planned search tools for filtering
