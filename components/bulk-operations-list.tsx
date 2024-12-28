'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BulkOperation } from '@/types/supabase';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function BulkOperationsList() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOperations() {
      try {
        const response = await fetch('/api/bulk-operations');
        if (!response.ok) {
          throw new Error('Failed to fetch operations');
        }
        const data = await response.json();
        setOperations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOperations();
  }, []);

  if (loading) {
    return <div>Loading operations...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bulk operations found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {operations.map((operation) => (
        <Link 
          key={operation.id} 
          href={`/bulk-send/${operation.id}`}
          className="block transition-colors hover:bg-muted/50"
        >
          <Card className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{operation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(operation.created_at))} ago
                </p>
              </div>
              <StatusBadge status={operation.status} />
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={(operation.processed_count / operation.total_count) * 100} 
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
            </div>
          </Card>
        </Link>
      ))}
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