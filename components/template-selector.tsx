'use client';

import { useState, useEffect } from 'react';
import { TemplateResponse } from '@/types/envelopes';
import { useToolTransition } from '@/hooks/use-tool-transition';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, [search]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      console.log('Fetching templates...');
      const response = await fetch(`/api/templates?${params}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Templates response:', data);
      
      setDebugInfo(data); // Store full response for debugging
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

  const handleTemplateClick = async (templateId: string) => {
    transition(async () => {
      try {
        await onChange(templateId);
      } catch (error) {
        console.error('Failed to select template:', error);
        // Show error UI
      }
    });
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-red-500">
          Error: {error}
        </div>
        {/* Debug information */}
        <div className="p-4 bg-[#F8F3F0] rounded-md">
          <h3 className="font-medium mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}>
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
      ) : templates.length === 0 ? (
        <div className="space-y-4">
          <div className="p-4 text-center text-gray-500">
            No templates found
          </div>
          {/* Debug information */}
          <div className="p-4 bg-[#F8F3F0] rounded-md">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <button
              key={template.templateId}
              onClick={() => handleTemplateClick(template.templateId)}
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