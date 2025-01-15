'use client';

import { useState } from 'react';
import { mockTemplates } from '@/lib/preview-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ds-input flex-1 border-gray-300"
        />
      </div>

      {loading ? (
        <div className="p-4 flex justify-center">
          <LoadingSpinner label="Loading templates..." />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No templates found
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.templateId}
              onClick={() => onChange(template.templateId)}
              className={`p-4 rounded-lg text-left transition-colors ${
                value === template.templateId 
                  ? 'bg-[#4C00FF] text-white' 
                  : 'border border-gray-200 hover:border-[#4C00FF] hover:shadow-sm'
              }`}
            >
              <div className="font-medium">{template.name}</div>
              {template.description && (
                <div className={`text-sm ${value === template.templateId ? 'text-white/90' : 'text-gray-500'}`}>
                  {template.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 