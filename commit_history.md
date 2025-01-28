# Commit History

| Date | Title |
|------|--------|

| 2024-12-13 | Initial commit |

| 2024-12-15 | chore: Initial project setup with Next.js, TypeScript, and Supabase template |

| 2024-12-15 | supabase setup |

| 2024-12-16 | supabase config |

| 2024-12-16 | feat(docusign): implement OAuth integration and secure token management |

| 2024-12-16 | fix: improve authentication flow and protected routes |

| 2024-12-16 | fix: update route handler types for Next.js 14 compatibility |

| 2024-12-16 | revert: restore original working middleware |

| 2024-12-16 | fix: correct route handler types for document endpoint |

| 2024-12-16 | fix: update route handler to match Next.js documentation |

| 2024-12-16 | fix: update route params to use Promise type |

| 2024-12-16 | fix: update envelope route handler params type |

| 2024-12-16 | fix: update DELETE handler to use correct types |

| 2024-12-16 | Update client.ts |

| 2024-12-16 | Update client.ts |

| 2024-12-16 | Update route.ts |

| 2024-12-16 | token debug |

| 2024-12-16 | token debug |

| 2024-12-16 | webhook debug |

| 2024-12-17 | fix: improve webhook handling in App Router |

| 2024-12-17 | Update route.ts |

| 2024-12-17 | fix: envelope status updates in webhook handler |

| 2024-12-17 | Update route.ts |

| 2024-12-17 | fix: add detailed logging for envelope status updates |

| 2024-12-17 | fix: improve webhook handler reliability and logging |

| 2024-12-17 | docs |

| 2024-12-17 | feat: Add document details page with PDF viewer |

| 2024-12-17 | package |

| 2024-12-17 | fix: Update PDF viewer implementation for Server Components |

| 2024-12-17 | fix: Update page props type definition for Next.js App Router |

| 2024-12-17 | fix: Update page props type to match Next.js App Router requirements |

| 2024-12-17 | fix: Update params handling for Next.js 15 compatibility |

| 2024-12-17 | fix: Improve PDF viewer and document endpoint |

| 2024-12-17 | fix: Simplify PDF viewer file prop to fix type error |

| 2024-12-17 | fix: Use local PDF.js worker file |

| 2024-12-17 | fix: Add type declaration for PDF.js worker |

| 2024-12-17 | pdf viewr |

| 2024-12-17 | fix: Simplify PDF.js worker initialization |

| 2024-12-17 | fix: Update PDF.js worker path to use modern build |

| 2024-12-17 | viewer |

| 2024-12-17 | refactor: switch to @react-pdf-viewer/core for improved PDF viewing |

| 2024-12-17 | feat: add manual void and resend actions for envelopes |

| 2024-12-17 | updating the resend endpoint: |

| 2024-12-18 | fix: add missing Supabase client to DocuSign constructors |

| 2024-12-18 | fix: correct type definition for resend route handler |

| 2024-12-18 | fix: update route handler types for Next.js 15 |

| 2024-12-18 | fix: correct Next.js 15 route handler type definition |

| 2024-12-18 | fix: update resend route handler signature to match Next.js App Router types |

| 2024-12-18 | fix: update document details page props to match Next.js App Router types |

| 2024-12-18 | refactor: split document details into server and client components |

| 2024-12-18 | fix: use getUser instead of getSession for authentication |

| 2024-12-18 | revert: move back to single client component for document details |

| 2024-12-18 | Update document-details.tsx |

| 2024-12-18 | fix: update page props type to match Next.js App Router requirements |

| 2024-12-18 | refactor: move document actions to client components, convert details to server component |

| 2024-12-18 | fix: correct page props type definition for document details |

| 2024-12-18 | fix: update page props type to match Next.js App Router conventions |

| 2024-12-18 | fix: handle params as Promise in document details page |

| 2024-12-18 | fix: remove Promise wrapper from params type in document details page |

| 2024-12-18 | fix: use correct Next.js PageProps interface for document details page |

| 2024-12-18 | Update page.tsx |

| 2024-12-18 | feat: improve void envelope validation and error handling |

| 2024-12-18 | fix: improve envelope void validation and UI |

| 2024-12-18 | feat: add resend success feedback |

| 2024-12-18 | feat: add DocuSign template management - includes template listing, details, and envelope creation from templates |

| 2024-12-18 | feat: add template UI components and integrate with document creation |

| 2024-12-18 | fix: add missing CreateEnvelopeOptions type |

| 2024-12-18 | fix: preserve template role names when creating envelope |

| 2024-12-18 | feat: add detailed logging for template loading |

| 2024-12-18 | fix: correctly map DocuSign template responses |

| 2024-12-18 | fix: add TypeScript types for DocuSign API responses |

| 2024-12-18 | fix: properly load template details including subject and roles |

| 2024-12-18 | Update page.tsx |

| 2024-12-18 | Update envelopes.ts |

| 2024-12-18 | Update template-role-form.tsx |

| 2024-12-18 | fix double submit button |

| 2024-12-18 | Update template-role-form.tsx |

| 2024-12-18 | fix: template envelope submission and role handling |

| 2024-12-18 | fix: improve error handling for template envelope creation |

| 2024-12-18 | Update template-role-form.tsx |

| 2024-12-28 | feat: implement bulk send operations (WIP) |

| 2024-12-28 | Update #0-Coordinator-instructions.md |

| 2024-12-28 | Update route.ts |

| 2024-12-28 | codemod |

| 2024-12-28 | fix: update cookie handling in layout and route handlers |

| 2024-12-28 | refactor: update Supabase client creation pattern to fix cookie handling and type errors |

| 2024-12-28 | fix: resolve Next.js build issues with auth routes by clearing build cache |

| 2024-12-28 | chore: add force-dynamic directive to routes using authentication |

| 2024-12-28 | fix: properly handle template roles in bulk send operations |

