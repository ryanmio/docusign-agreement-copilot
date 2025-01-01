import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, User } from 'lucide-react';
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
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  // Use instance state directly
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
    // Use memoized validation
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
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Add Recipients</h2>
      
      {recipients.map((recipient, index) => (
        <div key={index} className="space-y-2">
          <h3 className="font-medium">{recipient.roleName}</h3>
          
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Name"
              value={recipient.name}
              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {recipient.error?.name && (
              <div className="text-sm text-red-500">{recipient.error.name}</div>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              value={recipient.email}
              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {recipient.error?.email && (
              <div className="text-sm text-red-500">{recipient.error.email}</div>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={state.status === 'submitting'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {state.status === 'submitting' ? 'Sending...' : 'Continue'}
        </button>
      </div>

      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600">{state.error}</div>
        </div>
      )}
    </div>
  );
} 