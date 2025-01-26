"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { LiveStatusBadge, StatusType } from './live-status-badge';

interface EnvelopeSuccessProps {
  envelopeId: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: StatusType;
}

interface Envelope {
  id: string;
  status: StatusType;
  subject: string;
  recipients: Recipient[];
}

export function EnvelopeSuccess({ envelopeId }: EnvelopeSuccessProps) {
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('[ENV-DEBUG] Component mounted, env:', {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0,8),
      hasEnvelopeId: !!envelopeId
    });

    let isActive = true;
    let timer: NodeJS.Timeout;

    async function pollEnvelope() {
      if (!isActive) return;
      
      try {
        console.log('[ENV-DEBUG] Supabase query starting');
        
        const { data: envelope, error } = await supabase
          .from('envelopes')
          .select('*, recipients(*)')
          .eq('id', envelopeId)
          .single();

        console.log('[ENV-DEBUG] Query complete:', { 
          hasError: !!error,
          hasData: !!envelope
        });

        if (!isActive) return;

        if (error) {
          console.error('Error fetching envelope:', error);
          setError('Failed to load envelope status');
          setLoading(false);
        } else if (envelope) {
          setEnvelope(envelope);
          setError(null);
          setLoading(false);
        }

        if (isActive) {
          timer = setTimeout(pollEnvelope, 5000);
        }
      } catch (err) {
        console.error('[ENV-DEBUG] Critical error:', err);
        if (!isActive) return;
        if (isActive) {
          timer = setTimeout(pollEnvelope, 5000);
        }
      }
    }

    pollEnvelope();

    return () => {
      isActive = false;
      if (timer) clearTimeout(timer);
    };
  }, [envelopeId, supabase]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#130032]/40" />
          <span className="text-[#130032]/60">Loading envelope status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 text-[#FF5252]">{error}</div>
      </Card>
    );
  }

  if (!envelope) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 text-[#FF5252]">Envelope not found</div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
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
          <LiveStatusBadge status={envelope.status} />
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
                <LiveStatusBadge status={recipient.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            asChild
            className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white"
          >
            <Link href={`/documents/${envelope.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 