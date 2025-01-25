'use client';

import { useState, useEffect } from 'react';
import { TemplateResponse } from '@/types/envelopes';
import { useToolTransition } from '@/hooks/use-tool-transition';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TemplateSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function TemplateSelector({ value = '', onChange }: TemplateSelectorProps) {
  const { isTransitioning, transition } = useToolTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  const handleTemplateClick = (templateId: string) => {
    // Set selection immediately
    setSelectedId(templateId);
    
    // Then trigger the transition
    transition(async () => {
      try {
        await onChange(templateId);
      } catch (error) {
        console.error('Failed to select template:', error);
      }
    });
  };

  useEffect(() => {
    loadTemplates();
  }, [search]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();
      
      setTemplates(data.templates || []);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load templates');
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border border-gray-200">
      <div className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#130032]/40" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#130032]/20 focus:border-[#4C00FF] focus:ring-1 focus:ring-[#4C00FF]"
          />
        </div>

        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner label="Loading templates..." />
          </div>
        ) : templates.length === 0 ? (
          <div className="p-4 text-center text-[#130032]/60">
            No templates found
          </div>
        ) : (
          <div className="grid gap-3">
            {templates.map((template) => {
              const isSelected = selectedId === template.templateId;
              return (
                <Card
                  key={template.templateId}
                  onClick={() => handleTemplateClick(template.templateId)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#4C00FF] border-none shadow-[0_2px_4px_rgba(76,0,255,0.2)]' 
                      : 'border-[#130032]/10 hover:border-[#4C00FF] hover:shadow-[0_2px_4px_rgba(19,0,50,0.1)]'
                  }`}
                >
                  <div className={`font-medium ${
                    isSelected ? 'text-white' : 'text-[#130032]'
                  }`}>
                    {template.name}
                  </div>
                  {template.description && (
                    <div className={`text-sm mt-1 ${
                      isSelected
                        ? 'text-white/90' 
                        : 'text-[#130032]/60'
                    }`}>
                      {template.description}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
} 