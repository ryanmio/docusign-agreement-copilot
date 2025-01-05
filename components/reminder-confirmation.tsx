import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReminderConfirmationProps {
  success: boolean;
  envelopeId: string;
  error?: string;
  recipientCount?: number;
}

export function ReminderConfirmation({ success, envelopeId, error, recipientCount }: ReminderConfirmationProps) {
  return (
    <Card className="p-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        {success ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium">Reminder Sent Successfully</h3>
              <p className="text-sm text-gray-600">
                {recipientCount 
                  ? `Reminder sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`
                  : 'Reminder sent successfully'}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-medium">Failed to Send Reminder</h3>
              <p className="text-sm text-red-600">{error || 'An error occurred while sending the reminder'}</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
} 