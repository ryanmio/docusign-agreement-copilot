'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { CreateEnvelopePayload, Document, Recipient } from '@/types/envelopes';

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: '', name: '' }]);

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

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documents.length) {
      setError('Please add at least one document');
      return;
    }

    if (!recipients.some(r => r.email && r.name)) {
      setError('Please add at least one recipient');
      return;
    }

    const payload: CreateEnvelopePayload = {
      subject,
      message,
      documents,
      recipients: recipients.filter(r => r.email && r.name),
    };

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/envelopes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create envelope');
      }

      router.push('/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Document</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className="block mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              placeholder="Enter message"
            />
          </div>

          <div>
            <label className="block mb-2">Documents</label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {documents.length > 0 && (
              <ul className="mt-2 space-y-1">
                {documents.map((doc, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block mb-2">Recipients</label>
            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    required
                    className="flex-1 border rounded-md px-3 py-2"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    required
                    className="flex-1 border rounded-md px-3 py-2"
                    placeholder="Name"
                  />
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRecipient}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              + Add Recipient
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Envelope'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/documents')}
              className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 