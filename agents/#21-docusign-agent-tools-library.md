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
└── supabase/           # Supabase integration
```

## Data Provider Pattern

### 1. Provider Interfaces (@docusign-agent/core)
```typescript
// providers/envelope.ts
export interface EnvelopeProvider {
  getEnvelope(envelopeId: string): Promise<EnvelopeData>;
  listDocuments(envelopeId: string): Promise<DocumentData[]>;
  listRecipients(envelopeId: string): Promise<RecipientData[]>;
  saveEnvelope(envelope: EnvelopeData): Promise<void>;
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

### 2. Supabase Implementation (@docusign-agent/supabase)
```typescript
// SupabaseEnvelopeProvider.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EnvelopeProvider } from '@docusign-agent/core';

export class SupabaseEnvelopeProvider implements EnvelopeProvider {
  constructor(private supabase = createClientComponentClient()) {}

  async getEnvelope(envelopeId: string): Promise<EnvelopeData> {
    const { data, error } = await this.supabase
      .from('envelopes')
      .select('*, recipients(*)')
      .eq('id', envelopeId)
      .single();
    
    if (error) throw new Error('Failed to fetch envelope');
    return this.mapToEnvelopeData(data);
  }
}

// SupabaseAuthProvider.ts
export class SupabaseAuthProvider implements AuthProvider {
  constructor(private supabase = createClientComponentClient()) {}

  async getCurrentUser(): Promise<UserData | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw new Error('Failed to get user');
    return user ? this.mapToUserData(user) : null;
  }
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

  async getEnvelopeDetails(envelopeId: string): Promise<EnvelopeDetails> {
    const envelope = await this.provider.getEnvelope(envelopeId);
    const documents = await this.provider.listDocuments(envelopeId);
    const recipients = await this.provider.listRecipients(envelopeId);

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
npm install @docusign-agent/core @docusign-agent/react @docusign-agent/ai @docusign-agent/supabase
```

### 2. Configure Providers
```typescript
// app/providers.tsx
import { SupabaseEnvelopeProvider, SupabaseAuthProvider } from '@docusign-agent/supabase';
import { ProviderContext } from '@docusign-agent/react';

export function Providers({ children }) {
  const envelopeProvider = new SupabaseEnvelopeProvider();
  const authProvider = new SupabaseAuthProvider();

  return (
    <ProviderContext.Provider value={{ envelopeProvider, authProvider }}>
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
import { SupabaseEnvelopeProvider } from '@docusign-agent/supabase';

const provider = new SupabaseEnvelopeProvider();

export const tools = {
  getEnvelopeDetails: {
    ...getEnvelopeDetails,
    execute: async (args, { client }) => {
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

## Complexity Assessment

### Effort Required: 3-4 days

1. **Core Package & Providers (1 day)**
   - Define provider interfaces
   - Implement core operations
   - Write types

2. **React Package (1-2 days)**
   - Create provider context
   - Update hooks for provider support
   - Build UI components

3. **AI Package (0.5 days)**
   - Update tool interfaces for providers
   - Implement tool executors

4. **Supabase Integration (0.5 days)**
   - Implement provider classes
   - Update Agreement Copilot

### Key Benefits
1. Clean separation from Supabase
2. Reusable components
3. Better type safety
4. Simplified maintenance

Would you like me to:
1. Detail the implementation for another tool?
2. Create a more detailed timeline?
3. Start implementing the core package?
