# AI Component Cheat Sheet: Adding New Tools

## Overview
This cheat sheet provides step-by-step instructions for adding new tools to the system. Follow these steps in order, and reference the Vercel AI SDK documentation as needed.

## Prerequisites
1. **Required Dependencies**
```typescript
// package.json
{
  "dependencies": {
    "ai": "latest",    // Vercel AI SDK
    "zod": "^3.0.0",   // For parameter validation
    "@/components/ui": // UI components
  }
}
```

2. **Tool Types**
There are three types of tools you can create:
- **Server-side automatic**: Execute without user interaction
- **Client-side automatic**: Run in the browser without user input
- **User interaction tools**: Require user input (like forms)

3. **Tool States**
Tools can be in one of three states:
- `partial-call`: Tool call is being generated
- `call`: Tool is ready for execution
- `result`: Tool execution is complete

4. **Configuration Check**
```typescript
// app/api/chat/route.ts
import { tools } from '@/ai/tools';

export const runtime = 'edge';

const config = {
  experimental_toolCallStreaming: true,
  tools: tools  // Make sure your tool is added here
};
```

## Adding a New Tool: Two Required Steps

### Step 1: Add Tool to System Prompt
In `app/api/chat/route.ts`, add instructions for when the AI should use your tool:
```typescript
content: `You are a helpful assistant that helps users manage their DocuSign documents and agreements.
// Existing tool instructions...
When users ask about [specific use case], use the [yourNewTool] tool to [action].

// Example:
When users ask about priorities, urgent items, or what needs attention, 
use the displayPriorityDashboard tool to show them a prioritized view 
of their agreements.`
```

### Step 2: Register Tool Implementation
In `app/api/chat/route.ts`, add your tool to the tools object:
```typescript
tools: {
  // Existing tools...
  yourNewTool: tool({
    name: 'yourNewTool',
    description: 'Clear description of what your tool does',
    parameters: z.object({
      // Your tool's parameters
    }),
    execute: async (args) => {
      // Your tool's logic
    }
  })
}
```

IMPORTANT: Both steps are required! The system prompt tells the AI when to use the tool, 
and the tool registration makes it available for use.

## Step 3: Create Tool Component
**File**: `components/your-new-tool.tsx`

1. **For Form-based Tools**:
```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormInstance } from '@/hooks/use-form-instance';
import type { YourToolState } from '@/types/tools';

interface YourNewToolProps {
  toolCallId: string;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onBack?: () => void;
}

export function YourNewTool({ toolCallId, initialData, onSubmit, onBack }: YourNewToolProps) {
  // 1. Use form instance for persistent state
  const { instance, isRestored, updateState } = useFormInstance<YourToolState>(
    toolCallId,
    {
      status: 'initial',
      data: initialData || {},
    }
  );

  // 2. Handle loading state
  if (!isRestored) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  // 3. Get current state
  const { state } = instance;
  
  // 4. Define handlers
  const handleSubmit = async (formData: any) => {
    try {
      // Update state
      updateState({ status: 'submitting' });
      
      // Validate
      const validatedData = validateFormData(formData);
      
      // Submit
      await onSubmit(validatedData);
      
      // Update completion
      updateState({ 
        status: 'complete',
        isComplete: true
      });
    } catch (error) {
      updateState({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Submission failed'
      });
    }
  };

  // 5. Render UI based on state
  return (
    <Card className="p-6">
      {state.status === 'initial' && (
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      )}
      {state.status === 'submitting' && <LoadingSpinner />}
      {state.status === 'complete' && <SuccessMessage />}
      {state.error && <ErrorMessage error={state.error} />}
    </Card>
  );
}
```

2. **For Non-Form Tools**:
```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface YourNewToolProps {
  toolCallId: string;
  data: any;
  onSelect: (selection: any) => Promise<void>;
  onBack?: () => void;
}

export function YourNewTool({ toolCallId, data, onSelect, onBack }: YourNewToolProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSelect = async (selection: any) => {
    try {
      setIsLoading(true);
      await onSelect(selection);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Selection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Selection UI */}
          {error && <ErrorMessage error={error} />}
        </>
      )}
    </Card>
  );
}
```

## Step 4: Add Tool Definition
**File**: `ai/tools.ts`
```typescript
import { tool } from 'ai/rsc';
import { z } from 'zod';
import { YourNewToolParams } from '@/types/tools';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const yourNewTool = tool({
  // 1. Basic Info
  name: 'yourNewTool',
  description: 'Clear description of what your tool does',
  
  // 2. Parameters (must match your type definition)
  parameters: YourNewToolParams,
  
  // 3. Execution Logic
  execute: async (params, { toolCallId }) => {
    try {
      // Handle authentication if needed
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate input
      const validatedData = YourNewToolParams.parse(params);
      
      // Process data
      const result = await processData(validatedData);
      
      // Return result (must match YourNewToolResult type)
      return {
        completed: false, // Set to true only when no more user input needed
        data: result,
        toolCallId
      };
    } catch (error) {
      return {
        completed: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
        toolCallId
      };
    }
  }
});

// Add to tools array
export const tools = [
  recipientFormTool,
  templateSelectorTool,
  yourNewTool,  // Add your tool here
] as const;
```