| 2024-12-28 | Create 20240117_realtime_updates.sql |

| 2024-12-28 | fix: update bulk send page to use React.use() for params and add types |

| 2024-12-28 | fix: type safety in bulk recipient real-time updates |

| 2024-12-28 | refactor: extract BulkOperationView into reusable component |

| 2024-12-28 | docs: add AI-ready components documentation |

| 2024-12-28 | fix: store bulk sent envelopes in envelopes table |

| 2024-12-28 | fix: restore working version of DocuSign integration |

| 2024-12-28 | Update ai-components.md |

| 2024-12-29 | WIP: Basic AI chat working with Vercel AI SDK - DocuSign integration pending |

| 2024-12-29 | fix: resolve cookies await issue and improve envelope lookup error handling |

| 2024-12-29 | fix: move type declarations to root level and fix module declaration |

| 2024-12-29 | fix: remove typeRoots to fix components type error |

| 2024-12-29 | chores |

| 2024-12-29 | feat: add template selector tool and document process for adding new tools |

| 2024-12-29 | feat: add template selector tool and document tool creation process |

| 2024-12-29 | feat: add envelope list tool to chat interface |

| 2024-12-29 | Update ai-components.md |

| 2024-12-29 | Create #5-multistep-flows-instructions.md |

| 2024-12-29 | feat: Add template preview component and flow - Add TemplatePreview component for multi-step sending flow - Add previewTemplate tool - Integrate preview flow in chat UI - Show template details and confirmation buttons |

| 2024-12-29 | feat: Enhance template preview with roles and signing time - Add estimated signing time - Improve recipient roles display - Update button text to be more descriptive |

| 2024-12-29 | refactor: Remove estimated signing time - Remove inaccurate signing time estimate - Clean up template preview layout |

| 2024-12-29 | feat: Add recipient form and collection flow - Add RecipientForm component with validation - Add collectRecipients tool - Update chat UI to handle recipient collection - Update system prompt for multi-step flow |

| 2024-12-29 | fix: Implement working template sending flow - Fix sendTemplate tool to use DocuSignEnvelopes directly - Add proper error handling and database storage - Update system prompt for better recipient handling |

| 2024-12-29 | feat: Add recipient metadata support - Add metadata column to recipients table - Add migration script - Update tools and chat page |

| 2024-12-29 | feat: Add EnvelopeSuccess component - Create new component with live status polling - Show recipient status updates - Add actions to send another or view details |

| 2024-12-29 | demo docs |

| 2024-12-29 | chores |

| 2024-12-29 | chores |

| 2024-12-29 | feat: add vendor renewal and employee offboarding templates for demo |

| 2024-12-29 | chores |

| 2024-12-30 | feat: implement TemplatePreview component and tool - Add component with role display, previewTemplate tool, chat rendering, and docs |

| 2024-12-30 | feat: update previewTemplate tool in tools.ts to match route.ts implementation |

| 2024-12-30 | feat: improve template sending flow with maxSteps and clearer AI responses |

| 2024-12-30 | fix: improve template sending flow with explicit recipient collection and confirmation steps |

| 2024-12-31 | feat: Successfully implemented prefill functionality for DocuSign templates with proper tab handling |

| 2024-01-01 | fix: restore multi-step tool functionality for recipient collection |

| 2024-01-01 | refactor: improve tool handling and state management |

| 2025-01-01 | chores |

| 2025-01-01 | refactor: remove duplicate state management in RecipientForm |

| 2025-01-01 | feat: implement core tool state handling for MVP |

| 2025-01-01 | perf: add form cleanup and validation improvements |

| 2025-01-01 | chores |

| 2025-01-01 | chores |

| 2025-01-01 | feat: Add Priority Dashboard for Agreement Management - Add new PriorityDashboard component with urgent/today/this-week sections - Implement displayPriorityDashboard tool using DocuSign API - Update cheat sheet with clearer two-step tool addition process - Fix envelope viewing by using correct DocuSign ID mapping - Add robust recipient handling for different DocuSign response formats. The Priority Dashboard helps users quickly understand which agreements need attention by showing declined/voided documents as urgent, highlighting agreements expiring within 48 hours, grouping upcoming deadlines within 7 days, and providing quick actions for view/sign/remind. |

| 2025-01-01 | Create #8-priority-dashboard-report.md |

| 2025-01-01 | fix: add type definition for recipient parameter to resolve TypeScript error |

| 2025-01-02 | chores |

| 2025-01-02 | chores |

| 2025-01-02 | fix lint types error |

| 2025-01-02 | feat: Add pattern detection validation script and endpoint - Add demo-pattern-test.ts for analyzing Tuesday patterns - Add /api/validate-patterns endpoint - Implement time-based pattern detection - Add confidence scoring - Add detailed analysis output |

| 2025-01-02 | feat: Implement subject-based pattern detection for Tuesday tasks - Switch from template to subject-based pattern detection - Add detailed time analysis - Focus on Vendor Renewal patterns - Improve analysis output |

| 2025-01-02 | prep for Navigator API integration |

| 2025-01-03 | fix: improve chat UI and message flow - Prevent empty message bubbles by conditionally rendering messages - Add loading indicator for better user feedback - Enhance system prompt to ensure model explains actions before tools - Configure proper message streaming with experimental_toolCallStreaming |

| 2025-01-03 | fix: ensure proper tool flow order for recipient collection - Update system prompt to enforce previewTemplate before collectRecipients - Remove debug logging - Fix empty roles array issue in recipient form |

| 2025-01-03 | fix: remove unnecessary roles count from template selector |

| 2025-01-03 | fix: improve chat behavior and tool handling - Add experimental_toolCallStreaming to fix empty messages - Update system prompt to prevent redundant messages - Remove automatic retry of collectRecipients - Add clearer instructions about tool handling |

| 2025-01-03 | chores |

