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
  chartType?: 'pie'   // Currently only pie is supported
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
    
    // Create a map to count by dimension
    const dimensionMap = new Map<string, number>();
    
    // Count agreements by dimension
    data.agreements?.forEach((agreement: any) => {
      // Get the value for the requested dimension
      let dimensionValue: string;
      
      // Handle special cases
      switch(dimension) {
        case 'party_name':
          // Get first party name from agreement
          dimensionValue = agreement.parties?.[0]?.name_in_agreement || 'Unknown Party';
          break;
        case 'category':
          dimensionValue = agreement.category || 'Uncategorized';
          break;
        case 'type':
          dimensionValue = agreement.type || 'Unknown Type';
          break;
        case 'status':
          dimensionValue = agreement.status?.toLowerCase().replace(/_/g, ' ') || 'Unknown Status';
          break;
        case 'jurisdiction':
          dimensionValue = agreement.provisions?.jurisdiction || 'Unknown Jurisdiction';
          break;
        default:
          dimensionValue = agreement[dimension] || `Unknown ${formatDimensionLabel(dimension)}`;
      }
      
      // For value metrics, use the annual agreement value
      let metricValue = 1; // Default for count
      if (metric === 'value' || metric === 'avg_value') {
        metricValue = agreement.provisions?.annual_agreement_value || 0;
      }
      
      dimensionMap.set(dimensionValue, (dimensionMap.get(dimensionValue) || 0) + metricValue);
    });

    console.log(`📊 ${formatDimensionLabel(dimension)} counts:`, Object.fromEntries(dimensionMap));

    // Transform into the expected format
    const result = {
      values: Array.from(dimensionMap.entries()).map(([value, count]) => {
        const result: Record<string, string | number> = {};
        result[dimension] = value;
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

// DocuSign brand colors for pie slices - cool purple palette
const BRAND_COLORS = [
  '#4C00FF',  // Primary Purple
  '#CBC2FF',  // Light Purple
  '#26065D',  // Dark Purple
  '#7F47FF',  // Medium Purple
  '#130032',  // Deep Purple
  '#E5E0FF',  // Softer Purple
  '#3D1A70',  // Rich Purple
  '#9B7CFF',  // Lavender Purple
];

export function AgreementChart({ dimension, metric, chartType = 'pie' }: AgreementChartProps) {
  // Validate chart type
  if (chartType !== 'pie') {
    return (
      <Card className="p-6">
        <div className="text-amber-500">
          Only pie charts are currently supported. Requested type: {chartType}
        </div>
      </Card>
    )
  }

  const id = `agreement-${dimension}-${metric}-${chartType}`
  
  const { data, isLoading, error } = useSWR<ApiResponse>(
    `/api/navigator/analyze?dimension=${dimension}&metric=${metric}`,
    fetcher
  )

  const [activeDimension, setActiveDimension] = React.useState<string>()
  
  const chartData = React.useMemo((): ChartDataItem[] => {
    if (!data?.values) return []
    return data.values.map((item, index): ChartDataItem => ({
      dimension: String(item[dimension]),
      value: Number(item[metric]),
      fill: BRAND_COLORS[index % BRAND_COLORS.length]
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
        color: BRAND_COLORS[index % BRAND_COLORS.length]
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
            {formatMetricLabel(metric)} by {formatDimensionLabel(dimension)}
          </CardTitle>
          <CardDescription className="text-[#130032]/60">
            Select {formatDimensionLabel(dimension).toLowerCase()} to analyze
          </CardDescription>
        </div>
        <Select 
          value={activeDimension} 
          onValueChange={setActiveDimension}
        >
          <SelectTrigger className="ml-auto h-8 w-[180px] rounded-lg pl-2.5 bg-white border-[#130032]/20">
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
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
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
                        {formatMetricValue(chartData[activeIndex].value, metric)}
                      </tspan>
                      <tspan x={cx} y={cy + 16} className="fill-[#130032]/60 text-sm">
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

