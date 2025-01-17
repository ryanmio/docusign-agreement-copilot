'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Calculator } from 'lucide-react'

interface MathResultProps {
  expression: string
  result: number
  steps?: {
    text: string
    value: number
  }[]
}

export function DocuSignMathResult({
  expression = "2500 * 1.08 + 150",
  result = 2850,
  steps = [
    { text: "Multiply 2500 by 1.08", value: 2700 },
    { text: "Add 150 to 2700", value: 2850 }
  ]
}: MathResultProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-[#4C00FF]/10 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-[#4C00FF]" />
            </div>
            <h3 className="text-[#130032] tracking-[-0.02em] text-xl font-medium">
              Calculation Result
            </h3>
          </div>

          {/* Steps */}
          {steps && steps.length > 0 && (
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-1 text-sm text-[#130032]"
                >
                  <span className="font-medium">
                    {index + 1}. {step.text}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(step.value)}
                  </span>
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
              {formatCurrency(result)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Example usage with default values
export function DocuSignMathResultDemo() {
  return (
    <DocuSignMathResult
      expression="2500 * 1.08 + 150"
      result={2850}
      steps={[
        { text: "Multiply 2500 by 1.08", value: 2700 },
        { text: "Add 150 to 2700", value: 2850 }
      ]}
    />
  )
}

