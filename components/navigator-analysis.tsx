import { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AgreementList } from './agreement-list';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterState {
  partyName: string;
  type: string;
  category: string;
  minValue?: number;
  maxValue?: number;
  jurisdiction: string;
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
  const [accordionValue, setAccordionValue] = useState<string>("filters");
  const [filters, setFilters] = useState<FilterState>({
    partyName: '',
    type: '',
    category: '',
    jurisdiction: ''
  });

  // Add refs for inputs that need focus management
  const partyNameRef = useRef<HTMLInputElement>(null);
  const minValueRef = useRef<HTMLInputElement>(null);
  const maxValueRef = useRef<HTMLInputElement>(null);

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
    
    return result.result.agreements.filter(agreement => {
      const matchesParty = !filters.partyName || 
        agreement.parties.some((p: any) => {
          if (!p.name_in_agreement) return false;
          return p.name_in_agreement.toLowerCase().includes(filters.partyName.toLowerCase());
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
      
      return matchesParty && matchesType && matchesCategory && 
        matchesJurisdiction && matchesValue;
    });
  }, [result?.result?.agreements, filters]);

  const FilterControls = () => {
    const activeFilterCount = [
      filters.partyName,
      filters.type,
      filters.category,
      filters.jurisdiction,
      filters.minValue,
      filters.maxValue
    ].filter(Boolean).length;

    const handleInputClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

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

    return (
      <Accordion 
        type="single" 
        collapsible 
        className="mb-6 bg-gray-50 rounded-lg"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="filters" className="border-none">
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
                  <select 
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={filters.type}
                    onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">All Types</option>
                    {uniqueValues.types.map((type, index) => (
                      <option key={`type-${type}-${index}`} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div key="category">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    {uniqueValues.categories.map((category, index) => (
                      <option key={`category-${category}-${index}`} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div key="jurisdiction">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <select
                    id="jurisdiction"
                    className="w-full p-2 border rounded-md"
                    value={filters.jurisdiction}
                    onChange={e => setFilters(f => ({ ...f, jurisdiction: e.target.value }))}
                  >
                    <option value="">All Jurisdictions</option>
                    {uniqueValues.jurisdictions.map((jurisdiction, index) => (
                      <option key={`jurisdiction-${jurisdiction}-${index}`} value={jurisdiction}>{jurisdiction}</option>
                    ))}
                  </select>
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
                      jurisdiction: ''
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
        <FilterControls />
        
        <AgreementList 
          agreements={filteredAgreements}
          title={`Found Agreements (${filteredAgreements.length} of ${agreements.length})`}
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
            <FilterControls />
            <AgreementList 
              agreements={filteredAgreements}
              title={`Found Agreements (${filteredAgreements.length} of ${result.result.agreements.length})`}
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