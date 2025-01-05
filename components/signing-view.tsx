import { useEffect, useRef } from 'react';

interface SigningViewProps {
  signingUrl: string;
  toolCallId: string;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function SigningView({ signingUrl, toolCallId, onComplete, onError }: SigningViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js-d.docusign.com/bundle.js';
    script.async = true;

    script.onload = () => {
      const DocuSign = (window as any).DocuSign;
      if (!DocuSign?.loadDocuSign) {
        console.error('DocuSign library not loaded correctly');
        return;
      }

      const integrationKey = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID;
      console.log('Initializing DocuSign with:', {
        integrationKey,
        signingUrl
      });

      if (!integrationKey) {
        console.error('DocuSign integration key is not defined');
        onError(new Error('DocuSign integration key is not defined'));
        return;
      }

      DocuSign.loadDocuSign(integrationKey)
        .then((docusign: any) => {
          console.log('Creating signing view');
          
          const signing = docusign.signing({
            url: signingUrl,
            displayFormat: 'focused'
          });

          signing.on('sessionEnd', (event: string) => {
            console.log('Session ended:', event);
            if (event === 'signing_complete') {
              onComplete();
            }
          });

          console.log('Mounting signing view');
          signing.mount('#docusign-container');
        })
        .catch((error: any) => {
          console.error('DocuSign initialization error:', error);
          onError(new Error(error.message || 'Failed to initialize DocuSign'));
        });
    };

    script.onerror = () => {
      console.error('Failed to load DocuSign script');
      onError(new Error('Failed to load DocuSign script'));
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [signingUrl, onComplete, onError]);

  return (
    <div 
      id="docusign-container" 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '800px',
        border: 'none',
        position: 'relative'
      }}
    />
  );
} 