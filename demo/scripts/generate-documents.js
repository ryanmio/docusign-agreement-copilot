import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import markdownpdf from 'markdown-pdf';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Promisify markdown-pdf
const markdownToPdf = promisify(markdownpdf);

// Configuration
const DEMO_DIR = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(DEMO_DIR, 'templates');
const MARKDOWN_OUTPUT_DIR = path.join(DEMO_DIR, 'markdown');
const PDF_OUTPUT_DIR = path.join(DEMO_DIR, 'pdf');

// Document dates configuration
const dates = {
  tuesdayReviews: [
    '2024-12-17',
    '2024-12-24',
    '2024-12-31',
    '2025-01-07',
    '2025-01-14'
  ],
  vendorRenewals: [
    {
      vendor: 'GlobalTech',
      effectiveDate: '2025-01-07',
      expirationDate: '2026-01-07'
    },
    {
      vendor: 'AcmeCorp',
      effectiveDate: '2025-01-15',
      expirationDate: '2026-01-15'
    },
    {
      vendor: 'FastComm',
      effectiveDate: '2025-02-01',
      expirationDate: '2026-02-01',
      autoRenew: true
    }
  ],
  vendorCheckIns: [
    {
      vendor: 'FastComm',
      date: '2025-01-02'
    },
    {
      vendor: 'GlobalTech',
      date: '2025-01-09'
    }
  ],
  sarahOffboarding: {
    startDate: '2023-12-15',
    assignmentDate: '2023-12-20'
  },
  michaelOffboarding: {
    startDate: '2025-01-02',
    documents: [
      { type: 'NDA', date: '2025-01-02' },
      { type: 'IP', date: '2025-01-02' },
      { type: 'ACCOUNTS', date: '2025-01-02' }
    ]
  }
};

// Additional documents to generate
const additionalDocs = [
  // Recent Weekly Reviews (Tuesdays)
  { type: 'WEEKLY-REVIEW', date: '2024-12-17' },
  { type: 'WEEKLY-REVIEW', date: '2024-12-24' },
  { type: 'WEEKLY-REVIEW', date: '2024-12-31' },
  { type: 'WEEKLY-REVIEW', date: '2025-01-07' },
  { type: 'WEEKLY-REVIEW', date: '2025-01-14' },
  
  // Sarah's additional docs
  { type: 'SARAH-OFFBOARDING-IP', date: '2025-01-02' },
  { type: 'SARAH-OFFBOARDING-ACCOUNTS', date: '2025-01-02' },
  
  // New vendor renewals
  { type: 'VENDOR-RENEWAL-FastComm', date: '2025-02-01', autoRenew: true },
  { type: 'VENDOR-RENEWAL-GlobalTech', date: '2025-01-07', autoRenew: false },
  
  // New vendor check-ins
  { type: 'VENDOR-CHECK-IN-FastComm', date: '2025-01-02' },
  { type: 'VENDOR-CHECK-IN-GlobalTech', date: '2025-01-09' }
];

// Validate template exists
async function validateTemplate(templatePath) {
  try {
    await fs.access(templatePath);
    return true;
  } catch (error) {
    console.error(`Template not found: ${templatePath}`);
    return false;
  }
}

// Ensure output directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(MARKDOWN_OUTPUT_DIR, { recursive: true });
    await fs.mkdir(PDF_OUTPUT_DIR, { recursive: true });
    console.log('Output directories created/verified');
  } catch (error) {
    console.error('Failed to create output directories:', error);
    throw error;
  }
}

// Read and process a template
async function processTemplate(templatePath, replacements) {
  if (!await validateTemplate(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  try {
    let content = await fs.readFile(templatePath, 'utf-8');
    
    // Replace all placeholders with actual values
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`_{2,}${key}_{2,}`, 'g');
      content = content.replace(regex, value);
    }
    
    return content;
  } catch (error) {
    console.error(`Failed to process template ${templatePath}:`, error);
    throw error;
  }
}