## Step 5: Add Tool Handler
**File**: `app/chat/page.tsx`
```typescript
import { useCallback } from 'react';
import { useChat } from 'ai/react';
import type { ToolInvocation } from '@/types/tools';
import { YourNewTool } from '@/components/your-new-tool';

export default function ChatPage() {
  // 1. Set up chat with tools
  const { messages, append, handleToolResult } = useChat({
    experimental_toolCallStreaming: true,
    onToolCall: async ({ toolCall }) => {
      // Handle automatic validation here if needed
    }
  });

  // 2. Handle tool invocations
  const handleToolInvocation = useCallback((toolInvocation: ToolInvocation) => {
    const { toolName, toolCallId, state, result } = toolInvocation;

    // Handle states
    if (state === 'error' || result?.error) {
      return <ErrorDisplay error={result?.error || 'Tool error'} />;
    }

    if (state === 'partial-call') {
      return <LoadingState />;
    }

    if (result?.completed) {
      return null;
    }

    // Handle specific tools
    switch (toolName) {
      case 'yourNewTool':
        return (
          <YourNewTool
            toolCallId={toolCallId}
            initialData={result?.data}
            onSubmit={async (data) => {
              try {
                // Update tool result
                await handleToolResult(toolCallId, {
                  ...result,
                  ...data,
                  completed: true
                });
                
                // Add user message
                await append({
                  role: 'user',
                  content: `Action completed: ${data.summary}`
                });
              } catch (error) {
                console.error('Tool error:', error);
                await handleToolResult(toolCallId, {
                  error: error instanceof Error ? error.message : 'Tool execution failed'
                });
              }
            }}
            onBack={async () => {
              try {
                await handleToolResult(toolCallId, {
                  ...result,
                  goBack: true,
                  completed: true
                });
                await append({
                  role: 'user',
                  content: 'go back'
                });
              } catch (error) {
                console.error('Back action failed:', error);
              }
            }}
          />
        );
    }
  }, [handleToolResult, append]);

  // 3. Render chat interface
  return (
    <div className="flex flex-col h-full">
      {messages.map((message) => (
        <div key={message.id}>
          {/* Render message content */}
          {message.content}
          
          {/* Render tool invocations */}
          {message.toolInvocations?.map((toolInvocation) => 
            handleToolInvocation(toolInvocation)
          )}
        </div>
      ))}
    </div>
  );
}
```

## Common Gotchas & Solutions

1. **State Management**
- Always use `useFormInstance` for forms that need state persistence
- Clear form state when component unmounts
- Handle all possible states in the UI
- Use `sessionStorage` with 30-minute expiry for form state:
```typescript
function saveFormState(toolCallId: string, state: FormState) {
  sessionStorage.setItem(`form-${toolCallId}`, JSON.stringify({
    state,
    timestamp: Date.now()
  }));
}

function loadFormState(toolCallId: string): FormState | null {
  const saved = sessionStorage.getItem(`form-${toolCallId}`);
  if (!saved) return null;

  const { state, timestamp } = JSON.parse(saved);
  // Expire after 30 minutes
  if (Date.now() - timestamp > 30 * 60 * 1000) {
    sessionStorage.removeItem(`form-${toolCallId}`);
    return null;
  }
  return state;
}
```

2. **Type Safety**
- Keep types in sync between parameters and results
- Use Zod for runtime validation
- Don't forget to update the ToolResult union type
- Match tool parameters to component props

3. **Authentication**
- Check authentication in tool execution
- Handle expired sessions
- Protect sensitive operations
- Use appropriate auth client based on context (route handler vs component)

4. **Error Handling**
- Always return errors in the expected format
- Show user-friendly error messages
- Log errors for debugging
- Handle all tool states appropriately:
  ```typescript
  if (state === 'partial-call') return <LoadingState />;
  if (state === 'error') return <ErrorDisplay error={error} />;
  if (state === 'result' && result.completed) return null;
  ```

5. **Performance**
- Memoize callbacks and heavy computations
- Clean up subscriptions and intervals
- Consider debouncing form updates
- Use tool streaming for better UX
- Handle race conditions in multi-step flows

## Documentation References
- Tool Definitions: `15-tools-and-tool-calling.mdx`
- State Management: `72-call-tools-multiple-steps.mdx`
- Error Handling: `21-error-handling.mdx`
- Form Patterns: `90-render-visual-interface-in-chat.mdx`

Need more help? Check the full documentation in the Vercel AI SDK docs or ask a senior developer for guidance. 