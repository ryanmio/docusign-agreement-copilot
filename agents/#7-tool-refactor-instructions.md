TASK: Refactor AI Tools from Route Handler to Dedicated Tools Module

OBJECTIVE:
Reorganize the AI tools implementation by moving them from the route handler to a dedicated tools module. This refactoring will improve code organization, maintainability, and follow the template's intended architecture. The goal is to have a clean separation between routing logic and tool implementations.

REQUIRED DELIVERABLES:

1. Tool Implementation Migration:
- Move all tool implementations from `app/api/chat/route.ts` to `ai/tools.ts`
- Ensure all tool interfaces and types are properly defined in `ai/tools.ts`
- Maintain existing functionality while improving code organization
- Add proper error handling and logging in the tools module

2. Route Handler Cleanup:
- Remove tool implementations from `route.ts`
- Import tools from `ai/tools.ts`
- Keep only routing logic and tool invocations in `route.ts`
- Ensure proper error handling for tool invocations

3. Documentation and Type Safety:
- Add JSDoc comments for each tool implementation
- Ensure proper TypeScript types for all tool parameters and returns
- Document any shared utilities or helpers
- Add inline comments explaining complex logic

PROOF OF COMPLETION:
Please provide:
1. Successfully moved tool implementations with all tests passing
2. Clean route handler that only handles routing and tool invocations
3. Proper TypeScript types and documentation
4. No regression in existing functionality

Next agent will handle:
- Adding unit tests for the refactored tools
- Implementing additional error handling if needed
- Adding performance monitoring
- Creating documentation for tool usage

IMPORTANT:
- Do not change tool functionality during refactoring
- Maintain backward compatibility for all tools
- Keep the same tool parameter schemas
- Preserve all existing logging and error handling

-------------------

👋 Hello from Agent 8 (Priority Dashboard Implementation)!

I just completed implementing the priority dashboard filtering logic, and I wanted to share some helpful information to make your refactoring task smoother. Here's what I've learned about our project structure!

TECHNICAL HANDOFF NOTES:

1. Project Structure:
- `app/api/chat/route.ts` - Currently contains all tool implementations
- `ai/tools.ts` - Target file for tool implementations
- `components/` - Contains React components used by tools
- `lib/` - Contains shared utilities and API clients

2. Existing Patterns:
- Tools use `zod` for parameter validation
- Each tool has a description and typed parameters
- Tools follow the pattern: `toolName: tool({ description, parameters, execute })`
- Many tools require Supabase and DocuSign client initialization

3. Key Files to Reference:
- `lib/docusign/envelopes.ts` - DocuSign API client
- `components/priority-dashboard.tsx` - Example of tool UI component
- `ai/tools.ts` - Current tools implementation

4. Helpful Code Patterns:
```typescript
// Tool implementation pattern
const toolName = tool({
  description: 'Tool description',
  parameters: z.object({
    param1: z.string().describe('Parameter description')
  }),
  execute: async ({ param1 }) => {
    // Implementation
  }
});

// Client initialization pattern
const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
const docusign = new DocuSignEnvelopes(supabase);
```

5. Development Tips:
- Keep error handling consistent across tools
- Use the existing logging patterns
- Maintain type safety throughout the refactor
- Test each tool after moving it

6. Gotchas We Found:
- Some tools require cookie store access
- Tools may have interdependencies
- Type definitions might need to be exported
- Some tools use shared utility functions

I'm excited to see how the refactoring improves our codebase! The priority dashboard implementation has shown us the importance of clean tool organization. Good luck! 🚀

Best regards,
Agent 8 🎯 📊 ⚡️

Note: Pay special attention to the authentication handling in tools, as many require access to the Supabase session. 