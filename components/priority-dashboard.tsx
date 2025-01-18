import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  purgeState?: 'unpurged' | 'documents_and_metadata_queued' | 'documents_queued' | 'metadata_queued' | 'purged';
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
    <div className="space-y-8">
      {sections.map((section) => {
        const activeEnvelopes = section.envelopes.filter(env => 
          !env.purgeState || env.purgeState === 'unpurged'
        );
        
        return (
          <div key={section.type}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className={`text-base font-semibold flex items-center gap-2 ${
                section.type === 'urgent' ? 'text-red-600' :
                section.type === 'today' ? 'text-orange-600' :
                'text-yellow-600'
              }`}>
                {section.title}
                <span className="text-sm font-normal text-gray-600">
                  ({activeEnvelopes.length})
                </span>
              </h2>
            </div>
            
            <div className="space-y-1">
              {activeEnvelopes.map((envelope) => (
                <div 
                  key={envelope.envelopeId} 
                  className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-sm border-b last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm truncate">
                        {envelope.subject}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        envelope.status === 'sent' ? 'bg-blue-50 text-blue-700' :
                        envelope.status === 'voided' ? 'bg-gray-100 text-gray-700' :
                        envelope.status === 'declined' ? 'bg-red-50 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {envelope.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {envelope.recipients.map(r => r.name).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {envelope.status === 'sent' && (
                      <Button
                        size="sm"
                        className="bg-[#6B4CF6] hover:bg-[#5A3FD6] text-white"
                        onClick={() => onAction(envelope.envelopeId, 'sign')}
                      >
                        Sign
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(envelope.envelopeId, 'view')}
                    >
                      View
                    </Button>
                    {envelope.status !== 'declined' && envelope.status !== 'voided' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(envelope.envelopeId, 'remind')}
                      >
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 