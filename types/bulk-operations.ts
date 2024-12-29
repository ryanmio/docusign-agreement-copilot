export type BulkOperationStatus = 'created' | 'processing' | 'completed' | 'failed';

export interface BulkOperation {
  id: string;
  user_id: string;
  name: string;
  status: BulkOperationStatus;
  total_count: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface BulkRecipient {
  id: string;
  bulk_operation_id: string;
  email: string;
  name: string;
  status?: string;
  docusign_envelope_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
} 