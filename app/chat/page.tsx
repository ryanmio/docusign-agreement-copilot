'use client';

import { useChat } from 'ai/react';
import { BulkOperationView } from '@/components/bulk-operation-view';
import PDFViewer from '@/components/pdf-viewer';
import DocumentView from '@/components/document-view';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5,
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Got response:', response);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map(m => (
          <div key={m.id} className="mb-4">
            <div className="font-bold mb-2">
              {m.role === 'user' ? 'User: ' : 'AI: '}
            </div>
            <div className="whitespace-pre-wrap mb-2">{m.content}</div>
            {m.toolInvocations ? (
              <div className="mb-4">
                {(() => {
                  const invocation = m.toolInvocations[0];
                  if (!invocation || !('result' in invocation)) return null;

                  switch (invocation.toolName) {
                    case 'displayBulkOperation':
                      return <BulkOperationView {...invocation.result} />;
                    case 'displayPdfViewer':
                      return (
                        <div className="h-[750px] border border-gray-300 rounded-lg">
                          <PDFViewer {...invocation.result} />
                        </div>
                      );
                    case 'displayDocumentDetails':
                      return <DocumentView {...invocation.result} />;
                    default:
                      return <pre>{JSON.stringify(invocation.result, null, 2)}</pre>;
                  }
                })()}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your documents..."
          className="flex-1 p-2 border rounded-md"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 