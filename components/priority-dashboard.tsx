import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white border border-gray-200">
      <div className="p-6 space-y-8">
        {sections.map((section) => {
          const activeEnvelopes = section.envelopes.filter(env => 
            !env.purgeState || env.purgeState === 'unpurged'
          );

          // Calculate pagination
          const totalPages = Math.ceil(activeEnvelopes.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const paginatedEnvelopes = activeEnvelopes.slice(startIndex, startIndex + itemsPerPage);
          
          return (
            <div key={section.type}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-semibold flex items-center gap-2 ${
                    section.type === 'urgent' ? 'text-red-600' :
                    section.type === 'today' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {section.title}
                    <span className="text-sm font-normal text-[#130032]/60">
                      ({activeEnvelopes.length})
                    </span>
                  </h2>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-[#130032]/60 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-[#130032]/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-[#130032]/60 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {paginatedEnvelopes.map((envelope) => (
                  <Card
                    key={envelope.envelopeId} 
                    className="border border-[#130032]/10 hover:border-[#4C00FF] transition-all"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-[#130032] truncate">
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
                        <p className="text-sm text-[#130032]/60 mt-0.5">
                          {envelope.recipients.map(r => r.name).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {envelope.status === 'sent' && (
                          <Button
                            size="sm"
                            className="bg-[#4C00FF] hover:bg-[#26065D] text-white"
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
                  </Card>
                ))}

                {activeEnvelopes.length === 0 && (
                  <div className="text-center py-4 text-[#130032]/60">
                    No envelopes in this section
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
} 