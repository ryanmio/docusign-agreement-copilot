# DocuSign Agent Tools Library

## Overview
A modular, reusable library for building DocuSign-powered applications with AI capabilities. Based on the Stripe toolkit pattern, providing a consistent structure for both data operations and UI components.

## Package Structure
```
@docusign-agent/
├── core/           # Core toolkit, types, and tools
├── react/          # React components
└── integrations/   # Optional integrations
    └── supabase/  # Supabase implementation
```

## Core Structure

### 1. Toolkit Class
```typescript
export class DocuSignAgentToolkit {
  private tools: Record<string, Tool> = {};

  constructor(
    private provider: DocuSignProvider,
    private config: {
      actions?: Actions;
      context?: {
        account?: string;
        baseUrl?: string;
      };
    }
  ) {
    // Register default tools
    this.registerTool(getEnvelopeDetails);
    this.registerTool(displayPdfViewer);
    // ... other tools
  }

  registerTool(tool: Tool) {
    if (this.isToolAllowed(tool)) {
      this.tools[tool.method] = tool;
    }
  }

  private isToolAllowed(tool: Tool): boolean {
    if (!this.config.actions) return true;
    // Check if tool's required actions are allowed
    return true; // Implement permission check
  }

  getTools(): Record<string, Tool> {
    return this.tools;
  }
}
```

### 2. Provider Interface
```typescript
export interface DocuSignProvider {
  // Core operations
  getResource(type: 'envelope' | 'template' | 'document', id: string): Promise<any>;
  listResources(type: 'envelope' | 'template' | 'document', filters?: any): Promise<any[]>;
  saveResource(type: 'envelope' | 'template' | 'document', data: any): Promise<void>;
}
```

### 3. Tool Structure
```typescript
export interface Tool {
  method: string;      // Method name (e.g., 'displayPdfViewer')
  name: string;        // Display name
  description: string; // Prompt template
  parameters: z.ZodSchema;
  actions: {           // Required permissions
    [resource: string]: {
      [action: string]: boolean;
    };
  };
  execute: (args: any, context: { provider: DocuSignProvider }) => Promise<any>;
}
```

## Tool Implementations

### 1. Display PDF Viewer
```typescript
export const displayPdfViewer: Tool = {
  method: 'displayPdfViewer',
  name: 'Display PDF Viewer',
  description: 'Preview document content',
  parameters: z.object({
    url: z.string()
  }),
  actions: {
    documents: { read: true }
  },
  execute: async ({ url }, { provider }) => ({
    component: PDFViewer,
    props: { url }
  })
};
```

### 2. Get Envelope Details
```typescript
export const getEnvelopeDetails: Tool = {
  method: 'getEnvelopeDetails',
  name: 'Get Envelope Details',
  description: 'Display envelope and document details',
  parameters: z.object({
    envelopeId: z.string(),
    showActions: z.boolean().optional()
  }),
  actions: {
    envelopes: { read: true }
  },
  execute: async ({ envelopeId }, { provider }) => {
    const data = await provider.getResource('envelope', envelopeId);
    return {
      component: EnvelopeDetails,
      props: { data }
    };
  }
};
```

## React Components

### PDF Viewer
```typescript
interface PDFViewerProps {
  url: string;
  height?: string | number;
  scale?: number;
  onError?: (error: LoadError) => void;
  className?: string;
}

export function PDFViewer({ 
  url, 
  height = '750px',
  scale = 1.2,
  onError,
  className 
}: PDFViewerProps) {
  return (
    <div className={className} style={{ height }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          defaultScale={scale}
          onError={onError}
        />
      </Worker>
    </div>
  );
}
```

## Usage in Application

### 1. Setup
```typescript
import { DocuSignAgentToolkit } from '@docusign-agent/core';
import { SupabaseProvider } from '@docusign-agent/integrations/supabase';

// Initialize provider
const provider = new SupabaseProvider(supabaseClient);

// Create toolkit
const toolkit = new DocuSignAgentToolkit(provider, {
  actions: {
    envelopes: { read: true },
    documents: { read: true }
  }
});

// Get tools for AI
const tools = toolkit.getTools();
```

### 2. Use in AI Component
```typescript
export function AIChatComponent() {
  return (
    <AI
      api="/api/chat"
      tools={tools}
      messages={[
        { role: "system", content: "I am a DocuSign assistant..." }
      ]}
    />
  );
}