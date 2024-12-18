'use client';

import { useState, useEffect } from 'react';
import { TemplateResponse } from '@/types/envelopes';

interface TemplateSelectorProps {
  onSelect: (template: TemplateResponse) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-red-500">
          Error: {error}
        </div>
        {/* Debug information */}
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>

      {loading ? (
        <div className="p-4 text-center">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="space-y-4">
          <div className="p-4 text-center text-gray-500">
            No templates found
          </div>
          {/* Debug information */}
          <div className="p-4 bg-gray-50 rounded-md">
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
              onClick={() => onSelect(template)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">{template.name}</div>
              {template.description && (
                <div className="text-sm text-gray-500">{template.description}</div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                {template.roles.length} role(s)
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 