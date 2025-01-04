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
const DOCUSIGN_BASE_PATH = process.env.NEXT_PUBLIC_DOCUSIGN_OAUTH_BASE_PATH;
const DOCUSIGN_CLIENT_ID = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID;
const DOCUSIGN_ADMIN_EMAIL = process.env.DOCUSIGN_ADMIN_EMAIL;

// Track created envelopes for potential rollback
const createdEnvelopes = [];

// Create DocuSign API client
function createDocuSignClient() {
  if (!DOCUSIGN_BASE_PATH || !DOCUSIGN_CLIENT_ID || !DOCUSIGN_ADMIN_EMAIL) {
    throw new Error('Missing required DocuSign configuration');
  }

  const apiClient = new docusign.ApiClient({
    basePath: DOCUSIGN_BASE_PATH,
    oAuthBasePath: DOCUSIGN_BASE_PATH
  });

  return {
    async createEnvelope({ emailSubject, documents, recipients }) {
      console.log('Creating envelope:', { emailSubject, recipients });
      
      if (process.env.NODE_ENV !== 'production') {
        return 'TEST-ENVELOPE-ID';
      }

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
          recipientId: recipient.recipientId,
          routingOrder: recipient.routingOrder
        });
        return signer;
      });

      envelopeDefinition.recipients = { signers };
      envelopeDefinition.status = 'sent';

      // For dry run, return fake ID
      if (!process.argv.includes('--execute')) {
        return `DRY-RUN-${Date.now()}`;
      }

      try {
        const envelopesApi = new docusign.EnvelopesApi(apiClient);
        const results = await envelopesApi.createEnvelope(
          process.env.DOCUSIGN_ACCOUNT_ID,
          { envelopeDefinition }
        );
        return results.envelopeId;
      } catch (error) {
        console.error('Error creating envelope:', error);
        throw error;
      }
    }
  };
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
async function processWeeklyReviews(client, isDryRun) {
  console.log('\nProcessing Weekly Review documents...');
  const pattern = /WEEKLY-REVIEW-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const weeklyReviews = files.filter(f => pattern.test(f));
  console.log(`Found ${weeklyReviews.length} weekly review documents`);

  for (const file of weeklyReviews) {
    const documentPath = path.join(PDF_DIR, file);
    const [, date] = pattern.exec(file);
    await sendEnvelope(
      client,
      documentPath,
      `Weekly Team Review - ${date}`,
      [recipients.manager],
      isDryRun
    );
  }
}

// Process vendor documents
async function processVendorDocuments(client, isDryRun) {
  console.log('\nProcessing Vendor documents...');
  const pattern = /VENDOR-(CHECK-IN|RENEWAL)-([A-Za-z]+)-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const vendorDocs = files.filter(f => pattern.test(f));
  console.log(`Found ${vendorDocs.length} vendor documents`);

  for (const file of vendorDocs) {
    const documentPath = path.join(PDF_DIR, file);
    const [, type, company, date] = pattern.exec(file);
    await sendEnvelope(
      client,
      documentPath,
      `${company} - ${type === 'CHECK-IN' ? 'Check-in' : 'Renewal'} - ${date}`,
      [recipients.vendor, recipients.manager],
      isDryRun
    );
  }
}

// Process Sarah's documents
async function processSarahDocuments(client, isDryRun) {
  console.log('\nProcessing Sarah\'s documents...');
  const pattern = /SARAH-OFFBOARDING-([A-Z]+)-(\d{4}-\d{2}-\d{2})\.pdf$/;
  const files = await fs.readdir(PDF_DIR);
  const sarahDocs = files.filter(f => pattern.test(f));
  console.log(`Found ${sarahDocs.length} offboarding documents`);

  for (const file of sarahDocs) {
    const documentPath = path.join(PDF_DIR, file);
    const [, type, date] = pattern.exec(file);
    await sendEnvelope(
      client,
      documentPath,
      `Sarah's Offboarding Documents - ${date}`,
      [recipients.sarah, recipients.manager],
      isDryRun
    );
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
      }))
    });
    
    // Track created envelope
    if (!isDryRun && !envelopeId.startsWith('DRY-RUN-')) {
      createdEnvelopes.push({
        envelopeId,
        documentName: path.basename(documentPath),
        emailSubject,
        recipients: signers.map(s => ({ name: s.name, email: s.email })),
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

// Main execution
async function main() {
  try {
    console.log('🔍 Analyzing documents...');
    const counts = await countDocuments();
    const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);
    
    console.log('\nDocuments to be processed:');
    console.log(`- Weekly Reviews: ${counts.weeklyReviews}`);
    console.log(`- Vendor Documents: ${counts.vendorDocs}`);
    console.log(`- Sarah's Documents: ${counts.sarahDocs}`);
    console.log(`\nTotal documents: ${totalDocs}`);
    
    const isDryRun = !process.argv.includes('--execute');
    if (isDryRun) {
      console.log('\n🏃 DRY RUN MODE - No envelopes will be created');
    } else {
      const confirmed = await confirmAction(
        '\n⚠️  This will create real DocuSign envelopes and send emails to recipients. Proceed?'
      );
      if (!confirmed) {
        console.log('Operation cancelled by user');
        process.exit(0);
      }
    }
    
    console.log('\n🚀 Starting envelope creation...');
    
    // Initialize our DocuSign client
    const client = createDocuSignClient();
    
    // Process all document types
    await processWeeklyReviews(client, isDryRun);
    await processVendorDocuments(client, isDryRun);
    await processSarahDocuments(client, isDryRun);
    
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
    if (createdEnvelopes.length > 0) {
      console.log('\n⚠️  Some envelopes were created before the error occurred');
      await saveEnvelopeLog();
    }
    process.exit(1);
  }
}

// Run without --execute for dry run
main(); 