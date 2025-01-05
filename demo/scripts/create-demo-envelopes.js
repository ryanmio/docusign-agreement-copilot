import docusign from 'docusign-esign';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env.local file
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const DOCUSIGN_ACCESS_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const DOCUSIGN_BASE_PATH = process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi';

// Template IDs
const VENDOR_RENEWAL_TEMPLATE_ID = 'f8b28512-7f82-4c22-bcee-1c87b7ba4fe3';
const EMPLOYEE_OFFBOARDING_TEMPLATE_ID = 'fbe8f291-a700-43a8-a7cb-845f88eb941a';

// Demo data
const demoEnvelopes = [
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'FastComm Vendor Renewal Agreement - February 2025',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+demo1@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '75000'
            }
          ]
        }
      },
      {
        email: 'ryan+demo2@mioduski.us',
        name: 'Sarah Johnson',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'FastComm',
      effectiveDate: '2025-02-01',
      annualFee: 75000,
      autoRenew: true
    }
  },
  {
    templateId: VENDOR_RENEWAL_TEMPLATE_ID,
    emailSubject: 'GlobalTech Vendor Renewal Agreement - January 2025',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+demo1@mioduski.us',
        name: 'John Smith',
        roleName: 'Company Representative',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Annual Fee',
              value: '120000'
            }
          ]
        }
      },
      {
        email: 'ryan+demo3@mioduski.us',
        name: 'Michael Chen',
        roleName: 'Vendor Representative'
      }
    ],
    metadata: {
      type: 'vendor_renewal',
      vendor: 'GlobalTech',
      effectiveDate: '2025-01-07',
      annualFee: 120000,
      autoRenew: false
    }
  },
  {
    templateId: EMPLOYEE_OFFBOARDING_TEMPLATE_ID,
    emailSubject: 'Sarah Williams - Employee Offboarding Documents',
    status: 'sent',
    templateRoles: [
      {
        email: 'ryan+demo1@mioduski.us',
        name: 'John Smith',
        roleName: 'Supervisor',
        tabs: {
          textTabs: [
            {
              tabLabel: 'Text 0e541988-6858-4418-9d23-478b31094d3c',
              value: 'Project handover completed'
            },
            {
              tabLabel: 'Text 46d90d1c-cc59-4d7b-87a7-f992d4104c71',
              value: 'All company assets returned'
            }
          ],
          dateTabs: [
            {
              tabLabel: 'Separation Date fe9ffc63-56b3-4eaf-b62f-0230f7c2a253',
              value: '2025-01-31'
            }
          ]
        }
      },
      {
        email: 'ryan+demo4@mioduski.us',
        name: 'Sarah Williams',
        roleName: 'Employee'
      },
      {
        email: 'ryan+demo5@mioduski.us',
        name: 'Emily Davis',
        roleName: 'HR Representative'
      }
    ],
    metadata: {
      type: 'employee_offboarding',
      employee: 'Sarah Williams',
      separationDate: '2025-01-31',
      department: 'Engineering',
      position: 'Senior Software Engineer'
    }
  }
];

async function initializeDocuSignClient() {
  if (!DOCUSIGN_ACCESS_TOKEN || !DOCUSIGN_ACCOUNT_ID) {
    throw new Error('Required environment variables are missing');
  }

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(DOCUSIGN_BASE_PATH);
  apiClient.addDefaultHeader('Authorization', `Bearer ${DOCUSIGN_ACCESS_TOKEN}`);
  return apiClient;
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
      existingLog = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch (error) {
      // File doesn't exist or is invalid JSON
    }
    existingLog.push(envelopeLog);
    fs.writeFileSync(logPath, JSON.stringify(existingLog, null, 2));
    
    return results;
  } catch (error) {
    console.error('Error creating envelope:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
    throw error;
  }
}

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

main().catch(console.error); 