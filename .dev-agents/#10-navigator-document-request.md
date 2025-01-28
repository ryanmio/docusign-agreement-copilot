# Navigator Document Requirements Report

## Important Update: Navigator vs eSignature Integration

We've discovered a critical detail about the Navigator API integration that affects our demo preparation. Unlike the eSignature API, Navigator requires documents to be specifically uploaded to its repository for AI analysis. Documents in DocuSign eSignature do not automatically appear in Navigator - they must be manually uploaded through the Navigator UI (API upload is planned for future releases).

## Document Requirements for Demo

To properly showcase the Navigator API's capabilities in our demo, particularly the "Morning Scramble" and pattern recognition features, we need to create and upload specific documents that will demonstrate:

1. **Tuesday Patterns**
   - Need several agreements dated on Tuesdays
   - Should include vendor renewals and regular review tasks
   - Recommend at least 5-10 agreements to establish the pattern

2. **Vendor Renewals**
   - Multiple vendor agreements with upcoming renewal dates
   - Should include different terms (e.g., 5% increases, different notice periods)
   - Need both auto-renewal and manual renewal examples

3. **Employee Documents**
   - Documents related to employee offboarding (for Sarah's scenario)
   - Should include NDAs, IP agreements, and any vendor accounts
   - Need multiple related agreements to demonstrate relationship mapping

4. **Agreement Categories**
   - Need a mix of different agreement types for AI categorization
   - Should align with Navigator's standard categories (BusinessServices, HumanResources, etc.)
   - Examples: SOWs, MSAs, NDAs, employment agreements

## Required Information

Please provide:

1. **Document Timeline**
   - When should each document be dated?
   - What renewal/expiration dates should be used?
   - Which documents should be marked as "Tuesday review" items?

2. **Agreement Details**
   - Specific terms to include in each agreement
   - Required parties and signatories
   - Any specific provisions that should be detectable by Navigator's AI

3. **Demo Scenario Alignment**
   - Which documents should be "urgent" during the demo?
   - What patterns should be discoverable?
   - What relationships should exist between agreements?

## Next Steps

1. Once we receive these details, we will:
   - Create all required demo documents
   - Upload them to Navigator through the UI
   - Allow time for AI analysis to complete
   - Verify all patterns and relationships are detectable via API

2. Timeline considerations:
   - Documents must be uploaded before API integration testing
   - AI analysis may take some time to complete
   - Should plan for multiple upload-test cycles

Please provide these details as soon as possible to ensure we have sufficient time for document preparation, AI processing, and integration testing before the demo.

## Technical Notes

- Navigator's AI will extract metadata like:
  - Agreement type and category
  - Parties involved
  - Key dates (effective, expiration, renewal)
  - Important provisions
  - Relationships between agreements

- This extracted data will power our demo features:
  - Pattern recognition
  - Priority dashboard
  - Relationship mapping
  - Proactive notifications

Let us know if you need any clarification or have additional requirements for the demo documents. 