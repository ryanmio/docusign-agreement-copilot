# Guide: Extracting DocuSign Agent Tools to Library

## Overview
This guide outlines the step-by-step process for extracting our current implementation into a reusable library structure. For architecture decisions and tool patterns, refer to `#21-docusign-agent-tools-library.md` and `#21-agent-tools-report.md`.

## Migration Steps

### Phase 1: Setup Library Structure (1 hour)
1. Create new repository `docusign-agent`
2. Initialize package structure:
```
@docusign-agent/
├── core/           # Tools and toolkit
├── react/          # Components
└── integrations/   # Supabase implementation
```
3. Set up TypeScript, ESLint, and build configs
4. Create placeholder README and documentation

### Phase 2: Extract Core Tools (2 hours)
1. Create base types from current implementation:
```typescript
// From chat/page.tsx handleToolInvocation
type ToolName = 
  | 'displayPdfViewer'
  | 'displayDocumentDetails'
  | 'displayTemplateSelector'
  // ... other tool names
```

2. Extract tool definitions:
- Move each case from `handleToolInvocation` to individual tool files
- Add proper typing and validation
- Example:
```typescript
// core/tools/displayPdfViewer.ts
export const displayPdfViewer: Tool = {
  method: 'displayPdfViewer',
  name: 'Display PDF Viewer',
  description: 'Preview document content',
  parameters: z.object({
    url: z.string()
  }),
  actions: {
    documents: { read: true }
  }
};
```

### Phase 2.5: Status Provider Pattern (1.5 hours)
1. Create base interfaces for status tracking:
```typescript
// core/providers/status.ts
export interface EnvelopeStatus {
  envelopeId: string;
  status: string;
  recipients: Array<{
    email: string;
    name: string;
    status: string;
  }>;
  lastUpdated: Date;
}

export interface StatusProvider {
  subscribe(envelopeId: string): Observable<EnvelopeStatus>;
  getStatus(envelopeId: string): Promise<EnvelopeStatus>;
  getStatuses(filters: StatusFilter): Promise<EnvelopeStatus[]>;
}

export interface StatusFilter {
  status?: string[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}
```

2. Create Supabase implementation:
```typescript
// integrations/supabase/SupabaseStatusProvider.ts
export class SupabaseStatusProvider implements StatusProvider {
  constructor(private supabase: SupabaseClient) {}

  subscribe(envelopeId: string): Observable<EnvelopeStatus> {
    return new Observable(subscriber => {
      // Initial fetch
      this.getStatus(envelopeId).then(status => subscriber.next(status));
      
      // Real-time subscription
      const subscription = this.supabase
        .channel('envelope-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'envelopes',
          filter: `docusign_envelope_id=eq.${envelopeId}`
        }, 
        payload => {
          this.getStatus(envelopeId).then(status => subscriber.next(status));
        })
        .subscribe();

      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  async getStatus(envelopeId: string): Promise<EnvelopeStatus> {
    const { data, error } = await this.supabase
      .from('envelopes')
      .select('*, recipients(*)')
      .eq('docusign_envelope_id', envelopeId)
      .single();

    if (error) throw error;
    return this.mapToEnvelopeStatus(data);
  }

  async getStatuses(filters: StatusFilter): Promise<EnvelopeStatus[]> {
    let query = this.supabase
      .from('envelopes')
      .select('*, recipients(*)');

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    // ... other filters

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.mapToEnvelopeStatus);
  }

  private mapToEnvelopeStatus(data: any): EnvelopeStatus {
    return {
      envelopeId: data.docusign_envelope_id,
      status: data.status,
      recipients: data.recipients,
      lastUpdated: new Date(data.updated_at)
    };
  }
}
```

3. Create polling fallback:
```typescript
// integrations/polling/PollingStatusProvider.ts
export class PollingStatusProvider implements StatusProvider {
  constructor(
    private client: DocuSignClient,
    private pollInterval: number = 5000
  ) {}

  subscribe(envelopeId: string): Observable<EnvelopeStatus> {
    return new Observable(subscriber => {
      const poll = async () => {
        try {
          const status = await this.getStatus(envelopeId);
          subscriber.next(status);
        } catch (error) {
          subscriber.error(error);
        }
      };

      // Initial poll
      poll();
      
      // Set up polling interval
      const interval = setInterval(poll, this.pollInterval);

      // Cleanup
      return () => clearInterval(interval);
    });
  }

  async getStatus(envelopeId: string): Promise<EnvelopeStatus> {
    const envelope = await this.client.envelopes.get(envelopeId);
    return this.mapToEnvelopeStatus(envelope);
  }

  // ... implementation
}
```

4. Update React components to use provider:
```typescript
// react/hooks/useEnvelopeStatus.ts
export function useEnvelopeStatus(envelopeId: string) {
  const provider = useStatusProvider();
  const [status, setStatus] = useState<EnvelopeStatus>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const subscription = provider
      .subscribe(envelopeId)
      .subscribe({
        next: setStatus,
        error: setError
      });

    return () => subscription.unsubscribe();
  }, [envelopeId, provider]);

  return { status, error };
}
```

