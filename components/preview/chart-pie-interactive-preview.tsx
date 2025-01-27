"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockChartData } from "@/lib/preview-data"

// DocuSign brand colors for pie slices - cool purple palette
const BRAND_COLORS = [
  '#4C00FF',  // Primary Purple
  '#CBC2FF',  // Light Purple
  '#26065D',  // Dark Purple
  '#7F47FF',  // Medium Purple
  '#130032',  // Deep Purple
];

interface ChartDataItem {
  dimension: string
  value: number
  fill: string
}

function formatMetricValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact'
  }).format(value)
}

export function AgreementChartPreview() {
  const id = 'agreement-chart-preview'
  const [activeDimension, setActiveDimension] = React.useState<string>()
  
  const chartData = React.useMemo((): ChartDataItem[] => {
    return mockChartData.values.map((item, index): ChartDataItem => ({
      dimension: String(item.category),
      value: Number(item.value),
      fill: BRAND_COLORS[index % BRAND_COLORS.length]
    }))
  }, [])

  const chartConfig = React.useMemo((): ChartConfig => {
    const config: ChartConfig = {
      value: {
        label: 'Total Value'
      }
    }

    mockChartData.values.forEach((item, index) => {
      const key = String(item.category).toLowerCase().replace(/\s+/g, '-')
      config[key] = {
        label: String(item.category),
        color: BRAND_COLORS[index % BRAND_COLORS.length]
      }
    })

    return config
  }, [])

  const activeIndex = React.useMemo(() => 
    chartData.findIndex(item => 
      item.dimension === activeDimension
    ), [activeDimension, chartData])

  React.useEffect(() => {
    if (chartData.length && !activeDimension) {
      setActiveDimension(chartData[0].dimension)
    }
  }, [chartData, activeDimension])

  return (
    <Card data-chart={id} className="bg-white shadow-sm border border-[#130032]/10">
      <ChartStyle
        id={id}
        config={chartConfig}
      />
      <style jsx global>{`
        [data-chart="${id}"] .recharts-sector {
          cursor: pointer;
        }
      `}</style>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-[#130032] text-xl tracking-tight">
            Agreement Value by Category
          </CardTitle>
          <CardDescription className="text-[#130032]/60">
            Select category to analyze
          </CardDescription>
        </div>
        <Select 
          value={activeDimension} 
          onValueChange={setActiveDimension}
        >
          <SelectTrigger className="ml-auto h-8 w-[180px] rounded-lg pl-2.5 bg-white border-[#130032]/20">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {chartData.map((item) => (
              <SelectItem 
                key={item.dimension} 
                value={item.dimension} 
                className="rounded-lg [&_span]:flex"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.dimension}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-4 pt-4">
        <ChartContainer 
          id={id} 
          config={chartConfig} 
          className="mx-auto aspect-square w-full max-w-[350px]"
        >
          <PieChart>
            <ChartTooltip 
              cursor={false} 
              content={
                <ChartTooltipContent 
                  hideLabel 
                  className="bg-white shadow-lg border border-[#130032]/10 rounded-lg p-2"
                />
              } 
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="dimension"
              innerRadius={70}
              strokeWidth={2}
              stroke="#fff"
              activeIndex={activeIndex}
              onClick={(_, index) => setActiveDimension(chartData[index].dimension)}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector {...props} outerRadius={outerRadius + 16} innerRadius={outerRadius + 10} />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox) || activeIndex === -1) return null
                  
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} y={cy - 8} className="fill-[#130032] text-2xl font-bold">
                        {formatMetricValue(chartData[activeIndex].value)}
                      </tspan>
                      <tspan x={cx} y={cy + 16} className="fill-[#130032]/60 text-sm">
                        Total Value
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 