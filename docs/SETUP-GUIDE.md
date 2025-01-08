# Setup Guide

## Prerequisites
1. Docusign Developer Account
2. Supabase Project
3. Node.js and npm/yarn
4. Environment variables configured

## Docusign Configuration

### 1. Create Docusign App
1. Go to Docusign Developer Center
2. Create a new Integration
3. Select "Authorization Code Grant"
4. Add redirect URI: `{BASE_URL}/api/auth/docusign/callback`
5. Note down:
   - Integration Key
   - Secret Key

### 2. Enable Connect (Webhooks)
1. Go to Docusign Admin
2. Navigate to Connect
3. Create new configuration
4. Set webhook URL: `{BASE_URL}/api/webhooks/docusign`
5. Enable events:
   - Envelope Sent
   - Envelope Delivered
   - Envelope Completed
   - Recipient Completed

## Environment Setup

### 1. Required Variables
```env
# Docusign Configuration
DOCUSIGN_CLIENT_ID=your_integration_key
DOCUSIGN_CLIENT_SECRET=your_secret_key
DOCUSIGN_AUTH_SERVER=account-d.docusign.com
DOCUSIGN_REDIRECT_URI=http://localhost:3000/api/auth/docusign/callback

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Database Setup
Run the following migrations in order:
1. `20231216_envelope_management.sql`
2. `20231216_webhook_events.sql`
3. `20231217_envelope_status_procedure.sql`
4. `20231217_webhook_envelope_policy.sql`

## Local Development

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Run Migrations
```bash
# Using Supabase CLI
supabase db reset

# Or manually in SQL editor
# Run migrations in order from /supabase/migrations/
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Testing Setup

### 1. Verify OAuth Flow
1. Visit `/settings`
2. Click "Connect Docusign"
3. Complete OAuth flow
4. Verify token storage in `api_credentials` table

### 2. Test Document Sending
1. Visit `/documents/new`
2. Upload test document
3. Add recipient
4. Send envelope
5. Verify status updates

### 3. Verify Webhooks
1. Send test envelope
2. Monitor webhook events in logs
3. Verify status updates in UI
4. Check `webhook_events` table

## Troubleshooting

### Common Issues

1. **OAuth Errors**
   - Verify redirect URI matches exactly
   - Check environment variables
   - Ensure cookies are enabled

2. **Webhook Issues**
   - Verify webhook URL is accessible
   - Check Connect configuration
   - Monitor webhook_events table

3. **Database Errows**
   - Verify RLS policies
   - Check enum type definitions
   - Validate foreign key relationships

### Debug Tools
1. Use `/api/webhooks/docusign/debug` for webhook logs
2. Check Supabase logs for database issues
3. Monitor Next.js server logs for API errors

## Security Checklist
- [ ] Environment variables configured
- [ ] RLS policies enabled
- [ ] OAuth credentials secured
- [ ] Webhook endpoint secured
- [ ] Error logging configured
- [ ] Token refresh working
  </rewritten_file>