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

  useEffect(() => {
    loadTemplates();
  }, [search]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
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
        <div className="p-4 text-center text-gray-500">
          No templates found
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