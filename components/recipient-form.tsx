import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, User } from 'lucide-react';

interface RecipientFormProps {
  roles: Array<{ roleName: string }>;
  onSubmit: (recipients: Array<{ email: string; name: string; roleName: string }>) => void;
  onBack?: () => void;
}

export function RecipientForm({ roles, onSubmit, onBack }: RecipientFormProps) {
  const [recipients, setRecipients] = useState(
    roles.map(role => ({ 
      email: '', 
      name: '', 
      roleName: role.roleName,
      error: { email: '', name: '' }
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    return '';
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

    setRecipients(newRecipients);

    // Check if there are any errors
    if (newRecipients.some(r => r.error.email || r.error.name)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(recipients.map(({ email, name, roleName }) => ({ 
        email, 
        name, 
        roleName 
      })));
    } finally {
      setIsSubmitting(false);
    }
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
    setRecipients(newRecipients);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Add Recipients</h3>
          <p className="text-sm text-gray-500 mt-1">
            Enter the details for each required signer
          </p>
        </div>

        <div className="space-y-6">
          {recipients.map((recipient, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="font-medium text-sm text-gray-700">
                {recipient.roleName}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    placeholder="Enter recipient's email"
                    className={recipient.error.email ? 'border-red-500' : ''}
                  />
                  {recipient.error.email && (
                    <div className="text-sm text-red-500">{recipient.error.email}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  <Input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    placeholder="Enter recipient's name"
                    className={recipient.error.name ? 'border-red-500' : ''}
                  />
                  {recipient.error.name && (
                    <div className="text-sm text-red-500">{recipient.error.name}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Review & Send'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 