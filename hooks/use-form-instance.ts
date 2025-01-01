import { useRef, useState, useEffect } from 'react';
import { FormInstance, FormState } from '../types/form';
import { createInitialState } from '../utils/form-state';
import { loadFormState, saveFormState } from '../utils/form-persistence';

export function useFormInstance(toolCallId: string, roles: Array<{ roleName: string }>) {
  const formRef = useRef<FormInstance>();
  const [isRestored, setIsRestored] = useState(false);
  const [version, setVersion] = useState(0);

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
    
    // Increment version to trigger re-render
    setVersion(v => v + 1);
    
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