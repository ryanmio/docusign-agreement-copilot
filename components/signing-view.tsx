import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';
import { createPortal } from 'react-dom';

interface SigningViewProps {
  signingUrl: string;
  onComplete?: () => void;
  onCancel?: () => void;
  mode?: 'embedded' | 'modal';
  toolCallId?: string;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    DocuSign?: {
      loadDocuSign: (integrationKey: string) => Promise<{
        signing: (options: {
          url: string;
          displayFormat?: 'default' | 'focused';
          style?: any;
        }) => any;
      }>;
    };
  }
}

export function SigningView({ signingUrl, onComplete, onCancel }: SigningViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const integrationKey = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID ?? '';
  const signingInstanceRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  // Create container on mount
  useEffect(() => {
    const div = document.createElement('div');
    div.id = 'docusign-container';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'absolute';
    div.style.inset = '0';
    setContainer(div);
    return () => {
      setContainer(null);
    };
  }, []);

  // Handle service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }, []);

  const initializeDocuSign = useCallback(async () => {
    if (initializingRef.current || signingInstanceRef.current || !window.DocuSign?.loadDocuSign) {
      return;
    }
    
    try {
      initializingRef.current = true;
      
      const docusign = await window.DocuSign.loadDocuSign(integrationKey);
      if (!docusign) {
        throw new Error('DocuSign SDK not loaded');
      }

      if (!mountedRef.current) return;

      const instance = await docusign.signing({
        url: signingUrl,
        displayFormat: 'default',
        style: {
          border: 'none',
          width: '100%',
          height: '100%'
        }
      });

      if (!mountedRef.current) {
        instance.close?.();
        return;
      }

      instance.on('ready', () => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });

      instance.on('sessionEnd', (event: string) => {
        if (!mountedRef.current) return;
        
        if (event === 'signing_complete') {
          onComplete?.();
        } else if (event === 'cancel') {
          onCancel?.();
        }
      });

      if (container && mountedRef.current) {
        instance.mount('#docusign-container');
        signingInstanceRef.current = instance;
      } else {
        instance.close?.();
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('DocuSign initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize DocuSign');
        setLoading(false);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [signingUrl, integrationKey, onComplete, onCancel, container]);

  useEffect(() => {
    if (!signingUrl || !integrationKey) {
      setError('Missing required configuration');
      setLoading(false);
      return;
    }

    mountedRef.current = true;

    const cleanup = () => {
      mountedRef.current = false;
      if (signingInstanceRef.current?.close) {
        try {
          signingInstanceRef.current.close();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      signingInstanceRef.current = null;
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [signingUrl, integrationKey]);

  return (
    <>
      <Script 
        src="https://js-d.docusign.com/bundle.js"
        strategy="afterInteractive"
        onLoad={initializeDocuSign}
        onError={(error) => {
          console.error('DocuSign script error:', error);
          setError('Failed to load DocuSign script');
          setLoading(false);
        }}
      />
      <Card className="w-full h-[800px] relative overflow-hidden">
        {container && createPortal(
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-4 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <div className="text-center">
                  <div className="font-medium">Loading DocuSign...</div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-red-500">Error: {error}</div>
              </div>
            )}
          </>,
          container
        )}
        {container && <div className="w-full h-full absolute inset-0" ref={(el) => {
          if (el && !el.contains(container)) {
            el.appendChild(container);
          }
        }} />}
      </Card>
    </>
  );
} 