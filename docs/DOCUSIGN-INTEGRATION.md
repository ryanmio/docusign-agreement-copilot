# Docusign Integration Documentation

## Overview
Agreement Copilot integrates with Docusign to provide document signing capabilities with real-time status updates. This integration uses OAuth 2.0 for authentication and webhooks for real-time event processing.

## Authentication Flow
1. **OAuth 2.0 Implementation**
   - Authorization Code Grant flow
   - Automatic token refresh
   - Secure credential storage in Supabase
   - Environment-based configuration

2. **Connection Process**
   ```
   User -> Settings Page -> Connect Docusign -> OAuth Flow -> Return to App
   ```

## Core Features

### 1. Envelope Management
- Create and send envelopes
- Track envelope status in real-time
- Manage recipients
- Download signed documents

### 2. Webhook Integration
- Real-time status updates
- Event processing for:
  - `envelope-sent`
  - `recipient-delivered`
  - `recipient-completed`
  - `envelope-completed`
- Automatic database synchronization

### 3. Security
- Secure token storage in Supabase
- Row Level Security (RLS) policies
- Environment variable management
- Error handling and logging

## API Endpoints

### Authentication
```
POST /api/auth/docusign
GET  /api/auth/docusign/callback
POST /api/auth/docusign/disconnect
GET  /api/auth/docusign/status
```

### Envelopes
```
POST /api/envelopes
GET  /api/envelopes
GET  /api/envelopes/:id
GET  /api/envelopes/:id/documents/:documentId
```

### Webhooks
```
POST /api/webhooks/docusign
GET  /api/webhooks/docusign/debug
```

## Database Schema

### Envelopes Table
```sql
create table envelopes (
  id uuid primary key,
  user_id uuid references auth.users,
  docusign_envelope_id text unique,
  subject text,
  message text,
  status envelope_status,
  created_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz,
  metadata jsonb
);
```

### Recipients Table
```sql
create table recipients (
  id uuid primary key,
  envelope_id uuid references envelopes,
  email text,
  name text,
  status text,
  signing_url text,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  routing_order integer
);
```

## Status Flow
```
created -> sent -> delivered -> completed
                            -> declined
                            -> voided
```

## Error Handling
- Comprehensive error logging
- User-friendly error messages
- Automatic retry for failed webhook events
- Database transaction management

## Testing
- OAuth flow verification
- Envelope creation and sending
- Status update processing
- Webhook event handling
- Security policy validation

## Known Limitations
1. Single signer per envelope (current implementation)
2. Basic signing ceremony customization
3. No template support yet
4. No bulk operations

## Future Enhancements
1. Template support
2. Bulk envelope operations
3. Enhanced signing ceremony customization
4. Advanced document analysis features
5. Rate limiting implementation
6. Webhook retry mechanism 