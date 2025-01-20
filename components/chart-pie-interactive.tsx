"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import useSWR from 'swr'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AgreementChartProps {
  dimension: string    // e.g. 'category', 'party_name'
  metric: string      // e.g. 'value', 'count'
}

interface ApiResponse {
  values: Array<Record<string, string | number>>
}

interface ChartDataItem {
  dimension: string
  value: number
  fill: string
}

const fetcher = async (url: string) => {
  // Extract dimension and metric from URL
  const params = new URLSearchParams(url.split('?')[1]);
  const dimension = params.get('dimension') as string;
  const metric = params.get('metric') as string;

  console.log('📊 Chart fetcher called:', { dimension, metric });

  // Make POST request with proper body
  const response = await fetch('/api/navigator/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `Show ${metric} by ${dimension}`,
      filters: {
        groupBy: dimension,
        metric: metric
      }
    })
  });

  if (!response.ok) {
    console.error('❌ API request failed:', response.status, response.statusText);
    throw new Error('Failed to fetch chart data');
  }

  const data = await response.json();
  console.log('📊 Raw API response:', data);
  
  // Transform the API response into the expected format
  if (data.metadata?.totalAgreements) {
    console.log('📊 Total agreements:', data.metadata.totalAgreements);
    
    // Create a map to count agreements by category
    const categoryMap = new Map<string, number>();
    
    // Count agreements by category
    data.agreements?.forEach((agreement: any) => {
      const category = agreement.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    console.log('📊 Category counts:', Object.fromEntries(categoryMap));

    // Transform into the expected format
    const result = {
      values: Array.from(categoryMap.entries()).map(([category, count]) => {
        const result: Record<string, string | number> = {};
        result[dimension] = category;
        result[metric] = count;
        return result;
      })
    };

    console.log('📊 Transformed data:', result);
    return result;
  }

  console.log('❌ No agreement data found');
  // Return empty values if no data
  return { values: [] };
}

function formatMetricLabel(metric: string): string {
  switch (metric) {
    case 'value': return 'Total Value'
    case 'count': return 'Agreements'
    case 'avg_value': return 'Average Value'
    default: return metric
  }
}

function formatDimensionLabel(dimension: string): string {
  switch (dimension) {
    case 'category': return 'Category'
    case 'party_name': return 'Party'
    case 'jurisdiction': return 'Jurisdiction'
    case 'type': return 'Type'
    case 'status': return 'Status'
    default: return dimension
  }
}

function formatMetricValue(value: number, metric: string): string {
  if (metric === 'value' || metric === 'avg_value') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(value)
  }
  return value.toLocaleString()
}

export function AgreementChart({ dimension, metric }: AgreementChartProps) {
  const id = `agreement-${dimension}-${metric}`
  
  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/navigator/analyze?dimension=${dimension}&metric=${metric}`,
    fetcher
  )

  const [activeDimension, setActiveDimension] = React.useState<string>()
  
  const chartData = React.useMemo((): ChartDataItem[] => {
    if (!data?.values) return []
    return data.values.map((item): ChartDataItem => ({
      dimension: String(item[dimension]),
      value: Number(item[metric]),
      fill: `var(--color-${String(item[dimension]).toLowerCase().replace(/\s+/g, '-')})`
    }))
  }, [data, dimension, metric])

  const chartConfig = React.useMemo((): ChartConfig => {
    if (!data?.values) return {} as ChartConfig
    
    const config: ChartConfig = {
      [metric]: {
        label: formatMetricLabel(metric)
      }
    }

    data.values.forEach((item: Record<string, string | number>, index: number) => {
      const key = String(item[dimension]).toLowerCase().replace(/\s+/g, '-')
      config[key] = {
        label: String(item[dimension]),
        color: `hsl(var(--chart-${(index % 5) + 1}))`
      }
    })

    return config
  }, [data, dimension, metric])

  const activeIndex = React.useMemo(() => 
    chartData.findIndex(item => 
      item.dimension === activeDimension
    ), [activeDimension, chartData])

  React.useEffect(() => {
    if (chartData.length && !activeDimension) {
      setActiveDimension(chartData[0].dimension)
    }
  }, [chartData, activeDimension])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">
          Failed to load chart data. Please try again later.
        </div>
      </Card>
    )
  }

  if (!data?.values?.length) {
    return (
      <Card className="p-6">
        <div className="text-gray-500">
          No data available for this chart.
        </div>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{formatMetricLabel(metric)} by {formatDimensionLabel(dimension)}</CardTitle>
          <CardDescription>Select {formatDimensionLabel(dimension).toLowerCase()} to analyze</CardDescription>
        </div>
        <Select 
          value={activeDimension} 
          onValueChange={setActiveDimension}
        >
          <SelectTrigger className="ml-auto h-7 w-[180px] rounded-lg pl-2.5">
            <SelectValue placeholder={`Select ${formatDimensionLabel(dimension)}`} />
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
                    style={{
                      backgroundColor: item.fill
                    }}
                  />
                  {item.dimension}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer 
          id={id} 
          config={chartConfig} 
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="dimension"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || activeIndex === -1) return null
                  
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                        {formatMetricValue(chartData[activeIndex].value, metric)}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                        {formatMetricLabel(metric)}
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

