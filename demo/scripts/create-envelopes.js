import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import docusign from 'docusign-esign';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Configuration
const DEMO_DIR = path.join(__dirname, '..');
const PDF_DIR = path.join(DEMO_DIR, 'pdf');
const ENVELOPE_LOG = path.join(DEMO_DIR, 'envelope-log.json');

// DocuSign configuration
const DOCUSIGN_BASE_PATH = process.env.NEXT_PUBLIC_DOCUSIGN_AUTHORIZATION_SERVER || 'https://account-d.docusign.com';
const DOCUSIGN_CLIENT_ID = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET;
const DOCUSIGN_ADMIN_EMAIL = process.env.DOCUSIGN_ADMIN_EMAIL;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID || '31665779';

// Track created envelopes for potential rollback and completion
const createdEnvelopes = [];

// Initialize DocuSign client
async function initializeDocuSignClient() {
  const DOCUSIGN_ACCESS_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN;
  
  if (!DOCUSIGN_ACCESS_TOKEN) {
    throw new Error('DOCUSIGN_ACCESS_TOKEN is missing from .env.local file');
  }

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', `Bearer ${DOCUSIGN_ACCESS_TOKEN}`);

  return apiClient;
}

// Demo recipients
const recipients = {
  sarah: {
    name: 'Sarah Johnson',
    email: 'ryan+sarah@mioduski.us',
    role: 'signer'
  },
  manager: {
    name: 'John Smith',
    email: 'ryan+manager@mioduski.us',
    role: 'manager'
  },
  vendor: {
    name: 'Alice Johnson',
    email: 'ryanamio@gmail.com',
    role: 'vendor'
  }
};

// Prompt for confirmation
async function confirmAction(message) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${message} (yes/no): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// Save envelope log
async function saveEnvelopeLog() {
  await fs.writeFile(ENVELOPE_LOG, JSON.stringify({
    timestamp: new Date().toISOString(),
    envelopes: createdEnvelopes
  }, null, 2));
  console.log(`\n📝 Envelope log saved to: ${ENVELOPE_LOG}`);
}

// Validate PDF exists
async function validateDocument(documentPath) {
  console.log(`Validating document: ${documentPath}`);
  try {
    await fs.access(documentPath);
    return true;
  } catch (error) {
    console.error(`❌ Document not found: ${documentPath}`);
    return false;
  }
}

// Filter function to check if a document should be processed
function shouldProcessDocument(filename) {
  const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (!dateMatch) return false;
  
  const docDate = new Date(dateMatch[0]);
  const cutoffDate = new Date('2024-12-17'); // Only process docs from Dec 17, 2024 onwards
  
  return docDate >= cutoffDate;
}

// Process weekly review documents
async function processWeeklyReviews(apiClient, isDryRun) {
  console.log('\nProcessing Weekly Review documents...');
  const pattern = /WEEKLY-REVIEW-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const weeklyReviews = files.filter(f => pattern.test(f) && shouldProcessDocument(f));
  console.log(`Found ${weeklyReviews.length} weekly review documents`);

  for (const file of weeklyReviews) {
    const documentPath = path.join(PDF_DIR, file);
    const [, date] = pattern.exec(file);
    const envelopeId = isDryRun ? 'TEST-ENVELOPE-ID' : await createEnvelope(apiClient, {
      emailSubject: `Weekly Team Review - ${date}`,
      documents: [{
        documentBase64: Buffer.from(await fs.readFile(documentPath)).toString('base64'),
        name: file,
        fileExtension: 'pdf'
      }],
      recipients: [{
        name: 'John Smith',
        email: 'ryan+manager@mioduski.us',
        role: 'manager'
      }],
      metadata: {
        documentType: 'WEEKLY',
        category: 'Review',
        effectiveDate: date,
        parties: 'John Smith',
        autoRenew: file.includes('FastComm'),
        expirationDate: getExpirationDate(file),
        completionOrder: 1,
        expectedStatus: 'completed',
        completionDate: date
      }
    });
    if (!isDryRun && !envelopeId.startsWith('DRY-RUN-')) {
      createdEnvelopes.push({
        envelopeId,
        documentName: file,
        emailSubject: `Weekly Team Review - ${date}`,
        recipients: [{ name: 'John Smith', email: 'ryan+manager@mioduski.us' }],
        metadata: {
          documentType: 'WEEKLY',
          category: 'Review',
          effectiveDate: date,
          parties: 'John Smith',
          autoRenew: file.includes('FastComm'),
          expirationDate: getExpirationDate(file),
          completionOrder: 1,
          expectedStatus: 'completed',
          completionDate: date
        },
        timestamp: new Date().toISOString()
      });
    }
    console.log(`✅ Envelope ${isDryRun ? 'would be' : 'sent'} successfully. Envelope ID: ${envelopeId}`);
  }
}

