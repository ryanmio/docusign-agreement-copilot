'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BulkOperation, BulkRecipient } from '@/types/bulk-operations';
import { use } from 'react';

export default function BulkOperationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [recipients, setRecipients] = useState<BulkRecipient[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch
    async function fetchOperation() {
      const { data: operation } = await supabase
        .from('bulk_operations')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (operation) {
        setOperation(operation);
      }

      const { data: recipients } = await supabase
        .from('bulk_recipients')
        .select('*')
        .eq('bulk_operation_id', resolvedParams.id);

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
          filter: `id=eq.${resolvedParams.id}`
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
          filter: `bulk_operation_id=eq.${resolvedParams.id}`
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
  }, [resolvedParams.id, supabase]);

  if (!operation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/bulk-send"
        className="inline-flex items-center mb-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Operations
      </Link>

      <h1 className="text-3xl font-bold mb-2">{operation.name}</h1>
      <p className="text-gray-500 mb-8">
        Created {new Date(operation.created_at).toLocaleString()}
      </p>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Progress</h2>
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
        <h2 className="text-xl font-semibold mb-4">Recipients</h2>
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