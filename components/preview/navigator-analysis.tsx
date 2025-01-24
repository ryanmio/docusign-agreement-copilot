"use client"

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
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
import { Filter, Building2, Calendar, MapPin } from 'lucide-react';
import { mockNavigatorAnalysis } from '@/lib/preview-data';

interface FilterState {
  partyName: string;
  type: string | null;
  category: string | null;
  jurisdiction: string | null;
}

export function NavigatorAnalysisPreview() {
  const [accordionValue, setAccordionValue] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    partyName: '',
    type: null,
    category: null,
    jurisdiction: null
  });

  // Get unique values for dropdowns
  const uniqueValues = useMemo(() => {
    const agreements = mockNavigatorAnalysis.result.agreements;
    return {
      types: Array.from(new Set(agreements.map(a => a.type))).filter(Boolean),
      categories: Array.from(new Set(agreements.map(a => a.category))).filter(Boolean),
      jurisdictions: Array.from(new Set(agreements.map(a => a.provisions?.jurisdiction))).filter(Boolean)
    };
  }, []);

  // Filter agreements based on current filters
  const filteredAgreements = useMemo(() => {
    return mockNavigatorAnalysis.result.agreements.filter(agreement => {
      const matchesParty = !filters.partyName || 
        agreement.parties?.some(p => 
          p.name_in_agreement.toLowerCase().includes(filters.partyName.toLowerCase())
        );
      
      const matchesType = !filters.type || 
        agreement.type === filters.type;
      
      const matchesCategory = !filters.category || 
        agreement.category === filters.category;
      
      const matchesJurisdiction = !filters.jurisdiction || 
        agreement.provisions?.jurisdiction === filters.jurisdiction;
      
      return matchesParty && matchesType && matchesCategory && matchesJurisdiction;
    });
  }, [filters]);

  const getActiveFilterCount = (filterState: FilterState) => {
    return Object.values(filterState).filter(Boolean).length;
  };

  return (
    <div className="space-y-4">
      <Accordion 
        type="single" 
        collapsible 
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="hover:no-underline p-0 [&[data-state=open]>div>div:last-child>svg]:rotate-180">
            <div className="w-full bg-[#F8F3F0]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#4C00FF]" />
                  <span className="font-medium">Filter Results</span>
                  {getActiveFilterCount(filters) > 0 && (
                    <Badge variant="secondary" className="bg-[#4C00FF] text-white">
                      {getActiveFilterCount(filters)} active
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-[#4C00FF] transition-transform duration-200" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 px-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="flex gap-2 items-center text-[#130032]">
                  <Building2 className="h-4 w-4" />
                  Party Name
                </Label>
                <Input
                  placeholder="Enter party name"
                  value={filters.partyName}
                  onChange={e => setFilters(f => ({ ...f, partyName: e.target.value }))}
                  className="border-[#CBC2FF] focus:ring-[#4C00FF]/20"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[#130032]">Agreement Type</Label>
                <Select
                  value={filters.type || undefined}
                  onValueChange={value => setFilters(f => ({ ...f, type: value }))}
                >
                  <SelectTrigger className="border-[#CBC2FF] focus:ring-[#4C00FF]/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg border border-[#CBC2FF]/20">
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueValues.types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[#130032]">Category</Label>
                <Select
                  value={filters.category || undefined}
                  onValueChange={value => setFilters(f => ({ ...f, category: value }))}
                >
                  <SelectTrigger className="border-[#CBC2FF] focus:ring-[#4C00FF]/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg border border-[#CBC2FF]/20">
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueValues.categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="flex gap-2 items-center text-[#130032]">
                  <MapPin className="h-4 w-4" />
                  Jurisdiction
                </Label>
                <Select
                  value={filters.jurisdiction || undefined}
                  onValueChange={value => setFilters(f => ({ ...f, jurisdiction: value }))}
                >
                  <SelectTrigger className="border-[#CBC2FF] focus:ring-[#4C00FF]/20">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg border border-[#CBC2FF]/20">
                    <SelectItem value="all">All Jurisdictions</SelectItem>
                    {uniqueValues.jurisdictions.map(jurisdiction => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="font-medium text-lg">
        Found Agreements ({filteredAgreements.length} of {mockNavigatorAnalysis.result.agreements.length})
      </div>

      <div className="space-y-4">
        {filteredAgreements.map(agreement => (
          <Card key={agreement.id} className="p-6 hover:bg-[#F8F3F0]/50 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#130032]">{agreement.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-[#F8F3F0] text-[#130032]">
                      {agreement.type}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#F8F3F0] text-[#130032]">
                      {agreement.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#E5FFE5] text-[#006600]">
                      complete
                    </Badge>
                    <Badge variant="secondary" className="bg-[#F0F7FF] text-[#0066CC]">
                      Expires {new Date(agreement.provisions.expiration_date).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#130032]">
                    ${agreement.provisions.annual_agreement_value.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#130032]/60">Annual Value</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-sm font-medium mb-1">Parties</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#130032]/40" />
                    <span>{agreement.parties[0].name_in_agreement}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Key Dates</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#130032]/40" />
                    <span>
                      {new Date(agreement.provisions.effective_date).toLocaleDateString()} - {new Date(agreement.provisions.expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Jurisdiction</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#130032]/40" />
                    <span>{agreement.provisions.jurisdiction}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredAgreements.length === 0 && (
          <div className="text-center text-[#130032]/70 py-8">
            No agreements match the current filters
          </div>
        )}
      </div>
    </div>
  );
} 