| 2025-01-03 | Update TODO.md |

| 2025-01-03 | Update TODO.md |

| 2025-01-03 | chores |

| 2025-01-04 | chores |

| 2025-01-04 | WIP: Initial document generation script setup - not tested |

| 2025-01-04 | WIP: Initial document generation script setup - not tested. Reset instructions: 1) Delete demo/markdown/ and demo/pdf/ directories 2) git reset --hard HEAD |

| 2025-01-04 | WIP: First attempt at document generation - using direct markdown/pdf generation. Moving to DocuSign API approach instead. |

| 2025-01-04 | feat: Implement envelope creation script with dry-run support and proper error handling |

| 2025-01-04 | feat: Successfully create DocuSign envelopes with access token |

| 2025-01-04 | Generated and deployed a focused set of demo documents |

| 2025-01-04 | fix: implement embedded signing functionality - Fix envelope recipient view generation - Fix DocuSign library casing and initialization - Fix display format to use 'focused' mode - Add detailed logging for debugging - Remove conflicting clientUserId from signing URL request |

| 2025-01-05 | WIP: Implement DocuSign embedded signing - Add envelope creation, database storage, recipient updating, and signing URL generation. TODO: Resolve CSP issues |

| 2025-01-05 | fix: Update CSP to allow PDF.js worker scripts and DocuSign CDN domains |

| 2025-01-05 | docs: add failure analysis report and revert signing view changes - Document implementation challenges and path forward |

| 2025-01-05 | fix: add missing props to SigningViewProps interface |

| 2025-01-05 | feat: implement working reminder functionality using DocuSign recipients resend endpoint |

| 2025-01-05 | docs: add reminder tool implementation report |

| 2025-01-05 | docs: add reminder tool implementation report |

| 2025-01-05 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-05 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-05 | Update #13-reminder-tool-report.md |

| 2025-01-05 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-05 | feat: Implement Math Tool for Agreement Calculations - Add calculateMath tool with mathjs integration (support for basic arithmetic and financial calculations, handle currency and percentage formatting, step-by-step calculation display, proper error handling) - Create MathResult component (clean UI with card layout, currency formatting, step-by-step display, error state handling) - Update system prompt with math guidelines - Add math.js dependencies - Add TypeScript types and interfaces |

| 2025-01-05 | docs: Add implementation report for Math Tool - Document deliverables, test results, and next steps |

| 2025-01-05 | fix: Update CSP to allow Supabase auth endpoint |

| 2025-01-05 | fix: Revert message styling changes to maintain existing UI |

| 2025-01-05 | feat: Add conversation starters and auto-scroll to chat |

| 2025-01-05 | fix: Update tsconfig.json to exclude example directories from build |

| 2025-01-05 | docs: Add chat UI improvements implementation report |

| 2025-01-05 | Update TODO.md |

| 2025-01-05 | system instruction tweak for less verbose priorities dash message |

| 2025-01-05 | Update TODO.md |

| 2025-01-05 | fix: Remove unnecessary Next.js config options |

| 2025-01-05 | style: Update priority dashboard to match DocuSign UI patterns |

| 2025-01-06 | Create #16-docusign-styling.md |

| 2025-01-06 | feat: implement DocuSign brand colors and design tokens |

| 2025-01-06 | feat: implement basic DocuSign button and input styles |

| 2025-01-06 | feat: update template selector with DocuSign styling |

| 2025-01-06 | feat: implement DocuSign-style loading spinner |

| 2025-01-06 | docs: add instructions for tool preview page task |

| 2025-01-06 | copy loading state |

| 2025-01-06 | feat: add component preview page with mock data |

| 2025-01-06 | feat: update button styles to match DocuSign specs |

| 2025-01-06 | fix: update pdf viewer height and CSP for pdf loading |

| 2025-01-06 | fix: update layout to match DocuSign brand colors |

| 2025-01-06 | fix: remove redundant header from preview page |

| 2025-01-06 | feat: convert props to tables below components |

| 2025-01-06 | preview page styles |

| 2025-01-06 | feat: add horizontal padding to preview page |

| 2025-01-06 | Update TODO.md |

| 2025-01-06 | feat: Complete Math Tool Implementation with Robust Currency Handling - Improve currency detection with multiple fallback methods - Update system prompt to preserve currency symbols - Fix result display in UI component - Add proper TypeScript types - Handle edge cases in expression cleaning - Remove redundant result from steps display - Add comprehensive logging for debugging |

| 2025-01-06 | docs: Update Math Tool implementation report - Add detailed technical specs and test results - Document currency detection improvements - Add integration points and future improvements - Include comprehensive test cases |

| 2025-01-06 | commit: Update conversation starters to be more agreement-focused |

| 2025-01-06 | Update .gitignore |

| 2025-01-06 | Update TODO.md |

| 2025-01-07 | docs: add tool preview page implementation report |

| 2025-01-07 | chores |

| 2025-01-06 | feat: update button styles to match DocuSign specs |

| 2025-01-07 | Update layout.tsx |

| 2025-01-07 | feat: make recipient form more compact and match DocuSign style |

| 2025-01-07 | Update layout.tsx |

| 2025-01-07 | feat: make recipient form more compact and match DocuSign style |

| 2025-01-07 | fix: update CSP to allow Vercel domains |

| 2025-01-07 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-07 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-07 | feat: add preview version of DocuSign Connect component |

| 2025-01-07 | docs: update implementation report with DocuSign Connect details |

| 2025-01-07 | feat: add EnvelopeSuccess preview with status progression simulation |

| 2025-01-07 | docs: update report with EnvelopeSuccess component details |

| 2025-01-07 | feat: add ReminderConfirmation preview component |

| 2025-01-07 | docs: update report with ReminderConfirmation details |

| 2025-01-07 | fix: add type narrowing for reminder confirmation states |

