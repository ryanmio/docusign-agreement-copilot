'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BulkOperation, BulkRecipient } from '@/types/bulk-operations';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface BulkOperationViewProps {
  operationId: string;
  showBackButton?: boolean;
}

export function BulkOperationView({ operationId, showBackButton = false }: BulkOperationViewProps) {
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [recipients, setRecipients] = useState<BulkRecipient[]>([]);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
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
    return <div className="p-4 text-[#130032]/60">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-[#CBC2FF]/40 text-[#26065D]'
      case 'error':
        return 'bg-[#FF5252]/10 text-[#FF5252]'
      case 'completed':
        return 'bg-[#4C00FF]/10 text-[#4C00FF]'
      case 'delivered':
        return 'bg-[#26065D]/10 text-[#26065D]'
      default:
        return 'bg-[#130032]/10 text-[#130032]'
    }
  }

  const RecipientRow = ({ recipient }: { recipient: BulkRecipient }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#130032]/10 last:border-b-0">
      <div className="flex items-center space-x-4">
        <span className={`
          ${getStatusColor(recipient.status || 'pending')}
          px-4 py-0.5 rounded-full text-xs font-medium capitalize
        `}>
          {recipient.status || 'pending'}
        </span>
        <div>
          <p className="font-semibold text-[#130032]">{recipient.name}</p>
          <p className="text-[#130032]/50 text-sm">{recipient.email}</p>
        </div>
      </div>
      <div className="text-right space-y-0.5">
        <p className="text-[#130032]/60 text-sm font-medium">{recipient.docusign_envelope_id || '-'}</p>
        {recipient.error_message && (
          <p className="text-[#FF5252] text-sm">{recipient.error_message}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)] w-full max-w-6xl mx-auto bg-white rounded-lg">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-1">
              {operation.name}
            </h2>
            <p className="text-[#130032]/60 text-sm tracking-[-0.01em]">
              Created {new Date(operation.created_at).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#130032] font-semibold text-2xl">{operation.processed_count}/{operation.total_count}</p>
            <p className="text-[#130032]/60 text-sm">Processed</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="mb-8">
          <div className="flex gap-6 mb-3">
            <span className="text-[#26065D] font-semibold text-lg flex items-center">
              <Check size={20} className="mr-2 stroke-[2.5]" />
              {operation.success_count} Succeeded
            </span>
            <span className="text-[#FF5252] font-semibold text-lg flex items-center">
              <AlertCircle size={20} className="mr-2 stroke-[2.5]" />
              {operation.error_count} Failed
            </span>
          </div>
          <div className="w-full bg-[#CBC2FF]/30 rounded-full h-2">
            <div
              className="bg-[#4C00FF] h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(operation.processed_count / operation.total_count) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`relative transition-all duration-300 ${showAllRecipients ? 'h-[400px]' : 'h-auto'}`}>
            {showAllRecipients && (
              <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-white to-transparent z-10" />
            )}
            
            <div className={showAllRecipients ? 'relative' : ''}>
              {showAllRecipients ? (
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  {recipients.map((recipient) => (
                    <RecipientRow key={recipient.id} recipient={recipient} />
                  ))}
                </ScrollArea>
              ) : (
                recipients.slice(0, 3).map((recipient) => (
                  <RecipientRow key={recipient.id} recipient={recipient} />
                ))
              )}
            </div>

            {showAllRecipients && (
              <div className="absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-b from-white to-transparent z-10" />
            )}
          </div>

          {recipients.length > 3 && (
            <button
              className="w-full mt-1 text-[#4C00FF] hover:text-[#4C00FF] hover:bg-[#4C00FF]/10 py-2 px-4 rounded flex items-center justify-center font-medium transition-colors duration-200"
              onClick={() => setShowAllRecipients(!showAllRecipients)}
            >
              {showAllRecipients ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show All Recipients
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 