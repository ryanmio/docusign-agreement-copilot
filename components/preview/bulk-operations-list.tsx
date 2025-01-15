'use client';

import { useState } from 'react';
import { mockBulkOperations } from '@/lib/preview-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function BulkOperationsListPreview() {
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useState(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  });

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner label="Loading bulk operations..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockBulkOperations.map((operation) => (
        <Card key={operation.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{operation.name}</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(operation.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`#view-${operation.id}`}>View Details</Link>
            </Button>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(operation.processed_count / operation.total_count) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
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
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 