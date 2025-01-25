# Agreement Copilot Implementation Plan

## Phase 1: Foundation (Week 1) 🏗️
- [x] Supabase Setup
  - [x] Create new Supabase project at database.new
  - [x] Copy API credentials from Supabase project settings
  - [x] Rename .env.example to .env.local
  - [x] Configure environment variables with Supabase credentials
  - [x] Restart Next.js development server
  - [x] Test Supabase connection

- [x] Project Setup
  - [x] Initialize Next.js project with TypeScript and Supabase
  - [x] Set up development environment
  - [x] Configure ESLint and Prettier
  - [x] Set up CI/CD pipeline
  - [x] Create documentation structure

- [x] Database Schema & Auth
  - [x] Design initial database schema
  - [x] Set up user authentication tables
  - [x] Configure Supabase Auth
  - [x] Create necessary database migrations
  - [x] Set up row level security policies

- [x] Docusign Authentication
  - [x] Implement Docusign OAuth flow
  - [x] Set up secure token storage
  - [x] Create user session management
  - [x] Test authentication edge cases

- [x] Basic Infrastructure
  - [x] Set up API routes structure
  - [x] Implement error handling middleware
  - [x] Create logging system
  - [x] Set up monitoring

## Phase 2: Core Features (Week 2) 🚀
- [x] Docusign Integration
  - [x] Implement envelope management
  - [x] Set up document retrieval system
  - [x] Configure webhook listeners
  - [x] Create document processing pipeline

- [x] AI Implementation
  - [x] Set up Vercel AI SDK
  - [x] Implement Claude integration
  - [x] Create document analysis system
  - [x] Build context management system

- [x] User Interface
  - [x] Design and implement main dashboard
  - [x] Create document viewer
  - [x] Build chat interface
  - [x] Implement real-time updates

## Phase 3: Tool Calling (Week 3) 🛠️
- [x] Implement "Collect Recipients" tool
- [x] Implement "Send Template" tool
- [x] Implement "Bulk Send" tool
- [x] Implement "Display Bulk Operation" tool
- [x] Implement "Display PDF Viewer" tool
- [x] Implement "Display Document Details" tool
- [x] Implement "Display Template Selector" tool
- [x] Implement "Preview Template" tool
- [x] Implement "Display Envelope List" tool
- [x] Implement "Display Priority Dashboard" tool
- [x] Implement "Get Template Tabs" tool
- [x] Implement "Send Reminder" tool
- [x] Implement math tool
- [x] Implement in-chat/embedded signing tool
- [x] Implement memoization for markdown https://sdk.vercel.ai/cookbook/next/markdown-chatbot-with-memoization
- [x] Implement document generation tool
  - [x] Memoization of Markdown Generation
  - [x] Make anchor tags white text or hide them somehow
  - [x] System Instructions Enhancement
  - [x] Confirmation Component
  - [x] Investigate and fix duplicate key value warning
  - [x] Error Handling Improvements
  - [x] Documentation
  - [ ] Imeplement pre-filled recipient name logic
- [ ] Implement Connect/Disconnect tool in chat
- [ ] Implement prepopulated search ability for template search tool
- [ ] Implement timeline view

## Phase 3.5: Navigator Integration 🧭

- [x] Initial Access Setup
  - [x] Get sync access from DocuSign support
  - [x] Enable eSign -> Navigator sync in platform
- [x] Core Setup
  - [x] Set up Navigator API authentication (added scopes to OAuth flow)
  - [x] Implement NavigatorClient class (basic implementation with error handling)
  - [x] Add error handling and retry logic
  - [x] Create test validation endpoint

- [x] Data Integration
  - [x] Create Navigator data models and types
  - [x] Implement agreement fetching and caching
  - [x] Add AI insight extraction helpers

- [x] Navigator Analysis
  - [x] Implement Navigator Analysis component
  - [x] Add manual filtering
  - [x] Add AI filtering
  - [x] Add expiration date range filtering
  - [x] Add jurisdiction filtering
  - [x] Add value filtering
  - [x] Basic reporting charts
  - [x] Fix filtering by vendor

## Phase 4: Polish & Submission (Week 4) ✨
- [-] Auto-Scroll to bottom
- [x] Make the homepage design more beautiful
- [x] Create project logo
- [x] Create homepage to chat page transition
- [x] Style remaining components like Docusign
- [x] Restyle header
- [x] Compare to Stripe https://stripe.dev/blog/adding-payments-to-your-agentic-workflows
- [x] Optimize conversation starters for productivity
- [x] Check to make sure "Docusign" doesnt have camel-case capital S
- [x] Reorder the preview tools page
- [x] Add math convo starter
- [ ] Update system instructions per https://x.com/weswinder/status/1860035463152828471
- [ ] Update metadata for sharing and stuff
- [ ] Add a user confirmation component where the ai can show what action it is about to perform and the details and then have the user confirm
 - [ ] Finish adding the preview page "How we use it" and "How it works" sections

CRITICAL BUGS:
- [x] Fix "Parties: Acme Corporation, <<SIGNER1_NAME>>" in contract expiring in 2027 and add annual value
- [x] Convo starter about analyze should include pie chart mention 
- [x] Add a contract that needs my signature to the priority dashboard to make sure i can sign it in the demo, currently the prioriy dash is only showing docs that others need to sign and none that i need to sign
- [x] Fix navigator analysis auth issue on deployed version
- [x] Envelope sending confirmation doesnt work on deployed version, doesnt create envelope
- [x] Fix navigator filters for expiration dates with relative dates and value
- [ ] Forgot to implement bulk send tool! Too late?

BUGS:
- [x] Add system instruction for multi-step workflows where user asks to do something and doesnt want to go step by step - ie. send X template to X then X. agent shouldnt pull up template and ask which, it hsould pull it up and add recipient x then ask for confirmation to send, then repeat with next recipient
- [x] Template selector hover state after clicking should be persistent showing the selected template
- [ ] When sending the NDA, pre-fill functionality wasn't fully demonstrated. Investigate whether pre-filled fields (e.g., title and name) are feasible on our time frame



- [ ] Testing & Validation
  - [ ] Test new user onboarding
  - [ ] Remove unused validation and testing routes and endpoints
  - [ ] Test on deployed version

- [ ] Documentation 📚
  - [ ] Create comprehensive README
      - [x] Nice diagrams like https://github.com/jimmc414/onefilellm?tab=readme-ov-file#data-flow-diagram
  - [ ] Document API endpoints
  - [x] Write setup instructions
  - [ ] Create user guide

- [ ] Agent Toolkit 
  - [x] Github Repo
  - [x] Documentation
  - [ ] Create npm package

- [ ] Submission Materials
  - [x] Create thumbnail image
  - [x] Pick project name
  - [x] Write elevator pitch
  - [x] Write headline (30 characters or less)
  - [x] Write Project Story (markdown) Be sure to write what inspired you, what you learned, how you built your project, and the challenges you faced.
  - [x] Comppile "Built with" list (What languages, frameworks, platforms, cloud services, databases, APIs, or other technologies did you use?)
  - [x] "Try it out" links (multiple)
  - [-] If applicable, please provide testing instructions for your project
  - [x] List of libraries or APIs you used
  - [ ] Take screenshots for Image gallery
  - [ ] Record demo video
  - [ ] Write project submission
  - [ ] Upload video to youtube unlisted
  - [ ] Upload a File
  - [ ] Set repo public



- [ ] IF TIME PERMITS:
  - [ ] Metered billing?
  - [ ] Other model providers
  - [ ] Implement "Memory" tool
