import { FormState } from '../types/form';

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