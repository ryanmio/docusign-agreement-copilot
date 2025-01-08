'use client';

import { useEffect, useState } from 'react';
import { mockBulkOperationView } from '@/lib/preview-data';
import type { BulkOperation, BulkRecipient } from '@/types/bulk-operations';
import { Button } from '@/components/ui/button';

interface BulkOperationViewPreviewProps {
  operationId?: string; // Optional in preview
}

export function BulkOperationViewPreview({ operationId = 'bulk-123' }: BulkOperationViewPreviewProps) {
  const [operation, setOperation] = useState<BulkOperation>(mockBulkOperationView.operation);
  const [recipients, setRecipients] = useState<BulkRecipient[]>(mockBulkOperationView.recipients);

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      if (operation.processed_count < operation.total_count) {
        setOperation(prev => ({
          ...prev,
          processed_count: Math.min(prev.processed_count + 1, prev.total_count),
          success_count: Math.min(prev.success_count + 1, prev.total_count - prev.error_count)
        }));

        // Update a random recipient
        const pendingRecipient = recipients.find(r => r.status === 'pending');
        if (pendingRecipient) {
          setRecipients(current => 
            current.map(recipient => 
              recipient.id === pendingRecipient.id
                ? { 
                    ...recipient, 
                    status: 'sent',
                    docusign_envelope_id: `env-${Math.random().toString(36).substr(2, 9)}`
                  }
                : recipient
            )
          );
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [operation.processed_count, operation.total_count, recipients]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">{operation.name}</h2>
        <p className="text-gray-500 text-sm">
          Created {new Date(operation.created_at).toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{
              width: `${(operation.processed_count / operation.total_count) * 100}%`
            }}
          ></div>
        </div>
        <p className="text-gray-600">
          {operation.processed_count} of {operation.total_count} processed
          {operation.success_count > 0 && (
            <span className="text-green-600 ml-2">
              ✓ {operation.success_count} succeeded
            </span>
          )}
          {operation.error_count > 0 && (
            <span className="text-red-600 ml-2">
              ✕ {operation.error_count} failed
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recipients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Envelope ID</th>
                <th className="text-left py-3 px-4">Error</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="border-b">
                  <td className="py-3 px-4">{recipient.name}</td>
                  <td className="py-3 px-4">{recipient.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        recipient.status === 'sent'
                          ? 'bg-yellow-100 text-yellow-800'
                          : recipient.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {recipient.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {recipient.docusign_envelope_id || '-'}
                  </td>
                  <td className="py-3 px-4 text-red-600">
                    {recipient.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setOperation(mockBulkOperationView.operation);
            setRecipients(mockBulkOperationView.recipients);
          }}
        >
          Restart Demo
        </Button>
      </div>
    </div>
  );
} 