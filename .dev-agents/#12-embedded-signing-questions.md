# DocuSign Embedded Signing Questions

## Current Implementation Status
We have implemented DocuSign embedded signing with the following components working:
- ✅ Envelope creation with email notifications
- ✅ Database storage for envelopes
- ✅ Recipient updating for embedded signing
- ✅ Signing URL generation
- ❌ Iframe embedding (blocked by CSP issues)
- ❌ DocuSign JS focused view (new approach)

## Current Issues
1. Service Worker Conflict:
```
Error importing mockServiceWorker.js NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope'
```

2. CSP Frame Ancestors:
```
Refused to frame 'https://demo.docusign.net/' because an ancestor violates the following Content Security Policy directive: "frame-ancestors http://localhost:3000"
```

## Questions for DocuSign Support

### 1. DocuSign JS Integration
Questions about the proper setup:
- What is the correct way to load the DocuSign JS library? Should it be included in the page head or loaded dynamically?
- Which domains need to be allowed for the service worker to function properly?
- Is there a complete list of required domains for CSP when using DocuSign JS?
- Are there specific initialization requirements for the focused view approach?

### 2. Service Worker Requirements
Questions about service worker integration:
- Why is DocuSign trying to load a mock service worker in demo environment?
- What service worker functionality is required for embedded signing?
- How should we configure our CSP to allow the necessary service worker scripts?

### 3. Focused View Implementation
Questions about the recommended approach:
- What is the recommended way to implement focused view without iframes?
- Are there specific event handlers we need to implement for the signing flow?
- How do we handle the completion/cancellation of the signing process?

### 4. Security and CSP Configuration
Questions about security setup:
- What is the minimum required CSP configuration for DocuSign JS?
- Which domains need to be allowed for each CSP directive?
- Are there different requirements between demo and production environments?

## Next Steps
1. Get clarification on DocuSign JS implementation requirements
2. Understand service worker requirements and configuration
3. Implement proper focused view approach
4. Configure security settings correctly
5. Test in both demo and production environments 