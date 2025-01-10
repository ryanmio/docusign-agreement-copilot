# DocuSign Focused View Signing Component - Technical Implementation Report

## Overview
This report details the implementation of the DocuSign focused view signing component, with complete code examples optimized for Next.js implementation. This guide ensures a flawless integration of DocuSign's focused view signing experience.

## 1. Complete Next.js Component Implementation

### File Structure
```
/components
  /DocuSignFocused
    index.tsx
    styles.module.css
/pages
  /api
    /docusign
      create-signing-session.ts
/types
  docusign.d.ts
```

### Component Implementation (components/DocuSignFocused/index.tsx)
```typescript
import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

interface DocuSignFocusedProps {
  integrationKey: string;
  signingUrl: string;
  onSuccess?: (event: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export const DocuSignFocused: React.FC<DocuSignFocusedProps> = ({
  integrationKey,
  signingUrl,
  onSuccess,
  onError,
  onCancel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let signing: any = null;

    const initializeDocuSign = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Load DocuSign bundle if not already loaded
        if (!window.DocuSign) {
          await loadDocuSignBundle();
        }

        const docusign = await window.DocuSign.loadDocuSign(integrationKey);
        
        signing = docusign.signing({
          url: signingUrl,
          displayFormat: 'focused',
          style: {
            branding: {
              primaryButton: {
                backgroundColor: '#333',
                color: '#fff'
              }
            },
            signingNavigationButton: {
              finishText: 'You have finished signing!',
              position: 'bottom-center'
            }
          }
        });

        // Event listeners
        signing.on('ready', () => {
          setIsLoading(false);
        });

        signing.on('sessionEnd', (event: any) => {
          if (event.status === 'completed') {
            onSuccess?.(event);
          } else if (event.status === 'cancelled') {
            onCancel?.();
          }
        });

        if (containerRef.current) {
          signing.mount('#docusign-focused-container');
        }
      } catch (err) {
        setError(err.message);
        onError?.(err);
      }
    };

    initializeDocuSign();

    // Cleanup
    return () => {
      if (signing && typeof signing.unmount === 'function') {
        signing.unmount();
      }
    };
  }, [integrationKey, signingUrl, onSuccess, onError, onCancel]);

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      {isLoading && <div className={styles.loader}>Loading DocuSign...</div>}
      <div 
        id="docusign-focused-container"
        ref={containerRef}
        className={styles.docusignContainer}
      />
    </div>
  );
};

// Helper function to load DocuSign bundle
const loadDocuSignBundle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.docusign.com/bundle.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load DocuSign bundle'));
    document.body.appendChild(script);
  });
};

export default DocuSignFocused;
```

### Styles (components/DocuSignFocused/styles.module.css)
```css
.container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 800px;
}

.docusignContainer {
  width: 100%;
  height: 100%;
  min-height: 800px;
  border: none;
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #666;
}

.error {
  color: #dc3545;
  padding: 1rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  margin: 1rem 0;
}
```

### Backend API Implementation (pages/api/docusign/create-signing-session.ts)
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import docusign from 'docusign-esign';

interface SigningSessionResponse {
  signingUrl: string;
  envelopeId: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SigningSessionResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      signerEmail,
      signerName,
      signerClientId = '1000',
      documentBase64,
      returnUrl,
    } = req.body;

    // Initialize DocuSign API Client
    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!);
    dsApiClient.addDefaultHeader('Authorization', `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`);

    // Create envelope definition
    const envelope = new docusign.EnvelopeDefinition();
    envelope.emailSubject = 'Please sign this document';
    
    // Add document to envelope
    const document = new docusign.Document();
    document.documentBase64 = documentBase64;
    document.name = 'Document for Signing';
    document.fileExtension = 'pdf';
    document.documentId = '1';
    envelope.documents = [document];

    // Add recipient
    const signer = docusign.Signer.constructFromObject({
      email: signerEmail,
      name: signerName,
      clientUserId: signerClientId,
      recipientId: '1',
      routingOrder: '1'
    });

    // Add signing fields (tabs)
    const signHere = docusign.SignHere.constructFromObject({
      anchorString: '/sig1/',
      anchorUnits: 'pixels',
      anchorXOffset: '20',
      anchorYOffset: '10'
    });
    
    const tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere]
    });
    signer.tabs = tabs;

    const recipients = docusign.Recipients.constructFromObject({
      signers: [signer]
    });
    envelope.recipients = recipients;
    envelope.status = 'sent';

    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    const createEnvelopeResponse = await envelopesApi.createEnvelope(
      process.env.DOCUSIGN_ACCOUNT_ID!,
      { envelopeDefinition: envelope }
    );

    // Create recipient view
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = returnUrl;
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = signerEmail;
    viewRequest.userName = signerName;
    viewRequest.clientUserId = signerClientId;
    viewRequest.frameAncestors = [process.env.NEXT_PUBLIC_APP_URL!];
    viewRequest.messageOrigins = [process.env.NEXT_PUBLIC_APP_URL!];

    const createRecipientViewResponse = await envelopesApi.createRecipientView(
      process.env.DOCUSIGN_ACCOUNT_ID!,
      createEnvelopeResponse.envelopeId,
      { recipientViewRequest: viewRequest }
    );

    res.status(200).json({
      signingUrl: createRecipientViewResponse.url,
      envelopeId: createEnvelopeResponse.envelopeId
    });
  } catch (error) {
    console.error('DocuSign API Error:', error);
    res.status(500).json({ error: 'Failed to create signing session' });
  }
}
```

### Type Definitions (types/docusign.d.ts)
```typescript
declare global {
  interface Window {
    DocuSign: {
      loadDocuSign: (integrationKey: string) => Promise<{
        signing: (config: DocuSignConfig) => DocuSignSigning;
      }>;
    };
  }
}

