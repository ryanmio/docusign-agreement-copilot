**TASK:** Make existing UI components accessible to the AI chat system

**OBJECTIVE:** Create AI tools and wrappers for the template selector, envelope list, and bulk operations list components so they can be rendered through chat commands. This will allow users to request and view these components through natural language.

**REQUIRED DELIVERABLES:**

1. Template Selection Tool:
   - Create `displayTemplateSelector` tool in `ai/tools.ts`
   - Add proper TypeScript types and parameters
   - Implement tool execution function that fetches templates
   - Add chat message rendering support
   - Document usage in `ai-components.md`

2. Envelope List Tool:
   - Create `displayEnvelopeList` tool
   - Add filtering parameters (recent, status, date range)
   - Implement data fetching from Supabase
   - Add chat message rendering support
   - Document usage and examples

3. Bulk Operations List Tool:
   - Create `displayBulkOperationsList` tool
   - Add status and filtering parameters
   - Implement data fetching logic
   - Add chat message rendering support
   - Document component dependencies

**PROOF OF COMPLETION:**

Please provide:
1. Updated `ai/tools.ts` with new tool definitions
2. Updated chat message rendering code showing new components
3. Example chat interactions demonstrating each new tool
4. Updated `ai-components.md` documentation
5. TypeScript types for all new tools

**Next agent will handle:**
- Adding search and filtering capabilities to components
- Implementing multi-step workflows (e.g., select template then add recipients)
- Adding context awareness about user's recent actions
- Improving error handling and user feedback

**IMPORTANT:**
- Maintain existing component functionality while adding AI capabilities
- Ensure proper error handling for invalid requests
- Keep TypeScript types strict and well-documented
- Follow existing patterns from `displayDocumentDetails` implementation 