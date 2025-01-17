'use client';

import { useState } from 'react';
import { mockTemplates } from '@/lib/preview-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface TemplateSelectorPreviewProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function TemplateSelectorPreview({ value = '', onChange = () => {} }: TemplateSelectorPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Simulate loading
  useState(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  });

  const filteredTemplates = mockTemplates.filter(
    template => 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
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
      ) : filteredTemplates.length === 0 ? (
        <div className="p-4 text-center text-[#130032]/60">
          No templates found
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.templateId}
              onClick={() => onChange(template.templateId)}
              className={`p-4 cursor-pointer transition-all ${
                value === template.templateId 
                  ? 'bg-[#4C00FF] border-none shadow-[0_2px_4px_rgba(76,0,255,0.2)]' 
                  : 'border-[#130032]/10 hover:border-[#4C00FF] hover:shadow-[0_2px_4px_rgba(19,0,50,0.1)]'
              }`}
            >
              <div className={`font-medium ${
                value === template.templateId ? 'text-white' : 'text-[#130032]'
              }`}>
                {template.name}
              </div>
              {template.description && (
                <div className={`text-sm mt-1 ${
                  value === template.templateId 
                    ? 'text-white/90' 
                    : 'text-[#130032]/60'
                }`}>
                  {template.description}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 