'use client';

import { useState } from 'react';
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">DocuSign Integration</h3>
          <p className="text-sm text-gray-500">
            Connect your DocuSign account to manage agreements
          </p>
        </div>
        <Button
          variant={isConnected ? "destructive" : "default"}
          onClick={handleConnection}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : (isConnected ? 'Disconnect' : 'Connect DocuSign')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 