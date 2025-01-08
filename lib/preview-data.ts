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