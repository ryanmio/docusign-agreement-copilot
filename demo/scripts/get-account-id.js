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
const DOCUSIGN_BASE_PATH = process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi';

if (!DOCUSIGN_ACCESS_TOKEN) {
  console.error('DOCUSIGN_ACCESS_TOKEN is missing from .env.local file');
  process.exit(1);
}

async function getAccountId() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(DOCUSIGN_BASE_PATH);
  apiClient.addDefaultHeader('Authorization', `Bearer ${DOCUSIGN_ACCESS_TOKEN}`);

  try {
    const userInfo = await apiClient.getUserInfo(DOCUSIGN_ACCESS_TOKEN);
    console.log('\nUser Info:', JSON.stringify(userInfo, null, 2));
    
    if (userInfo.accounts && userInfo.accounts.length > 0) {
      console.log('\nAccount ID:', userInfo.accounts[0].accountId);
      console.log('Base URI:', userInfo.accounts[0].baseUri);
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
  }
}

getAccountId().catch(console.error); 