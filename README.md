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



Sequence of events:
```sql
+----------------+       +--------------------+       +--------------------+       +---------------------------+       +--------------------+
|    User & UI   |       |  Chat/AI System    |       |    Tools Library    |       | DocuSign & External       |       |  Callback/Webhook  |
|                |       |                    |       |                    |       | Services                  |       |                    |
| "Show me the   |       | Receive Request:   |       | Call Tool:          |       | Handle API Calls:         |       | DocuSign Connect:  |
| details of     |       | - From React UI    |       | - displayDocument  |       | - eSignature Details      |       | - Notify Server    |
| Envelope #123" |       | Merge instructions |       | - Authenticate User|       | - Document Metadata       |       | - Update AI        |
|                |       | - Route to AI Model|       | - Fetch Metadata   |       | - Contract Insights       |       | - Real-time Updates|
+----------------+       +--------------------+       +--------------------+       +---------------------------+       +--------------------+
        |                          |                          |                                |                               |
        |  (1) User Input          |                          |                                |                               |
        +------------------------->|                          |                                |                               |
                                   | (2) AI Decides to        |                                |                               |
                                   | Call Tool:               |                                |                               |
                                   | "displayDocumentDetails" |                                |                               |
                                   +------------------------->| (3) Authenticate User         |                               |
                                                              | - Check Session in DB          |                               |
                                                              |                                |                               |
                                                              | (4) Call DocuSign REST API     |                               |
                                                              +----------------------------->  |                               |
                                                                                               | (5) Fetch Envelope Metadata   |
                                                                                               | - Status, PDFs, Recipients    |
                                                                                               |                               |
                                                                                               +-----------------------------> |
                                                                                                                               |
                                                              |<----------------------------+ (6) Return Data                 |
                                   |<------------------------+ "Envelope Metadata"         |                               |
        +------------------------->| (7) Format Response      |                                |                               |
        | Render React Component:  | - Render React Component |                                |                               |
        | DocumentDetailsView      | "DocumentDetailsView"    |                                |                               |
        |                          |                          |                                |                               |
+----------------+       +--------------------+       +--------------------+       +---------------------------+       +--------------------+
```



React Rendering:
```sql
+-----------------------+
|      Chat Window      |
|-----------------------|
|  +------------------+ | 
|  | Message Stream   | |  
|  |------------------| | 
|  | User: Show me    | | 
|  |  Envelope #123   | | 
|  | AI: Here are the | | 
|  |  details:        | | 
|  |                  | | 
|  | [DocumentDetails]| | <- React Component dynamically rendered
|  +------------------+ | 
+-----------------------+

Flow:
1. User Message -> Chat Agent generates a response:
   - Specification: { toolName: "displayDocumentDetails", envelopeId: 123 }

2. Chat Agent Response ->
   - Embedded Tool Invocation: "displayDocumentDetails"

3. React Integration:
   - UI detects `toolName` in the AI message.
   - Dynamically mounts `DocumentDetailsView` React component.

4. React Component:
   - Uses `props` such as `envelopeId` to fetch/render data.
   - Interactivity: User clicks within the component, triggering new tool calls (e.g., resend document).

```

Simplified Tool Call
```sql
User/UI         Chat Agent          Tools                DocuSign/Database
   |                 |                 |                           |
   |--Request-------->|                 |                           |
   |  "Show me        |                 |                           |
   |  Envelope #123"  |                 |                           |
   |                 |--Call Tool------>|                           |
   |                 | "displayDocumentDetails(envelopeId=123)"    |
   |                 |                 |--Fetch Data--------------->|
   |                 |                 |                           |
   |                 |                 |<--Return Data-------------|
   |                 |<--Result---------|                           |
   |                 | "Envelope #123 Details"                     |
   |<--Render--------|                 |                           |
   | "Display React Component with Data"                           |
   |                 |                 |                           |
```