// Process vendor documents
async function processVendorDocuments(apiClient, isDryRun) {
  console.log('\nProcessing Vendor documents...');
  const pattern = /VENDOR-(CHECK-IN|RENEWAL)-([A-Za-z]+)-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const vendorDocs = files.filter(f => pattern.test(f) && shouldProcessDocument(f));
  console.log(`Found ${vendorDocs.length} vendor documents`);

  for (const file of vendorDocs) {
    const documentPath = path.join(PDF_DIR, file);
    const [, type, company, date] = pattern.exec(file);
    const envelopeId = isDryRun ? 'TEST-ENVELOPE-ID' : await createEnvelope(apiClient, {
      emailSubject: `${company} - ${type === 'CHECK-IN' ? 'Check-in' : 'Renewal'} - ${date}`,
      documents: [{
        documentBase64: Buffer.from(await fs.readFile(documentPath)).toString('base64'),
        name: file,
        fileExtension: 'pdf'
      }],
      recipients: [
        {
          name: 'Alice Johnson',
          email: 'ryanamio@gmail.com',
          role: 'vendor'
        },
        {
          name: 'John Smith',
          email: 'ryan+manager@mioduski.us',
          role: 'manager'
        }
      ],
      metadata: {
        documentType: 'VENDOR',
        category: 'Agreement',
        effectiveDate: date,
        parties: 'Alice Johnson;John Smith',
        autoRenew: file.includes('FastComm'),
        expirationDate: getExpirationDate(file),
        completionOrder: type === 'CHECK-IN' ? 3 : 2,
        expectedStatus: type === 'CHECK-IN' ? 'sent' : 'completed',
        completionDate: type === 'CHECK-IN' ? '' : new Date(date).toISOString().split('T')[0]
      }
    });
    if (!isDryRun && !envelopeId.startsWith('DRY-RUN-')) {
      createdEnvelopes.push({
        envelopeId,
        documentName: file,
        emailSubject: `${company} - ${type === 'CHECK-IN' ? 'Check-in' : 'Renewal'} - ${date}`,
        recipients: [
          { name: 'Alice Johnson', email: 'ryanamio@gmail.com' },
          { name: 'John Smith', email: 'ryan+manager@mioduski.us' }
        ],
        metadata: {
          documentType: 'VENDOR',
          category: 'Agreement',
          effectiveDate: date,
          parties: 'Alice Johnson;John Smith',
          autoRenew: file.includes('FastComm'),
          expirationDate: getExpirationDate(file),
          completionOrder: type === 'CHECK-IN' ? 3 : 2,
          expectedStatus: type === 'CHECK-IN' ? 'sent' : 'completed',
          completionDate: type === 'CHECK-IN' ? '' : new Date(date).toISOString().split('T')[0]
        },
        timestamp: new Date().toISOString()
      });
    }
    console.log(`✅ Envelope ${isDryRun ? 'would be' : 'sent'} successfully. Envelope ID: ${envelopeId}`);
  }
}

