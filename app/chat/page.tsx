'use client';

import React, { useCallback } from 'react';
import { useChat } from 'ai/react';
import { DocumentView } from '@/components/document-view';
import { BulkOperationView } from '@/components/bulk-operation-view';
import PDFViewer from '@/components/pdf-viewer';
import { TemplateSelector } from '@/components/template-selector';
import { EnvelopeList } from '@/components/envelope-list';
import { TemplatePreview } from '@/components/template-preview';
import { RecipientForm } from '@/components/recipient-form';
import { EnvelopeSuccess } from '@/components/envelope-success';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, append, addToolResult } = useChat({
    maxSteps: 5,
    onFinish: (message) => {
      console.log('Chat finished with message:', message);
    },
    onResponse: (response) => {
      console.log('Received response:', response);
    },
    onToolCall: (toolCall) => {
      console.log('Tool called:', toolCall);
    }
  });

  const handleEnvelopeClick = useCallback((envelopeId: string) => {
    const message = `Tell me about envelope ${envelopeId}`;
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
    const event = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    handleSubmit(event);
  }, [handleSubmit, handleInputChange]);

  const handleToolInvocation = useCallback((toolInvocation: any) => {
    const { toolName, toolCallId, state } = toolInvocation;

    // Handle loading states
    if (state !== 'result') {
      return (
        <div className="p-4 text-gray-500">
          Loading...
        </div>
      );
    }

    const { result } = toolInvocation;

    // Handle completed tools
    if (result?.completed) {
      return null;
    }

    switch (toolName) {
      case 'displayTemplateSelector':
        return (
          <TemplateSelector 
            value={result?.selectedTemplateId} 
            onChange={(templateId) => {
              // First add the tool result
              addToolResult({
                toolCallId,
                result: {
                  selectedTemplateId: templateId,
                  completed: true
                }
              });
              // Let the result be processed before continuing
              setTimeout(() => {
                handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
              }, 100);
            }}
          />
        );

      case 'previewTemplate':
        return <TemplatePreview {...result} />;

      case 'collectRecipients':
        return (
          <RecipientForm 
            roles={result.roles}
            onSubmit={async (recipients) => {
              console.log('Form submitted with recipients:', recipients);
              // Add the tool result
              addToolResult({
                toolCallId,
                result: {
                  ...result,
                  recipients,
                  completed: true
                }
              });
              // Append a user message with the recipient information
              append({
                role: 'user',
                content: `I've added the recipients: ${recipients.map(r => `${r.roleName}: ${r.name} (${r.email})`).join(', ')}. Please continue.`
              });
            }}
            onBack={() => {
              addToolResult({
                toolCallId,
                result: {
                  ...result,
                  goBack: true
                }
              });
              append({
                role: 'user',
                content: 'go back'
              });
            }}
          />
        );

      case 'displayDocumentDetails':
        return <DocumentView {...result} />;

      case 'sendTemplate':
        return result?.success ? (
          <EnvelopeSuccess envelopeId={result.envelopeId} />
        ) : null;

      default:
        return null;
    }
  }, [addToolResult, handleSubmit, handleInputChange, append]);

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

            {message.toolInvocations?.map(toolInvocation => (
              <div key={toolInvocation.toolCallId}>
                {handleToolInvocation(toolInvocation)}
              </div>
            ))}
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