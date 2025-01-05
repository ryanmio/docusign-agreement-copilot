import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

interface EnvelopeSuccessProps {
  envelopeId: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Envelope {
  id: string;
  status: string;
  subject: string;
  recipients: Recipient[];
}

export function EnvelopeSuccess({ envelopeId }: EnvelopeSuccessProps) {
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClientComponentClient();
    let timer: NodeJS.Timeout;

    const fetchEnvelope = async () => {
      try {
        const { data: envelope, error } = await supabase
          .from('envelopes')
          .select('*, recipients(*)')
          .eq('docusign_envelope_id', envelopeId)
          .single();

        if (error) throw error;
        setEnvelope(envelope);
        setError(null);

        // Continue polling if the envelope is not in a final state
        const finalStates = ['completed', 'declined', 'voided'];
        if (!finalStates.includes(envelope.status)) {
          timer = setTimeout(fetchEnvelope, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        console.error('Error fetching envelope:', err);
        setError('Failed to load envelope status');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvelope();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [envelopeId]);

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      voided: 'bg-gray-100 text-gray-800',
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
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recipient.status || 'pending')}`}>
                {recipient.status || 'pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Send Another
          </Button>
          <Button
            asChild
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