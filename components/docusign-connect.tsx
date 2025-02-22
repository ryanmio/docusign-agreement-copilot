'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function DocuSignConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/docusign/status', {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to check connection status');
      const data = await response.json();
      setIsConnected(data.connected);
      
      // If connected and there's a redirect, handle it
      if (data.connected && redirect) {
        router.push(`/${redirect}`);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [redirect, router]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleConnection = async () => {
    if (isProcessing) return;
    
    if (isConnected) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/auth/docusign/disconnect', {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to disconnect');
        const data = await response.json();
        
        if (data.success) {
          await checkConnection();
          router.push('/?success=Docusign disconnected successfully');
        } else {
          throw new Error(data.error || 'Failed to disconnect');
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        router.push('/?error=Failed to disconnect Docusign');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Add redirect parameter to DocuSign auth URL if present
      const authUrl = redirect 
        ? `/api/auth/docusign?redirect=${redirect}`
        : '/api/auth/docusign';
      window.location.href = authUrl;
    }
  };

  const error = searchParams?.get('error');
  const success = searchParams?.get('success');

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            <div className="text-[#130032]/60">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-1">
                Docusign Integration
              </h3>
              <p className="text-[#130032]/60 text-sm tracking-[-0.01em]">
                Connect your Docusign account to manage agreements
              </p>
            </div>
            <Button
              variant={isConnected ? "destructive" : "default"}
              onClick={handleConnection}
              disabled={isProcessing}
              className={!isConnected ? "bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white" : ""}
            >
              {isProcessing ? 'Processing...' : (isConnected ? 'Disconnect' : 'Connect DocuSign')}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="border-none bg-[#FF5252]/10">
              <XCircle className="h-4 w-4 text-[#FF5252]" />
              <AlertTitle className="text-[#FF5252] font-medium">Error</AlertTitle>
              <AlertDescription className="text-[#FF5252]/90">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="border-none bg-[#4C00FF]/10">
              <CheckCircle2 className="h-4 w-4 text-[#4C00FF]" />
              <AlertTitle className="text-[#4C00FF] font-medium">Success</AlertTitle>
              <AlertDescription className="text-[#4C00FF]/90">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 