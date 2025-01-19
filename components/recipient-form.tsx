import { useState, useEffect } from 'react';
import { useFormInstance } from '../hooks/use-form-instance';
import { FormState, RecipientData } from '../types/form';

interface RecipientFormProps {
  roles: Array<{ roleName: string }>;
  toolCallId: string;
  onSubmit: (recipients: Array<{ email: string; name: string; roleName: string }>) => Promise<void>;
  onBack?: () => void;
}

export function RecipientForm({ roles, toolCallId, onSubmit, onBack }: RecipientFormProps) {
  const { instance, isRestored, updateState, validateForm } = useFormInstance(toolCallId, roles);

  if (!isRestored || !instance) {
    return <div className="p-4 text-[#130032]/60">Loading...</div>;
  }

  const { state } = instance;
  const { recipients } = state.data;

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
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
    const validatedRecipients = validateForm(recipients);
    const hasErrors = validatedRecipients.some(r => r.error.email || r.error.name);
    
    updateState({
      data: {
        ...state.data,
        recipients: validatedRecipients
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

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="space-y-1 mb-6">
        <h2 className="text-[#130032] tracking-[-0.02em] text-2xl font-semibold">Add Recipients</h2>
        <p className="text-[#130032]/60 tracking-[-0.01em]">Enter the name and email for each recipient</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipients.map((recipient, index) => (
          <div key={index} className="space-y-3">
            <h3 className="font-medium text-sm text-[#130032] tracking-[-0.01em]">{recipient.roleName}</h3>
            
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                  className="ds-input w-full"
                />
                {recipient.error?.name && (
                  <div className="text-sm text-red-500 mt-1">{recipient.error.name}</div>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                  className="ds-input w-full"
                />
                {recipient.error?.email && (
                  <div className="text-sm text-red-500 mt-1">{recipient.error.email}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={state.status === 'submitting'}
          className="ds-button-primary min-w-[120px]"
        >
          {state.status === 'submitting' ? 'Sending...' : 'Continue'}
        </button>
      </div>

      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[2px] mt-4">
          <div className="text-sm text-red-600">{state.error}</div>
        </div>
      )}
    </div>
  );
} 