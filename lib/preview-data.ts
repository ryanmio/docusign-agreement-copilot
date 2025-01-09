export const mockTemplates = [
  {
    templateId: 'template-1',
    name: 'Sales Agreement',
    description: 'Standard sales agreement template with payment terms',
  },
  {
    templateId: 'template-2',
    name: 'NDA Template',
    description: 'Non-disclosure agreement for business partnerships',
  },
  {
    templateId: 'template-3',
    name: 'Employment Contract',
    description: 'Standard employment agreement with terms and conditions',
  },
];

export const mockPriorityDashboard = {
  sections: [
    {
      title: 'Urgent Action Required',
      type: 'urgent' as const,
      envelopes: [
        {
          envelopeId: 'env-1',
          subject: 'Sales Contract Needs Signature',
          status: 'sent',
          recipients: [
            { email: 'john@example.com', name: 'John Doe', status: 'sent' }
          ],
          urgencyReason: 'Expires in 24 hours'
        }
      ]
    },
    {
      title: 'Due Today',
      type: 'today' as const,
      envelopes: [
        {
          envelopeId: 'env-2',
          subject: 'Partnership Agreement Review',
          status: 'sent',
          recipients: [
            { email: 'alice@example.com', name: 'Alice Smith', status: 'sent' }
          ],
          urgencyReason: 'Due end of day'
        }
      ]
    }
  ]
};

export const mockRecipientRoles = [
  { roleName: 'Client', roleId: 'role-1' },
  { roleName: 'Contractor', roleId: 'role-2' },
  { roleName: 'Witness', roleId: 'role-3' }
];

export const mockTemplatePreview = {
  templateId: 'template-1',
  templateName: 'Sales Agreement',
  description: 'Standard sales agreement template with payment terms and conditions',
  roles: [
    { roleName: 'Seller', roleId: 'role-1' },
    { roleName: 'Buyer', roleId: 'role-2' }
  ]
};

export const mockMathResult = {
  expression: '2500 * 1.08 + 150',
  result: 2850,
  steps: [
    '1. Multiply 2500 by 1.08 = 2700',
    '2. Add 150 to 2700 = 2850'
  ]
};

export const mockBulkOperations = [
  {
    id: 'bulk-1',
    name: 'January Contracts Batch',
    status: 'processing' as const,
    created_at: new Date().toISOString(),
    total_count: 100,
    processed_count: 45,
    success_count: 42,
    error_count: 3
  },
  {
    id: 'bulk-2',
    name: 'Q4 Renewals',
    status: 'completed' as const,
    created_at: new Date().toISOString(),
    total_count: 50,
    processed_count: 50,
    success_count: 48,
    error_count: 2
  }
];

export const mockPdfUrl = '/VENDOR-RENEWAL-AcmeCorp-2023-01-15.pdf';

export const mockDocuSignState = {
  isConnected: false,
  isProcessing: false,
  error: null,
  success: null
};

export const mockEnvelopeStates = {
  initial: {
    id: 'env-123',
    docusign_envelope_id: 'ds-456',
    status: 'sent',
    subject: 'Sales Agreement - ACME Corp',
    recipients: [
      {
        id: 'rec-1',
        name: 'John Doe',
        email: 'john@acme.com',
        status: 'sent'
      },
      {
        id: 'rec-2',
        name: 'Jane Smith',
        email: 'jane@acme.com',
        status: 'pending'
      }
    ]
  },
  inProgress: {
    id: 'env-123',
    docusign_envelope_id: 'ds-456',
    status: 'delivered',
    subject: 'Sales Agreement - ACME Corp',
    recipients: [
      {
        id: 'rec-1',
        name: 'John Doe',
        email: 'john@acme.com',
        status: 'completed'
      },
      {
        id: 'rec-2',
        name: 'Jane Smith',
        email: 'jane@acme.com',
        status: 'delivered'
      }
    ]
  },
  completed: {
    id: 'env-123',
    docusign_envelope_id: 'ds-456',
    status: 'completed',
    subject: 'Sales Agreement - ACME Corp',
    recipients: [
      {
        id: 'rec-1',
        name: 'John Doe',
        email: 'john@acme.com',
        status: 'completed'
      },
      {
        id: 'rec-2',
        name: 'Jane Smith',
        email: 'jane@acme.com',
        status: 'completed'
      }
    ]
  }
};

export const mockReminderStates = {
  success: {
    success: true,
    envelopeId: 'env-123',
    recipientCount: 2
  },
  error: {
    success: false,
    envelopeId: 'env-123',
    error: 'Failed to send reminder: Recipients not found'
  }
};

export const mockBulkOperationView = {
  operation: {
    id: 'bulk-123',
    name: 'Q1 Contract Renewals',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-123',
    total_count: 50,
    processed_count: 30,
    success_count: 25,
    error_count: 5,
    status: 'processing' as const
  },
  recipients: [
    {
      id: 'rec-1',
      name: 'Alice Johnson',
      email: 'alice@acme.com',
      status: 'sent',
      docusign_envelope_id: 'env-789',
      bulk_operation_id: 'bulk-123',
      error_message: undefined,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rec-2',
      name: 'Bob Wilson',
      email: 'bob@acme.com',
      status: 'error',
      docusign_envelope_id: undefined,
      bulk_operation_id: 'bulk-123',
      error_message: 'Invalid email address',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rec-3',
      name: 'Carol Smith',
      email: 'carol@acme.com',
      status: 'pending',
      docusign_envelope_id: undefined,
      bulk_operation_id: 'bulk-123',
      error_message: undefined,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

export const mockContractMarkdown = `# Service Agreement

## 1. Parties

This Service Agreement (the "Agreement") is entered into between:

- **Client**: Acme Corporation, a Delaware corporation with offices at 123 Business Ave, San Francisco, CA 94105
- **Service Provider**: TechPro Solutions LLC, a California limited liability company with offices at 456 Innovation Drive, San Jose, CA 95110

## 2. Services

The Service Provider agrees to provide the following services:
1. Custom software development and implementation
2. Technical support and maintenance
3. User training and documentation

## 3. Term and Compensation

This Agreement shall commence on the date of execution and continue for a period of 12 months.
The Client agrees to pay $10,000 per month for the services described herein.

## Signatures

IN WITNESS WHEREOF, the parties have executed this Agreement:

CLIENT:                              PROVIDER:
<<SIGNER1_HERE>>                    <<SIGNER2_HERE>>
____________________                ____________________
Name:                               Name:
Title:                              Title:
Date: <<DATE_HERE>>                 Date: <<DATE_HERE>>
`; 