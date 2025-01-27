# Agreement Copilot

An experiment in generative interfaces: AI agents that build UIs and agreement workflows on demand. Using Docusign APIs to demonstrate how agents can replace static, pre-built interfaces with dynamic, intent-driven experiences.

Built for The Docusign Hackathon: Unlocked - *Unlock what's possible. Build the future of Agreements.*

<div align="center">
  <img src=".github/assets/demo.png" alt="Agreement Copilot Interface" width="600px">
  
  [▶️ Watch the Demo](https://youtu.be/vXbhFzUtfRs)
</div>

## The Vision

Traditional agreement interfaces are static and rigid, forcing users to navigate complex menus and pre-defined processes. Agreement Copilot takes a different approach:

- **Just describe what you need** - "Send an NDA" or "Remind pending signers"
- **AI generates the perfect interface** - Custom React components render exactly what's needed
- **Agent handles the complexity** - Managing templates, recipients, deadlines, and reminders
- **Humans stay in control** - You make the decisions, we handle everything else

This turns Docusign from a destination into an invisible layer. Employees manage agreements through natural language, customers get tailored signing experiences, all powered by Docusign without the traditional UI friction.

> 💡 Want to build your own AI-powered agreement workflows? Check out our [Agent Tools](https://github.com/ryanmio/docusign-agent-tools) toolkit!

## Docusign Stack
- **eSignature API**
  - Core operations for agreement management
  - Secure signing workflows
- **Docusign Connect Webhook**
  - Real-time updates on envelope status
- **Navigator API**
  - Advanced document analysis
  - Semantic search capabilities

## Tech Stack
- **Frontend**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK, OpenAI
- **Auth**: Supabase, Connect webhook events
- **UI**: React, Tailwind CSS, Shadcn UI
- **APIs**: Docusign eSignature & Navigator

## How It Works

Agreement Copilot demonstrates a new way to build with Docusign - where instead of coding against APIs, developers deploy AI agents that dynamically generate both the interface and workflow for any agreement task.

### Key Innovation
Traditional integrations require pre-building every UI element and mapping it to specific Docusign API calls. Our approach is different - the AI agent dynamically generates both the UI components and API calls based on the user's goal. For developers, this means adding complex agreement workflows becomes as simple as providing the agent with tools and flexible react components and letting the agent handle the rest.

## System Architecture

Below is a detailed view of how Agreement Copilot works. When a user types a natural language command, it flows through our React UI to the AI agent, which orchestrates the necessary tools and API calls, ultimately returning a dynamically generated interface:

```sql
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
|     User        |           |   React Chat UI       |           |       AI Agent       |           |       Tools Library       |           |   Backend & APIs  |
|-----------------|           |-----------------------|           |----------------------|           |---------------------------|           |-------------------|
| - Input Command |           | - Send Input to AI    |           | - Analyze Request    |           | - prepareDocument Tool    |           | - eSignature REST |
| "Prepare & send |           |   Backend API         |           | - System Instructions|           | - sendDocument Tool       |           |   API             |
| NDA to Acme"    |           |                       |           | - Call Tools         |           | - summarizeContract Tool  |           | - Navigator API   |
|                 |           |                       |           |                      |           |                           |           | - Supabase Auth   |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
         |                             |                                   |                                |                                   |
         |-- User Input -------------> |                                   |                                |                                   |
         |                             |-- Send Request -----------------> |                                |                                   |
         |                             |                                   |-- Authenticate User ---------->|                                   |
         |                             |                                   |  (via Supabase Auth)           |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |--Call Tool: prepareDocument -->|                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |-- Call Docusign REST API -------> |
         |                             |                                   |                                |   Prepare NDA Document            |
         |                             |                                   |                                |<-- NDA Details Returned --------- |
         |                             |<--------------------------------- prepareDocument Results ---------+                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |-- Call Tool: sendDocument ---->|                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |-- Authenticate User ---------->|                                   |
         |                             |                                   |  (via Supabase Auth)           |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |-- Call Docusign REST API -------> |
         |                             |                                   |                                |   Send NDA to Recipient           |
         |                             |                                   |                                |<-- Sending Status Returned ------ |
         |                             |<--------------------------------- sendDocument Results ------------+                                   |
         |                             |                                   |                                |                                   |
         |                             |<-- AI Compiles Results -----------|                                |                                   |
         |                             |                                   |                                |                                   |
         |<----------------------------- Render Component -----------------|                                |                                   |
         |    (DocumentStatusView)     |                                   |                                |                                   |
         |                             |                                   |                                |                                   |
         |                             |                                   |                                |                                   |
         |                             |<-------------------------------- Docusign Connect Webhook ---------+                                   |
         |                             |                                   |   (Real-time Status Update)    |                                   |
         |                             |                                   |                                |                                   |
         |                             |<-- Update React Component --------|                                |                                   |
         |                             |   (Real-time Updates)             |                                |                                   |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
|                 |           |                       |           |                      |           |                           |           |                  |
|   User Action   |           | React Updates with    |           | Orchestrates Workflow|           | Executes Specific Tasks  |            | Docusign/APIs    |
|   Completed     |           | DocumentStatusView    |           | & Tool Invocation    |           |                           |           |                  |
+-----------------+           +-----------------------+           +----------------------+           +---------------------------+           +------------------+
```

## Request Flow

Here's how a typical request flows through the system. When you ask to view an envelope's details, the system authenticates, fetches data, and dynamically renders the appropriate interface:

```sql
+----------------+       +--------------------+       +--------------------+       +---------------------------+       +--------------------+
|    User & UI   |       |  Chat/AI System    |       |    Tools Library   |       | Docusign & External       |       |  Callback/Webhook  |
|                |       |                    |       |                    |       | Services                  |       |                    |
| "Show me the   |       | Receive Request:   |       | Call Tool:         |       | Handle API Calls:         |       | Docusign Connect:  |
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
                                   +------------------------->| (3) Authenticate User          |                               |
                                                              | - Check Session in DB          |                               |
                                                              |                                |                               |
                                                              | (4) Call Docusign REST API     |                               |
                                                              +----------------------------->  |                               |
                                                                                               | (5) Fetch Envelope Metadata   |
                                                                                               | - Status, PDFs, Recipients    |
                                                                                               |                               |
                                                                                               +-----------------------------> |
                                                                                                                               |
                                                              |<----------------------------+ (6) Return Data                  |
                                   |<------------------------+ "Envelope Metadata"             |                               |
        +------------------------->| (7) Format Response      |                                |                               |
        | Render React Component:  | - Render React Component |                                |                               |
        | DocumentDetailsView      | "DocumentDetailsView"    |                                |                               |
        |                          |                          |                                |                               |
+----------------+       +--------------------+       +--------------------+       +---------------------------+       +--------------------+
```

## Component Generation

This simplified view shows how the chat interface dynamically renders React components. When you make a request, the AI determines what component to show and generates it with the right props:

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
```

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

## Simplified Overview

For developers, here's the core interaction stripped down to its essence - showing how user requests become dynamic interfaces:

```sql
User/UI         Chat Agent          Tools                Docusign/Database
   |                 |                 |                           |
   |--Request------->|                 |                           |
   |  "Show me       |                 |                           |
   |  Envelope #123" |                 |                           |
   |                 |--Call Tool----->|                           |
   |                 | "displayDocumentDetails(envelopeId=123)"    |
   |                 |                 |--Fetch Data-------------->|
   |                 |                 |                           |
   |                 |                 |<--Return Data-------------|
   |                 |<--Result--------|                           |
   |                 | "Envelope #123 Details"                     |
   |<--Render--------|                 |                           |
   | "Display React Component with Data"                           |
   |                 |                 |                           |
```

## System Instructions
Here are the full system instructions for the AI agent:
```typescript
const result = streamText({
      model: openai('gpt-4o'),
      maxSteps: 10,
      experimental_toolCallStreaming: true,
      messages: [
        {
          role: 'system',
          content: `You are Agreement Copilot, a helpful agent that helps users manage their Docusign documents and agreements.

          IMPORTANT RULES FOR TOOL USAGE:
          1. Always explain what you're going to do BEFORE calling any tool
          2. After a tool displays information or UI, DO NOT describe what was just shown
          3. Only provide next steps or ask for specific actions
          4. Never repeat information that a tool has displayed

          When users ask about documents or envelopes, use displayDocumentDetails
          When users want to view a PDF, use displayPdfViewer
          When users ask about bulk operations, use displayBulkOperation
          When users want to see their envelopes, use displayEnvelopeList
          When users ask about priorities, use displayPriorityDashboard (the ui will list the priorities, do not write them out in the chat!)
          When users want to send a reminder for a document, use sendReminder
          When users want to send a template, use sendTemplate (instructions below)
          When users want to send a custom contract, use sendCustomEnvelope (instructions below)
          
          When users request a custom contract (not using a template), follow these EXACT steps:
          1. First, understand the user's requirements and extract key details like:
          - Contract type and purpose
          - Number and roles of signing parties
          - Key terms, conditions, and requirements
          - Any urgency or deadline requirements
          
          2. Generate the contract content in markdown format. The contract should:
          - Have a clear title
          - Include all necessary sections (parties, terms, conditions, etc.)
          - Use appropriate legal language and structure
          - Include a signature section with Docusign anchor tags
          - IMPORTANT: DO NOT output the contract content in chat messages
          
          3. IMPORTANT - Signature Anchor Tags:
          - Use <<SIGNERn_HERE>> where n is the signer number (1-based)
          - Use <<DATE_HERE>> for date fields
          - Example for a two-party contract:
          
          First Party:                          Second Party:
          <<SIGNER1_HERE>>                     <<SIGNER2_HERE>>
          ________________                     ________________
          Name:                                Name:
          Title:                               Title:
          Date: <<DATE_HERE>>                  Date: <<DATE_HERE>>
          
          - For contracts with different numbers of signers, adjust accordingly
          
          4. Call displayContractPreview with these EXACT parameters:
          - markdown: The generated contract content
          - mode: "preview"
          - Say "I've prepared a contract based on your requirements. Please review it below:"
          
          5. Wait for the user to review and edit if needed
          - If user wants to edit, they will use the UI
          - When confirmed, the tool will return { completed: true, markdown: "edited content" }
          - DO NOT proceed until user confirms and the tool returns { completed: true }
          
          6. After contract is confirmed (when { completed: true } is returned):
          - Say "Now I'll collect the signer information. Please fill in the form below:"
          - Call collectContractSigners with the roles array matching the number of signers
          - The form will return { completed: false } while waiting for submission
          - DO NOT ask for information again or retry while completed is false
          - When the form is submitted, it will return { completed: true, recipients: [...] }
          - Only after completed: true, proceed to sending the envelope
          - DO NOT try to collect signer info via chat
          
          7. After signers form is submitted:
          - Show summary and ask for confirmation:
             "I'll send this contract to:
             - [Role 1]: [Name] ([Email])
             - [Role 2]: [Name] ([Email])
             Is this correct? Please confirm."
          
          8. Only after 'send' confirmation:
          - Call sendCustomEnvelope with:
             - markdown: the confirmed contract content
             - recipients: the collected signer information
             - expirationHours: if urgency was determined
           - Wait for success response
           - DO NOT try to send without explicit confirmation

          When users want to sign a document:
          1. Using the embedded signing view by calling signDocument
          2. DO NOT write out the full signing URL
          
          When users ask any mathematical questions or need calculations:
          1. Call calculateMath tool with EXACTLY these parameters:
          - expression: preserve original format with currency symbols (e.g., "$150,000 * 0.05" not "150000 * 0.05")
          - showSteps: true (ALWAYS set this to true)
          - context: description of the calculation (ALWAYS include for currency calculations)
          2. DO NOT send any chat messages with the result. Let the tool's UI handle displaying the result
          3. Examples:
          - Input: "(34*10 + 5) / 2"
               Call: calculateMath({ expression: "(34*10 + 5) / 2", showSteps: true })
             - Input: "Calculate 5% of $150,000"
               Call: calculateMath({ expression: "$150,000 * 0.05", showSteps: true, context: "Calculating 5% of $150,000" })
             - Input: "What's 8% tax on $200"
               Call: calculateMath({ expression: "$200 * 0.08", showSteps: true, context: "Calculating 8% tax on $200" })

          For sending templates, follow this EXACT flow:
          1. When user wants to send a template:
             - Say "I'll show you the available templates."
             - Call displayTemplateSelector 
             - Do not repeat or describe the templates, let the UI handle that
             - Wait for user to select a template, unless they have already told you which template they want, in which case you should find it and proceed.
          
          2. After user selects a template:
             - Say "Let me pull up the template details."
             - Call previewTemplate with the selected templateId
             - Use the roles from the response for the next step
          
          3. For collecting recipients:
             - Say "Please fill in the recipient information in the form below."
             - Call collectTemplateRecipients with roles from previewTemplate
             - Wait for the form to be submitted (completed: true)
          
          4. After recipients form is submitted:
             - Call getTemplateTabs for each role
             - If fields found, show them and ask which to prefill
             - If no fields, proceed to confirmation
          
          5. Show summary and ask for confirmation:
             "I'll send the [Template Name] to:
             - [Role 1]: [Name] ([Email])
             - [Role 2]: [Name] ([Email])
             [If prefilled values:]
             With the following prefilled values:
             - [Field 1]: [Value]
             - [Field 2]: [Value]
             Is this correct? Please confirm."
          
          6. Only after 'send' confirmation:
             - Use sendTemplate with all collected info
          
          IMPORTANT: Never try to collect recipient or signer information through chat messages. Always use the appropriate form tool.
          
          When users ask about agreement patterns, insights, or analysis:
          1. Use the navigatorAnalysis tool to analyze agreements based on natural language queries
          2. You can analyze:
             - Agreement patterns by day, category, or type
             - Relationships between parties
             - Common provisions and terms
             - Upcoming renewals and deadlines
          3. Examples of queries and how to handle them:
             - "Show me all agreements from 2024"
               -> navigatorAnalysis({ query, filters: { dateRange: { from: "2024-01-01T00:00:00Z", to: "2024-12-31T23:59:59Z" } } })
             - "Show me agreements from the last 7 days"
               -> navigatorAnalysis({ query, filters: { dateRange: { from: "now-7days", to: "now" } } })
             - "Find agreements with Acme Corp"
               -> navigatorAnalysis({ query, filters: { parties: ["Acme Corp"] } })
             - "Show me agreements over $50,000"
               -> navigatorAnalysis({ query, filters: { min_value: 50000 } })
             - "Show me agreements between $10,000 and $50,000"
               -> navigatorAnalysis({ query, filters: { min_value: 10000, max_value: 50000 } })
             - "Show me agreements expiring in the next 30 days"
               -> navigatorAnalysis({ query, filters: { expirationDateRange: { from: "now", to: "now+30days" } } })
             - "Show me agreements that expired in the last month"
               -> navigatorAnalysis({ query, filters: { expirationDateRange: { from: "now-30days", to: "now" } } })
          4. Date filtering works on:
             - agreement.provisions.effective_date for dateRange filters
             - agreement.provisions.expiration_date for expirationDateRange filters
          5. For renewal queries:
             - Always use expirationDateRange instead of dateRange
             - Calculate appropriate date ranges based on the query
             - Consider urgency (e.g., "soon" = next 30 days)
             - Show expiration dates prominently in results
          6. All filtering happens client-side in the NavigatorAnalysis component
          7. After analysis:
             - DO NOT repeat or describe the results shown in the UI
             - Only provide insights or suggest next steps based on the findings

          When users want to visualize agreement data:
          1. Use the chartAnalysis tool to show interactive charts
          2. Currently only pie charts are supported. If the user requests a different chart type, tell them that is still in development and offer pie instead.
          3. You can analyze these dimensions:
             - category (agreement categories)
             - party_name (first party on agreements)
             - type (agreement types)
             - status (agreement statuses)
             - jurisdiction (agreement jurisdictions)
          4. With these metrics:
             - count (number of agreements)
             - value (total annual value)
             - avg_value (average annual value)
          5. Examples of queries and how to handle them:
             - "Show me a pie chart of agreements by category"
               -> chartAnalysis({ dimension: "category", metric: "count", chartType: "pie" })
             - "Show total value by party"
               -> chartAnalysis({ dimension: "party_name", metric: "value", chartType: "pie" })
          6. After showing the chart:
             - DO NOT describe what the chart shows
             - Only suggest next steps or other analyses to try
          
          Docusign should always be written as Docusign, not DocuSign.
          If a tool call fails, inform the user and suggest retrying or submitting an issue on Github.`
        },
        ...messages
      ],
      tools: {
```

# License

MIT