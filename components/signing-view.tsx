import { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';

interface SigningViewProps {
  signingUrl: string;
  onComplete?: () => void;
  onCancel?: () => void;
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

// Helper function to load DocuSign bundle
const loadDocuSignBundle = (): Promise<void> => {
  console.log('Loading DocuSign bundle...');
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector('script[src="https://js-d.docusign.com/bundle.js"]')) {
      console.log('DocuSign bundle already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-d.docusign.com/bundle.js';
    script.async = true;
    script.onload = () => {
      console.log('DocuSign bundle loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load DocuSign bundle');
      reject(new Error('Failed to load DocuSign bundle'));
    };
    document.body.appendChild(script);
  });
};

// Type guard for DocuSign global
const isDocuSignLoaded = (ds: any): ds is Window['DocuSign'] => {
  return ds && typeof ds.loadDocuSign === 'function';
};

export function SigningView({ signingUrl, onComplete, onCancel }: SigningViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'signed' | 'error'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);
  const signingRef = useRef<any>(null);
  const hasHandledSessionEnd = useRef(false);
  const integrationKey = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID ?? '';

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Step 1: Load DocuSign bundle if needed
        if (!window.DocuSign || !isDocuSignLoaded(window.DocuSign)) {
          await loadDocuSignBundle();
        }

        if (!mounted) return;

        // Step 2: Initialize DocuSign
        const docusign = await window.DocuSign?.loadDocuSign(integrationKey);
        if (!docusign || !mounted) return;

        // Step 3: Create and mount signing view
        const signing = await docusign.signing({
          url: signingUrl,
          displayFormat: 'focused'
        });

        if (!mounted) return;

        // Store instance first
        signingRef.current = signing;

        // Set up event listeners
        signing.on('ready', () => {
          if (mounted) {
            setLoading(false);
            setStatus('ready');
          }
        });

        signing.on('sessionEnd', (event: any) => {
          console.log('DocuSign session ended with event:', event);
          if (!mounted || hasHandledSessionEnd.current) return;
          
          // Check the returnUrl for the event type
          const returnUrl = event?.returnUrl;
          if (returnUrl) {
            const url = new URL(returnUrl);
            const eventType = url.searchParams.get('event');
            
            if (eventType === 'signing_complete') {
              hasHandledSessionEnd.current = true;
              setStatus('signed');
              onComplete?.();
            } else if (eventType === 'cancel') {
              hasHandledSessionEnd.current = true;
              onCancel?.();
            }
          }
        });

        // Mount to container
        if (containerRef.current) {
          signing.mount('#docusign-focused-container');
        }
      } catch (err: unknown) {
        console.error('Error initializing DocuSign:', err);
        // Only set error state for non-service worker errors
        if (mounted && !(err instanceof Error && err.message.includes('mockServiceWorker.js'))) {
          setError(err instanceof Error ? err.message : 'Failed to initialize DocuSign');
          setStatus('error');
        }
        setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
      hasHandledSessionEnd.current = false;
      if (signingRef.current?.close) {
        try {
          signingRef.current.close();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      signingRef.current = null;
    };
  }, [signingUrl, integrationKey, onComplete, onCancel]);

  if (status === 'signed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document Signed Successfully!</h3>
        <p className="text-sm text-gray-500">The document has been signed and processed.</p>
      </div>
    );
  }

  return (
    <Card className="w-full h-[800px] relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <div className="mt-4 font-medium">Loading DocuSign...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}
      <div 
        id="docusign-focused-container"
        ref={containerRef}
        className="w-full h-full"
      />
    </Card>
  );
} 