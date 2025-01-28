**TASK:** Build Priority Dashboard for Agreement Management

**OBJECTIVE:** Create a Priority Dashboard component that shows urgent agreements requiring attention, supporting the "Morning Scramble" moment in our demo where Rachel needs to quickly understand the day's priorities.

**REQUIRED DELIVERABLES:**

1. Priority Dashboard Component:
   - Create `components/priority-dashboard.tsx`
   - Show urgent agreements requiring attention
   - Group by priority level (e.g., "Urgent", "Today", "This Week")
   - Display key metadata (deadline, status, type)
   - Add quick-action buttons for common tasks
   - Include status indicators
   - Ensure mobile responsiveness

2. AI Tool Integration:
   - Add `displayPriorityDashboard` tool in `ai/tools.ts`
   - Implement priority calculation logic
   - Add proper error handling
   - Update system prompt for the new tool

**DEMO FLOW ALIGNMENT:**

This component supports the critical "Morning Scramble" moment:
- User asks "What are the urgent priorities for today?"
- AI displays Priority Dashboard showing:
  - Agreements near deadline
  - Documents awaiting signature
  - Time-sensitive tasks
- User can quickly take action on urgent items

**PROOF OF COMPLETION:**

Please provide:
1. Working Priority Dashboard component with proper styling
2. AI tool implementation
3. Example chat interactions showing priority display
4. Updated documentation in `ai-components.md`

**IMPORTANT:**
- Focus on making the priority display clear and actionable
- Use existing envelope data from Supabase
- Keep the UI simple but impactful
- Maintain consistent styling with other components
- Prioritize features needed for demo flow

Remember: This component needs to immediately orient Rachel to her most urgent tasks, making her feel confident she won't miss anything important. 