# Navigator to eSignature Document Mapping

## Key Discovery
We found a reliable way to map Navigator agreements back to their original DocuSign envelopes. The Navigator API response includes two critical fields:

```json
{
  "source_name": "ESign",
  "source_id": "d74381f1-eae7-433e-8e92-f2ac550fb1b6"
}
```

When `source_name` is "ESign", the `source_id` field contains the original DocuSign envelope ID. This provides a direct, reliable mapping between Navigator agreements and their source envelopes.

## Implementation Details
1. When viewing a Navigator agreement, we can extract the `source_id`
2. This ID can be used to:
   - Look up the envelope in our Supabase database
   - Make API calls to DocuSign eSignature
   - Enable envelope actions (void, remind, etc.) from the Navigator view

## Advantages
- Direct 1:1 mapping (no fuzzy matching needed)
- Reliable (IDs are immutable)
- Fast (single database lookup)
- Works for all agreements synced from eSignature

## Next Steps
1. Add envelope ID extraction to Navigator Analysis component
2. Enable envelope actions in the Navigator UI
3. Add proper error handling for cases where:
   - source_name isn't "ESign"
   - envelope isn't found in our database
   - envelope API calls fail 