'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { mockDocuSignState } from '@/lib/preview-data';

export default function DocuSignConnectPreview() {
  const [isConnected, setIsConnected] = useState(mockDocuSignState.isConnected);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConnection = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isConnected) {
      setIsConnected(false);
      setSuccess('DocuSign disconnected successfully');
    } else {
      setIsConnected(true);
      setSuccess('DocuSign connected successfully');
    }
    
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-1">
                DocuSign Integration
              </h3>
              <p className="text-[#130032]/60 text-sm tracking-[-0.01em]">
                Connect your DocuSign account to manage agreements
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