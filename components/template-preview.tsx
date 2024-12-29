import { useState } from 'react';
import { TemplateSelector } from './template-selector';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, Users } from 'lucide-react';

interface TemplatePreviewProps {
  value?: string;
  onChange: (templateId: string) => void;
  onProceed?: () => void;
  onCancel?: () => void;
  mode?: 'select' | 'preview';
  selectedTemplate?: {
    name: string;
    description?: string;
    roles: Array<{ roleName: string }>;
  };
}

export function TemplatePreview({
  value,
  onChange,
  onProceed,
  onCancel,
  mode = 'select',
  selectedTemplate
}: TemplatePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleProceed = async () => {
    if (!value || !onProceed) return;
    setIsLoading(true);
    try {
      await onProceed();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {mode === 'preview' && selectedTemplate ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              {selectedTemplate.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h4 className="font-medium">Required Signers</h4>
              </div>
              <div className="grid gap-2 pl-6">
                {selectedTemplate.roles.map((role, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{role.roleName}</span>
                      <span className="text-gray-400 ml-2">Will receive email to sign</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              {onProceed && (
                <Button
                  onClick={handleProceed}
                  disabled={!value || isLoading}
                >
                  {isLoading ? 'Loading...' : 'Proceed to Recipients'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <TemplateSelector
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
} 