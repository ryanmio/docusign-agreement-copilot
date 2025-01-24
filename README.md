Exploring next-gen agreement interfaces for AI agents

## Docusign Stack
- **eSignature API**
  - Used for almost all operations
- **Docusign Connect Webhook**
  - Provides real-time updates on envelope status
- **Navigator API**
  - Facilitates document analysis and search

## Development Notes

### Known Issues
- Next.js 15 cookie warnings and Supabase auth warnings are intentionally suppressed in `next.config.js` for demo purposes
- These warnings do not affect functionality and are related to async cookie handling in Next.js 15
- For production use, these should be properly addressed by migrating to `@supabase/ssr` and implementing async cookie handling


Test to see if i can add a diagram like this:

```sql
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
|     User        |           |   React Chat UI       |           |       AI Agent       |           |       Tools Library        |           |   Backend & APIs  |
|-----------------|           |-----------------------|           |----------------------|           |---------------------------|           |------------------|
| - Input Command |           | - Send Input to AI    |           | - Analyze Request    |           | - prepareDocument Tool    |           | - DocuSign REST   |
| "Prepare & send |           |   Backend API         |           | - System Instructions|           | - sendDocument Tool       |           |   API             |
| NDA to Acme"    |           |                       |           | - Call Tools         |           | - summarizeContract Tool  |           | - DocuSign Navigator|
|                 |           |                       |           |                      |           |                           |           | - Supabase Auth   |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
         |                             |                                   |                                |                                   |
         |-- User Input -------------> |                                   |                                |                                   |
         |                             |-- Send Request -----------------> |                                |                                   |
         |                             |                                   |-- Authenticate User ---------->|                                   |
         |                             |                                   |  (via Supabase Auth)           |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |-- Call Tool: prepareDocument -->|                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |-- Call DocuSign REST API -------> |
         |                             |                                   |                                |   Prepare NDA Document           |
         |                             |                                   |                                |<-- NDA Details Returned -------- |
         |                             |<--------------------------------- prepareDocument Results ---------+                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |-- Call Tool: sendDocument ----->|                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |-- Authenticate User ---------->|                                   |
         |                             |                                   |  (via Supabase Auth)           |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |-- Call DocuSign REST API -------> |
         |                             |                                   |                                |   Send NDA to Recipient          |
         |                             |                                   |                                |<-- Sending Status Returned ----- |
         |                             |<--------------------------------- sendDocument Results -----------+                                   |
         |                             |                                   |                                |                                   |
         |                             |<-- AI Compiles Results ----------|                                |                                   |
         |                             |                                   |                                |                                   |
         |<----------------------------- Render Component ----------------|                                |                                   |
         |    (DocumentStatusView)      |                                |                                |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |                                   |
         |                             |<-------------------------------- DocuSign Connect Webhook --------|                                   |
         |                             |                                   |   (Real-time Status Update)    |                                   |
         |                             |                                   |                                |                                   |
         |                             |<-- Update React Component -------|                                |                                   |
         |                             |   (Real-time Updates)            |                                |                                   |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
|                 |           |                       |           |                      |           |                           |           |                  |
|   User Action   |           | React Updates with    |           | Orchestrates Workflow|           | Executes Specific Tasks  |           | DocuSign/APIs    |
|   Completed     |           | DocumentStatusView    |           | & Tool Invocation    |           |                           |           |                  |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
```