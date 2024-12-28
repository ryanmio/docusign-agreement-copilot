'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { CreateEnvelopePayload, Document, Recipient, TemplateResponse } from '@/types/envelopes';
import { TemplateSelector } from '@/components/template-selector';
import { TemplateRoleForm } from '@/components/template-role-form';

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: '', name: '' }]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResponse | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newDocuments: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await readFileAsBase64(file);
        newDocuments.push({
          name: file.name,
          content,
          fileExtension: file.name.split('.').pop() || '',
        });
      } catch (err) {
        setError('Error reading file. Please try again.');
        return;
      }
    }

    setDocuments([...documents, ...newDocuments]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const handleTemplateSelect = async (templateId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to load template details');
      }
      const templateDetails: TemplateResponse = await response.json();
      setSelectedTemplate(templateDetails);
      // Pre-fill subject from template
      setSubject(templateDetails.emailSubject || `Sign ${templateDetails.name}`);
    } catch (err) {
      console.error('Error loading template details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Starting form submission:', {
        useTemplate,
        selectedTemplate: selectedTemplate?.templateId,
        subject,
        message,
        recipientsCount: recipients.length,
      });

      if (!useTemplate && documents.length === 0) {
        throw new Error('Please add at least one document');
      }

      if (recipients.length === 0) {
        throw new Error('Please add at least one recipient');
      }

      if (useTemplate && !selectedTemplate) {
        throw new Error('Please select a template');
      }

      const payload = useTemplate 
        ? {
            subject,
            message,
            roles: recipients.map(recipient => ({
              email: recipient.email.trim(),
              name: recipient.name.trim(),
              roleName: recipient.roleName,
            })),
          }
        : {
            subject,
            message,
            documents,
            recipients,
          };

      console.log('Sending request with payload:', {
        ...payload,
        useTemplate,
        templateId: selectedTemplate?.templateId,
      });

      const response = await fetch(
        useTemplate 
          ? `/api/templates/${selectedTemplate!.templateId}/envelopes`
          : '/api/envelopes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('Received response:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create envelope');
      }

      const result = await response.json();
      console.log('Successfully created envelope:', result);

      router.push('/documents');
    } catch (err) {
      console.error('Error creating envelope:', err);
      setError(err instanceof Error ? err.message : 'Failed to create envelope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Document</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setUseTemplate(false);
                setSelectedTemplate(null);
              }}
              className={`px-4 py-2 rounded-md ${!useTemplate ? 'bg-blue-500 text-white' : 'border'}`}
            >
              Upload Documents
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`px-4 py-2 rounded-md ${useTemplate ? 'bg-blue-500 text-white' : 'border'}`}
            >
              Use Template
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              placeholder="Please sign this document"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Additional message for recipients"
            />
          </div>

          {useTemplate ? (
            selectedTemplate ? (
              <TemplateRoleForm
                template={selectedTemplate}
                onSubmit={(roles) => {
                  console.log('TemplateRoleForm submitted with roles:', roles);
                  setRecipients(roles);
                }}
                onCancel={() => setSelectedTemplate(null)}
              />
            ) : (
              <TemplateSelector 
                value={selectedTemplate?.templateId}
                onChange={handleTemplateSelect}
              />
            )
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Documents
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {documents.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {documents.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {doc.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Recipients
                  </label>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Add Recipient
                  </button>
                </div>
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="email"
                          required
                          value={recipient.email}
                          onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                          className="block w-full px-3 py-2 border rounded-md"
                          placeholder="Email"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={recipient.name}
                          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                          className="block w-full px-3 py-2 border rounded-md"
                          placeholder="Name"
                        />
                      </div>
                      {recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Sending...' : 'Send for Signature'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 