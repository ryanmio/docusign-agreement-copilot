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
- **Server-side chat tools**: Execute during AI chat completion (in route.ts)
- **Client-side UI tools**: Called directly by components (in tools.ts)
- **User interaction tools**: Can exist in either context, requiring user input (like forms)

3. **Tool States**
Tools can be in one of three states:
- `partial-call`: Tool call is being generated
- `call`: Tool is ready for execution
- `result`: Tool execution is complete

4. **Configuration Example**
```typescript
// app/api/chat/route.ts
const result = streamText({
  model: openai('gpt-4o'),
  maxSteps: 10,
  experimental_toolCallStreaming: true,
  messages: [
    {
      role: 'system',
      content: `You are a helpful assistant that helps users manage their Docusign documents and agreements.

      IMPORTANT RULES FOR TOOL USAGE:
      1. Always explain what you're going to do BEFORE calling any tool
      2. After a tool displays information or UI, DO NOT describe what was just shown
      3. Only provide next steps or ask for specific actions
      4. Never repeat information that a tool has displayed`
    },
    ...messages
  ],
  tools: {
    // Tools defined here
  }
});
```

## Understanding Tool Patterns

### 1. Server-Side Chat Tools
- **Location**: `app/api/chat/route.ts`
- **Purpose**: Used by AI during chat completion
- **Auth**: Uses `createRouteHandlerClient`
- **Format**: Uses `tool()` wrapper
- **Example**:
```typescript
// app/api/chat/route.ts
const result = streamText({
  model: openai('gpt-4o'),
  maxSteps: 10,
  experimental_toolCallStreaming: true,
  messages: [...],
  tools: {
    calculateMath: tool({
      description: '...',
      parameters: z.object({...}),
      execute: async (args) => {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        // Server-side execution
      }
    })
  }
});
```

### 2. Client-Side UI Tools
- **Location**: `ai/tools.ts`
- **Purpose**: Direct component interactions
- **Auth**: Uses `createClientComponentClient`
- **Format**: Direct object without tool wrapper
- **Example**:
```typescript
// ai/tools.ts
export const tools = {
  // Existing tools...
  yourNewTool: {
    // 1. Basic Info
    name: 'yourNewTool',
    description: 'Clear description of what your tool does',
    
    // 2. Parameters (must match your type definition)
    parameters: YourNewToolParams,
    
    // 3. Execution Logic
    execute: async (params) => {
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
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Tool execution failed'
        };
      }
    }
  }
} as const;
```

### 3. Dual-Location Tools
Some tools may need to exist in both locations because they:
- Serve different contexts (AI chat vs direct UI)
- Use different auth methods
- Have similar functionality but different implementations
- Example: displayDocumentDetails exists in both places with different auth

## Adding a New Tool: Required Steps

### Step 1: Determine Tool Location
Decide where your tool belongs based on its purpose:
- AI chat interaction → `route.ts`
- Direct UI interaction → `tools.ts`
- Both contexts → Implement in both files

### Step 2: Add Tool to System Prompt
If it's a chat tool, add instructions in `app/api/chat/route.ts`:
```typescript
content: `You are a helpful assistant that helps users manage their DocuSign documents and agreements.
// Existing tool instructions...
When users ask about [specific use case], use the [yourNewTool] tool to [action].`
```

### Step 3: Implement Tool
In the appropriate file(s):
```typescript
yourNewTool: tool({
  description: 'Clear description of what your tool does',
  parameters: z.object({
    // Your tool's parameters
  }),
  execute: async (args) => {
    // Your tool's logic with appropriate auth client
  }
})
```

### Step 4: Create Tool Component
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

### Step 5: Add Tool Definition
**File**: `ai/tools.ts`
```typescript
import { z } from 'zod';
import { YourNewToolParams } from '@/types/tools';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const tools = {
  // Existing tools...
  yourNewTool: {
    // 1. Basic Info
    name: 'yourNewTool',
    description: 'Clear description of what your tool does',
    
    // 2. Parameters (must match your type definition)
    parameters: YourNewToolParams,
    
    // 3. Execution Logic
    execute: async (params) => {
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
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Tool execution failed'
        };
      }
    }
  }
} as const;
```

### Step 6: Add Tool Handler
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
    const { toolName, toolCallId, state } = toolInvocation;

    switch (toolName) {
      case 'yourNewTool':
        return (
          <YourNewTool
            toolCallId={toolCallId}
            data={state.data}
            onSubmit={async (data) => {
              await handleToolResult(toolCallId, data);
            }}
          />
        );
      // ... other tool cases
    }
  }, [handleToolResult]);

  return (
    <div>
      {messages.map((message) => (
        // ... message rendering
      ))}
      {/* Tool invocation handling */}
      {currentToolInvocation && handleToolInvocation(currentToolInvocation)}
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