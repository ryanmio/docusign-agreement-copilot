'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BulkOperation, BulkRecipient } from '@/types/bulk-operations';

interface BulkOperationViewProps {
  operationId: string;
  showBackButton?: boolean;
}

export function BulkOperationView({ operationId, showBackButton = false }: BulkOperationViewProps) {
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [recipients, setRecipients] = useState<BulkRecipient[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch
    async function fetchOperation() {
      const { data: operation } = await supabase
        .from('bulk_operations')
        .select('*')
        .eq('id', operationId)
        .single();

      if (operation) {
        setOperation(operation);
      }

      const { data: recipients } = await supabase
        .from('bulk_recipients')
        .select('*')
        .eq('bulk_operation_id', operationId);

      if (recipients) {
        setRecipients(recipients);
      }
    }

    fetchOperation();

    // Set up real-time subscriptions
    const operationSubscription = supabase
      .channel('operation-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bulk_operations',
          filter: `id=eq.${operationId}`
        },
        (payload) => {
          setOperation(payload.new as BulkOperation);
        }
      )
      .subscribe();

    const recipientsSubscription = supabase
      .channel('recipient-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bulk_recipients',
          filter: `bulk_operation_id=eq.${operationId}`
        },
        (payload) => {
          setRecipients(current => 
            current.map(recipient => 
              recipient.id === (payload.new as BulkRecipient).id 
                ? { ...recipient, ...payload.new as BulkRecipient }
                : recipient
            )
          );
        }
      )
      .subscribe();

    return () => {
      operationSubscription.unsubscribe();
      recipientsSubscription.unsubscribe();
    };
  }, [operationId, supabase]);

  if (!operation) {
    return <div>Loading...</div>;
  }

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
    </div>
  );
} 