interface DocuSignConfig {
  url: string;
  displayFormat: 'focused';
  style?: {
    branding?: {
      primaryButton?: {
        backgroundColor?: string;
        color?: string;
      };
    };
    signingNavigationButton?: {
      finishText?: string;
      position?: 'bottom-center' | 'bottom-right' | 'bottom-left';
    };
  };
}

interface DocuSignSigning {
  mount: (selector: string) => void;
  unmount: () => void;
  on: (event: string, callback: (event: any) => void) => void;
}

export {};
```

## 2. Usage Example

### Page Implementation (pages/document-signing.tsx)
```typescript
import { useState } from 'react';
import { DocuSignFocused } from '../components/DocuSignFocused';

export default function DocumentSigningPage() {
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiateSigning = async () => {
    try {
      const response = await fetch('/api/docusign/create-signing-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerEmail: 'signer@example.com',
          signerName: 'John Doe',
          returnUrl: `${window.location.origin}/signing-complete`,
          documentBase64: 'your_document_base64_here'
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSigningUrl(data.signingUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSigningSuccess = (event: any) => {
    console.log('Signing completed:', event);
    // Handle successful signing
  };

  const handleSigningError = (error: any) => {
    console.error('Signing error:', error);
    setError(error.message);
  };

  const handleSigningCancel = () => {
    console.log('Signing cancelled');
    // Handle signing cancellation
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="signing-page">
      {!signingUrl ? (
        <button onClick={initiateSigning}>Start Signing</button>
      ) : (
        <DocuSignFocused
          integrationKey={process.env.NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY!}
          signingUrl={signingUrl}
          onSuccess={handleSigningSuccess}
          onError={handleSigningError}
          onCancel={handleSigningCancel}
        />
      )}
    </div>
  );
}
```

## 3. Environment Configuration

### Required Environment Variables (.env.local)
```bash
# DocuSign API Configuration
DOCUSIGN_INTEGRATION_KEY=your_integration_key
DOCUSIGN_ACCESS_TOKEN=your_access_token
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY=your_integration_key
```

## 4. Security Considerations

1. **Cross-Origin Configuration**
   - Configure frame ancestors and message origins to match your application's domain
   - Use environment variables for security settings
   - Implement proper CORS headers in API routes

2. **Token Management**
   - Implement proper token refresh mechanism
   - Store tokens securely
   - Use environment variables for sensitive data

3. **Error Handling**
   - Implement comprehensive error handling
   - Log errors securely
   - Provide user-friendly error messages

## 5. Best Practices

1. **Performance**
   - Lazy load the DocuSign bundle
   - Clean up resources on component unmount
   - Implement proper loading states

2. **User Experience**
   - Show loading states
   - Handle all possible signing outcomes
   - Provide clear error messages

3. **Maintenance**
   - Use TypeScript for better type safety
   - Implement proper logging
   - Keep dependencies updated

## Conclusion
This implementation provides a complete, production-ready DocuSign focused view signing experience in a Next.js application. The code is fully typed, includes error handling, and follows security best practices. The component is reusable and can be easily integrated into any Next.js project. 