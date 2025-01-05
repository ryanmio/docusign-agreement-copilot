import docusign from 'docusign-esign';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env.local file
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const DOCUSIGN_ACCESS_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const DOCUSIGN_BASE_PATH = process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi';

if (!DOCUSIGN_ACCESS_TOKEN || !DOCUSIGN_ACCOUNT_ID) {
  console.error('Required environment variables are missing:');
  console.error('DOCUSIGN_ACCESS_TOKEN:', !!DOCUSIGN_ACCESS_TOKEN);
  console.error('DOCUSIGN_ACCOUNT_ID:', !!DOCUSIGN_ACCOUNT_ID);
  process.exit(1);
}

async function initializeDocuSignClient() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(DOCUSIGN_BASE_PATH);
  apiClient.addDefaultHeader('Authorization', `Bearer ${DOCUSIGN_ACCESS_TOKEN}`);
  return apiClient;
}

async function checkTemplate(apiClient, templateId, name) {
  console.log(`\nChecking ${name} Template (${templateId})...`);
  
  try {
    const templatesApi = new docusign.TemplatesApi(apiClient);
    
    // Get template details
    const template = await templatesApi.get(DOCUSIGN_ACCOUNT_ID, templateId);
    console.log('\nTemplate Details:', JSON.stringify(template, null, 2));
    
    // Get recipients
    const recipients = await templatesApi.listRecipients(DOCUSIGN_ACCOUNT_ID, templateId);
    console.log('\nTemplate Recipients:', JSON.stringify(recipients, null, 2));
    
    // Get tabs for each recipient
    for (const signer of recipients.signers || []) {
      console.log(`\nTabs for recipient ${signer.roleName}:`);
      const tabs = await templatesApi.listTabs(
        DOCUSIGN_ACCOUNT_ID,
        templateId,
        signer.recipientId
      );
      console.log(JSON.stringify(tabs, null, 2));
    }
  } catch (error) {
    console.error('Error checking template:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
  }
}

// Check both templates
async function main() {
  const apiClient = await initializeDocuSignClient();
  
  // Vendor Renewal Template
  await checkTemplate(
    apiClient,
    'f8b28512-7f82-4c22-bcee-1c87b7ba4fe3',
    'Vendor Renewal'
  );
  
  // Offboarding Template
  await checkTemplate(
    apiClient,
    'fbe8f291-a700-43a8-a7cb-845f88eb941a',
    'Employee Offboarding'
  );
}

main().catch(console.error); 