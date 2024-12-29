'use client';

import React from 'react';
import { useChat } from 'ai/react';
import { DocumentView } from '@/components/document-view';
import { BulkOperationView } from '@/components/bulk-operation-view';
import PDFViewer from '@/components/pdf-viewer';
import { TemplateSelector } from '@/components/template-selector';
import { EnvelopeList } from '@/components/envelope-list';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const handleEnvelopeClick = (envelopeId: string) => {
    // When an envelope is clicked, ask about it in the chat
    const message = `Tell me about envelope ${envelopeId}`;
    const event = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    handleSubmit(event);
    // Set the input value after submission
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map(message => (
          <div key={message.id} className="space-y-4">
            <div className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100' 
                : 'bg-gray-100'
            }`}>
              {message.content}
            </div>

            {message.toolInvocations?.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'displayDocumentDetails') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <DocumentView {...result} />
                    </div>
                  );
                }
                
                if (toolName === 'displayPdfViewer') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId} className="h-[750px] border border-gray-300 rounded-lg">
                      <PDFViewer {...result} />
                    </div>
                  );
                }

                if (toolName === 'displayBulkOperation') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <BulkOperationView {...result} />
                    </div>
                  );
                }

                if (toolName === 'displayTemplateSelector') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <TemplateSelector value={result.selectedTemplateId} onChange={() => {}} />
                    </div>
                  );
                }

                if (toolName === 'displayEnvelopeList') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <EnvelopeList 
                        initialStatus={result.initialStatus}
                        initialPage={result.initialPage}
                        showStatusFilter={result.showStatusFilter}
                        onEnvelopeClick={handleEnvelopeClick}
                      />
                    </div>
                  );
                }
              }

              // Show loading states
              return (
                <div key={toolCallId} className="p-4 text-gray-500">
                  {toolName === 'displayTemplateSelector' ? (
                    'Loading templates...'
                  ) : (
                    'Loading...'
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your documents..."
            className="flex-1 p-4 border rounded-lg"
          />
          <button type="submit" className="px-8 py-4 bg-blue-500 text-white rounded-lg">
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 