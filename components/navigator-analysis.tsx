import { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AgreementList } from './agreement-list';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter, ChevronDown, ChevronUp, Building2, Calendar, MapPin } from 'lucide-react';

interface FilterState {
  partyName: string;
  type: string;
  category: string;
  minValue?: number;
  maxValue?: number;
  jurisdiction: string;
  dateRange?: {
    start?: string;  // ISO date string
    end?: string;    // ISO date string
  };
}

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
          parties?: string[];
        };
      };
    };
    completed: boolean;
  };
  onComplete?: (result: any) => Promise<void>;
}

export function NavigatorAnalysis({ 
  toolCallId,
  query,
  apiCall,
  result,
  onComplete
}: NavigatorAnalysisProps) {
  const [isLoading, setIsLoading] = useState(!result);
  const [accordionValue, setAccordionValue] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    partyName: result?.result?.metadata?.appliedFilters?.parties?.[0] || '',
    type: '',
    category: '',
    jurisdiction: '',
    dateRange: result?.result?.metadata?.appliedFilters?.from_date ? {
      start: result.result.metadata.appliedFilters.from_date,
      end: result.result.metadata.appliedFilters.to_date
    } : undefined
  });

  // Add refs for inputs that need focus management
  const partyNameRef = useRef<HTMLInputElement>(null);
  const minValueRef = useRef<HTMLInputElement>(null);
  const maxValueRef = useRef<HTMLInputElement>(null);

  // Add handleInputChange function
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FilterState,
    ref: React.RefObject<HTMLInputElement>
  ) => {
    e.stopPropagation();
    const value = e.target.value;
    setFilters(f => ({ 
      ...f, 
      [field]: field === 'minValue' || field === 'maxValue' 
        ? (value ? Number(value) : undefined)
        : value 
    }));
    // Maintain focus after state update
    setTimeout(() => {
      ref.current?.focus();
    }, 0);
  };

  // Get unique values for dropdowns
  const uniqueValues = useMemo(() => {
    if (!result?.result?.agreements) return { types: [], categories: [], jurisdictions: [] };
    
    console.log('Raw agreements:', result.result.agreements);
    
    const jurisdictions = result.result.agreements
      .map(a => {
        const jurisdiction = a.provisions?.jurisdiction;
        console.log('Agreement jurisdiction:', jurisdiction);
        return jurisdiction;
      })
      .filter(Boolean) // Remove null/undefined values
      .map(j => typeof j === 'string' ? j : String(j)) // Ensure string values
      .filter((j, index, self) => self.indexOf(j) === index); // Remove duplicates

    console.log('Processed jurisdictions:', jurisdictions);
    
    return {
      types: Array.from(new Set(result.result.agreements.map(a => a.type))).filter(Boolean),
      categories: Array.from(new Set(result.result.agreements.map(a => a.category))).filter(Boolean),
      jurisdictions
    };
  }, [result?.result?.agreements]);

  // Filter agreements based on current filters
  const filteredAgreements = useMemo(() => {
    if (!result?.result?.agreements) return [];
    
    console.log('Filtering agreements with filters:', filters);
    console.log('Raw agreements:', result.result.agreements);
    
    return result.result.agreements.filter(agreement => {
      const matchesParty = !filters.partyName || 
        agreement.parties.some((p: any) => {
          if (!p.name_in_agreement) return false;
          const partyName = p.name_in_agreement.toLowerCase();
          const filterName = filters.partyName.toLowerCase();
          console.log('Comparing party names:', { partyName, filterName });
          return partyName.includes(filterName) || filterName.includes(partyName);
        });
      
      console.log('Agreement party match result:', { 
        title: agreement.title, 
        matchesParty,
        parties: agreement.parties.map((p: any) => p.name_in_agreement)
      });

      const matchesType = !filters.type || 
        (agreement.type && agreement.type.toLowerCase() === filters.type.toLowerCase());
      
      const matchesCategory = !filters.category || 
        (agreement.category && agreement.category.toLowerCase() === filters.category.toLowerCase());
      
      const matchesJurisdiction = !filters.jurisdiction || 
        (agreement.provisions?.jurisdiction && 
         String(agreement.provisions.jurisdiction).toLowerCase() === filters.jurisdiction.toLowerCase());
      
      const annualValue = agreement.provisions?.annual_agreement_value;
      const matchesValue = (!filters.minValue || (annualValue !== undefined && annualValue >= filters.minValue)) &&
        (!filters.maxValue || (annualValue !== undefined && annualValue <= filters.maxValue));

      // Add date range filtering
      const matchesDateRange = !filters.dateRange || (
        agreement.provisions?.effective_date && filters.dateRange.start && filters.dateRange.end && (
          new Date(agreement.provisions.effective_date) >= new Date(filters.dateRange.start) &&
          new Date(agreement.provisions.effective_date) <= new Date(filters.dateRange.end)
        )
      );
      
      return matchesParty && matchesType && matchesCategory && 
        matchesJurisdiction && matchesValue && matchesDateRange;
    });
  }, [result?.result?.agreements, filters]);

  const getActiveFilterCount = (filterState: FilterState) => {
    return [
      filterState.partyName,
      filterState.type,
      filterState.category,
      filterState.jurisdiction,
      filterState.minValue,
      filterState.maxValue,
      filterState.dateRange?.start,
      filterState.dateRange?.end
    ].filter(Boolean).length;
  };

  const FilterControls = () => {
    const activeFilterCount = getActiveFilterCount(filters);

    const handleInputClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    return (
      <Accordion 
        type="single" 
        collapsible 
        className="mb-6 bg-gray-50 rounded-lg"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="filters">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter Results</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFilterCount} active
                </span>
              )}
              <span className="text-sm text-gray-500">
                {activeFilterCount > 0 ? 
                  `(${filteredAgreements.length} of ${result?.result?.agreements?.length || 0} matches)` : 
                  ''}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4" onClick={handleInputClick}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div key="party-name">
                  <Label htmlFor="party-name">Party Name</Label>
                  <Input
                    id="party-name"
                    ref={partyNameRef}
                    placeholder="Search parties..."
                    value={filters.partyName}
                    onChange={e => handleInputChange(e, 'partyName', partyNameRef)}
                  />
                </div>
                
                <div key="type">
                  <Label htmlFor="type">Type</Label>
                  <Select value={filters.type} onValueChange={value => setFilters(f => ({ ...f, type: value === 'all' ? '' : value }))}>
                    <SelectTrigger className="mt-1.5 border-[#130032]/20 bg-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueValues.types.map((type, index) => (
                        <SelectItem key={`type-${type}-${index}`} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div key="category">
                  <Label htmlFor="category">Category</Label>
                  <Select value={filters.category} onValueChange={value => setFilters(f => ({ ...f, category: value === 'all' ? '' : value }))}>
                    <SelectTrigger className="mt-1.5 border-[#130032]/20 bg-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueValues.categories.map((category, index) => (
                        <SelectItem key={`category-${category}-${index}`} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div key="jurisdiction">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select value={filters.jurisdiction} onValueChange={value => setFilters(f => ({ ...f, jurisdiction: value === 'all' ? '' : value }))}>
                    <SelectTrigger className="mt-1.5 border-[#130032]/20 bg-white">
                      <SelectValue placeholder="All Jurisdictions" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Jurisdictions</SelectItem>
                      {uniqueValues.jurisdictions.map((jurisdiction, index) => (
                        <SelectItem key={`jurisdiction-${jurisdiction}-${index}`} value={jurisdiction}>{jurisdiction}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div key="min-value">
                  <Label htmlFor="min-value">Min Annual Value</Label>
                  <Input
                    id="min-value"
                    ref={minValueRef}
                    type="number"
                    placeholder="Min value..."
                    value={filters.minValue || ''}
                    onChange={e => handleInputChange(e, 'minValue', minValueRef)}
                  />
                </div>
                
                <div key="max-value">
                  <Label htmlFor="max-value">Max Annual Value</Label>
                  <Input
                    id="max-value"
                    ref={maxValueRef}
                    type="number"
                    placeholder="Max value..."
                    value={filters.maxValue || ''}
                    onChange={e => handleInputChange(e, 'maxValue', maxValueRef)}
                    className="mt-1.5 border-[#130032]/20 focus:border-[#4C00FF] focus:ring-1 focus:ring-[#4C00FF]"
                  />
                </div>

                <div>
                  <Label htmlFor="date-range-start" className="text-[#130032]">Start Date</Label>
                  <Input
                    id="date-range-start"
                    type="date"
                    value={filters.dateRange?.start?.split('T')[0] || ''}
                    onChange={e => {
                      const newDateRange = e.target.value ? {
                        start: `${e.target.value}T00:00:00Z`,
                        end: filters.dateRange?.end
                      } : undefined;
                      setFilters(prev => ({
                        ...prev,
                        dateRange: newDateRange
                      }));
                    }}
                    className="mt-1.5 border-[#130032]/20 focus:border-[#4C00FF] focus:ring-1 focus:ring-[#4C00FF]"
                  />
                </div>

                <div>
                  <Label htmlFor="date-range-end" className="text-[#130032]">End Date</Label>
                  <Input
                    id="date-range-end"
                    type="date"
                    value={filters.dateRange?.end?.split('T')[0] || ''}
                    onChange={e => {
                      const newDateRange = e.target.value ? {
                        start: filters.dateRange?.start,
                        end: `${e.target.value}T23:59:59Z`
                      } : undefined;
                      setFilters(prev => ({
                        ...prev,
                        dateRange: newDateRange
                      }));
                    }}
                    className="mt-1.5 border-[#130032]/20 focus:border-[#4C00FF] focus:ring-1 focus:ring-[#4C00FF]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters({
                      partyName: '',
                      type: '',
                      category: '',
                      jurisdiction: '',
                      dateRange: undefined
                    });
                  }}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  // Production mode display
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6">
          <div className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-4">{query}</div>
          <div className="flex justify-center">
            <LoadingSpinner label="Analyzing agreements..." />
          </div>
        </div>
      </Card>
    );
  }

  const agreements = result?.result?.agreements || [];
  if (!agreements.length) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
        <div className="p-6">
          <div className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-4">{query}</div>
          <div className="text-[#130032]/60">No agreements found for this query.</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <div className="p-6">
        <div className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-6">{query}</div>
        
        <FilterControls />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#130032] font-medium">
              Found Agreements ({filteredAgreements.length} of {agreements.length})
            </h3>
            <span className="text-sm text-[#130032]/60">
              {filters.dateRange ? 
                `From ${new Date(filters.dateRange.start || Date.now()).toLocaleDateString()} to ${new Date(filters.dateRange.end || Date.now()).toLocaleDateString()}`
                : undefined
              }
            </span>
          </div>

          <div className="space-y-4">
            {filteredAgreements.map((agreement: any) => (
              <Card key={agreement.id} className="border border-[#130032]/10">
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-[#130032]">
                          {agreement.title || 
                            (agreement.file_name ? agreement.file_name.replace(/_/g, ' ').replace('.pdf', '') : 
                            'Untitled Agreement')
                          }
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-[#CBC2FF]/40 text-[#26065D]">
                            {agreement.type}
                          </Badge>
                          <Badge variant="secondary" className="bg-[#4C00FF]/10 text-[#4C00FF]">
                            {agreement.category}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              agreement.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-800' :
                              agreement.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {agreement.status?.toLowerCase().replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-[#130032]">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(agreement.provisions?.annual_agreement_value || 0)}
                        </div>
                        <div className="text-sm text-[#130032]/60">Annual Value</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#130032]/40" />
                        <div className="text-sm">
                          <div className="font-medium text-[#130032]">Parties</div>
                          <div className="text-[#130032]/60">
                            {agreement.parties?.map((p: any) => p.name_in_agreement).join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#130032]/40" />
                        <div className="text-sm">
                          <div className="font-medium text-[#130032]">Key Dates</div>
                          <div className="text-[#130032]/60">
                            {agreement.provisions?.effective_date && agreement.provisions?.expiration_date ? 
                              `${new Date(agreement.provisions.effective_date).toLocaleDateString()} - ${new Date(agreement.provisions.expiration_date).toLocaleDateString()}` :
                              'No dates available'
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#130032]/40" />
                        <div className="text-sm">
                          <div className="font-medium text-[#130032]">Jurisdiction</div>
                          <div className="text-[#130032]/60">{agreement.provisions?.jurisdiction || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredAgreements.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="text-[#4C00FF] border-[#4C00FF] hover:bg-[#4C00FF]/10">
                Load More
              </Button>
            </div>
          )}
        </div>
      
      {result?.result?.patterns && (
          <div className="mt-6 pt-6 border-t border-[#130032]/10">
            <h3 className="text-lg font-medium text-[#130032] mb-3">Detected Patterns</h3>
            <pre className="bg-[#F8F3F0] p-4 rounded-lg text-sm text-[#130032]/80">
            {JSON.stringify(result.result.patterns, null, 2)}
          </pre>
        </div>
      )}
      </div>
    </Card>
  );
} 