// Process Sarah's documents
async function processSarahDocuments(apiClient, isDryRun) {
  console.log('\nProcessing offboarding documents...');
  const pattern = /(SARAH|MICHAEL)-OFFBOARDING-([A-Z]+)-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const offboardingDocs = files.filter(f => pattern.test(f) && shouldProcessDocument(f));
  console.log(`Found ${offboardingDocs.length} offboarding documents`);

  for (const file of offboardingDocs) {
    const documentPath = path.join(PDF_DIR, file);
    const [, type, date] = pattern.exec(file);
    const envelopeId = isDryRun ? 'TEST-ENVELOPE-ID' : await createEnvelope(apiClient, {
      emailSubject: `Sarah's Offboarding Documents - ${date}`,
      documents: [{
        documentBase64: Buffer.from(await fs.readFile(documentPath)).toString('base64'),
        name: file,
        fileExtension: 'pdf'
      }],
      recipients: [
        {
          name: 'Sarah Johnson',
          email: 'ryan+sarah@mioduski.us',
          role: 'signer'
        },
        {
          name: 'John Smith',
          email: 'ryan+manager@mioduski.us',
          role: 'manager'
        }
      ],
      metadata: {
        documentType: 'SARAH',
        category: 'HR',
        effectiveDate: date,
        parties: 'Sarah Johnson;John Smith',
        autoRenew: file.includes('FastComm'),
        expirationDate: getExpirationDate(file),
        completionOrder: 4,
        expectedStatus: 'sent',
        completionDate: ''
      }
    });
    if (!isDryRun && !envelopeId.startsWith('DRY-RUN-')) {
      createdEnvelopes.push({
        envelopeId,
        documentName: file,
        emailSubject: `Sarah's Offboarding Documents - ${date}`,
        recipients: [
          { name: 'Sarah Johnson', email: 'ryan+sarah@mioduski.us' },
          { name: 'John Smith', email: 'ryan+manager@mioduski.us' }
        ],
        metadata: {
          documentType: 'SARAH',
          category: 'HR',
          effectiveDate: date,
          parties: 'Sarah Johnson;John Smith',
          autoRenew: file.includes('FastComm'),
          expirationDate: getExpirationDate(file),
          completionOrder: 4,
          expectedStatus: 'sent',
          completionDate: ''
        },
        timestamp: new Date().toISOString()
      });
    }
    console.log(`✅ Envelope ${isDryRun ? 'would be' : 'sent'} successfully. Envelope ID: ${envelopeId}`);
  }
}

// Count documents to process
async function countDocuments() {
  const files = await fs.readdir(PDF_DIR);
  return {
    weeklyReviews: files.filter(f => /WEEKLY-REVIEW-.*\.pdf$/.test(f)).length,
    vendorDocs: files.filter(f => /VENDOR-(CHECK-IN|RENEWAL)-.*\.pdf$/.test(f)).length,
    sarahDocs: files.filter(f => /SARAH-OFFBOARDING-.*\.pdf$/.test(f)).length
  };
}

