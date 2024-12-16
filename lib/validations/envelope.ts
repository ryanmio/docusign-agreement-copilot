import { z } from 'zod';

export const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  routingOrder: z.number().min(1).optional(),
});

export const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  content: z.string().min(1, 'Document content is required'),
  fileExtension: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid file extension'),
});

export const createEnvelopeSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().optional(),
  documents: z.array(documentSchema).min(1, 'At least one document is required'),
  recipients: z.array(recipientSchema).min(1, 'At least one recipient is required'),
});

// Query parameters for listing envelopes
export const listEnvelopesSchema = z.object({
  status: z.enum(['created', 'sent', 'delivered', 'signed', 'completed', 'declined', 'voided', 'error']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
}); 