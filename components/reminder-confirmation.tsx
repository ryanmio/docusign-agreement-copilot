import { Card, CardContent } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';

interface ReminderConfirmationProps {
  success: boolean;
  envelopeId: string;
  error?: string;
  recipientCount?: number;
}

export function ReminderConfirmation({ success, envelopeId, error, recipientCount }: ReminderConfirmationProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            success ? 'bg-[#4C00FF]/10' : 'bg-[#FF5252]/10'
          }`}>
            {success ? (
              <Check className="h-5 w-5 text-[#4C00FF]" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[#FF5252]" />
            )}
          </div>
          <div>
            <h3 className="text-[#130032] tracking-[-0.02em] text-lg font-medium">
              {success ? 'Reminder Sent Successfully' : 'Failed to Send Reminder'}
            </h3>
            <p className={`text-sm tracking-[-0.01em] ${
              success ? 'text-[#130032]/60' : 'text-[#FF5252]/90'
            }`}>
              {success
                ? recipientCount
                  ? `Reminder sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`
                  : 'Reminder sent successfully'
                : error || 'An error occurred while sending the reminder'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 