import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentView } from '@/components/document-view';

interface PriorityEnvelope {
  envelopeId: string;
  subject: string;
  status: string;
  expirationDate?: string;
  recipients: Array<{
    email: string;
    name: string;
    status: string;
  }>;
  urgencyReason: string;
}

interface PrioritySection {
  title: string;
  envelopes: PriorityEnvelope[];
  type: 'urgent' | 'today' | 'thisWeek';
}

interface PriorityDashboardProps {
  sections: PrioritySection[];
  onAction: (envelopeId: string, action: 'view' | 'sign' | 'remind') => Promise<void>;
  toolCallId: string;
}

export function PriorityDashboard({ sections, onAction, toolCallId }: PriorityDashboardProps) {
  // Helper to format the expiration date/time remaining
  const getTimeRemaining = (expirationDate?: string) => {
    if (!expirationDate) return 'No deadline';
    
    const expiration = new Date(expirationDate);
    const now = new Date();
    const hours = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hours < 24) return `${hours} hours remaining`;
    const days = Math.floor(hours / 24);
    return `${days} days remaining`;
  };

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'declined': return 'text-red-600';
      case 'voided': return 'text-gray-600';
      case 'sent': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-4">
      {sections.map((section) => (
        <div key={section.type} className="space-y-4">
          <h2 className={`text-lg font-semibold ${
            section.type === 'urgent' ? 'text-red-600' :
            section.type === 'today' ? 'text-orange-600' :
            'text-yellow-600'
          }`}>
            {section.title} ({section.envelopes.length})
          </h2>
          
          <div className="space-y-3">
            {section.envelopes.map((envelope) => (
              <Card key={envelope.envelopeId} className="p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-medium">{envelope.subject}</h3>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className={getStatusColor(envelope.status)}>
                        Status: {envelope.status}
                      </p>
                      <p>{getTimeRemaining(envelope.expirationDate)}</p>
                      <p>{envelope.urgencyReason}</p>
                    </div>

                    <div className="text-sm text-gray-500">
                      Recipients: {envelope.recipients.map(r => r.name).join(', ')}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(envelope.envelopeId, 'view')}
                    >
                      View
                    </Button>
                    {envelope.status === 'sent' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onAction(envelope.envelopeId, 'sign')}
                      >
                        Sign
                      </Button>
                    )}
                    {envelope.status !== 'declined' && envelope.status !== 'voided' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction(envelope.envelopeId, 'remind')}
                      >
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 