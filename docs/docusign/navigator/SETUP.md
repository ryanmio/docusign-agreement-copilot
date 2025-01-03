# Navigator API Setup Guide

## 1. Beta Access Requirements

### Prerequisites
- DocuSign Developer Account
- eSignature API Integration
- Beta Program Approval

### Configuration
- Navigator API Base URL: `https://navigator-d.docusign.com`
- Required Scopes: `signature navigator_read`
- API Version: Beta/v1

## 2. Authentication Setup

### Environment Variables
```env
NEXT_PUBLIC_DOCUSIGN_NAVIGATOR_BASE_PATH=https://navigator-d.docusign.com
```

### API Credentials
1. Ensure your OAuth configuration includes Navigator scopes
2. Update existing DocuSign client credentials
3. Verify token includes Navigator access

### Token Management
- Token refresh handling
- Scope validation
- Session persistence

## 3. Testing Environment

### Validation Endpoint
Use `/api/validate-navigator` to verify:
- API accessibility
- Authentication status
- Pattern analysis functionality

### Test Data Requirements
1. Minimum 30 days of agreement data
2. Various agreement types and categories
3. Regular patterns (e.g., Tuesday reviews)

### Error Scenarios
- Authentication failures
- Rate limiting
- Invalid scope access
- Beta access issues

## 4. Integration Checklist

### API Endpoint Verification
- [ ] GET /v1/agreements
- [ ] GET /v1/agreements/{id}
- [ ] Pattern analysis endpoints

### Authentication Flow
- [ ] OAuth configuration
- [ ] Token management
- [ ] Error handling

### Pattern Analysis
- [ ] Basic pattern detection
- [ ] AI-powered insights
- [ ] Confidence scoring

## 5. Troubleshooting

### Common Issues
1. 403 Forbidden
   - Check beta access status
   - Verify OAuth scopes
   - Validate token

2. 401 Unauthorized
   - Check token expiration
   - Verify credentials
   - Confirm session status

3. Rate Limiting
   - Review API quotas
   - Implement backoff strategy
   - Cache responses

### Support Resources
- DocuSign Developer Support
- Beta Program Contact
- Internal Documentation 