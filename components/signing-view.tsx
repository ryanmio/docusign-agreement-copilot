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
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js-d.docusign.com/bundle.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load DocuSign bundle'));
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
  const containerRef = useRef<HTMLDivElement>(null);
  const signingRef = useRef<any>(null);
  const integrationKey = process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID ?? '';

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Step 1: Load the DocuSign bundle if not already loaded
        if (!window.DocuSign || !isDocuSignLoaded(window.DocuSign)) {
          await loadDocuSignBundle();
        }

        if (!mounted) return;

        // Step 2: Initialize DocuSign with integration key
        const docusign = await window.DocuSign.loadDocuSign(integrationKey);
        if (!mounted) return;

        // Step 3: Configure signing with focused view
        const signing = await docusign.signing({
          url: signingUrl,
          displayFormat: 'focused',
          style: {
            branding: {
              primaryButton: {
                backgroundColor: '#4C00FF',
                color: '#fff'
              }
            }
          }
        });

        if (!mounted) return;

        // Step 4: Set up event listeners
        signing.on('ready', () => {
          if (mounted) {
            setLoading(false);
          }
        });

        signing.on('sessionEnd', (event: string) => {
          if (!mounted) return;
          
          if (event === 'signing_complete') {
            onComplete?.();
          } else if (event === 'cancel') {
            onCancel?.();
          }
        });

        // Store the signing instance for cleanup
        signingRef.current = signing;

        // Step 5: Mount to container if available
        if (containerRef.current && mounted) {
          signing.mount('#docusign-focused-container');
        }
      } catch (err) {
        if (mounted) {
          console.error('DocuSign initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize DocuSign');
          setLoading(false);
        }
      }
    };

    initialize();

    // Cleanup function
    return () => {
      mounted = false;
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

  return (
    <Card className="w-full h-[800px] relative overflow-hidden">
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
      <div 
        id="docusign-focused-container"
        ref={containerRef}
        className="w-full h-full absolute inset-0"
      />
    </Card>
  );
} 