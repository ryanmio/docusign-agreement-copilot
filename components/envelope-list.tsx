'use client';

import { useState, useEffect } from 'react';
import { EnvelopeStatus, EnvelopeListResponse } from '@/types/envelopes';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const statusOptions: EnvelopeStatus[] = [
  'created',
  'sent',
  'delivered',
  'signed',
  'completed',
  'declined',
  'voided',
  'error',
];

interface EnvelopeListProps {
  initialStatus?: EnvelopeStatus | '';
  initialPage?: number;
  showStatusFilter?: boolean;
  onEnvelopeClick?: (envelope: any) => void;
}

export function EnvelopeList({ 
  initialStatus = '', 
  initialPage = 1,
  showStatusFilter = true,
  onEnvelopeClick
}: EnvelopeListProps) {
  const [envelopes, setEnvelopes] = useState<EnvelopeListResponse['envelopes']>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState<EnvelopeStatus | ''>(initialStatus);
  const limit = 10;

  useEffect(() => {
    fetchEnvelopes();
  }, [page, status]);

  const fetchEnvelopes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/envelopes?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch envelopes');
      }

      const data: EnvelopeListResponse = await response.json();
      setEnvelopes(data.envelopes);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: EnvelopeStatus | '') => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when filter changes
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border border-gray-200">
      <div className="p-6 space-y-6">
        {showStatusFilter && (
          <div className="flex items-center gap-4">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as EnvelopeStatus | '')}
              className="ds-input w-48"
            >
              <option value="">All Status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner label="Loading envelopes..." />
          </div>
        ) : envelopes.length === 0 ? (
          <div className="text-center text-[#130032]/60">
            No envelopes found
          </div>
        ) : (
          <div className="grid gap-4">
            {envelopes.map((envelope) => (
              <Card
                key={envelope.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer border-[#130032]/10 hover:border-[#4C00FF]"
                onClick={() => onEnvelopeClick ? onEnvelopeClick(envelope) : window.location.href = `/documents/${envelope.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg text-[#130032]">{envelope.subject}</h3>
                    <p className="text-sm text-[#130032]/60">
                      Created: {new Date(envelope.createdAt || envelope.created_at || '').toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(envelope.status)}`}>
                    {envelope.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ds-button-secondary px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-[#130032]/60">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ds-button-secondary px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function getStatusColor(status: EnvelopeStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'voided':
      return 'bg-gray-100 text-gray-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'signed':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-yellow-100 text-yellow-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}