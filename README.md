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