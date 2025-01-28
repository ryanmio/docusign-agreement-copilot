**TASK:** Implement Send Reminder Tool for Agreement Copilot

**OBJECTIVE:** Create a tool that allows users to send reminders for pending DocuSign envelopes through natural language commands in the chat interface, using the `/v2.1/accounts/{accountId}/envelopes/{envelopeId}/reminders` endpoint.

**REQUIRED DELIVERABLES:**

1. Reminder Tool Implementation:
   - Create `sendReminder` tool in `ai/tools.ts`
   - Integrate with DocuSign reminders endpoint
   - Handle authentication and errors
   - Support both single and bulk reminders
   - Add success/failure notifications

2. UI Components:
   - Create `components/reminder-confirmation.tsx`
   - Show reminder status and confirmation
   - Handle error states gracefully
   - Keep it simple but informative

3. DocuSign Integration:
   - Implement reminder API call in `lib/docusign/envelopes.ts`
   - Add proper error handling
   - Include rate limiting consideration
   - Support customizable reminder message

**EXAMPLE INTERACTIONS:**

1. Single Reminder:
   ```
   User: "Send a reminder for the vendor agreement"
   AI: "I'll send a reminder. Here's a preview of the reminder message..."
   [Shows confirmation when sent]
   ```

2. Bulk Reminders:
   ```
   User: "Remind everyone who hasn't signed yet"
   AI: "I'll send reminders to all pending signers..."
   [Shows summary of reminders sent]
   ```

**IMPLEMENTATION STEPS:**

1. Tool Definition:
   ```typescript
   sendReminder: tool({
     description: 'Send a reminder for a DocuSign envelope',
     parameters: z.object({
       envelopeId: z.string(),
       message: z.string().optional()
     }),
     execute: async ({ envelopeId, message }) => {
       // Implementation here
     }
   })
   ```

2. Add Tool Rendering:
   ```typescript
   // In chat page component
   if (toolName === 'sendReminder') {
     return <ReminderConfirmation {...result} />;
   }
   ```

3. Update System Prompt:
   - Add instructions for when to use reminder tool
   - Include example reminder scenarios
   - Define reminder-specific language patterns

**PROOF OF COMPLETION:**

Provide:
1. Working reminder tool implementation
2. UI components for confirmation
3. Example chat interactions
4. Error handling documentation
5. Updated system prompt

**IMPORTANT:**
- Keep the UI simple and clean
- Focus on reliable delivery
- Handle rate limits gracefully
- Provide clear feedback
- Consider bulk reminder scenarios

Remember: This tool should make sending reminders feel effortless while ensuring reliable delivery and clear feedback to users. 