| 2025-01-07 | feat: add BulkOperationView preview with simulated updates |

| 2025-01-07 | fix: use fixed dates in mock data to prevent hydration errors |

| 2025-01-07 | Update DocuSign to Docusign in documentation and configuration files |

| 2025-01-08 | chores |

| 2025-01-08 | fix: update CSP headers to allow vercel.live and vercel.app frames |

| 2025-01-08 | chores |

| 2025-01-09 | Update #19-docgen-plan.md |

| 2025-01-09 | Update TODO.md |

| 2025-01-09 | feat: add markdown editor component with preview/edit functionality and mock contract data |

| 2025-01-09 | fix: remove unused ContractPreview import |

| 2025-01-09 | display contract preview |

| 2025-01-09 | chores |

| 2025-01-09 | feat: implement working focused view signing component - Remove manual iframe management - Use DocuSign SDK focused view - Implement proper initialization sequence - Add proper cleanup handling |

| 2025-01-09 | fix: improve signDocument tool response to prevent redundant signing links |

| 2025-01-09 | fix: handle DocuSign signing completion correctly by parsing event from returnUrl - Add hasHandledSessionEnd ref to prevent duplicate events - Parse signing_complete from returnUrl - Fix event handling to show success UI - Clean up on unmount |

| 2025-01-10 | fix: suppress duplicate emails when updating recipient for embedded signing |

| 2025-01-10 | fix: suppress emails during initial envelope creation for embedded signing |

| 2025-01-10 | Merge pull request #1 from ryanmio/docgen |

| 2025-01-10 | fix: improve signature block formatting and anchor tags |

| 2025-01-10 | feat: implement working contract preview with edit functionality in chat interface |

| 2025-01-11 | fix: preserve DocuSign anchor tags in PDF generation - Replace HTML escaping with inline spans for anchor tags - Update HTML/CSS to prevent Puppeteer from breaking up tags - Simplify preprocessing approach for better reliability - Maintain exact DocuSign anchor tag format (<<TAG>>) - Verified working with test document |

| 2025-01-11 | fix: enable email notifications for non-embedded signing - Only use embedded signing settings when explicitly requested - Remove default email suppression for regular signing flows - Fix issue with signers not receiving DocuSign emails |

| 2025-01-11 | docs: add AI document generation implementation report - Document achievements, technical details, and next steps - Include memoization, system instructions, and error handling plans - Add lessons learned and recommendations |

| 2025-01-11 | docs: add new document generation tools to AI components documentation - Add ContractPreview, CollectContractSigners, and SendCustomEnvelope - Include tool definitions, component usage, and examples - Document features and technical details |

| 2025-01-11 | fix: ensure envelope status tracking works for custom contracts |

| 2025-01-11 | chores |

