'use client';

import Link from 'next/link';
import { use } from 'react';
import { BulkOperationView } from '@/components/bulk-operation-view';

export default function BulkOperationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/bulk-send"
        className="inline-flex items-center mb-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Operations
      </Link>

      <BulkOperationView operationId={resolvedParams.id} />
    </div>
  );
} 