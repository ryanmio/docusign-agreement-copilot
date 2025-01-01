// Form instance type
export interface FormInstance {
  id: string;               // toolCallId
  state: FormState;         // Current form state
  lastUpdate: number;       // Timestamp of last update
  version: number;          // For optimistic concurrency
}

// Tool invocation type
export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: 'partial-call' | 'result' | 'error';
  result?: any;
  error?: string;
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