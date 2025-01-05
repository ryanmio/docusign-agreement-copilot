import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SigningViewProps {
  signingUrl: string;
  mode: 'focused-view';
  toolCallId: string;
  onComplete?: () => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

export function SigningView({ 
  signingUrl, 
  mode, 
  toolCallId,
  onComplete, 
  onError 
}: SigningViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleSessionEnd = useCallback(async (event: string) => {
    try {
      switch (event) {
        case 'signing_complete':
          toast({
            title: 'Document signed successfully',
            variant: 'default'
          });
          await onComplete?.();
          break;
          
        case 'ttl_expired':
          toast({
            title: 'Signing session expired',
            description: 'Please try again',
            variant: 'destructive'
          });
          await onError?.(new Error('Signing session expired'));
          break;
          
        case 'user_cancelled':
          toast({
            title: 'Signing cancelled',
            description: 'You can resume signing later',
            variant: 'default'
          });
          await onError?.(new Error('Signing cancelled by user'));
          break;
          
        default:
          console.warn('Unknown session end event:', event);
      }
    } catch (error) {
      console.error('Error handling session end:', error);
      toast({
        title: 'Error processing signing result',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [onComplete, onError, toast]);

  useEffect(() => {
    let mounted = true;
    
    const initializeSigning = async () => {
      try {
        // Load DocuSign JS dynamically
        const script = document.createElement('script');
        script.src = process.env.NODE_ENV === 'production' 
          ? 'https://js.docusign.com/bundle.js'
          : 'https://js-d.docusign.com/bundle.js';
        script.async = true;

        script.onload = () => {
          if (!mounted) return;
          
          const { DocuSign } = window as any;
          
          if (!DocuSign) {
            console.error('DocuSign library not found in window');
            return;
          }

          console.log('DocuSign library loaded, initializing...');
          
          DocuSign.loadDocuSign(process.env.NEXT_PUBLIC_DOCUSIGN_CLIENT_ID!)
            .then((docusign: any) => {
              if (!mounted) return;
              
              console.log('Creating signing view...');
              const signing = docusign.signing({
                url: signingUrl,
                displayFormat: mode,
                style: {
                  branding: {
                    primaryButton: {
                      backgroundColor: '#0F172A',
                      color: '#fff'
                    }
                  },
                  signingNavigationButton: {
                    position: 'bottom-right',
                    finishText: 'Complete Signing'
                  }
                }
              });

              signing.on('ready', () => {
                console.log('Signing view ready');
              });

              signing.on('sessionEnd', handleSessionEnd);

              if (containerRef.current) {
                console.log('Mounting signing view...');
                signing.mount('#signing-container');
              }
            })
            .catch((error: Error) => {
              console.error('DocuSign initialization error:', error);
              if (mounted) {
                toast({
                  title: 'Failed to load signing view',
                  description: 'Please try again',
                  variant: 'destructive'
                });
                onError?.(error);
              }
            });
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('Error setting up signing view:', error);
        if (mounted) {
          toast({
            title: 'Error setting up signing',
            description: 'Please try again',
            variant: 'destructive'
          });
          onError?.(error as Error);
        }
      }
    };

    initializeSigning();

    return () => {
      mounted = false;
      const script = document.querySelector('script[src*="docusign.com/bundle.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [signingUrl, mode, handleSessionEnd, toast]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div 
          id="signing-container" 
          ref={containerRef}
          className="w-full min-h-[600px]"
          aria-label="Document signing interface"
        />
      </div>
    </div>
  );
} 