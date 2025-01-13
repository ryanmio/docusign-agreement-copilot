import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AgreementList } from './agreement-list';

interface NavigatorAnalysisProps {
  toolCallId: string;
  query: string;
  apiCall?: {
    endpoint: string;
    params: Record<string, any>;
  };
  result?: {
    result: {
      agreements: any[];
      patterns: any;
      metadata: {
        totalAgreements: number;
        appliedFilters: {
          from_date: string;
          to_date: string;
        };
      };
    };
    isDebug: boolean;
    completed: boolean;
  };
  isDebug?: boolean;
  onComplete?: (result: any) => Promise<void>;
}

export function NavigatorAnalysis({ 
  toolCallId,
  query,
  apiCall,
  result,
  isDebug = false,
  onComplete
}: NavigatorAnalysisProps) {
  const [isLoading, setIsLoading] = useState(!result);

  // Production mode display
  if (!isDebug) {
    if (isLoading) {
      return (
        <Card className="p-6">
          <div className="text-lg font-medium mb-4">{query}</div>
          <div className="flex justify-center">
            <LoadingSpinner label="Analyzing agreements..." />
          </div>
        </Card>
      );
    }

    // Check the actual result structure
    const agreements = result?.result?.agreements || [];
    if (!agreements.length) {
      return (
        <Card className="p-6">
          <div className="text-lg font-medium mb-4">{query}</div>
          <div className="text-gray-500">No agreements found for this query.</div>
        </Card>
      );
    }

    return (
      <Card className="p-6">
        <AgreementList 
          agreements={agreements}
          title="Found Agreements"
          subtitle={result?.result?.metadata?.appliedFilters ? 
            `From ${new Date(result.result.metadata.appliedFilters.from_date || Date.now()).toLocaleDateString()} to ${new Date(result.result.metadata.appliedFilters.to_date || Date.now()).toLocaleDateString()}`
            : undefined
          }
        />
        
        {result?.result?.patterns && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-3">Detected Patterns</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm">
              {JSON.stringify(result.result.patterns, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    );
  }

  // Debug mode display
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="font-medium text-sm text-gray-500">Natural Language Query</div>
        <div className="text-lg">{query}</div>
      </div>

      {apiCall && (
        <div className="space-y-2">
          <div className="font-medium text-sm text-gray-500">Constructed API Call</div>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
            <div className="font-mono text-sm">
              <div>Endpoint: {apiCall.endpoint}</div>
              <div>Parameters:</div>
              <pre className="mt-2">
                {JSON.stringify(apiCall.params, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-500">Agreements</div>
            <AgreementList 
              agreements={result.result.agreements}
              title="Found Agreements"
              subtitle={result?.result?.metadata?.appliedFilters ? 
                `From ${new Date(result.result.metadata.appliedFilters.from_date || Date.now()).toLocaleDateString()} to ${new Date(result.result.metadata.appliedFilters.to_date || Date.now()).toLocaleDateString()}`
                : undefined
              }
            />
          </div>

          {result.result.patterns && (
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-500">Detected Patterns</div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result.result.patterns, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {isLoading && (
        <div className="flex justify-center">
          <LoadingSpinner label="Fetching results..." />
        </div>
      )}
    </Card>
  );
} 