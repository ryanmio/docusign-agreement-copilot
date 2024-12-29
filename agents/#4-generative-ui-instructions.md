**TASK:** Make existing UI components accessible to the AI chat system

**OBJECTIVE:** Create AI tools and wrappers for the template selector, envelope list, and bulk operations list components so they can be rendered through chat commands. This will allow users to request and view these components through natural language.

**PROCESS FOR ADDING NEW TOOLS:**

1. Component Requirements:
   - Ensure the UI component exists and works standalone (e.g., `components/template-selector.tsx`)
   - Component should handle its own loading states, error states, and user interactions
   - Component should accept clear props for configuration

2. Add Tool Definition in `app/api/chat/route.ts`:
   ```typescript
   displayNewTool: tool({
     description: 'Clear description of what the tool does',
     parameters: z.object({
       // Define required and optional parameters
       requiredParam: z.string().describe('Parameter description'),
       optionalParam: z.boolean().optional().describe('Optional parameter description')
     }),
     execute: async ({ requiredParam, optionalParam }) => {
       try {
         // Authentication
         const cookieStore = cookies();
         const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
         if (sessionError || !session?.user) {
           throw new Error('User not authenticated');
         }

         // Data fetching
         // Add your data fetching logic here

         // Return data for the component
         return {
           // Match the props your component expects
         };
       } catch (error) {
         console.error('Error in displayNewTool:', error);
         throw error;
       }
     }
   })
   ```

3. Update System Prompt in `app/api/chat/route.ts`:
   ```typescript
   content: `You are a helpful assistant that helps users manage their DocuSign documents and agreements.
   // Add instruction for when to use your new tool
   When users want [specific action], use the displayNewTool tool.
   Always use the appropriate tool to display information rather than just describing it.`
   ```

4. Add Tool Rendering in `app/chat/page.tsx`:
   ```typescript
   if (toolName === 'displayNewTool') {
     const { result } = toolInvocation;
     return (
       <div key={toolCallId}>
         <YourComponent {...result} />
       </div>
     );
   }
   ```

5. Document Usage in `docs/ai-components.md`:
   - Tool description and purpose
   - Parameters and their usage
   - Example chat interactions
   - Technical details and dependencies

**KEY LEARNINGS:**
1. The tool must be registered in THREE places:
   - Tool definition in the tools object
   - System prompt instructions
   - Chat page rendering logic
2. Order matters: Add the tool definition before updating the system prompt
3. Tool parameters should match component props
4. Always include error handling and authentication checks
5. Restart the chat session after making changes

**PROOF OF COMPLETION:**
- Tool is registered in `app/api/chat/route.ts`
- System prompt includes instructions for the tool
- Component renders correctly in chat interface
- Users can invoke the tool through natural language

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