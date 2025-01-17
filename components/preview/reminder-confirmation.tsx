'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { mockReminderStates } from '@/lib/preview-data';

export function ReminderConfirmationPreview() {
  const [showSuccess, setShowSuccess] = useState(true);
  const currentState = showSuccess ? mockReminderStates.success : mockReminderStates.error;

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              currentState.success ? 'bg-[#4C00FF]/10' : 'bg-[#FF5252]/10'
            }`}>
              {currentState.success ? (
                <Check className="h-5 w-5 text-[#4C00FF]" />
              ) : (
                <AlertCircle className="h-5 w-5 text-[#FF5252]" />
              )}
            </div>
            <div>
              <h3 className="text-[#130032] tracking-[-0.02em] text-lg font-medium">
                {currentState.success ? 'Reminder Sent Successfully' : 'Failed to Send Reminder'}
              </h3>
              <p className={`text-sm tracking-[-0.01em] ${
                currentState.success ? 'text-[#130032]/60' : 'text-[#FF5252]/90'
              }`}>
                {currentState.success
                  ? 'recipientCount' in currentState
                    ? `Reminder sent to ${currentState.recipientCount} recipient${currentState.recipientCount > 1 ? 's' : ''}`
                    : 'Reminder sent successfully'
                  : 'error' in currentState ? currentState.error : 'An error occurred while sending the reminder'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowSuccess(!showSuccess)}
          className="text-[#4C00FF] border-[#4C00FF] hover:bg-[#4C00FF]/10"
        >
          Toggle State
        </Button>
      </div>
    </div>
  );
} 