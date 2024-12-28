'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { TemplateSelector } from '@/components/template-selector';

interface Recipient {
  name: string;
  email: string;
}

export default function NewBulkSendPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseRecipients = (text: string): Recipient[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [name, email] = line.split(',').map(part => part.trim());
        return { name, email };
      })
      .filter(({ name, email }) => name && email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const recipients = parseRecipients(recipientsText);
      
      if (recipients.length === 0) {
        throw new Error('No valid recipients found. Please check the format.');
      }

      if (!selectedTemplateId && !file) {
        throw new Error('Please select a template or upload a document.');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('recipients', JSON.stringify(recipients));
      
      if (selectedTemplateId) {
        formData.append('templateId', selectedTemplateId);
      }
      
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/bulk-operations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create bulk operation');
      }

      const operation = await response.json();
      
      toast({
        title: 'Bulk operation created',
        description: `Created operation with ${recipients.length} recipients`,
      });

      router.push(`/bulk-send/${operation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Bulk Send Operation</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Operation Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., January Contracts"
                  required
                />
              </div>

              <div>
                <Label>Document</Label>
                <div className="space-y-4">
                  <div>
                    <Label>Option 1: Select Template</Label>
                    <TemplateSelector
                      value={selectedTemplateId}
                      onChange={setSelectedTemplateId}
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Option 2: Upload Document</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">
                  Recipients (one per line, format: name, email)
                </Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Example:
                  <pre className="bg-muted p-2 rounded mt-1">
                    John Doe, john@example.com
                    Jane Smith, jane@example.com
                  </pre>
                </div>
                <Textarea
                  id="recipients"
                  value={recipientsText}
                  onChange={(e) => setRecipientsText(e.target.value)}
                  placeholder="Enter recipients..."
                  required
                  rows={10}
                />
              </div>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Bulk Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 