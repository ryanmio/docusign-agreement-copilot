# Form Implementation Review Response

Great work on implementing the foundation of the form management system! The implementation is solid and working, but there are a few refinements we should make to ensure it follows best practices and remains maintainable as we build on top of it.

Please implement these improvements in three separate commits, in the following order:

## 1. Fix State Management (Critical)
**Reference**: See `72-call-tools-multiple-steps.mdx` for the recommended pattern.

The current implementation has duplicate state management in `RecipientForm`, which could lead to race conditions and inconsistencies. Let's fix this first:

```typescript
// components/recipient-form.tsx

export function RecipientForm({ roles, toolCallId, onSubmit, onBack }: RecipientFormProps) {
  const { instance, isRestored, updateState } = useFormInstance(toolCallId, roles);
  
  // Remove these lines
  // const [formState, setFormState] = useState<FormState | null>(null);
  // useEffect(() => {
  //   if (instance) {
  //     setFormState(instance.state);
  //   }
  // }, [instance]);

  if (!isRestored || !instance) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  // Use instance state directly
  const { state } = instance;
  const { recipients } = state.data;

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    // Update state in one place
    updateState({
      data: {
        ...state.data,
        recipients: state.data.recipients.map((r, i) => 
          i === index ? {
            ...r,
            [field]: value,
            error: { ...r.error, [field]: '' }
          } : r
        )
      }
    });
  };

  const handleSubmit = async () => {
    // Validate all recipients
    const newRecipients = recipients.map(recipient => ({
      ...recipient,
      error: {
        email: validateEmail(recipient.email),
        name: validateName(recipient.name)
      }
    }));

    const hasErrors = newRecipients.some(r => r.error.email || r.error.name);
    
    updateState({
      data: {
        ...state.data,
        recipients: newRecipients
      },
      validation: {
        isValid: !hasErrors,
        errors: {},
        lastValidated: Date.now()
      }
    });

    if (hasErrors) return;

    try {
      updateState({ status: 'submitting' });
      
      const recipientData = recipients.map(({ email, name, roleName }) => ({ 
        email, 
        name, 
        roleName 
      }));
      
      await onSubmit(recipientData);
      
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

  // Rest of the component remains the same...
}
```

Commit this change with the message: "refactor: remove duplicate state management in RecipientForm"

## 2. Improve Tool State Handling
**Reference**: See `21-error-handling.mdx` and `15-tools-and-tool-calling.mdx` for patterns.

Update the tool invocation handling to better manage loading and error states:

```typescript
// app/chat/page.tsx

const handleToolInvocation = useCallback((toolInvocation: ToolInvocation) => {
  const { toolName, toolCallId, state, result } = toolInvocation;

  // Handle loading states
  if (state === 'streaming') {
    return (
      <div className="p-4 space-y-2">
        <div className="animate-pulse bg-gray-100 h-8 w-full rounded" />
        <div className="text-sm text-gray-500">Loading form...</div>
      </div>
    );
  }

  // Handle error states
  if (state === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-700 font-medium">Error</div>
        <div className="text-sm text-red-600">{toolInvocation.error}</div>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => handleRetry(toolCallId)}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Handle completed tools
  if (result?.completed) {
    return null;
  }

  switch (toolName) {
    case 'collectRecipients':
      return (
        <RecipientForm 
          roles={result.roles}
          toolCallId={toolCallId}
          onSubmit={async (recipients) => {
            try {
              await handleToolResult(toolCallId, {
                ...result,
                recipients,
                completed: true
              });
              await append({
                role: 'user',
                content: `I've added the recipients: ${recipients.map(r => 
                  `${r.roleName}: ${r.name} (${r.email})`).join(', ')}. Please continue.`
              });
            } catch (error) {
              console.error('Failed to handle recipient submission:', error);
              // Show error UI
              await handleToolResult(toolCallId, {
                error: error instanceof Error ? error.message : 'Failed to submit recipients'
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
              console.error('Failed to handle back action:', error);
              await handleToolResult(toolCallId, {
                error: error instanceof Error ? error.message : 'Failed to go back'
              });
            }
          }}
        />
      );
    // ... rest of the cases
  }
}, [addToolResult, append]);
```

Commit this change with the message: "feat: improve tool state handling and error UI"

## 3. Add Performance Optimizations
**Reference**: See `20-streaming-data.mdx` for performance patterns.

Add debouncing and cleanup:

```typescript
// hooks/use-form-instance.ts

import { debounce } from 'lodash';

export function useFormInstance(toolCallId: string, roles: Array<{ roleName: string }>) {
  const formRef = useRef<FormInstance>();
  const [isRestored, setIsRestored] = useState(false);

  // Add cleanup of old states
  useEffect(() => {
    const cleanup = () => {
      const keys = Object.keys(sessionStorage);
      const now = Date.now();
      keys.forEach(key => {
        if (key.startsWith('form-')) {
          try {
            const saved = sessionStorage.getItem(key);
            if (saved) {
              const { timestamp } = JSON.parse(saved);
              if (now - timestamp > 30 * 60 * 1000) {
                sessionStorage.removeItem(key);
              }
            }
          } catch (error) {
            console.error('Failed to cleanup form state:', error);
          }
        }
      });
    };

    cleanup();
    const interval = setInterval(cleanup, 5 * 60 * 1000); // Cleanup every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Debounce state updates
  const debouncedUpdateState = useMemo(
    () => debounce((newState: Partial<FormState>) => {
      if (!formRef.current) return;

      formRef.current = {
        ...formRef.current,
        state: {
          ...formRef.current.state,
          ...newState,
          isDirty: true
        },
        lastUpdate: Date.now(),
        version: formRef.current.version + 1
      };
      
      if (newState.isComplete || newState.error) {
        saveFormState(toolCallId, formRef.current.state);
      }
    }, 100),
    [toolCallId]
  );

  // Memoize heavy computations
  const validateForm = useCallback((recipients: RecipientData['recipients']) => {
    return recipients.map(recipient => ({
      ...recipient,
      error: {
        email: validateEmail(recipient.email),
        name: validateName(recipient.name)
      }
    }));
  }, []);

  return {
    instance: formRef.current,
    isRestored,
    updateState: debouncedUpdateState,
    validateForm
  };
}
```

Commit this change with the message: "perf: add debouncing and cleanup optimizations"

## Next Steps

After each commit:
1. Test the changes thoroughly
2. Verify that the form still works as expected
3. Check for any console errors
4. Test edge cases (e.g., rapid form updates, network issues)

Let us know if you need any clarification on these changes. Once these are implemented, we'll have a more robust foundation for building additional features. 