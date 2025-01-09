**TASK:** Create DocuSign Agent Tools Library

**OBJECTIVE:** Build a companion toolkit that extracts and packages our proven patterns from Agreement Copilot into a reusable library for building AI-powered DocuSign applications with Vercel's AI SDK.

**REQUIRED DELIVERABLES:**

1. New Package Setup:
   - Create new directory `packages/docusign-agent-tools`
   - Set up TypeScript configuration
   - Configure package.json
   - Set up build process
   - Create README.md

2. Extract Core Functionality:
   - Copy and adapt proven patterns from Agreement Copilot
   - Create clean interfaces
   - Add proper TypeScript types
   - Ensure zero app-specific dependencies

3. Documentation Website:
   - Create simple docs site
   - Add installation guide
   - Document each tool/component
   - Show Agreement Copilot examples
   - Include API reference

**TOOLKIT STRUCTURE:**

1. Core Tools:
   ```typescript
   // packages/docusign-agent-tools/src/tools/index.ts
   export const tools = {
     templates: {
       displayTemplateSelector,
       // etc...
     },
     documents: {
       displayPriorityDashboard,
       sendReminder,
       // etc...
     }
   };
   ```

2. Base Components:
   ```typescript
   // packages/docusign-agent-tools/src/components/index.ts
   export {
     TemplatePreview,
     PriorityDashboard,
     ReminderConfirmation,
     // etc...
   };
   ```

3. Utilities:
   ```typescript
   // packages/docusign-agent-tools/src/utils/index.ts
   export {
     createDocuSignAgent,
     useDocuSignAuth,
     // etc...
   };
   ```

**DOCUMENTATION:**

1. Getting Started:
   ```markdown
   # DocuSign Agent Tools

   A toolkit for building AI-powered DocuSign applications with Vercel AI SDK.

   ## Installation
   \`\`\`bash
   npm install @docusign/agent-tools
   \`\`\`

   ## Quick Start
   See our example app: [Agreement Copilot](link-to-repo)
   ```

2. Tool Documentation:
   - Purpose and use cases
   - Installation and setup
   - Basic usage
   - Advanced configuration
   - Example from Agreement Copilot

**EXAMPLE USAGE:**

```typescript
import { createDocuSignAgent } from '@docusign/agent-tools';

// Create an agent with selected tools
const agent = createDocuSignAgent({
  tools: ['templates', 'documents'],
  components: ['preview', 'dashboard']
});

// Use in your Vercel AI SDK app
const runtime = createAI({
  agent,
  // ... config
});
```

**PROOF OF COMPLETION:**

Provide:
1. Working npm package
2. Basic documentation site
3. Clean separation from Agreement Copilot
4. TypeScript types and declarations
5. Example usage in Agreement Copilot

**IMPORTANT:**
- Keep Agreement Copilot as is
- Extract only proven patterns
- Focus on reusability
- Write clear documentation
- Use Agreement Copilot as example

Remember: We're creating a companion toolkit that others can use to build their own AI-powered DocuSign apps, with Agreement Copilot serving as the reference implementation. 