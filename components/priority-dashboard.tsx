import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.type} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.envelopes.map((envelope) => (
              <div
                key={envelope.envelopeId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{envelope.subject}</h4>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100">
                      {envelope.status}
                    </span>
                    {envelope.expirationDate && (
                      <span className="ml-2">
                        Expires: {new Date(envelope.expirationDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{envelope.urgencyReason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction(envelope.envelopeId, 'view')}
                  >
                    Review
                  </Button>
                  {envelope.status === 'sent' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(envelope.envelopeId, 'sign')}
                      >
                        Sign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(envelope.envelopeId, 'remind')}
                      >
                        Remind
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
} 