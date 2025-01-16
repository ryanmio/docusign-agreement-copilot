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
- [ ] Implement Connect/Disconnect tool
- [ ] Implement "Memory" tool
- [ ] Implement prepopulated search ability for template search tool
- [ ] Implement pattern recognition tool
      > ⚠️ ON HOLD: Waiting for Docusign dev support to grant us access to sync Navigatorwith eSignature.

## Phase 3.5: Navigator Integration 🧭

- [ ] Initial Access Setup
  - [ ] Get sync access from DocuSign support (ON HOLD)
  - [ ] Enable eSign -> Navigator sync in platform
- [x] Core Setup
  - [x] Set up Navigator API authentication (added scopes to OAuth flow)
  - [x] Implement NavigatorClient class (basic implementation with error handling)
  - [x] Add error handling and retry logic
  - [x] Create test validation endpoint

- [ ] Data Integration
  - [x] Create Navigator data models and types
  - [x] Implement agreement fetching and caching
  - [x] Add AI insight extraction helpers

- [ ] Priority Enhancement
  - [ ] Enhance Priority Dashboard with AI insights
  - [ ] Add agreement urgency scoring
    - [ ] Implement scoring algorithm using Navigator data
    - [ ] Add visual urgency indicators

- [ ] Pattern Recognition
  - [ ] Implement Tuesday task detection
    - [ ] Create pattern detection algorithm
    - [ ] Add visualization component
  - [ ] Add renewal pattern analysis
    - [ ] Implement renewal tracking
    - [ ] Create renewal timeline view
  - [ ] Create employee agreement mapping
    - [ ] Build relationship graph
    - [ ] Add filtering by employee
  - [ ] Build timeline view or other visualizations

- [ ] Predictive Features
  - [ ] Implement task forecasting
    - [ ] Create prediction models
    - [ ] Add forecast visualization
  - [ ] Add policy update detection
    - [ ] Implement change detection
    - [ ] Add notification system
  - [ ] Build AI insight display
    - [ ] Create insight dashboard

- [ ] Testing & Validation
  - [ ] Create test suite for Navigator features
  - [ ] Add error simulation tests
  - [ ] Implement performance monitoring
  - [ ] Document edge cases and limitations

## Phase 4: Polish & Submission (Week 4) ✨
- [x] Auto-Scroll to bottom
- [x] Make the homepage design more beautiful
- [x] Create project logo
- [x] Create homepage to chat page transition
- [ ] Style remaining components like Docusign
- [ ] Optimize conversation starters for productivity
- [ ] Restyle header
- [ ] Check to make sure "Docusign" doesnt have camel-case capital S
- [ ] Update system instructions per https://x.com/weswinder/status/1860035463152828471
- [ ] Compare to Stripe https://stripe.dev/blog/adding-payments-to-your-agentic-workflows
- [ ] Metered billing
- [ ] Other models?
- [ ] Reorder the preview tools page
- [ ] Test new user onboarding

- [ ] Documentation 📚
  - [ ] Create comprehensive README
  - [ ] Document API endpoints
  - [ ] Write setup instructions
  - [ ] Create user guide

- [ ] Agent Toolkit 
  - [ ] Documentation
    - [ ] Example: https://github.com/stripe/agent-toolkit
  - [ ] Create npm package

- [ ] Submission Materials
  - [ ] Record demo video
  - [ ] Write project submission