| 2025-01-11 | fix: improve anchor tag visibility in generated PDFs - Use light gray color (#f8f8f8) for subtle appearance - Add comprehensive logging for tag preservation - Keep minimal CSS to ensure DocuSign compatibility |

| 2025-01-11 | fix: improve signer form state handling - Update system instructions to clarify form state transitions - Add logging for form state tracking - Prevent premature retries while form is in progress - Make completed state handling more explicit |

| 2025-01-11 | fix: prevent re-renders during markdown streaming - Add memoization to ContractPreviewTool component using useMemo and useCallback - Revert unnecessary memoization in MarkdownEditor component - Keep original clean implementation with proper memo comparisons |

| 2025-01-11 | docs: update docgen report with completed tasks - Add addendum section detailing completed and remaining immediate tasks |

| 2025-01-11 | chores |

| 2025-01-11 | Merge pull request #2 from ryanmio/docgen |

| 2025-01-11 | chores |

| 2025-01-11 | feat(navigator): Add Navigator API integration and debug endpoint - Set up client and pattern analysis |

| 2025-01-11 | fix(navigator): Update API response parsing to handle correct data structure - Fix agreement data extraction from Navigator API response - Add detailed response logging for debugging |

| 2025-01-11 | docs(navigator): Add initial Navigator API integration plan and setup docs - Document confirmed data structure and demo features - Outline implementation phases and success metrics |

| 2025-01-12 | create navigator debug endpoint |

| 2025-01-12 | fix(navigator): Use DocuSignClient token management for Navigator API - Fixed token handling by reusing eSignature client's token management - Added better error handling and debug logging - Successfully fetching agreements from Navigator API |

| 2025-01-12 | feat(navigator): Add contract pattern detection - Added PatternDetection component to analyze contract categories by day - Created /navigator/patterns page with pattern visualization - Added pattern analysis API endpoint with 90-day lookback - Shows top 5 patterns with >25% frequency |

| 2025-01-12 | fix(navigator): Fix Navigator analysis endpoint and chat integration - Add cookie forwarding for internal API calls |

| 2025-01-12 | fix(navigator): Improve date handling and null checks in NavigatorAnalysis - Add fallback dates and optional chaining for metadata - Make subtitle conditional based on filter presence - Update both production and debug mode displays |

| 2025-01-13 | fix(navigator): Fix jurisdiction and value filtering - Update jurisdiction access to use provisions.jurisdiction - Fix annual value filtering to use correct path - Add proper type handling and null checks for filter values - Improve filter state display in accordion |

| 2025-01-13 | fix(navigator): Improve filter functionality - Add input focus management to maintain focus while typing - Fix party name filtering to use name_in_agreement - Improve value filtering with proper type handling - Add controlled accordion state to prevent unwanted closing - Add proper event propagation handling |

| 2025-01-13 | Create accordion.tsx |

| 2025-01-13 | fix(chat): Restore PDF viewer functionality - Restore displayPdfViewer case in handleToolInvocation - Add back PDF viewer rendering with height and border styling - Reference commit 7d3c450 for original implementation |

| 2025-01-13 | fix(chat): Restore EnvelopeList and BulkOperationView functionality - Add back displayEnvelopeList case with proper props - Add back displayBulkOperation case with operationId and showBackButton - Reference commit 7d3c450 for original implementation |

| 2025-01-13 | favicon |

| 2025-01-13 | fix: Revert PriorityDashboard to original eSignature implementation and remove nav.tsx - Restore PriorityDashboard to use DocuSign eSignature API instead of Navigator - Remove mistakenly created nav.tsx file - Reference commit e68c8e609 for the changes being reverted |

| 2025-01-13 | (fix) delete unused test page |

| 2025-01-13 | (bug) types |

| 2025-01-13 | fix(navigator): Fix accordion behavior in NavigatorAnalysis - Set initial accordionValue state to empty string to start closed - Ensure proper controlled state with value and onValueChange props - Add stopPropagation to prevent unwanted accordion toggling |

| 2025-01-14 | Update TODO.md |

| 2025-01-14 | style: restore original priority dashboard styling with colored headers and list view |

| 2025-01-14 | feat: implement scroll-to-bottom button with improved visibility logic - Add scroll-to-bottom button that appears when not at bottom - Use subtle styling with semi-transparent backdrop - Fix scroll position detection logic - Remove fixed container height for better content flow |

| 2025-01-14 | chores |

| 2025-01-14 | feat(homepage): implement v0-generated design |

| 2025-01-14 | feat(auth): implement streamlined auth and docusign connect flow |

| 2025-01-14 | fix(middleware): allow unauthenticated access to homepage |

| 2025-01-14 | feat(middleware): allow unauthenticated access to preview page |

| 2025-01-14 | feat(preview): add template selector preview component |

| 2025-01-14 | fix(preview): allow template selection in preview |

| 2025-01-14 | feat(preview): add bulk operations list preview |

| 2025-01-14 | fix(middleware): allow access to PDF file in public folder |

| 2025-01-15 | feat(homepage): implement seamless chat transitions |

| 2025-01-15 | docs: add homepage to chat transition report |

| 2025-01-15 | refactor: rename SearchInput to ChatEntryInput |

| 2025-01-15 | docs: update transition report with ChatEntryInput rename |

| 2025-01-15 | fix: update ChatEntryInput imports and usage |

| 2025-01-15 | refactor: remove duplicate chat page component |

| 2025-01-15 | Update TODO.md |

| 2025-01-15 | Merge pull request #3 from ryanmio/navigator-integration |

| 2025-01-15 | refactor: update header to use hamburger menu dropdown - Replace email and sign out button with hamburger menu - Add dropdown with email, Docusign Integration link, and sign out option - Improve dropdown styling with solid background and proper borders |

| 2025-01-15 | Update TODO.md |

| 2025-01-15 | fix: update CSP headers to support Vercel Toolbar - Add required domains for styles, images, fonts, and WebSocket connections |

| 2025-01-15 | fix: add Pusher WebSocket domains to CSP connect-src directive |

| 2025-01-15 | refactor: replace all /auth/login routes with /auth/connect |

| 2025-01-15 | chore: remove deprecated /auth/login page |

| 2025-01-15 | chore: remove deprecated (auth-pages) directory and its contents |

| 2025-01-15 | chore: update .env.example to match current environment variables |

| 2025-01-15 | chore: remove unused tutorial components |

| 2025-01-15 | fix: update auth page heading for first-time users - Change heading to 'Get Started' - Update description to focus on new users - Set default view to sign up |

| 2025-01-16 | feat: add document view component to preview page |

| 2025-01-16 | docs: update implementation report with document view details |

| 2025-01-16 | feat: make recipient form more compact and match DocuSign style |

| 2025-01-16 | feat: improve bulk operations view UX - move Restart Demo button outside card, sort errors to top, update mock data |

| 2025-01-16 | fix: remove unused tutorial component reference from protected page |

| 2025-01-16 | chore: remove unused protected route page |

| 2025-01-16 | feat: redesign document view with DocuSign styling and improved UX - Add collapsible document details section - Implement new recipient card design with status badges - Update color scheme to match DocuSign brand guide - Add expandable PDF viewer - Improve typography and spacing throughout - Add action buttons for resend and void operations |

| 2025-01-16 | feat: redesign envelope success with DocuSign styling and update success message - Update color scheme to match DocuSign brand guide - Add circular mail icons and status badges - Improve typography and spacing - Change success message to 'Envelope sent successfully!' - Add consistent shadows and rounded corners - Update button styling with brand colors |

| 2025-01-16 | feat: redesign math result with DocuSign styling - Add calculator icon with brand colors - Update typography and spacing - Improve error state styling - Add consistent shadows and rounded corners - Update layout with proper card structure |

| 2025-01-17 | style: update DocuSign connect components with brand styling - Add card layout with proper shadows - Update typography and colors to match brand guide - Improve alert and button styling - Maintain all existing functionality |

| 2025-01-17 | style: update reminder confirmation with DocuSign styling - Add card layout with brand shadows - Update icons and colors to match brand guide - Improve typography with proper tracking - Enhance error states with brand colors - Maintain all existing functionality |

| 2025-01-17 | feat: update navigator analysis with proper title display and status badges |

| 2025-01-17 | fix: update select components to use valid values for default options |

| 2025-01-17 | fix: add white background to select dropdowns |

| 2025-01-17 | chores |

| 2025-01-17 | fix: correct date display in navigator analysis to use provisions dates |

| 2025-01-17 | feat: add date range filter to navigator analysis |

| 2025-01-17 | fix: party filter and date range handling in navigator analysis |

| 2025-01-17 | refactor: remove debug mode from navigator analysis |

| 2025-01-17 | fix: date range filter initialization from API response |

| 2025-01-17 | feat: add pagination with load more functionality |

| 2025-01-17 | style: update filter UI to match design mockup |

| 2025-01-17 | fix: remove isDebug prop from NavigatorAnalysis usage |

| 2025-01-17 | fix: add missing properties to GetAgreementsOptions interface |

| 2025-01-17 | fix: remove unsupported date filter options from Navigator API calls |

| 2025-01-17 | fix: remove unsupported date filter from navigator patterns route |

| 2025-01-17 | fix: remove unsupported date filters from navigator priorities route |

| 2025-01-17 | fix: move filtering to client-side in navigator analyze route |

| 2025-01-17 | fix: remove unsupported date filters from validate navigator route |

| 2025-01-17 | Update TODO.md |

| 2025-01-17 | fix: suppress Next.js 15 cookie warnings for demo |

| 2025-01-17 | fix: prevent hydration mismatch in preview page |

| 2025-01-17 | fix: add proper streaming headers and dynamic API config - Add dynamic = force-dynamic and revalidate = 0 to ensure fresh responses - Add proper SSE headers for streaming - Fix type annotations for error handling in Puppeteer code - Remove Edge Runtime config since we need Node.js features for Puppeteer |

| 2025-01-17 | feat: enhance error logging for deployment debugging - Add environment variable checks - Improve auth error details - Add detailed error information in response |

| 2025-01-17 | Revert "feat: enhance error logging for deployment debugging - Add environment variable checks - Improve auth error details - Add detailed error information in response" |

| 2025-01-17 | feat: update template preview and selector to match DocuSign design |

| 2025-01-17 | chores |

| 2025-01-17 | fix: remove container class to allow full-width background |

| 2025-01-17 | docusign capitalization |

| 2025-01-17 | fix: improve chat layout with proper height calculations and padding |

| 2025-01-17 | feat: add white background to conversation starter buttons |

| 2025-01-17 | refactor: update template cards styling - Remove debug info, add white backgrounds, standardize styles |

| 2025-01-17 | fix: improve chat layout with proper scrollbar positioning and content width |

| 2025-01-17 | chores |

| 2025-01-17 | refactor: consolidate Tailwind config into TypeScript version |

| 2025-01-17 | Update TODO.md |

| 2025-01-18 | fix: filter out purged envelopes and extend date range to 90 days |

| 2025-01-18 | docs: add comprehensive documentation headers to tools.ts and route.ts explaining tool patterns and separation of concerns |

| 2025-01-18 | chores |

| 2025-01-18 | library research |

| 2025-01-18 | research |

| 2025-01-18 | Update #21-docusign-agent-tools-library.md |

| 2025-01-18 | research |

| 2025-01-18 | Create DEV-BRIEF-V2.md |

| 2025-01-18 | Create #22-library-setup.md |

| 2025-01-18 | research |

| 2025-01-18 | fixes |

| 2025-01-19 | style: unify typography between template preview and recipient form |

| 2025-01-19 | style: unify card styling between template preview and recipient form |

| 2025-01-19 | style: center recipient form columns based on count |

| 2025-01-19 | style: unify template selector with preview version styling |

| 2025-01-19 | Update route.ts |

| 2025-01-19 | fix: improve error handling for document details tool and add API logging |

| 2025-01-19 | fix: update handleEnvelopeClick to use docusign_envelope_id instead of Supabase id |

| 2025-01-19 | style: update EnvelopeList to use Card layout and consistent design system styling |

| 2025-01-19 | Delete agreement-list.tsx |

| 2025-01-19 | style: update NavigatorAnalysis card to use white background and consistent border styling |

| 2025-01-20 | fix: update URL parameter handling to use useSearchParams hook |

| 2025-01-20 | style: update PriorityDashboard to use Card layout and consistent design system styling |

| 2025-01-20 | feat: add pagination to PriorityDashboard sections |

| 2025-01-20 | feat: set PriorityDashboard pagination to 3 items per section |

| 2025-01-20 | feat: add expandable envelope cards with detailed view in PriorityDashboard |

| 2025-01-20 | feat: add expiration date support to templates and custom contracts - Add expirationDateTime to envelope interfaces and types - Update createEnvelope and createEnvelopeFromTemplate to support expiration - Add expirationHours parameter to sendTemplate and sendCustomEnvelope tools - Update system prompt with expiration date instructions for both flows |

| 2025-01-20 | fix: improve envelope status polling with progressive intervals - Add immediate polling on mount - Use 1s intervals for first 3 attempts - Use 2s intervals for next 3 attempts - Fall back to 5s intervals thereafter |

| 2025-01-20 | style: update MarkdownEditor with consistent white background and theme styling |

| 2025-01-20 | style: add explicit white background to envelope success cards |

| 2025-01-20 | Create #22-failure.md |

| 2025-01-20 | fix: add type definition for createEnvelopeWithExpiration params |

| 2025-01-20 | Create #23-core-toolkit.md |

| 2025-01-20 | fix: replace useSearchParams with standard URLSearchParams to resolve Next.js warnings |

| 2025-01-20 | commit: Update capabilities section with refined categories and actions |

| 2025-01-20 | fix: navigator analysis filtering - Fixed expiration date filtering by removing pre-filtering in API route - Send all agreements to frontend and handle all filtering client-side - Added proper null checks for agreement properties (parties, dates, etc.) - Made filtering logic consistent across all filter types - Added fallback text for missing data - Fixed runtime error when accessing undefined properties |

| 2025-01-20 | feat: implement pagination for Navigator agreements - Added pagination support to fetch all agreements beyond the 25-item limit - Uses page_token_next to fetch subsequent pages until complete - Logs progress of fetching with pageSize and totalSoFar counts |

| 2025-01-20 | research |

| 2025-01-20 | feat: implement interactive pie chart for agreement analysis - Add POST-based data fetching from Navigator API - Transform API data for chart visualization - Add interactive dimension selection - Add loading and error states - Add value formatting for different metrics - Add debug logging for troubleshooting |

| 2025-01-20 | fix: use correct dimension values in pie chart - Handle different dimensions (party_name, type, status, etc) - Add better logging with dimension labels - Improve unknown value handling |

| 2025-01-20 | feat: add chart analysis tool - Add chartType parameter for future chart types - Update system instructions for chart tool - Fix party name and other dimension handling - Add proper error states and loading |

| 2025-01-20 | style: update chart colors to cool purple palette - Remove cream color for better cohesion - Add new lavender purple - Reorder colors for better contrast |

| 2025-01-20 | feat: add click interaction to pie chart - Add onClick handler to update selected dimension - Add pointer cursor on hover - Fix chart styling with proper data attributes |

| 2025-01-20 | chores |

| 2025-01-20 | docs: add discovery about Navigator to eSignature mapping using source_id |

| 2025-01-20 | feat: add envelope ID logging when clicking Navigator agreements |

| 2025-01-20 | feat: add envelope actions to Navigator Analysis - Add dropdown menu for agreements with envelope IDs - Implement view, remind, and void actions - Connect actions to chat interface |

| 2025-01-20 | fix: resolve PDF.js version mismatch by aligning worker and API versions to 3.11.174 |

| 2025-01-20 | fix: update cookie handling for Next.js 15 compatibility - Fix cookie store handling in all API routes - Return fresh cookies() call in createRouteHandlerClient callbacks - Ensure proper typing for ReadonlyRequestCookies - Update cookie handling in chat, navigator-patterns, and navigator-priorities routes |

| 2025-01-20 | Update TODO.md |

| 2025-01-21 | fix: move Navigator filtering to client-side for interactive filters |

| 2025-01-21 | Update TODO.md |

| 2025-01-21 | Update #6-demo-idea-v2.md |

| 2025-01-21 | feat(document-view): implement side-by-side PDF viewer with individual expand/collapse functionality |

| 2025-01-21 | feat(pdf-viewer): improve PDF scaling and layout in both condensed and expanded states |

| 2025-01-21 | feat(document-view): set details open by default and update PDF background to white |

| 2025-01-21 | fix: force PDF viewer remount on expand/collapse to ensure proper scaling |

| 2025-01-22 | fix: initialize filters object before access to prevent undefined error |

| 2025-01-22 | fix: update AI instructions for proper filter parameter passing | Root cause analysis: Previous fix only handled undefined filters inside execute(), but the AI wasn't passing filters parameter at all in tool calls. Logs showed query being passed but filters missing entirely. | Solution: Updated system instructions with explicit tool call examples, shows exact parameter structure for each query type, demonstrates proper filters object format (e.g. parties: ['Name']), maintains existing filter capabilities with correct syntax. | Why this fixes it: 1) AI now knows to pass filters parameter proactively, 2) Previous defensive coding still helps as backup, 3) Explicit examples prevent AI from reverting to simpler calls, 4) Matches the API's expected parameter structure. | Testing: Party name queries now properly pass filters object, filters reach API endpoint with correct structure, maintains compatibility with other filter types. |

| 2025-01-22 | feat: add relative date handling for filters | Added support for now+/-Xdays format in date filters. Simple regex-based solution that handles both future and past dates. Updated AI instructions to use supported formats. Added documentation for future expansion to quarters/years. |

| 2025-01-22 | Update .gitignore |

| 2025-01-22 | fix: robust bulk send envelope storage with retry logic - Added retry mechanism, improved error handling, fixed race conditions, added exponential backoff |

| 2025-01-22 | Update .gitignore |

| 2025-01-22 | type error |

| 2025-01-22 | DocuSign to Docusign |

| 2025-01-22 | demo docs and cleaning |

| 2025-01-23 | chores |

| 2025-01-23 | refactor: simplify priority dashboard categories based on activity |

| 2025-01-23 | hotfix: Priority dashboard expiration handling |

| 2025-01-24 | truncate pdf title |

| 2025-01-24 | feat: update conversation starters with specific context for better AI responses |

| 2025-01-24 | fix: Update expiration handling to match new system (refs 7cd8a2f4, a2e9017c) |

| 2025-01-24 | feat: add sidebar navigation to preview page and organize components |

| 2025-01-24 | style: increase spacing between preview components |

| 2025-01-24 | feat: make preview sidebar sticky |

| 2025-01-24 | fix: remove double cards in preview components |

| 2025-01-24 | fix: remove double card wrapping from components that have their own cards |

| 2025-01-24 | fix: remove double card wrapping from DocuSign Connect and Document View |

| 2025-01-24 | fix: remove double card wrapping from Envelope Success component |

| 2025-01-24 | fix: remove double card wrapping from Reminder Confirmation component |

| 2025-01-24 | fix: replace CSS back to top with interactive button |

| 2025-01-24 | fix: hide divider and back-to-top button for first component |

| 2025-01-24 | fix: reduce spacing above first component |

| 2025-01-24 | feat: reorganize components into logical sections with headers |

| 2025-01-24 | style: update section headers to be more subtle and match navigation |

| 2025-01-24 | style: reduce top spacing to bring content up |

| 2025-01-24 | style: center components that should be centered |

| 2025-01-24 | feat: add interactive agreement chart component |

| 2025-01-24 | feat: enhance agreement search component |

| 2025-01-24 | docs: update template preview and selector descriptions, fix props tables |

| 2025-01-24 | docs: update document view and envelope success descriptions, emphasize real-time features |

| 2025-01-24 | chores |

| 2025-01-24 | Update README.md |

| 2025-01-24 | ascii diagrams |

| 2025-01-24 | Update README.md |

| 2025-01-24 | Create #23-toolkit-completion-report.md |

| 2025-01-24 | feat: add math calculation capability with URL-safe example |

| 2025-01-24 | math tweaks |

| 2025-01-24 | fix: enhance Navigator API error logging and update base URL - Update default Navigator base URL to navigator-d.docusign.com - Add token validation logging for better debugging - Include response headers in error logs - Add environment info to error output |

| 2025-01-25 | Update route.ts |

| 2025-01-25 | fix: Navigator API deployment issue by using client directly - Eliminates cookie forwarding issues in production - Removes unnecessary HTTP hop - Adds proper session validation and pagination |

| 2025-01-25 | Merge branch 'main' of https://github.com/ryanmio/docusign-agreement-copilot |

| 2025-01-25 | refactor: remove debug logging now that Navigator API is fixed |

| 2025-01-25 | (feat) update system instructions to allow agent to skip user input if they have already specified a template name |

| 2025-01-25 | feat: add comprehensive logging for envelope creation and polling to debug production issues |

| 2025-01-25 | (fix) accidental duplication |

| 2025-01-25 | feat: add detailed debug logging for envelope ID tracking |

| 2025-01-25 | fix: add fallback to database ID query in envelope success component |

| 2025-01-25 | fix: return DocuSign envelope ID instead of database ID in sendTemplate tool |

| 2025-01-25 | fix: improve envelope polling logic and initial status handling |

| 2025-01-25 | feat: integrate LiveStatusBadge component with type-safe status handling |

| 2025-01-25 | fix: set initial recipient status to 'sent' in createEnvelope and createEnvelopeFromTemplate |

| 2025-01-25 | feat: integrate LiveStatusBadge component with type-safe status handling |

| 2025-01-25 | feat: integrate LiveStatusBadge in preview envelope success component |

| 2025-01-25 | chores |

| 2025-01-25 | fix: set initial recipient status to 'sent' when storing in database |

| 2025-01-25 | fix: maintain local selection state in template selector to show immediate visual feedback when clicked |

| 2025-01-25 | fix: restore relative date filtering in navigator analysis - Add parseRelativeDate helper for ISO dates, 'now' keyword, and now+/-Xdays format - Update date range matching logic - Fix regression from previous commits |

| 2025-01-25 | fix: add value filtering to navigator analysis - Add min_value and max_value to filter types - Update metadata response to include value filters - Add examples for value filtering in AI instructions |

| 2025-01-25 | fix: update navigator analysis component for value filtering - Add min_value/max_value to interface - Initialize value filters in state - Add useEffect for handling initial value filters |

| 2025-01-25 | fix: set initial recipient status to 'sent' when storing in database |

| 2025-01-25 | fix: handle duplicate recipients with upsert to prevent unique constraint violations |

| 2025-01-25 | chores |

| 2025-01-25 | fix: restore working version of envelope storage code |

| 2025-01-25 | fix: use consistent docusign_envelope_id when returning from sendTemplate |

| 2025-01-25 | fix: restore working version that returns docusignResponse.envelopeId |

| 2025-01-25 | fix: resolve envelope success loading state by using database ID |

| 2025-01-25 | fix: add delay before first envelope query to ensure db write completes - Fixes infinite loading state |

| 2025-01-25 | fix: improve envelope success component reliability - Add better error handling and logging - Show different messages for initial delay vs loading - Continue polling on not found errors - Fix loading state management |

| 2025-01-25 | fix: remove loading flashes during envelope polling - Only show loading state during initial fetch - Keep polling in background without visual changes - Add isActive flag to prevent state updates after unmount - Add better cleanup and debug logging |

| 2025-01-25 | fix: continue polling through delivered state - Reduce polling interval to 2s for faster updates - Add logging for polling decisions - Only stop at truly final states (completed/declined/voided/error) |

| 2025-01-25 | fix: revert envelope success component to working version - Use local isActive flag instead of ref - Keep 5s polling interval - Remove queryInProgressRef - Simplify cleanup logic |

| 2025-01-25 | fix: move supabase client initialization outside effect to fix production polling |

| 2025-01-26 | fix: resolve envelope success polling issues - Add isActiveRef checks in both demo and real polling paths - Prevent state updates after component unmount - Fix component lifecycle management in production - Maintain polling until final status - Add debug logging for better visibility |

| 2025-01-26 | fix: restore sendCustomEnvelope tool that was accidentally removed in 1e0ad17339eb476a200a978f1ac45368f5bdebca |

| 2025-01-26 | fix: handle recipient storage correctly for both template and custom envelopes |

| 2025-01-26 | fix: use upsert for recipients to handle duplicates gracefully |

| 2025-01-26 | fix: make recipient storage errors non-blocking for demo |

| 2025-01-26 | fix: handle recipient storage errors gracefully for demo - Template sends and custom sends now working for demo - Both flows handle recipient storage errors without breaking UI - Known issue: Live status tracking broken for custom envelopes (returns docusign_envelope_id instead of db id) - TODO post-demo: Fix custom envelope status tracking by returning correct db id |

| 2025-01-26 | tweaks for demo recording |

| 2025-01-27 | chores |

| 2025-01-27 | Update README.md |

| 2025-01-27 | readme |

| 2025-01-27 | Update README.md |

| 2025-01-27 | art |

| 2025-01-27 | Update README.md |

| 2025-01-27 | Update README.md |

| 2025-01-27 | fix: restore envelope-success.tsx to production state - Remove demo hardcoded data - Restore actual database polling logic - Clean up polling lifecycle management |

| 2025-01-27 | fix: remove hardcoded email addresses - Add useSession hook for auth state - Use session email in chat page - Use mock email in preview page |

| 2025-01-27 | fix: correct useSession import path from lib/hooks to hooks |

| 2025-01-27 | (cleanup) remove used imports, move use session hook |

| 2025-01-27 | chores and docs |

| 2025-01-27 | feat: update metadata and switch to static OG image |

| 2025-01-27 | feat: add Vercel Analytics for page view tracking |

| 2025-01-27 | Update TODO.md |

| 2025-01-27 | renaming agents > .dev-agents |
