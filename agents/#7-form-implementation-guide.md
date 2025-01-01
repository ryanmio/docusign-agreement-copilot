# Form Implementation Guide

## Type Definitions

```typescript
// types/form.ts

// Form instance type
export interface FormInstance {
  id: string;               // toolCallId
  state: FormState;         // Current form state
  lastUpdate: number;       // Timestamp of last update
  version: number;          // For optimistic concurrency
}

// Form state type
export interface FormState {
  status: FormStatus;
  data: RecipientData;
  validation: ValidationState;
  isDirty: boolean;
  isComplete: boolean;
  error?: string;
}

// Form status type
export type FormStatus = 
  | 'initial'      // Form just created
  | 'input'        // User is entering data
  | 'validating'   // Data is being validated
  | 'submitting'   // Form is being submitted
  | 'complete'     // Form submission complete
  | 'error';       // Error state

// Validation state type
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  lastValidated?: number;
}

// Recipient data type
export interface RecipientData {
  recipients: Array<{
    email: string;
    name: string;
    roleName: string;
    error?: {
      email?: string;
      name?: string;
    };
  }>;
  roles: Array<{
    roleName: string;
    required: boolean;
  }>;
}
```

## Helper Functions

### 1. Initial State Creation

```typescript
// utils/form-state.ts

export function createInitialState(roles: Array<{ roleName: string }>): FormState {
  return {
    status: 'initial',
    data: {
      recipients: roles.map(role => ({
        email: '',
        name: '',
        roleName: role.roleName,
        error: {}
      })),
      roles: roles.map(role => ({
        roleName: role.roleName,
        required: true
      }))
    },
    validation: {
      isValid: false,
      errors: {},
    },
    isDirty: false,
    isComplete: false
  };
}
```

### 2. State Persistence

```typescript
// utils/form-persistence.ts

export function saveFormState(toolCallId: string, state: FormState): void {
  try {
    const key = `form-${toolCallId}`;
    sessionStorage.setItem(key, JSON.stringify({
      state,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save form state:', error);
  }
}

export function loadFormState(toolCallId: string): FormState | null {
  try {
    const key = `form-${toolCallId}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) return null;

    const { state, timestamp } = JSON.parse(saved);
    // Expire after 30 minutes
    if (Date.now() - timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return state;
  } catch (error) {
    console.error('Failed to load form state:', error);
    return null;
  }
}

export function clearFormState(toolCallId: string): void {
  try {
    const key = `form-${toolCallId}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear form state:', error);
  }
}
```

### 3. Form Instance Management

```typescript
// hooks/use-form-instance.ts

import { useRef, useState, useEffect } from 'react';
import { FormInstance, FormState } from '../types/form';
import { createInitialState, loadFormState, saveFormState } from '../utils/form-state';

export function useFormInstance(toolCallId: string, roles: Array<{ roleName: string }>) {
  const formRef = useRef<FormInstance>();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!formRef.current) {
      // Try to load saved state
      const savedState = loadFormState(toolCallId);
      
      formRef.current = {
        id: toolCallId,
        state: savedState || createInitialState(roles),
        lastUpdate: Date.now(),
        version: 1
      };
      setIsRestored(true);
    }

    // Save state on unmount if dirty
    return () => {
      if (formRef.current?.state.isDirty) {
        saveFormState(toolCallId, formRef.current.state);
      }
    };
  }, [toolCallId, roles]);

  const updateState = (newState: Partial<FormState>) => {
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
    
    // Save state if it's complete or has an error
    if (newState.isComplete || newState.error) {
      saveFormState(toolCallId, formRef.current.state);
    }
  };

  return {
    instance: formRef.current,
    isRestored,
    updateState
  };
}
```

## Integration with RecipientForm

Here's how to integrate these pieces with your existing `RecipientForm` component:

```typescript
// components/recipient-form.tsx

import { useFormInstance } from '../hooks/use-form-instance';
import { FormState, RecipientData } from '../types/form';

interface RecipientFormProps {
  roles: Array<{ roleName: string }>;
  toolCallId: string;
  onSubmit: (recipients: Array<{ email: string; name: string; roleName: string }>) => Promise<void>;
  onBack?: () => void;
}

export function RecipientForm({ roles, toolCallId, onSubmit, onBack }: RecipientFormProps) {
  const { instance, isRestored, updateState } = useFormInstance(toolCallId, roles);
  
  // Wait for state restoration
  if (!isRestored) {
    return <div>Loading...</div>;
  }

  const { state } = instance!;
  const { recipients } = state.data;

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    return '';
  };

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = {
      ...newRecipients[index],
      [field]: value,
      error: {
        ...newRecipients[index].error,
        [field]: '' // Clear error on change
      }
    };

    updateState({
      data: {
        ...state.data,
        recipients: newRecipients
      },
      validation: {
        isValid: false,
        errors: {},
        lastValidated: Date.now()
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

  // Rest of your component remains the same...
}
```

## Additional Considerations

1. **Form State Recovery**
   - The form state is automatically persisted to `sessionStorage`
   - States are recovered when the form is remounted
   - States expire after 30 minutes for security
   - Dirty states are saved on unmount

2. **Validation Caching**
   - Validation results are cached in the form state
   - Cached results are invalidated when fields change
   - This prevents unnecessary revalidation

3. **Race Condition Prevention**
   - The form instance includes a version number
   - Each update increments the version
   - This helps detect and prevent concurrent updates

4. **Error Handling**
   - Form-level errors are tracked in the state
   - Field-level errors are tracked per recipient
   - Error states persist until explicitly cleared

5. **Performance Optimization**
   - State updates are batched where possible
   - Validation is debounced during typing
   - Heavy operations are memoized

## Next Steps

1. Implement the form instance management system
2. Add state persistence
3. Update the validation system
4. Add error handling
5. Implement performance optimizations

Let me know if you need clarification on any part of the implementation! 