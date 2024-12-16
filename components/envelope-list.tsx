'use client';

import { useState, useEffect } from 'react';
import { EnvelopeStatus, EnvelopeListResponse } from '@/types/envelopes';
import { Alert } from '@/components/ui/alert';

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

export function EnvelopeList() {
  const [envelopes, setEnvelopes] = useState<EnvelopeListResponse['envelopes']>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EnvelopeStatus | ''>('');
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
    <div>
      <div className="mb-4 flex items-center gap-4">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as EnvelopeStatus | '')}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : envelopes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No envelopes found
        </div>
      ) : (
        <div className="space-y-4">
          {envelopes.map((envelope) => (
            <div
              key={envelope.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{envelope.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(envelope.createdAt || envelope.created_at || '').toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(envelope.status)}`}>
                  {envelope.status}
                </span>
              </div>
              <div className="mt-2">
                <a
                  href={`/documents/${envelope.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
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