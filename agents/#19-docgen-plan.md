# AI-Powered Custom Contract Generation with Anchor Tags

## Overview
This document describes a plan for integrating an AI-driven contract generation flow using anchor tags for DocuSign signing fields. The AI will create custom contract text in markdown format, which we'll convert to PDF with embedded anchor placeholders (e.g., "<<SIGN_HERE>>"). The PDF will be attached to a DocuSign envelope with anchor-based field placement for signatures.

## System Prompt Addition
Add this section to the existing system message in route.ts:

```typescript
When users ask to generate a custom contract:

1. Generate the contract in markdown format with these anchor tags:
   • "<<SIGN_HERE>>" - Primary signature field
   • "<<DATE_HERE>>" - Date field
   • For multiple signers: "<<SIGNER1_HERE>>", "<<SIGNER2_HERE>>"

2. Use this markdown structure:
   ```markdown
   # [Contract Title]
   ## 1. [First Section]
   [Content...]

   ## Signatures
   IN WITNESS WHEREOF:

   PARTY A:                    PARTY B:
   <<SIGNER1_HERE>>           <<SIGNER2_HERE>>
   ___________________        ___________________
   Date: <<DATE_HERE>>        Date: <<DATE_HERE>>
   ```

3. IMPORTANT RULES:
   - Include at least one signature anchor per signer
   - Keep anchor tags on their own lines
   - Use proper markdown headings (# for title, ## for sections)
   - Place signature block at the bottom

4. After user confirms the contract:
   - Use collectRecipients to gather signer information
   - Then use sendCustomEnvelope to create and send the document

Never try to handle document conversion or styling - the app will manage that.
```

## Implementation Flow

1. **AI Draft Generation**  
   - User requests contract generation via chat
   - AI generates markdown-formatted contract with anchor tags
   - Returns markdown text for preview

2. **Preview & Editing**  
   - Display markdown-rendered preview
   - Allow text editing if needed
   - Show anchor tags in a visually distinct way

3. **Document Processing**  
   - Convert markdown to PDF using a library like react-markdown-to-pdf
   - Maintain anchor tag text in the conversion
   - Convert PDF to base64 for DocuSign API

4. **Envelope Creation**  
   ```typescript
   const envelopeDefinition = {
     emailSubject: subject,
     documents: [{
       documentBase64: base64Doc,
       name: 'Contract.pdf',
       fileExtension: 'pdf',
       documentId: '1'
     }],
     recipients: {
       signers: recipients.map((recipient, i) => ({
         email: recipient.email,
         name: recipient.name,
         recipientId: (i + 1).toString(),
         tabs: {
           signHereTabs: [{
             anchorString: `<<SIGNER${i + 1}_HERE>>`,
             anchorUnits: "pixels",
             anchorXOffset: "0",
             anchorYOffset: "0"
           }],
           dateSignedTabs: [{
             anchorString: "<<DATE_HERE>>",
             anchorUnits: "pixels",
             anchorXOffset: "0",
             anchorYOffset: "0"
           }]
         }
       }))
     },
     status: "sent"
   };
   ```

5. **New Tool: sendCustomEnvelope**
   ```typescript
   interface SendCustomEnvelopeParams {
     markdown: string;          // Contract text in markdown
     recipients: Array<{       // From collectRecipients
       email: string;
       name: string;
       role: string;
     }>;
     subject: string;          // Email subject
     message?: string;         // Optional email message
   }
   ```

## Technical Components Needed

1. **Markdown to PDF Conversion**
   - Install and configure react-markdown-to-pdf or similar
   - Ensure anchor tags are preserved during conversion
   - Handle basic styling (fonts, spacing)

2. **Preview Component**
   - Markdown renderer for preview
   - Edit capability
   - Visual distinction for anchor tags

3. **sendCustomEnvelope Tool**
   - Handle markdown → PDF conversion
   - Create envelope with anchor tabs
   - Send via DocuSign API

## Edge Cases & Mitigation

1. **Anchor Tag Preservation**
   - Validate anchor tags exist in PDF after conversion
   - Ensure proper spacing around anchors

2. **PDF Formatting**
   - Set consistent fonts and spacing
   - Ensure anchor tags are clearly visible for testing
   - Consider adding basic header/footer

3. **Multiple Signers**
   - Match recipient roles to correct SIGNER[N] anchors
   - Validate all required anchors present

## Success Metrics

1. Contract Generation
   - AI consistently produces well-formatted markdown
   - Anchor tags correctly placed
   - Preview renders accurately

2. Document Processing
   - Clean PDF conversion
   - Anchor tags preserved
   - Professional appearance

3. Signing Experience
   - Signature fields appear at correct anchors
   - Multiple signers properly handled
   - Date fields correctly placed

## Next Steps

1. Implement markdown to PDF conversion
2. Create sendCustomEnvelope tool
3. Add preview component
4. Test with multiple signer scenarios
5. Add error handling and validation

This approach provides a streamlined way to generate custom contracts while maintaining professional formatting and reliable signature field placement. 