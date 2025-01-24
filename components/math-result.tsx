import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calculator } from 'lucide-react';

interface MathResultProps {
  expression: string;
  result: number | string;
  steps?: string[];
  error?: string;
  className?: string;
  isCurrency?: boolean;
}

export function MathResult({ expression, result, steps, error, className, isCurrency = false }: MathResultProps) {
  // Format numbers with commas and optionally as currency
  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    return new Intl.NumberFormat('en-US', {
      style: isCurrency ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  if (error) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)] bg-white", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-[#FF5252]/10 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-[#FF5252]" />
            </div>
            <div>
              <p className="text-[#FF5252] font-medium">Error: {error}</p>
              <p className="text-sm text-[#FF5252]/60 mt-1">Expression: {expression}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out the result step since it will be shown separately
  const filteredSteps = steps?.filter(step => !step.startsWith('Result:'));

  return (
    <Card className={cn("w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)] bg-white", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#4C00FF]/10 flex items-center justify-center flex-shrink-0">
                <Calculator className="h-5 w-5 text-[#4C00FF]" />
              </div>
              <h3 className="text-[#130032] tracking-[-0.02em] text-xl font-medium">
                Calculation Result
              </h3>
            </div>
          </div>

          {/* Steps */}
          {filteredSteps && filteredSteps.length > 0 && (
            <div className="space-y-2">
              {filteredSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-1 text-sm text-[#130032]"
                >
                  <span className="font-medium">
                    {index + 1}. {step}
                  </span>
                  {/* Note: We don't have step values in the current interface */}
                </div>
              ))}
            </div>
          )}

          {/* Final Result */}
          <div className="flex items-center justify-between pt-3 border-t border-[#130032]/10">
            <span className="text-sm text-[#130032] font-medium">
              {expression} =
            </span>
            <span className="text-lg font-semibold text-[#130032]">
              {formatNumber(result)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 