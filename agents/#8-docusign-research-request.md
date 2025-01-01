# DocuSign Research Request - Priority Dashboard Envelope Queries

## Project Context
Building a Priority Dashboard that shows urgent agreements requiring attention. We need to fetch and categorize envelopes from the last 30 days based on their status, expiration dates, and other metadata. This will be integrated into our existing chat interface using the DocuSignEnvelopes class.

## Specific Questions

1. What's the most efficient API call to get envelopes with their expiration dates and status? We need to filter for:
   - Envelopes from last 30 days
   - Only active (not completed) envelopes
   - Include expiration/due date information
   - Include current status

2. What envelope statuses should we consider "active" in DocuSign's system? We know about 'declined' and 'voided', but need a complete list of statuses we should check.

3. Is there a direct way to query envelopes by expiration date, or do we need to fetch and filter client-side?

Please provide relevant API endpoint documentation and example responses that would help implement these queries efficiently. 