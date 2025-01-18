# DocuSign Agent Tools Library

## Overview
A modular, reusable library for building DocuSign-powered applications with AI capabilities. The library provides core DocuSign operations, React hooks and components, and AI tool definitions.

## Package Structure
```
@docusign-agent/
├── core/                 # Core DocuSign operations & types
│   ├── types/           # Shared TypeScript types
│   ├── client/          # DocuSign API client
│   └── providers/       # Data provider interfaces
├── react/               # React hooks & components
│   ├── hooks/           # Data fetching hooks
│   └── components/      # UI components
├── ai/                  # AI tool definitions
│   ├── tools/           # Individual tool definitions
│   └── toolkit/         # Tool composition
└── integrations/        # Optional integrations
    └── supabase/       # Supabase provider implementation
```

## Data Provider Pattern

### 1. Provider Interfaces (@docusign-agent/core)
```typescript
// providers/envelope.ts
export interface EnvelopeProvider {
  // Core envelope operations
  getEnvelope(id: string): Promise<EnvelopeData>;
  listEnvelopes(filters?: EnvelopeFilters): Promise<EnvelopeData[]>;
  saveEnvelope(data: EnvelopeData): Promise<void>;
  
  // Document operations
  listDocuments(envelopeId: string): Promise<DocumentData[]>;
  getDocument(envelopeId: string, documentId: string): Promise<DocumentData>;
  
  // Recipient operations
  listRecipients(envelopeId: string): Promise<RecipientData[]>;
  updateRecipient(envelopeId: string, recipientId: string, data: RecipientData): Promise<void>;
}

// providers/auth.ts
export interface AuthProvider {
  getCurrentUser(): Promise<UserData | null>;
  getAccessToken(): Promise<string>;
}

// providers/template.ts
export interface TemplateProvider {
  listTemplates(): Promise<TemplateData[]>;
  getTemplate(templateId: string): Promise<TemplateData>;
}
```

### 2. Supabase Implementation (@docusign-agent/integrations/supabase)
```typescript
// providers/SupabaseEnvelopeProvider.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EnvelopeProvider } from '@docusign-agent/core';

export class SupabaseEnvelopeProvider implements EnvelopeProvider {
  constructor(private supabase: SupabaseClient) {}

  async getEnvelope(id: string): Promise<EnvelopeData> {
    const { data, error } = await this.supabase
      .from('envelopes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error('Failed to fetch envelope');
    return this.mapToEnvelopeData(data);
  }

  // ... implement other methods
}
```

### 3. Core Operations with Providers
```typescript
// operations/envelopes.ts
export class EnvelopeOperations {
  constructor(
    private client: DocuSignClient,
    private provider: EnvelopeProvider
  ) {}

  async getEnvelopeDetails(id: string): Promise<EnvelopeDetails> {
    const envelope = await this.provider.getEnvelope(id);
    const documents = await this.provider.listDocuments(id);
    const recipients = await this.provider.listRecipients(id);

    return {
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      created: envelope.createdDateTime,
      sent: envelope.sentDateTime,
      documents,
      recipients
    };
  }
}
```

### 4. React Hooks with Provider Context
```typescript
// hooks/useEnvelopeDetails.ts
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProviderContext } from '../context';

export const useEnvelopeDetails = (
  envelopeId: string,
  options?: {
    onError?: (error: Error) => void;
    onSuccess?: (data: EnvelopeDetails) => void;
  }
) => {
  const { envelopeProvider, docusignClient } = useContext(ProviderContext);
  const operations = new EnvelopeOperations(docusignClient, envelopeProvider);

  return useQuery({
    queryKey: ['envelope', envelopeId],
    queryFn: () => operations.getEnvelopeDetails(envelopeId),
    ...options
  });
};
```

### 5. AI Tools with Provider Support
```typescript
// tools/getEnvelopeDetails.ts
export const getEnvelopeDetails: Tool<EnvelopeProvider> = {
  name: 'getEnvelopeDetails',
  description: 'Retrieve and display detailed information about a document envelope',
  parameters: z.object({
    envelopeId: z.string(),
    showActions: z.boolean().optional()
  }),
  execute: async ({ envelopeId, showActions }, { client, provider }) => {
    const operations = new EnvelopeOperations(client, provider);
    return operations.getEnvelopeDetails(envelopeId);
  }
};
```

## Migration Plan for Agreement Copilot

### 1. Install New Packages
```bash
npm install @docusign-agent/core @docusign-agent/react @docusign-agent/ai @docusign-agent/integrations-supabase
```

### 2. Configure Providers
```typescript
// app/providers.tsx
import { SupabaseEnvelopeProvider } from '@docusign-agent/integrations-supabase';
import { ProviderContext } from '@docusign-agent/react';

export function Providers({ children }) {
  const supabase = createClientComponentClient();
  const provider = new SupabaseEnvelopeProvider(supabase);

  return (
    <ProviderContext.Provider value={{ provider }}>
      {children}
    </ProviderContext.Provider>
  );
}
```

### 3. Update Tool Usage
```typescript
// ai/tools.ts
import { getEnvelopeDetails } from '@docusign-agent/ai';
import { EnvelopeDetailsView } from '@docusign-agent/react';

export const tools = {
  getEnvelopeDetails: {
    ...getEnvelopeDetails,
    execute: async (args, { client, provider }) => {
      const result = await getEnvelopeDetails.execute(args, { client, provider });
      return {
        component: EnvelopeDetailsView,
        props: {
          ...result,
          showActions: args.showActions
        }
      };
    }
  }
};
```
