'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { mockReminderStates } from '@/lib/preview-data';

export function ReminderConfirmationPreview() {
  const [showSuccess, setShowSuccess] = useState(true);

  const currentState = showSuccess ? mockReminderStates.success : mockReminderStates.error;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          {currentState.success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">Reminder Sent Successfully</h3>
                <p className="text-sm text-gray-600">
                  {currentState.recipientCount 
                    ? `Reminder sent to ${currentState.recipientCount} recipient${currentState.recipientCount > 1 ? 's' : ''}`
                    : 'Reminder sent successfully'}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium">Failed to Send Reminder</h3>
                <p className="text-sm text-red-600">{currentState.error || 'An error occurred while sending the reminder'}</p>
              </div>
            </>
          )}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowSuccess(!showSuccess)}
        >
          Toggle State
        </Button>
      </div>
    </div>
  );
} 