# AI-Powered Custom Contract Generation with Anchor Tags

## Overview
This document describes a plan for integrating an AI-driven contract generation flow using anchor tags for DocuSign signing fields—no pre-created DocuSign template required. The AI will create custom contract text (from user requests), and we’ll embed anchor placeholders (e.g., "<<SIGN_HERE>>") in the text. Then we convert that text into a .docx or PDF, attach it to a DocuSign envelope, and rely on anchor-based field placement for signatures.

---

## Objectives & Motivations
1. **Flexibility**: Allow fully custom contracts generated on the fly, rather than relying on a pre-stored template.  
2. **Reliability**: Use anchor tags to eliminate reliance on manual coordinates or complex “docGenFormField” logic in DocuSign.  
3. **User Control**: Provide a preview and editing step before sending.  
4. **Hackathon Readiness**: Implement quickly, demonstrate AI capabilities, and minimize friction.

---

## High-Level Architecture

1. **AI Draft Generation**  
   - The user requests, “Generate a custom contract for [XYZ].”  
   - The AI (via our existing chat infrastructure) composes contract language, including anchor tags like "<<SIGN_HERE>>" for each signer.  
   - The final text returns to the client for preview.

2. **Preview & Editing**  
   - The user sees the draft in a text editor or viewer.  
   - They can revise or add new anchor tags if they want additional fields.  
   - A minimal styling approach (e.g., a simple header with a logo) can be included at this stage.

3. **Document Conversion**  
   - Once the user approves, the system sends the contract text (still containing anchor placeholders) to a file-generation library.  
   - The resulting output (.docx or PDF) is returned, ready to send.

4. **Envelope Creation & Tab Mapping**  
   - Create a new DocuSign envelope. Attach the newly generated .docx/PDF.  
   - In the request, specify "anchorString": "<<SIGN_HERE>>" (or "<<SIGNER1_HERE>>" if multiple signers) for each relevant role. This ensures signature tabs appear where specified.

5. **Signing & Completion**  
   - The envelope is sent to signers as usual.  
   - DocuSign replaces each anchor with a signature field, so signers can sign in the correct spots.  
   - The signed document is stored or returned to the user as a final PDF.

---

## Detailed Steps

### 1. Generating Contract Text with Anchors

1. **Add an AI prompt** in the existing chat flow to instruct the model to include anchor tag placeholders:
   - "Create a contract with a place for a signature. Use ‘<<SIGN_HERE>>’ for the signature anchor."
2. **Post-process** the AI’s response to ensure at least one anchor is present. If missing, we can add it automatically or prompt the user to place a signature anchor.

### 2. User Preview & Editing

1. **Display** the generated text in a text area or preview panel.  
2. **Allow** simple modifications:
   - If the user wants multiple signers or additional placeholders (like "Date" anchors), they can add “<<DATE_FIELD>>” or “<<SIGNER2_HERE>>.”  
   - Potentially track which anchor belongs to which role, if there are multiple recipients.

### 3. Conversion to .docx or PDF

1. **Use a library** (like docx, pdfkit, or similar) to convert the final text into a formatted document.  
2. **Add small branding** (like a header image or color theme) so the output is visually appealing:
   - Insert a logo if feasible, ensuring the content remains mostly AI-driven.  
3. **Return** the file in memory or store temporarily on the server.

### 4. Envelope Creation & Anchor Tabs

1. **Collect** recipient details as needed (usually through a recipient form or your “collectRecipients” tool).  
2. **Construct** the Envelope create request with the following:
   - Document attachments: the newly generated .docx/PDF as base64.  
   - For each anchor (like "<<SIGN_HERE>>"):
     - "anchorString": "<<SIGN_HERE>>"
     - "documentId": [the ID referencing the doc we attached]
     - "recipientId": [the signer's ID]
     - "tabType": "signHere" (or "initialHere", "dateSigned", etc.)
3. **Send** this envelope to DocuSign using your existing “send” mechanism.

### 5. Final User Experience

1. **Real-Time Chat**: The user converses with the AI about desired contract details.  
2. **Auto-Generated Draft**: AI returns the draft with placeholders.  
3. **Preview & Adjust**: The user fine-tunes text or anchor placement.  
4. **Click “Send for Signature”**: The system merges the text into a doc, sets up anchor fields, and calls DocuSign.  
5. **Signers** get their usual signing flow; anchors become signature fields.

---

## Edge Cases & Mitigation

1. **Missing Anchors**: We must confirm at least one anchor is in the final text for signers.  
2. **Multiple Signers**: If we have two or more signers, we need separate anchor tags (e.g., “<<SIGNER1_HERE>>,” “<<SIGNER2_HERE>>”).  
3. **Visibility of Anchor Text**: If we don’t remove or hide them, “<<SIGN_HERE>>” is visible in the final PDF. We might enable "anchorRemoveIfMatched" or use invisible styling.  
4. **AI-Incorrect Clauses**: The user can fix any questionable text in the editor. This is more a content concern than a technical one.

---

## Future Enhancements

1. **Conditional Clauses**: If we eventually want advanced logic (e.g., disclaimers for signers in certain states), we could integrate partial Document Generation or custom logic to hide paragraphs.  
2. **Dynamic Data Fields**: If we want fillable text fields for signers, we could add anchor tags for text fields (“<<TEXT_FIELD>>”) or switch to more advanced tab definitions.  
3. **Cloud Storage**: Store the final doc after user preview, so it’s available for reference or re-sending.

---

## Conclusion

By leveraging AI to generate contract text and anchor placeholders, then converting it to a doc or PDF for a new envelope, we achieve a fully custom, from-scratch contract workflow. This approach avoids complex template configuration, remains flexible for user edits, and yields a powerful demonstration of AI + DocuSign integration suitable for hackathon success. 