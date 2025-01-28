# Multi-step Tool Implementation Guide for Vercel AI SDK

## Overview

This guide provides a comprehensive approach to implementing multi-step tools in a chat interface using the Vercel AI SDK, with a specific focus on form handling and state management. The implementation patterns described here are based on extensive review of the Vercel AI SDK documentation and cookbook examples.

## Core Concepts

### 1. Tool Architecture
- Tools are functions with three key elements:
  - Description: Guides the AI in tool selection
  - Parameters: Zod schema for validation
  - Execute function: Handles tool logic

### 2. Tool Types
1. Server-side automatic tools
2. Client-side automatic tools
3. User interaction tools (like forms)

### 3. Tool States
- `partial-call`: Tool call being generated
- `call`: Tool ready for execution
- `result`: Tool execution complete

## Implementation Guide

### 1. Form Tool Definition

```typescript
// ai/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export const recipientFormTool = tool({
  description: 'Collect and validate recipient information for document signing',
  parameters: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    role: z.enum(['signer', 'cc', 'viewer']),
    // add other fields as needed
  }),
  execute: async (args, { toolCallId }) => {
    try {
      // Validate input
      const validatedData = await validateRecipientData(args);
      
      // Process data
      const processedData = await processRecipientData(validatedData);
      
      return {
        success: true,
        data: processedData,
        toolCallId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        toolCallId
      };
    }
  }
});
```

### 2. Form Components

```typescript
// components/recipient-form.tsx
interface RecipientFormProps {
  toolCallId: string;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
}

export function RecipientForm({ toolCallId, onSubmit, initialData }: RecipientFormProps) {
  const [state, setState] = useState<FormState>({
    status: 'input',
    data: initialData || {},
    toolCallId
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setState({ ...state, status: 'validating' });
      // Validate
      setState({ ...state, status: 'submitting' });
      await onSubmit(data);
      setState({ ...state, status: 'complete' });
    } catch (error) {
      setState({ 
        ...state, 
        status: 'input',
        error: error.message 
      });
    }
  };

  return (
    <div className="recipient-form">
      {/* Form UI based on state */}
      {state.status === 'input' && (
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      )}
      {state.status === 'validating' && <ValidationSpinner />}
      {state.status === 'submitting' && <SubmissionSpinner />}
      {state.status === 'complete' && <SuccessMessage />}
      {state.error && <ErrorMessage error={state.error} />}
    </div>
  );
}
```

### 3. Chat Integration

```typescript
// app/chat/page.tsx
export default function ChatPage() {
  const { messages, addToolResult } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'recipientForm') {
        // Handle automatic validation if needed
        return;
      }
    }
  });

  return (
    <div className="chat-container">
      {messages.map(message => (
        <div key={message.id} className="message">
          {message.content}
          {message.toolInvocations?.map(toolInvocation => (
            <ToolHandler
              key={toolInvocation.toolCallId}
              toolInvocation={toolInvocation}
              onToolResult={addToolResult}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// components/tool-handler.tsx
function ToolHandler({ toolInvocation, onToolResult }) {
  const { toolName, toolCallId, state } = toolInvocation;

  if (toolName === 'recipientForm') {
    switch (state) {
      case 'call':
        return (
          <RecipientForm
            toolCallId={toolCallId}
            onSubmit={async (data) => {
              await onToolResult({
                toolCallId,
                result: { success: true, data }
              });
            }}
          />
        );
      case 'result':
        return <FormResult data={toolInvocation.result} />;
      default:
        return <LoadingState />;
    }
  }

  return null;
}
```

### 4. API Route

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    maxSteps: 5,
    tools,
    experimental_toolCallStreaming: true,
    onStepFinish: async ({ toolCalls, toolResults }) => {
      // Log or monitor tool execution
    },
    onFinish: async ({ responseMessages }) => {
      try {
        // Persist chat state
        await saveChat(responseMessages);
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }
  });

  return result.toDataStreamResponse();
}
```

## Best Practices

### 1. Form State Management
- Track form state independently for each tool call
- Use toolCallId for state identification
- Handle all possible form states
- Provide clear feedback for each state

### 2. Error Handling
- Validate input on both client and server
- Provide clear error messages
- Allow error recovery
- Handle network errors
- Prevent duplicate submissions

### 3. Performance
- Use tool streaming for better UX
- Implement proper loading states
- Cache form data when appropriate
- Handle race conditions

### 4. User Experience
- Clear form validation feedback
- Smooth state transitions
- Progress indicators
- Error recovery options
- Confirmation messages

## Common Issues and Solutions

### 1. Multiple Form Renders
**Problem**: Form component renders multiple times
**Solution**: 
```typescript
function useFormInstance(toolCallId: string) {
  return useMemo(() => ({
    id: toolCallId,
    // form instance state
  }), [toolCallId]);
}
```

### 2. Race Conditions
**Problem**: Multiple form submissions conflict
**Solution**: 
```typescript
function useFormSubmission() {
  const [pending, setPending] = useState(new Set<string>());
  
  const submit = async (toolCallId: string, data: FormData) => {
    if (pending.has(toolCallId)) return;
    setPending(prev => new Set(prev).add(toolCallId));
    try {
      await submitForm(data);
    } finally {
      setPending(prev => {
        const next = new Set(prev);
        next.delete(toolCallId);
        return next;
      });
    }
  };

  return { submit, isPending: (id: string) => pending.has(id) };
}
```

### 3. State Persistence
**Problem**: Form state lost on navigation
**Solution**: 
```typescript
function usePersistentFormState(toolCallId: string) {
  const [state, setState] = useState(() => 
    loadState(toolCallId) || initialState
  );

  useEffect(() => {
    saveState(toolCallId, state);
  }, [toolCallId, state]);

  return [state, setState];
}
```

## Testing Strategy

1. Unit Tests:
   - Form validation
   - State transitions
   - Error handling

2. Integration Tests:
   - Tool execution flow
   - Chat integration
   - State persistence

3. E2E Tests:
   - Complete form flows
   - Error scenarios
   - Multi-step interactions

## Monitoring and Debugging

1. Tool Execution Logging:
```typescript
onStepFinish({ toolCalls, toolResults }) {
  console.log('Tool execution:', {
    calls: toolCalls.map(c => ({
      id: c.toolCallId,
      name: c.toolName,
      status: c.state
    })),
    results: toolResults
  });
}
```

2. State Tracking:
```typescript
function useFormStateTracking(toolCallId: string) {
  useEffect(() => {
    const unsubscribe = trackFormState(toolCallId, (state) => {
      console.log('Form state update:', {
        toolCallId,
        state
      });
    });
    return unsubscribe;
  }, [toolCallId]);
}
```

## Conclusion

This implementation guide provides a robust foundation for building multi-step tools with form handling in the Vercel AI SDK. By following these patterns and best practices, you can create reliable, user-friendly form interactions in your chat interface while maintaining clean code and good performance. 