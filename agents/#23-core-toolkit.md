**TASK:** Build DocuSign Agent Tools Core (Beta)

**OBJECTIVE:** Create a minimal, focused toolkit that demonstrates AI-powered DocuSign integration patterns using the Vercel AI SDK. No complex dependencies, no real-time requirements, just core DocuSign operations with AI.

**CORE FEATURES ONLY:**
1. View Documents
2. Send Templates
3. Check Status

**IMPLEMENTATION APPROACH:**

1. Basic Setup:
```bash
mkdir docusign-agent-tools-core
cd docusign-agent-tools-core
pnpm init
```

2. Minimal Package Structure:
```
src/
├── auth/
│   └── oauth.ts       # Basic DocuSign OAuth
├── tools/
│   ├── view.ts       # Document viewing
│   ├── send.ts       # Template sending
│   └── status.ts     # Status checking
└── index.ts          # Public API
```

3. Simple Public API:
```typescript
// src/index.ts
export function createDocuSignAgent({
  clientId,
  scopes = ['signature']
}: {
  clientId: string;
  scopes?: string[];
}) {
  return {
    tools: {
      viewDocument,
      sendTemplate,
      checkStatus
    }
  };
}
```

4. Minimal Tool Implementation:
```typescript
// src/tools/view.ts
export const viewDocument = {
  name: 'viewDocument',
  description: 'View a DocuSign document',
  parameters: z.object({
    envelopeId: z.string()
  }),
  execute: async ({ envelopeId }, { docusign }) => {
    const envelope = await docusign.getEnvelope(envelopeId);
    return {
      type: 'document',
      content: envelope
    };
  }
};
```

**PROOF OF CONCEPT APP:**

Create a tiny demo app showing basic usage:
```typescript
// demo/app/api/chat/route.ts
import { createDocuSignAgent } from 'docusign-agent-tools-core';

const agent = createDocuSignAgent({
  clientId: process.env.DOCUSIGN_CLIENT_ID
});

export async function POST(req: Request) {
  // Basic chat implementation
  // Shows document viewing
  // Template sending
  // Status checking
}
```

**REQUIREMENTS:**

1. Zero External Dependencies:
   - No database
   - No complex auth
   - No real-time
   - Just DocuSign + Vercel AI SDK

2. Core Tools Only:
   - viewDocument
   - sendTemplate
   - checkStatus

3. Simple Authentication:
   - Basic DocuSign OAuth
   - No session management
   - Pass through access token

4. Minimal Documentation:
```markdown
# DocuSign Agent Tools Core (Beta)

Minimal toolkit for AI-powered DocuSign operations.

## Install
\`\`\`bash
npm install docusign-agent-tools-core
\`\`\`

## Usage
\`\`\`typescript
import { createDocuSignAgent } from 'docusign-agent-tools-core';

const agent = createDocuSignAgent({
  clientId: 'your-client-id'
});
\`\`\`
```

**IMPORTANT CONSTRAINTS:**
- No complex features
- No real-time updates
- No state management
- No UI components
- Just core DocuSign operations

**DELIVERABLES:**

1. Working NPM Package:
   - Core tools implemented
   - TypeScript types
   - Basic documentation

2. Tiny Demo App:
   - Shows basic usage
   - Minimal chat interface
   - Document operations only

3. Documentation:
   - Installation guide
   - Basic usage examples
   - API reference

**PROOF OF COMPLETION:**

Provide:
1. Working package
2. Simple demo app
3. Basic documentation
4. Usage examples

Remember: This is a proof of concept to demonstrate the potential of AI-powered DocuSign tools. Keep it extremely focused and simple. 