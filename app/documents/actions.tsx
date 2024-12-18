'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DocumentActionsProps {
  envelope: {
    id: string;
    status: string;
  };
}

export function DocumentActions({ envelope }: DocumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this envelope? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/envelopes/${envelope.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Voided by user',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to void envelope');
      }

      router.refresh();
    } catch (err) {
      console.error('Error voiding envelope:', err);
      alert(err instanceof Error ? err.message : 'Failed to void envelope');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!confirm('Are you sure you want to resend this envelope?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/envelopes/${envelope.id}/resend`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend envelope');
      }

      router.refresh();
    } catch (err) {
      console.error('Error resending envelope:', err);
      alert(err instanceof Error ? err.message : 'Failed to resend envelope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {envelope.status !== 'completed' && envelope.status !== 'voided' && (
        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Resend'}
        </button>
      )}
      {['sent', 'delivered', 'created'].includes(envelope.status) && (
        <button
          onClick={handleVoid}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Void'}
        </button>
      )}
    </div>
  );
} 