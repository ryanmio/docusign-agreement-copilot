const fs = require('fs').promises;
const path = require('path');
const markdownpdf = require('markdown-pdf');
const { promisify } = require('util');
const markdownToPdf = promisify(markdownpdf);

// Configuration
const DEMO_DIR = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(DEMO_DIR, 'templates');
const MARKDOWN_OUTPUT_DIR = path.join(DEMO_DIR, 'markdown');
const PDF_OUTPUT_DIR = path.join(DEMO_DIR, 'pdf');

// Document dates configuration
const dates = {
  tuesdayReviews: [
    '2023-12-05',
    '2023-12-12',
    '2023-12-19',
    '2023-12-26',
    '2024-01-02'
  ],
  vendorRenewals: [
    {
      vendor: 'GlobalTech',
      effectiveDate: '2023-01-07',
      expirationDate: '2024-01-07'
    },
    {
      vendor: 'AcmeCorp',
      effectiveDate: '2023-01-15',
      expirationDate: '2024-01-15'
    },
    {
      vendor: 'FastComm',
      effectiveDate: '2023-02-01',
      expirationDate: '2024-02-01',
      autoRenew: true
    },
    {
      vendor: 'TechServ',
      effectiveDate: '2023-03-01',
      expirationDate: '2024-03-01'
    }
  ],
  sarahOffboarding: {
    startDate: '2023-12-15',
    assignmentDate: '2023-12-20'
  }
};

// Ensure output directories exist
async function ensureDirectories() {
  await fs.mkdir(MARKDOWN_OUTPUT_DIR, { recursive: true });
  await fs.mkdir(PDF_OUTPUT_DIR, { recursive: true });
}

// Read and process a template
async function processTemplate(templatePath, replacements) {
  let content = await fs.readFile(templatePath, 'utf-8');
  
  // Replace all placeholders with actual values
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`_+${key}_+`, 'g'), value);
  }
  
  return content;
}

// Generate both markdown and PDF versions of a document
async function generateDocument(content, baseName) {
  const markdownPath = path.join(MARKDOWN_OUTPUT_DIR, `${baseName}.md`);
  const pdfPath = path.join(PDF_OUTPUT_DIR, `${baseName}.pdf`);
  
  // Write markdown
  await fs.writeFile(markdownPath, content);
  
  // Generate PDF
  await markdownToPdf()
    .from(markdownPath)
    .to(pdfPath);
    
  console.log(`Generated ${baseName}`);
}

// Generate vendor renewal documents
async function generateVendorRenewals() {
  const template = await fs.readFile(
    path.join(TEMPLATES_DIR, 'vendor', 'VENDOR-RENEWAL-AGREEMENT.md'),
    'utf-8'
  );
  
  for (const renewal of dates.vendorRenewals) {
    const content = template
      .replace('_________________', renewal.effectiveDate)
      .replace('_________________________', renewal.vendor);
      
    await generateDocument(
      content,
      `VENDOR-RENEWAL-${renewal.vendor}-${renewal.effectiveDate}`
    );
  }
}

// Generate Sarah's offboarding documents
async function generateOffboardingDocs() {
  const templates = {
    nda: path.join(TEMPLATES_DIR, 'employee', 'EMPLOYEE-OFFBOARDING-AGREEMENT.md')
  };
  
  // Generate NDA
  const ndaContent = await processTemplate(templates.nda, {
    date: dates.sarahOffboarding.startDate,
    name: 'Sarah Johnson',
    department: 'Engineering',
    position: 'Senior Software Engineer'
  });
  
  await generateDocument(ndaContent, `SARAH-OFFBOARDING-NDA-${dates.sarahOffboarding.startDate}`);
}

// Main execution
async function main() {
  try {
    await ensureDirectories();
    await generateVendorRenewals();
    await generateOffboardingDocs();
    console.log('Document generation completed successfully!');
  } catch (error) {
    console.error('Error generating documents:', error);
    process.exit(1);
  }
}

main(); 