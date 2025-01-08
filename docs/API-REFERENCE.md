# API Reference

## Authentication Endpoints

### Connect Docusign
```http
POST /api/auth/docusign
```
Initiates Docusign OAuth flow.

**Response**: Redirects to Docusign login

### OAuth Callback
```http
GET /api/auth/docusign/callback
```
Handles OAuth callback from Docusign.

**Query Parameters**:
- `code`: Authorization code
- `state`: State parameter for security

**Response**: Redirects to settings page with success/error message

### Disconnect Docusign
```http
POST /api/auth/docusign/disconnect
```
Removes Docusign integration.

**Response**:
```json
{
  "success": true
}
```

### Check Connection
```http
GET /api/auth/docusign/status
```
Checks Docusign connection status.

**Response**:
```json
{
  "connected": boolean,
  "expires_at": string | null,
  "created_at": string | null
}
```

## Envelope Endpoints

### Create Envelope
```http
POST /api/envelopes
```

**Request Body**:
```json
{
  "subject": string,
  "message": string?,
  "documents": [{
    "name": string,
    "content": string, // base64
    "fileExtension": string
  }],
  "recipients": [{
    "email": string,
    "name": string,
    "routingOrder": number?
  }]
}
```

**Response**:
```json
{
  "id": string,
  "docusign_envelope_id": string,
  "subject": string,
  "status": "sent",
  "created_at": string,
  "updated_at": string
}
```

### List Envelopes
```http
GET /api/envelopes
```

**Query Parameters**:
- `status`: Filter by status
- `page`: Page number
- `limit`: Items per page

**Response**:
```json
{
  "envelopes": [{
    "id": string,
    "subject": string,
    "status": string,
    "created_at": string,
    "updated_at": string,
    "completed_at": string?
  }],
  "count": number
}
```

### Get Envelope
```http
GET /api/envelopes/:id
```

**Response**:
```json
{
  "id": string,
  "subject": string,
  "status": string,
  "created_at": string,
  "updated_at": string,
  "completed_at": string?,
  "recipients": [{
    "email": string,
    "name": string,
    "status": string?,
    "completed_at": string?
  }]
}
```

### Get Document
```http
GET /api/envelopes/:id/documents/:documentId
```

**Response**: Binary file download

## Webhook Endpoints

### Docusign Webhook
```http
POST /api/webhooks/docusign
```
Handles Docusign Connect webhook events.

**Request Body**: Docusign Connect XML/JSON payload

**Response**:
```json
{
  "success": true
}
```

### Debug Webhook
```http
GET /api/webhooks/docusign/debug
```
Returns recent webhook events for debugging.

**Response**:
```json
{
  "events": [{
    "provider": "docusign",
    "event_type": string,
    "payload": object,
    "processed_at": string,
    "created_at": string
  }],
  "timestamp": string
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

## Error Responses

```json
{
  "error": string,
  "details"?: object
}
```

## Rate Limits

Currently no rate limits implemented. Future enhancement planned.

## Webhook Events

### Supported Events
- `envelope-sent`
- `envelope-delivered`
- `envelope-completed`
- `recipient-delivered`
- `recipient-completed`

### Event Processing
1. Validate payload
2. Update envelope status
3. Update recipient status
4. Log event
5. Return success
