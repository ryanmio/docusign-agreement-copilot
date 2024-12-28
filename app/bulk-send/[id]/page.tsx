'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BulkOperation, BulkRecipient } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { use } from 'react';

interface OperationDetails extends BulkOperation {
  recipients: BulkRecipient[];
}

export default function BulkOperationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [operation, setOperation] = useState<OperationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOperation() {
      try {
        const response = await fetch(`/api/bulk-operations/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch operation details');
        }
        const data = await response.json();
        setOperation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOperation();
  }, [resolvedParams.id]);

  if (loading) {
    return <div>Loading operation details...</div>;
  }

  if (error || !operation) {
    return (
      <div className="text-red-500">
        Error: {error || 'Operation not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back to Operations
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{operation.name}</h1>
            <p className="text-muted-foreground">
              Created {formatDistanceToNow(new Date(operation.created_at))} ago
            </p>
          </div>
          <StatusBadge status={operation.status} />
        </div>
      </div>

      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-4">Progress</h2>
        <Progress 
          value={(operation.processed_count / operation.total_count) * 100} 
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {operation.processed_count} of {operation.total_count} processed
          </span>
          <div className="space-x-4">
            <span className="text-green-600">
              ✓ {operation.success_count} succeeded
            </span>
            {operation.error_count > 0 && (
              <span className="text-red-600">
                ✕ {operation.error_count} failed
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-4">Recipients</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Envelope ID</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operation.recipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell>{recipient.name}</TableCell>
                  <TableCell>{recipient.email}</TableCell>
                  <TableCell>
                    <RecipientStatusBadge status={recipient.status} />
                  </TableCell>
                  <TableCell>
                    {recipient.docusign_envelope_id ? (
                      <code className="text-xs">
                        {recipient.docusign_envelope_id}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {recipient.error_message ? (
                      <span className="text-red-600 text-sm">
                        {recipient.error_message}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: BulkOperation['status'] }) {
  const variants: Record<typeof status, { class: string; label: string }> = {
    created: { class: 'bg-blue-100 text-blue-800', label: 'Created' },
    processing: { class: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
    completed: { class: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { class: 'bg-red-100 text-red-800', label: 'Failed' }
  };

  const variant = variants[status];

  return (
    <Badge variant="secondary" className={variant.class}>
      {variant.label}
    </Badge>
  );
}

function RecipientStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Pending
      </Badge>
    );
  }

  const variants: Record<string, { class: string; label: string }> = {
    created: { class: 'bg-blue-100 text-blue-800', label: 'Created' },
    sent: { class: 'bg-yellow-100 text-yellow-800', label: 'Sent' },
    delivered: { class: 'bg-blue-100 text-blue-800', label: 'Delivered' },
    completed: { class: 'bg-green-100 text-green-800', label: 'Completed' },
    declined: { class: 'bg-red-100 text-red-800', label: 'Declined' },
    error: { class: 'bg-red-100 text-red-800', label: 'Error' }
  };

  const variant = variants[status] || { 
    class: 'bg-gray-100 text-gray-800', 
    label: status 
  };

  return (
    <Badge variant="secondary" className={variant.class}>
      {variant.label}
    </Badge>
  );
} 