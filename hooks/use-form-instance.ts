import { useRef, useState, useEffect, useCallback } from 'react';
import { FormInstance, FormState } from '../types/form';
import { createInitialState } from '@/utils/form-state';
import { loadFormState, saveFormState } from '@/utils/form-persistence';
import { validateEmail, validateName } from '@/utils/validation';

export function useFormInstance(toolCallId: string, roles: Array<{ roleName: string }>) {
  const formRef = useRef<FormInstance>();
  const [isRestored, setIsRestored] = useState(false);
  const [version, setVersion] = useState(0);

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
              if (now - timestamp > 30 * 60 * 1000) { // 30 minutes
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

  // Initialize form instance
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

  // Direct state updates (no debouncing)
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
    
    setVersion(v => v + 1);
    
    // Save state if it's complete or has an error
    if (newState.isComplete || newState.error) {
      saveFormState(toolCallId, formRef.current.state);
    }
  };

  // Memoize validation function
  const validateForm = useCallback((recipients: FormState['data']['recipients']) => {
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
    updateState,
    validateForm
  };
} 