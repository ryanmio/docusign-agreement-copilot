**TASK:** Clean and Polish Repository for Submission

**OBJECTIVE:** Systematically review and clean up the codebase, focusing on comments, unused code, and demo-related items to ensure a professional submission.

**PHASE 1: Analysis & Planning**

Create a cleanup report (`CLEANUP-REPORT.md`) containing:

1. Comment Audit:
   ```markdown
   ## Comments to Update
   
   ### Type 1: TODO/Note Comments
   - [ ] `app/chat/page.tsx:45` - "Add scroll listener to show/hide button"
   - [ ] `lib/docusign/envelopes.ts:23` - "Use docusign_envelope_id instead of Supabase id"
   
   ### Type 2: Unclear Comments
   - [ ] `components/pdf-viewer.tsx:89` - "This fixes the thing"
   - [ ] `ai/tools.ts:156` - "Temporary fix for demo"
   
   ### Type 3: Demo-Related Comments
   - [ ] `components/envelope-success.tsx:12` - "TODO: Real-time status updates are broken"
   ```

2. Unused Code Inventory:
   ```markdown
   ## Code to Remove
   
   ### Unused Routes
   - [ ] `app/api/test/route.ts`
   - [ ] `app/api/validate/route.ts`
   
   ### Debug Components
   - [ ] `components/debug-view.tsx`
   - [ ] `components/test-button.tsx`
   
   ### Temporary Files
   - [ ] `scripts/temp-data-generator.ts`
   - [ ] `lib/test-helpers.ts`
   ```

3. Demo Cleanup Items:
   ```markdown
   ## Demo-Related Cleanup
   
   ### Data Cleanup
   - [ ] Remove test envelopes
   - [ ] Clean up test templates
   - [ ] Update demo recipient emails
   
   ### Configuration
   - [ ] Update environment variables
   - [ ] Check API keys
   - [ ] Verify webhook URLs
   ```

**PHASE 2: Implementation Plan**

1. Comment Updates:
   ```typescript
   // BEFORE:
   // Add scroll listener to show/hide button
   window.addEventListener('scroll', handleScroll);

   // AFTER:
   // Scroll listener controls button visibility based on scroll position
   window.addEventListener('scroll', handleScroll);
   ```

2. Code Removal Process:
   ```bash
   # 1. Move to backup
   mkdir -p .backup/unused
   git mv unused-file.ts .backup/unused/

   # 2. Update imports
   # 3. Test functionality
   # 4. Commit changes
   ```

3. Demo Data Cleanup:
   ```typescript
   // Update test data with generic examples
   const demoTemplates = {
     nda: 'template-id-1',
     vendor: 'template-id-2'
   };
   ```

**PHASE 3: Verification**

Create checklist:
1. [ ] All TODOs addressed or removed
2. [ ] Comments are descriptive
3. [ ] No unused routes
4. [ ] No debug code
5. [ ] Demo data is clean
6. [ ] All tests pass
7. [ ] Build succeeds
8. [ ] No console errors

**IMPORTANT GUIDELINES:**

1. Comment Updates:
   - Make comments describe WHY, not WHAT
   - Remove unnecessary TODOs
   - Keep important warnings
   - Document complex logic

2. Code Removal:
   - Test after each removal
   - Keep demo-critical code
   - Document removed features
   - Backup if unsure

3. Demo Data:
   - Use consistent test accounts
   - Remove personal emails
   - Clean up test documents
   - Update example data

**PROOF OF COMPLETION:**

Provide:
1. Cleanup report
2. List of changes made
3. Test results
4. Build verification

Remember: The goal is a clean, professional codebase that's ready for public viewing. Be thorough but careful not to break demo functionality. 