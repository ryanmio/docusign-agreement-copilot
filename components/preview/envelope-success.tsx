'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { mockEnvelopeStates } from '@/lib/preview-data';
import { LiveStatusBadge, StatusType } from '@/components/live-status-badge';

interface EnvelopeSuccessPreviewProps {
  envelopeId?: string; // Optional in preview
}

export function EnvelopeSuccessPreview({ envelopeId = 'ds-456' }: EnvelopeSuccessPreviewProps) {
  const [envelope, setEnvelope] = useState<typeof mockEnvelopeStates.initial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    const states = [
      mockEnvelopeStates.initial,
      mockEnvelopeStates.inProgress,
      mockEnvelopeStates.completed
    ];
    
    // Initial load
    setLoading(true);
    const timer = setTimeout(() => {
      setEnvelope(states[0]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate status progression
  useEffect(() => {
    if (!envelope || stateIndex >= 2) return;

    const states = [
      mockEnvelopeStates.initial,
      mockEnvelopeStates.inProgress,
      mockEnvelopeStates.completed
    ];

    const timer = setTimeout(() => {
      const nextIndex = stateIndex + 1;
      setStateIndex(nextIndex);
      setEnvelope(states[nextIndex]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [envelope, stateIndex]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#130032]/40" />
          <span className="text-[#130032]/60">Loading envelope status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 text-[#FF5252]">{error}</div>
      </Card>
    );
  }

  if (!envelope) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 text-[#FF5252]">Envelope not found</div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <div className="p-6 space-y-6">
        {/* Success Header */}
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-[#4C00FF]/10 flex items-center justify-center flex-shrink-0">
            <Check className="h-6 w-6 text-[#4C00FF]" />
          </div>
          <div>
            <h3 className="text-[#130032] tracking-[-0.02em] text-2xl font-light">
              Envelope sent successfully!
            </h3>
            <p className="text-[#130032]/60 text-sm tracking-[-0.01em] mt-1">
              The envelope has been created and sent to recipients
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-4 border-y border-[#130032]/10">
          <span className="text-[#130032] font-medium">Status</span>
          <LiveStatusBadge status={envelope.status as StatusType} />
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <h4 className="text-[#130032] font-medium mb-4">Recipients</h4>
          <div className="space-y-3">
            {envelope.recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-4 bg-[#CBC2FF]/10 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#130032]/40" />
                  </div>
                  <div>
                    <div className="font-medium text-[#130032]">{recipient.name}</div>
                    <div className="text-sm text-[#130032]/60">{recipient.email}</div>
                  </div>
                </div>
                <LiveStatusBadge status={recipient.status as StatusType} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setStateIndex(0);
              setEnvelope(mockEnvelopeStates.initial);
            }}
            className="text-[#4C00FF] border-[#4C00FF] hover:bg-[#4C00FF]/10"
          >
            Restart Demo
          </Button>
          <Button
            asChild
            className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white"
          >
            <Link href="#view-details">
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 