import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <Card className={cn("p-4 bg-red-50", className)}>
        <p className="text-red-600 font-medium">Error: {error}</p>
        <p className="text-sm text-red-500 mt-1">Expression: {expression}</p>
      </Card>
    );
  }

  // Filter out the result step since it will be shown separately
  const filteredSteps = steps?.filter(step => !step.startsWith('Result:'));

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-2">
        {filteredSteps && filteredSteps.length > 0 && (
          <div className="space-y-1">
            {filteredSteps.map((step, index) => (
              <p key={index} className="text-sm text-gray-600">
                {step}
              </p>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center border-t pt-2">
          <span className="text-sm text-gray-600">{expression} =</span>
          <span className="font-medium">{formatNumber(result)}</span>
        </div>
      </div>
    </Card>
  );
} 