// Generate both markdown and PDF versions of a document
async function generateDocument(content, baseName) {
  const markdownPath = path.join(MARKDOWN_OUTPUT_DIR, `${baseName}.md`);
  const pdfPath = path.join(PDF_OUTPUT_DIR, `${baseName}.pdf`);
  
  try {
    // Write markdown
    await fs.writeFile(markdownPath, content);
    console.log(`Generated markdown: ${baseName}.md`);
    
    // Generate PDF
    await new Promise((resolve, reject) => {
      markdownpdf()
        .from(markdownPath)
        .to(pdfPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
      
    console.log(`Generated PDF: ${baseName}.pdf`);
  } catch (error) {
    console.error(`Failed to generate document ${baseName}:`, error);
    throw error;
  }
}

// Generate vendor renewal documents
async function generateVendorRenewals() {
  const templatePath = path.join(TEMPLATES_DIR, 'vendor', 'VENDOR-RENEWAL-AGREEMENT.md');
  
  if (!await validateTemplate(templatePath)) {
    return;
  }
  
  try {
    for (const renewal of dates.vendorRenewals) {
      const content = await processTemplate(templatePath, {
        date: renewal.effectiveDate,
        vendor: renewal.vendor,
        expirationDate: renewal.expirationDate
      });
      
      await generateDocument(
        content,
        `VENDOR-RENEWAL-${renewal.vendor}-${renewal.effectiveDate}`
      );
    }
    console.log('Completed vendor renewal generation');
  } catch (error) {
    console.error('Failed to generate vendor renewals:', error);
    throw error;
  }
}

// Generate offboarding documents
async function generateOffboardingDocs() {
  const templatePath = path.join(TEMPLATES_DIR, 'employee', 'EMPLOYEE-OFFBOARDING-AGREEMENT.md');
  
  if (!await validateTemplate(templatePath)) {
    return;
  }
  
  try {
    // Generate Sarah's historical docs
    const sarahContent = await processTemplate(templatePath, {
      date: dates.sarahOffboarding.startDate,
      name: 'Sarah Johnson',
      department: 'Engineering',
      position: 'Senior Software Engineer'
    });
    
    await generateDocument(
      sarahContent,
      `SARAH-OFFBOARDING-NDA-${dates.sarahOffboarding.startDate}`
    );

    // Generate Michael's new docs
    for (const doc of dates.michaelOffboarding.documents) {
      const content = await processTemplate(templatePath, {
        date: doc.date,
        name: 'Michael Chen',
        department: 'Product',
        position: 'Product Manager'
      });
      
      await generateDocument(
        content,
        `MICHAEL-OFFBOARDING-${doc.type}-${doc.date}`
      );
    }
    
    console.log('Completed offboarding document generation');
  } catch (error) {
    console.error('Failed to generate offboarding documents:', error);
    throw error;
  }
}

// Generate weekly review documents
async function generateWeeklyReviews() {
  const templatePath = path.join(TEMPLATES_DIR, 'reviews', 'WEEKLY-REVIEW-TEMPLATE.md');
  
  if (!await validateTemplate(templatePath)) {
    return;
  }
  
  try {
    for (const date of dates.tuesdayReviews) {
      const content = await processTemplate(templatePath, {
        date: date,
        team: 'Engineering Team Alpha',
        project: 'Agreement Copilot Development',
        'Completed Points': '34',
        'Planned Points': '40',
        'Completion Rate': '85%',
        'Code Coverage': '92%',
        'Bug Resolution Rate': '95%',
        'Technical Debt Items Addressed': '5',
        present: 'John, Sarah, Mike, Lisa',
        absent: 'None',
        remote: 'David, Emma'
      });
      
      await generateDocument(
        content,
        `WEEKLY-REVIEW-${date}`
      );
    }
    console.log('Completed weekly review generation');
  } catch (error) {
    console.error('Failed to generate weekly reviews:', error);
    throw error;
  }
}

// Generate internal summary documents
async function generateInternalSummaries() {
  const templatePath = path.join(TEMPLATES_DIR, 'reviews', 'INTERNAL-SUMMARY-TEMPLATE.md');
  
  if (!await validateTemplate(templatePath)) {
    return;
  }
  
  try {
    // Generate for specific dates (Dec 19 and Jan 2)
    const summaryDates = ['2024-12-19', '2025-01-02'];
    
    for (const date of summaryDates) {
      const content = await processTemplate(templatePath, {
        'Report Date': date,
        'Period Covered': date.startsWith('2024') ? 'Q4 2024' : 'Q1 2025',
        department: 'Engineering',
        'Prepared By': 'John Smith',
        revenue: '$2.5M',
        'Customer Satisfaction': '4.8/5.0',
        'Team Productivity': '92%',
        'Project Completion Rate': '88%',
        'Budget Used': '82%',
        'Team Capacity': '90%',
        'Infrastructure Usage': '75%'
      });
      
      await generateDocument(
        content,
        `INTERNAL-SUMMARY-${date}`
      );
    }
    console.log('Completed internal summary generation');
  } catch (error) {
    console.error('Failed to generate internal summaries:', error);
    throw error;
  }
}

// Generate vendor check-in documents
async function generateVendorCheckIns() {
  const templatePath = path.join(TEMPLATES_DIR, 'vendor', 'VENDOR-CHECK-IN-TEMPLATE.md');
  
  if (!await validateTemplate(templatePath)) {
    return;
  }
  
  try {
    for (const checkIn of dates.vendorCheckIns) {
      const content = await processTemplate(templatePath, {
        date: checkIn.date,
        vendor: checkIn.vendor
      });
      
      await generateDocument(
        content,
        `VENDOR-CHECK-IN-${checkIn.vendor}-${checkIn.date}`
      );
    }
    console.log('Completed vendor check-in generation');
  } catch (error) {
    console.error('Failed to generate vendor check-ins:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await ensureDirectories();
    
    // Generate all document types
    await generateWeeklyReviews();
    await generateVendorRenewals();
    await generateVendorCheckIns();
    await generateOffboardingDocs();
    await generateInternalSummaries();
    
    console.log('\n✨ Document generation completed successfully!');
  } catch (error) {
    console.error('\n❌ Document generation failed:', error);
    process.exit(1);
  }
}

main(); 