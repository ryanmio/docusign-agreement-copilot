# AI-Ready Components

This document lists the components that are ready for use by the AI model in generating UI and functionality.

## Components

### BulkOperationView

A component that displays the progress and status of a bulk document sending operation with real-time updates.

```tsx
import { BulkOperationView } from '@/components/bulk-operation-view';

// Usage
<BulkOperationView 
  operationId="operation-id" // Required: The ID of the bulk operation to display
  showBackButton={false}     // Optional: Whether to show a back button (default: false)
/>
```

**Features:**
- Real-time progress updates via Supabase subscriptions
- Progress bar showing completion status
- Detailed recipient table with status indicators
- Error handling and loading states
- Responsive design with mobile support

**Use Cases:**
- Displaying status of bulk document sending operations
- Monitoring recipient progress
- Debugging failed sendings
- Real-time operation monitoring

**Technical Details:**
- Uses Supabase real-time subscriptions
- Requires authentication context
- Auto-refreshes without page reload
- Typescript support with proper type definitions

## Database Schema Dependencies

Components may depend on specific database tables and schemas. Here are the current dependencies:

### BulkOperationView Dependencies

**bulk_operations table:**
- id: string
- name: string
- created_at: timestamp
- processed_count: number
- total_count: number
- success_count: number
- error_count: number

**bulk_recipients table:**
- id: string
- bulk_operation_id: string (foreign key to bulk_operations.id)
- name: string
- email: string
- status: string
- docusign_envelope_id: string
- error_message: string 