// Create and send envelope
async function sendEnvelope(client, documentPath, emailSubject, signers, isDryRun = false) {
  console.log(`\nCreating envelope for: ${path.basename(documentPath)}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Recipients: ${signers.map(s => `${s.name} <${s.email}>`).join(', ')}`);
  
  if (!await validateDocument(documentPath)) {
    throw new Error(`Invalid document: ${documentPath}`);
  }

  try {
    // Read document content
    const documentContent = await fs.readFile(documentPath);
    const documentBase64 = Buffer.from(documentContent).toString('base64');
    
    // Extract metadata from filename
    const fileName = path.basename(documentPath);
    const docType = fileName.split('-')[0];
    const effectiveDate = extractDate(fileName);
    
    // Calculate completion metadata
    const completionMetadata = calculateCompletionMetadata(docType, effectiveDate);
    
    const metadata = {
      documentType: docType,
      category: getDocumentCategory(docType),
      effectiveDate,
      parties: signers.map(s => s.name).join(';'),
      autoRenew: fileName.includes('FastComm'),
      expirationDate: getExpirationDate(fileName),
      ...completionMetadata
    };
    
    // Create envelope with our client
    const envelopeId = await client.createEnvelope({
      emailSubject,
      documents: [{
        documentBase64,
        name: path.basename(documentPath),
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: signers.map((signer, i) => ({
        email: signer.email,
        name: signer.name,
        recipientId: (i + 1).toString(),
        routingOrder: (i + 1).toString(),
        roleName: signer.role
      })),
      metadata
    });
    
    // Track created envelope
    if (!isDryRun && !envelopeId.startsWith('DRY-RUN-')) {
      createdEnvelopes.push({
        envelopeId,
        documentName: path.basename(documentPath),
        emailSubject,
        recipients: signers.map(s => ({ name: s.name, email: s.email })),
        metadata,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Envelope ${isDryRun ? 'would be' : 'sent'} successfully. Envelope ID: ${envelopeId}`);
    return envelopeId;
  } catch (error) {
    console.error('❌ Error sending envelope:', error.message);
    throw error;
  }
}

// Calculate completion metadata based on document type and date
function calculateCompletionMetadata(docType, effectiveDate) {
  const date = new Date(effectiveDate);
  
  switch (docType) {
    case 'WEEKLY':
      // Weekly reviews should be completed same day
      return {
        completionOrder: 1,
        expectedStatus: 'completed',
        completionDate: effectiveDate
      };
    
    case 'VENDOR':
      if (effectiveDate.includes('2023-12')) {
        // Recent vendor docs should be pending
        return {
          completionOrder: 3,
          expectedStatus: 'sent',
          completionDate: ''
        };
      } else {
        // Older vendor docs should be completed
        const completionDate = new Date(date);
        completionDate.setDate(date.getDate() + 2);
        return {
          completionOrder: 2,
          expectedStatus: 'completed',
          completionDate: completionDate.toISOString().split('T')[0]
        };
      }
    
    case 'SARAH':
      // Sarah's docs should be pending
      return {
        completionOrder: 4,
        expectedStatus: 'sent',
        completionDate: ''
      };
    
    default:
      return {
        completionOrder: 99,
        expectedStatus: 'sent',
        completionDate: ''
      };
  }
}

// Helper functions for metadata
function getDocumentCategory(docType) {
  switch (docType) {
    case 'WEEKLY':
      return 'Review';
    case 'VENDOR':
      return 'Agreement';
    case 'SARAH':
      return 'HR';
    case 'INTERNAL':
      return 'Review';
    default:
      return 'Other';
  }
}

function extractDate(fileName) {
  const match = fileName.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function getExpirationDate(fileName) {
  // Only vendor renewals have expiration dates
  if (!fileName.includes('VENDOR-RENEWAL-')) {
    return '';
  }
  
  const effectiveDate = extractDate(fileName);
  if (!effectiveDate) {
    return '';
  }
  
  // Add one year to effective date
  const date = new Date(effectiveDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

async function createEnvelope(apiClient, envelopeData) {
  try {
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    
    const envelope = new docusign.EnvelopeDefinition();
    envelope.templateId = envelopeData.templateId;
    envelope.templateRoles = envelopeData.templateRoles;
    envelope.status = envelopeData.status;
    envelope.emailSubject = envelopeData.emailSubject;
    
    // Add metadata as custom fields
    const customFields = {
      textCustomFields: Object.entries(envelopeData.metadata).map(([key, value]) => ({
        name: key,
        value: value.toString(),
        required: 'false',
        show: 'true'
      }))
    };
    envelope.customFields = customFields;

    console.log(`Creating envelope for ${envelopeData.emailSubject}...`);
    const results = await envelopesApi.createEnvelope(DOCUSIGN_ACCOUNT_ID, { envelopeDefinition: envelope });
    console.log(`Envelope created with ID: ${results.envelopeId}`);
    
    // Log the envelope details
    const envelopeLog = {
      envelopeId: results.envelopeId,
      templateId: envelopeData.templateId,
      emailSubject: envelopeData.emailSubject,
      status: results.status,
      metadata: envelopeData.metadata,
      created: new Date().toISOString()
    };
    
    // Append to envelope log file
    const logPath = path.resolve(__dirname, 'envelope-log.json');
    let existingLog = [];
    try {
      existingLog = JSON.parse(await fs.readFile(logPath, 'utf8'));
    } catch (error) {
      // File doesn't exist or is invalid JSON
    }
    existingLog.push(envelopeLog);
    await fs.writeFile(logPath, JSON.stringify(existingLog, null, 2));
    
    return results;
  } catch (error) {
    console.error('Error creating envelope:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
    throw error;
  }
}

// Validate environment variables
function validateEnvironment() {
  const required = {
    'NEXT_PUBLIC_DOCUSIGN_AUTHORIZATION_SERVER': DOCUSIGN_BASE_PATH,
    'NEXT_PUBLIC_DOCUSIGN_CLIENT_ID': DOCUSIGN_CLIENT_ID,
    'DOCUSIGN_CLIENT_SECRET': DOCUSIGN_CLIENT_SECRET,
    'DOCUSIGN_ADMIN_EMAIL': DOCUSIGN_ADMIN_EMAIL,
    'DOCUSIGN_ACCOUNT_ID': DOCUSIGN_ACCOUNT_ID
  };

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n` +
      'Please check your .env.local file and ensure all variables are set.'
    );
  }
}

// Template IDs
const VENDOR_RENEWAL_TEMPLATE_ID = 'f8b28512-7f82-4c22-bcee-1c87b7ba4fe3';
const EMPLOYEE_OFFBOARDING_TEMPLATE_ID = 'fbe8f291-a700-43a8-a7cb-845f88eb941a';

// Demo data
const demoEnvelopes = [
  // FastComm Historical Renewals
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'FastComm Vendor Renewal Agreement - February 2022',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '129575'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'FastComm',
      effectiveDate: '2022-02-01',
      expirationDate: '2023-02-01',
      parties: 'FastComm;GreenLeaf Analytics',
      annualFee: 129575,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2022-02-01'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'FastComm Vendor Renewal Agreement - February 2023',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '136054'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'FastComm',
      effectiveDate: '2023-02-01',
      expirationDate: '2024-02-01',
      parties: 'FastComm;GreenLeaf Analytics',
      annualFee: 136054,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2023-02-01'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'FastComm Vendor Renewal Agreement - February 2024',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '142857'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'FastComm',
      effectiveDate: '2024-02-01',
      expirationDate: '2025-02-01',
      parties: 'FastComm;GreenLeaf Analytics',
      annualFee: 142857,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2024-02-01'
    }
  },

  // GlobalTech Historical Renewals
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'GlobalTech Vendor Renewal Agreement - January 2022',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '172768'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'GlobalTech',
      effectiveDate: '2022-01-07',
      expirationDate: '2023-01-07',
      parties: 'GlobalTech;GreenLeaf Analytics',
      annualFee: 172768,
      autoRenew: false,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2022-01-07'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'GlobalTech Vendor Renewal Agreement - January 2023',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '181406'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'GlobalTech',
      effectiveDate: '2023-01-07',
      expirationDate: '2024-01-07',
      parties: 'GlobalTech;GreenLeaf Analytics',
      annualFee: 181406,
      autoRenew: false,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2023-01-07'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'GlobalTech Vendor Renewal Agreement - January 2024',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '190476'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'GlobalTech',
      effectiveDate: '2024-01-07',
      expirationDate: '2025-01-07',
      parties: 'GlobalTech;GreenLeaf Analytics',
      annualFee: 190476,
      autoRenew: false,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2024-01-07'
    }
  },

  // AcmeCorp Historical Renewals
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'AcmeCorp Vendor Renewal Agreement - January 2022',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '151171'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'AcmeCorp',
      effectiveDate: '2022-01-15',
      expirationDate: '2023-01-15',
      parties: 'AcmeCorp;GreenLeaf Analytics',
      annualFee: 151171,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2022-01-15'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'AcmeCorp Vendor Renewal Agreement - January 2023',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '158730'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'AcmeCorp',
      effectiveDate: '2023-01-15',
      expirationDate: '2024-01-15',
      parties: 'AcmeCorp;GreenLeaf Analytics',
      annualFee: 158730,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2023-01-15'
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'AcmeCorp Vendor Renewal Agreement - January 2024',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '166667'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'AcmeCorp',
      effectiveDate: '2024-01-15',
      expirationDate: '2025-01-15',
      parties: 'AcmeCorp;GreenLeaf Analytics',
      annualFee: 166667,
      autoRenew: true,
      completionOrder: 2,
      status: 'completed',
      completionDate: '2024-01-15'
    }
  },

  // Vendor Renewals
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'FastComm Vendor Renewal Agreement - February 2025',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '150000'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'FastComm',
      effectiveDate: '2025-02-01',
      expirationDate: '2026-02-01',
      parties: 'FastComm;GreenLeaf Analytics',
      annualFee: 150000,
      autoRenew: true,
      completionOrder: 2
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'GlobalTech Vendor Renewal Agreement - January 2025',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '200000'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'GlobalTech',
      effectiveDate: '2025-01-07',
      expirationDate: '2026-01-07',
      parties: 'GlobalTech;GreenLeaf Analytics',
      annualFee: 200000,
      autoRenew: false,
      completionOrder: 2
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'AcmeCorp Vendor Renewal Agreement - January 2025',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '175000'
            }
          ]
        }
      },
      {
        email: 'ryanamio@gmail.com',
        name: 'Alice Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'AcmeCorp',
      effectiveDate: '2025-01-15',
      expirationDate: '2026-01-15',
      parties: 'AcmeCorp;GreenLeaf Analytics',
      annualFee: 175000,
      autoRenew: true,
      completionOrder: 2
    }
  },

  // Sarah's Offboarding Documents
  {
    templateId: EMPLOYEE_OFFBOARDING_TEMPLATE_ID,
    emailSubject: 'Sarah Johnson - IP Protection Agreement',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+sarah@mioduski.us',
        name: 'Sarah Johnson',
        roleName: 'Employee',
        tabs: {
          dateTabs: [
            {
              tabLabel: 'Separation Date fe9ffc63-56b3-4eaf-b62f-0230f7c2a253',
              value: '2025-01-02'
            }
          ]
        }
      },
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Supervisor'
      }
    ],
    metadata: {
      type: 'offboarding_ip',
      employee: 'Sarah Johnson',
      department: 'Engineering',
      position: 'Senior Developer',
      separationDate: '2025-01-02',
      documentType: 'OFFBOARDING',
      category: 'HR',
      effectiveDate: '2025-01-02',
      parties: 'Sarah Johnson;GreenLeaf Analytics',
      agreementType: 'IP_PROTECTION',
      completionOrder: 1
    }
  },
  {
    templateId: EMPLOYEE_OFFBOARDING_TEMPLATE_ID,
    emailSubject: 'Sarah Johnson - Account Access Termination',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+sarah@mioduski.us',
        name: 'Sarah Johnson',
        roleName: 'Employee',
        tabs: {
          dateTabs: [
            {
              tabLabel: 'Separation Date fe9ffc63-56b3-4eaf-b62f-0230f7c2a253',
              value: '2025-01-02'
            }
          ]
        }
      },
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Supervisor'
      }
    ],
    metadata: {
      type: 'offboarding_accounts',
      employee: 'Sarah Johnson',
      department: 'Engineering',
      position: 'Senior Developer',
      separationDate: '2025-01-02',
      documentType: 'OFFBOARDING',
      category: 'HR',
      effectiveDate: '2025-01-02',
      parties: 'Sarah Johnson;GreenLeaf Analytics',
      agreementType: 'ACCOUNT_ACCESS',
      completionOrder: 1
    }
  },
  {
    templateId: EMPLOYEE_OFFBOARDING_TEMPLATE_ID,
    emailSubject: 'Sarah Johnson - Non-Disclosure Agreement',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+sarah@mioduski.us',
        name: 'Sarah Johnson',
        roleName: 'Employee',
        tabs: {
          dateTabs: [
            {
              tabLabel: 'Separation Date fe9ffc63-56b3-4eaf-b62f-0230f7c2a253',
              value: '2025-01-02'
            }
          ]
        }
      },
      {
        email: 'ryan+manager@mioduski.us',
        name: 'John Smith',
        roleName: 'Supervisor'
      }
    ],
    metadata: {
      type: 'offboarding_nda',
      employee: 'Sarah Johnson',
      department: 'Engineering',
      position: 'Senior Developer',
      separationDate: '2025-01-02',
      documentType: 'OFFBOARDING',
      category: 'HR',
      effectiveDate: '2025-01-02',
      parties: 'Sarah Johnson;GreenLeaf Analytics',
      agreementType: 'NDA',
      completionOrder: 1
    }
  }
];

async function main() {
  try {
    const apiClient = await initializeDocuSignClient();
    
    console.log('\nCreating demo envelopes...\n');
    
    for (const envelopeData of demoEnvelopes) {
      await createEnvelope(apiClient, envelopeData);
    }
    
    console.log('\nAll demo envelopes created successfully!');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Only run if --execute flag is present
if (process.argv.includes('--execute')) {
  main().catch(console.error);
} else {
  console.log('Run with --execute flag to create envelopes');
} 