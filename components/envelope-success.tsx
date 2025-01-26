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
  const [pollCount, setPollCount] = useState(0);
  const [isInitialDelay, setIsInitialDelay] = useState(true);

  useEffect(() => {
    const supabase = createClientComponentClient();
    let timer: NodeJS.Timeout;
    let isActive = true; // Add mounted flag

    const fetchEnvelope = async () => {
      if (!isActive) return; // Skip if unmounted
      try {
        console.log('ENVELOPE_SUCCESS_DEBUG: Querying with ID:', { 
          envelopeId,
          pollCount,
          timestamp: new Date().toISOString(),
          isActive
        });

        if (!supabase) {
          console.error('ENVELOPE_SUCCESS_DEBUG: Failed to create Supabase client');
          if (!isActive) return;
          setError('Database connection failed');
          setLoading(false);
          return;
        }
        console.log('ENVELOPE_SUCCESS_DEBUG: Supabase client created');

        // Add a small delay before first query to handle race condition
        if (pollCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (!isActive) return;
        }
        if (!isActive) return;
        setIsInitialDelay(false);
        
        let queryResult;
        try {
          console.log('ENVELOPE_SUCCESS_DEBUG: Starting query...');
          queryResult = await supabase
            .from('envelopes')
            .select('*, recipients(*)')
            .eq('id', envelopeId)
            .single();
          if (!isActive) return;
          console.log('ENVELOPE_SUCCESS_DEBUG: Query completed:', queryResult);
        } catch (queryError) {
          if (!isActive) return;
          console.error('ENVELOPE_SUCCESS_DEBUG: Query threw error:', queryError);
          setError('Database query failed');
          setLoading(false);
          return;
        }

        const { data: envelope, error } = queryResult;
        if (!isActive) return;

        if (error) {
          console.error('ENVELOPE_SUCCESS_DEBUG: Query failed:', { 
            error: {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            },
            envelopeId,
            timestamp: new Date().toISOString()
          });
          if (error.code === 'PGRST116') {
            // Not found - keep polling but show not found state
            setLoading(false);
            setError('Envelope not found - retrying...');
            if (isActive) {
              timer = setTimeout(() => {
                if (!isActive) return;
                setPollCount(count => count + 1);
              }, 2000);
            }
            return;
          }
          // Real error - stop polling
          setError('Failed to load envelope status');
          setLoading(false);
          return;
        }
        
        console.log('Envelope fetch result:', { 
          found: !!envelope, 
          status: envelope?.status,
          recipientCount: envelope?.recipients?.length 
        });

        if (!envelope) {
          console.log('ENVELOPE_SUCCESS_DEBUG: Envelope not found, will retry');
          setLoading(false);
          setError('Waiting for envelope...');
          if (isActive) {
            timer = setTimeout(() => {
              if (!isActive) return;
              setPollCount(count => count + 1);
            }, 2000);
          }
          return;
        }

        setEnvelope(envelope);
        setError(null);
        setLoading(false);
        
        // Continue polling until we reach a final state
        const finalStates = ['completed', 'declined', 'voided', 'error'];
        const shouldPoll = !finalStates.includes(envelope.status);
        console.log('ENVELOPE_SUCCESS_DEBUG: Poll decision:', {
          status: envelope.status,
          shouldContinuePolling: shouldPoll,
          timestamp: new Date().toISOString()
        });
        
        if (shouldPoll) {
          if (isActive) {
            timer = setTimeout(() => {
              if (!isActive) return;
              setPollCount(count => count + 1);
            }, 2000);
          }
        }
      } catch (err) {
        if (!isActive) return;
        console.error('ENVELOPE_SUCCESS_DEBUG: Unhandled error:', err);
        setError('Failed to load envelope status');
        setLoading(false);
        
        // Keep polling on unhandled errors
        if (isActive) {
          timer = setTimeout(() => {
            if (!isActive) return;
            setPollCount(count => count + 1);
          }, 2000);
        }
      }
    };

    fetchEnvelope();

    return () => {
      console.log('ENVELOPE_SUCCESS_DEBUG: Cleanup triggered');
      isActive = false;
      if (timer) {
        console.log('ENVELOPE_SUCCESS_DEBUG: Clearing timer');
        clearTimeout(timer);
      }
    };
  }, [envelopeId, pollCount]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6 flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#130032]/40" />
          <span className="text-[#130032]/60">
            {isInitialDelay 
              ? "Preparing envelope details..." 
              : "Loading envelope status..."}
          </span>
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