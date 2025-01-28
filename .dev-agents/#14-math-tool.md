**TASK:** Implement Math Tool for Agreement Copilot

**OBJECTIVE:** Create a math tool that can handle numerical calculations in our chat interface, following Vercel's recommended patterns and integrating with our existing tool system.

**REQUIRED DELIVERABLES:**

1. Math Tool Implementation:
   - Create `calculateMath` tool in `ai/tools.ts`
   - Follow Vercel's recommended implementation
   - Support basic arithmetic operations
   - Handle complex calculations
   - Provide clear error messages

2. UI Components:
   - Create `components/math-result.tsx`
   - Show calculation and result
   - Support step-by-step display if needed
   - Handle error states gracefully

3. Tool Integration:
   - Add proper TypeScript types
   - Update system prompt
   - Add rendering logic in chat
   - Document usage patterns

**EXAMPLE INTERACTIONS:**

1. Basic Calculations:
   ```
   User: "Calculate 5% of $150,000 for the vendor increase"
   AI: Shows calculation: "$150,000 × 0.05 = $7,500"
   ```

2. Contract Math:
   ```
   User: "What's the total value of all vendor renewals?"
   AI: Shows itemized calculation with total
   ```

**IMPLEMENTATION STEPS:**

1. Tool Definition:
   ```typescript
   calculateMath: tool({
     description: 'Perform mathematical calculations',
     parameters: z.object({
       expression: z.string(),
       showSteps: z.boolean().optional()
     }),
     execute: async ({ expression, showSteps }) => {
       // Implementation following Vercel's pattern
     }
   })
   ```

2. Add Tool Rendering:
   ```typescript
   if (toolName === 'calculateMath') {
     return <MathResult {...result} />;
   }
   ```

3. Update System Prompt:
   - Add math-specific instructions
   - Include calculation examples
   - Define when to use math tool

**PROOF OF COMPLETION:**

Provide:
1. Working math tool implementation
2. UI component for results
3. Example calculations
4. Error handling documentation
5. Updated system prompt

**IMPORTANT:**
- Follow Vercel's recommended patterns
- Keep calculations accurate
- Handle edge cases gracefully
- Format numbers appropriately
- Consider financial calculations

Remember: The math tool should make contract-related calculations easy and reliable, with clear presentation of results. 