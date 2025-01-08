'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { mockEnvelopeStates } from '@/lib/preview-data';

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

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      voided: 'bg-gray-100 text-gray-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          <span>Loading envelope status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50">
        <div className="text-red-700">{error}</div>
      </Card>
    );
  }

  if (!envelope) {
    return (
      <Card className="p-6 bg-yellow-50">
        <div className="text-yellow-700">Envelope not found</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Success Header */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Template sent successfully!</h3>
            <p className="text-sm text-gray-500">The envelope has been created and sent to recipients</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between border-t border-b py-3">
          <span className="text-sm font-medium">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(envelope.status)}`}>
            {envelope.status}
          </span>
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recipients</h4>
          {envelope.recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{recipient.name}</div>
                  <div className="text-sm text-gray-500">{recipient.email}</div>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                {recipient.status}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setStateIndex(0);
              setEnvelope(mockEnvelopeStates.initial);
            }}
          >
            Restart Demo
          </Button>
          <Button asChild>
            <Link href="#view-details">
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 