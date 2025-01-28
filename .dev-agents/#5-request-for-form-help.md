# Request for Form Implementation Guidance

## Context
We are implementing the form instance management and state persistence improvements suggested in your review response. The implementation includes `useFormInstance` and `useFormPersistence` hooks, but we need clarification on some type definitions and helper functions.

## Current Form Structure
Our recipient form currently:
1. Collects recipient information (name, email) for each role
2. Validates inputs before submission
3. Handles back/submit actions
4. Reports submission state

## Questions

### 1. Type Definitions
You provided hooks that use `FormInstance` and `FormState` types:
```typescript
export function useFormInstance(toolCallId: string) {
  const formRef = useRef<FormInstance>();
  // ...
}

function useFormPersistence(toolCallId: string, initialState: FormState) {
  // ...
}
```

Could you provide:
- The recommended structure for `FormInstance`
- The recommended structure for `FormState`
- Any additional types needed for form management

### 2. Initial State Creation
The hooks reference a `createInitialState` function:
```typescript
formRef.current = {
  id: toolCallId,
  state: createInitialState(),
  lastUpdate: Date.now()
};
```

Could you provide:
- The recommended implementation of `createInitialState`
- What fields should be included in the initial state
- How this should integrate with our existing recipient form structure

### 3. State Persistence
The implementation mentions `saveFormState`:
```typescript
if (formRef.current?.state.isDirty) {
  saveFormState(toolCallId, formRef.current.state);
}
```

Could you clarify:
- The recommended implementation of `saveFormState`
- How it should interact with sessionStorage
- Any additional state management utilities needed

### 4. Integration Questions
1. How should these hooks integrate with our existing `RecipientForm` component?
2. Should we track form state separately for each recipient role?
3. How should we handle the transition between form states (e.g., when going back)?

## Current Implementation
For reference, our current recipient form component is in `components/recipient-form.tsx` and handles:
- Role-based recipient collection
- Email and name validation
- Form submission state
- Back/submit actions

## Request
Could you provide guidance on:
1. The complete type definitions needed
2. Implementation details for helper functions
3. Best practices for integrating these with our existing form
4. Any additional considerations for our specific use case

This will help us implement the form management system correctly and avoid any potential issues with state management or persistence. 