5. Create provider context:
```typescript
// react/context/StatusProviderContext.tsx
const StatusProviderContext = createContext<StatusProvider>(
  new PollingStatusProvider(defaultClient)
);

export function StatusProviderProvider({
  provider,
  children
}: {
  provider: StatusProvider;
  children: React.ReactNode;
}) {
  return (
    <StatusProviderContext.Provider value={provider}>
      {children}
    </StatusProviderContext.Provider>
  );
}

export function useStatusProvider() {
  return useContext(StatusProviderContext);
}
```

### Phase 3: Extract React Components (3 hours)
1. Move each component to `@docusign-agent/react`:
```typescript
// From current components/pdf-viewer.tsx
// To @docusign-agent/react/components/PDFViewer.tsx
```

2. Create hooks for data fetching:
```typescript
// react/hooks/useToolRenderer.ts
export const useToolRenderer = ({
  onToolResult,
  onAppend
}: ToolRendererProps) => {
  return useCallback((toolInvocation) => {
    // Extract logic from page.tsx handleToolInvocation
  }, [onToolResult, onAppend]);
};
```

3. Create base components for common patterns:
```typescript
// react/components/ToolRenderer.tsx
export const ToolRenderer: React.FC<{
  toolInvocation: ToolInvocation;
  onToolResult: (id: string, result: any) => Promise<void>;
  onAppend: (message: Message) => Promise<void>;
}>;
```

### Phase 4: Extract Data Layer (2 hours)
1. Create provider interface (see `#21-docusign-agent-tools-library.md`)
2. Move Supabase implementation to `integrations/supabase`
3. Create test provider for development:
```typescript
// core/testing/MockProvider.ts
export class MockProvider implements DocuSignProvider {
  async getResource(type, id) {
    // Return mock data
  }
  // ... other methods
}
```

### Phase 5: Migration & Documentation (4 hours)
1. Set up local package linking:
```bash
# In docusign-agent library
npm link

# In your current app
npm link @docusign-agent/core @docusign-agent/react @docusign-agent/integrations
```

2. Create toolkit initialization:
```typescript
// lib/docusign-agent.ts
import { DocuSignAgentToolkit } from '@docusign-agent/core';
import { SupabaseProvider } from '@docusign-agent/integrations/supabase';

export const toolkit = new DocuSignAgentToolkit(
  new SupabaseProvider(supabaseClient),
  {
    actions: {
      envelopes: { read: true },
      documents: { read: true }
    }
  }
);
```

3. Migrate tools case by case:

```typescript
// Step 1: Move tool definition to library
// @docusign-agent/core/tools/displayPdfViewer.ts
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
  execute: async ({url}, {provider}) => ({
    component: PDFViewer,
    props: { url }
  })
};

// Step 2: Update chat/page.tsx tool handling
// Before:
case 'displayPdfViewer':
  return (
    <div className="h-[750px] border border-gray-300 rounded-lg">
      <PDFViewer {...toolInvocation.result} />
    </div>
  );

// After:
// The tool handling is now managed by useToolRenderer
const handleToolInvocation = useToolRenderer({
  onToolResult: handleToolResult,
  onAppend: append,
  tools: toolkit.getTools() // This includes all registered tools
});

// Step 3: Update API route
// Before (api/chat/route.ts):
const tools = {
  displayPdfViewer: async ({url}) => {
    // ... implementation
  }
};

// After:
import { toolkit } from '@/lib/docusign-agent';
const tools = toolkit.getTools();
```

4. Migration order for tools:
   a. Simple viewer tools first:
      - `displayPdfViewer`
      - `displayDocumentDetails`
      - `displayTemplateSelector`
   
   b. Interactive tools next:
      - `collectRecipients`
      - `signDocument`
      - `sendReminder`
   
   c. Complex tools last:
      - `navigatorAnalysis`
      - `displayContractPreview`
      - `displayPriorityDashboard`

5. For each tool:
   - Move component to library
   - Move tool definition to library
   - Update API implementation
   - Test the migration
   - Document any special handling

6. Migrate components systematically:
```typescript
// Before: import { PDFViewer } from '@/components/pdf-viewer'
// After:  import { PDFViewer } from '@docusign-agent/react'

// Before: import { DocumentView } from '@/components/document-view'
// After:  import { DocumentView } from '@docusign-agent/react'
```

7. Document integration points:
```typescript
/**
 * Key integration points:
 * 1. Toolkit initialization (lib/docusign-agent.ts)
 * 2. Tool rendering (chat/page.tsx)
 * 3. Component usage (throughout app)
 * 4. Provider implementation (if using Supabase)
 */
```

8. Test and validate:
- Run the app with new library
- Verify all tools work as before
- Test error handling
- Check typing and validation

## Testing Strategy
1. Unit tests for each tool
2. Component tests for React components
3. Integration tests for provider implementations
4. E2E test with demo app

## Validation Steps
1. Run current app with extracted library
2. Verify all tools work as before
3. Test error handling
4. Check typing and validation
5. Verify build process

## Timeline
- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 3 hours
- Phase 4: 2 hours
- Phase 5: 4 hours (Migration & Documentation)
Total: ~12 hours with testing

## Notes
- Use TypeScript paths to test locally before publishing
- Migrate one component at a time, testing each
- Keep error boundaries in React components
- Document integration points as we migrate
- Start with simpler tools (like PDFViewer) before complex ones 