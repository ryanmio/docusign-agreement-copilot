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

// Process weekly review documents
async function processWeeklyReviews(apiClient, isDryRun) {
  console.log('\nProcessing Weekly Review documents...');
  const pattern = /WEEKLY-REVIEW-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const weeklyReviews = files.filter(f => pattern.test(f));
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
  const vendorDocs = files.filter(f => pattern.test(f));
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
  console.log('\nProcessing Sarah\'s documents...');
  const pattern = /SARAH-OFFBOARDING-([A-Z]+)-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const sarahDocs = files.filter(f => pattern.test(f));
  console.log(`Found ${sarahDocs.length} offboarding documents`);

  for (const file of sarahDocs) {
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

async function createEnvelope(apiClient, { emailSubject, documents, recipients, metadata }) {
  console.log('Creating envelope:', { emailSubject, recipients, metadata });
  
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = emailSubject;
  
  // Add documents
  envelopeDefinition.documents = documents.map((doc, i) => ({
    documentBase64: doc.documentBase64,
    name: doc.name,
    fileExtension: doc.fileExtension,
    documentId: (i + 1).toString()
  }));

  // Add recipients
  const signers = recipients.map((recipient, i) => {
    const signer = docusign.Signer.constructFromObject({
      email: recipient.email,
      name: recipient.name,
      recipientId: (i + 1).toString(),
      routingOrder: (i + 1).toString(),
      roleName: recipient.role,
      tabs: {
        signHereTabs: [{
          documentId: '1',
          pageNumber: '1',
          xPosition: '100',
          yPosition: '100'
        }]
      }
    });
    return signer;
  });

  envelopeDefinition.recipients = { signers };
  envelopeDefinition.status = "sent";

  try {
    console.log('Making API call to DocuSign...');
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    console.log('Using account ID:', DOCUSIGN_ACCOUNT_ID);
    
    const results = await envelopesApi.createEnvelope(
      DOCUSIGN_ACCOUNT_ID,
      { envelopeDefinition }
    );
    
    console.log('DocuSign API Response:', JSON.stringify(results, null, 2));
    
    if (!results || !results.envelopeId) {
      throw new Error('Failed to get envelope ID from DocuSign response');
    }
    
    return results.envelopeId;
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

// Main function to create envelopes
async function main() {
  try {
    console.log('Validating environment...');
    validateEnvironment();

    console.log('Initializing DocuSign client...');
    const apiClient = await initializeDocuSignClient();
    
    console.log('🔍 Analyzing documents...');
    const counts = await countDocuments();
    const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);
    
    console.log('\nDocuments to be processed:');
    console.log(`- Weekly Reviews: ${counts.weeklyReviews}`);
    console.log(`- Vendor Documents: ${counts.vendorDocs}`);
    console.log(`- Sarah's Documents: ${counts.sarahDocs}`);
    console.log(`\nTotal documents: ${totalDocs}`);
    
    const isDryRun = !process.argv.includes('--execute');
    const skipConfirm = process.argv.includes('--no-confirm');
    
    if (isDryRun) {
      console.log('\n🏃 DRY RUN MODE - No envelopes will be created');
    } else if (!skipConfirm) {
      const confirmed = await confirmAction(
        '\n⚠️  This will create real DocuSign envelopes and send emails to recipients. Proceed?'
      );
      if (!confirmed) {
        console.log('Operation cancelled by user');
        process.exit(0);
      }
    }
    
    console.log('\n🚀 Starting envelope creation...');
    
    // Process all document types
    await processWeeklyReviews(apiClient, isDryRun);
    await processVendorDocuments(apiClient, isDryRun);
    await processSarahDocuments(apiClient, isDryRun);
    
    if (!isDryRun) {
      await saveEnvelopeLog();
    }
    
    console.log('\n✨ Process completed successfully!');
    if (isDryRun) {
      console.log('\nTo create envelopes, run with --execute flag');
    } else {
      console.log(`Created ${createdEnvelopes.length} envelopes`);
      console.log('Envelope details saved to envelope-log.json');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.body) {
      console.error('API Error Details:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

// Run without --execute for dry run
main(); 