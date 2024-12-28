import { Metadata } from 'next';
import { BulkOperationsList } from '../../components/bulk-operations-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bulk Send Operations',
  description: 'Manage your bulk send operations'
};

export default function BulkSendPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bulk Send Operations</h1>
          <p className="text-muted-foreground">
            Send documents to multiple recipients at once
          </p>
        </div>
        <Button asChild>
          <Link href="/bulk-send/new">
            New Bulk Send
          </Link>
        </Button>
      </div>
      <BulkOperationsList />
    </div>
  );
} 