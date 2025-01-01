'use client';

import React, { useCallback } from 'react';
import { useChat, Message, UseChatHelpers } from 'ai/react';
import { DocumentView } from '@/components/document-view';
import { BulkOperationView } from '@/components/bulk-operation-view';
import PDFViewer from '@/components/pdf-viewer';
import { TemplateSelector } from '@/components/template-selector';
import { EnvelopeList } from '@/components/envelope-list';
import { TemplatePreview } from '@/components/template-preview';
import { RecipientForm } from '@/components/recipient-form';
import { EnvelopeSuccess } from '@/components/envelope-success';

// Define the extended options type to include experimental features
interface ExtendedChatOptions {
  maxSteps?: number;
  experimental_toolCallStreaming?: boolean;
  onFinish?: (message: Message) => void;
  onResponse?: (response: Response) => void;
  onToolCall?: (params: { toolCall: any }) => React.ReactNode;
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, append, addToolResult } = useChat({
    maxSteps: 5,
    experimental_toolCallStreaming: true,
    onFinish: (message: Message) => {
      console.log('Chat finished with message:', message);
    },
    onResponse: (response: Response) => {
      console.log('Received response:', response);
    },
    onToolCall: ({ toolCall }: { toolCall: any }) => {
      console.log('Tool called:', toolCall);
      if (toolCall.state === 'partial-call') {
        // Show progressive loading
        return <div className="p-4 text-gray-500">Loading...</div>;
      }
    }
  } as ExtendedChatOptions);

  const handleToolResult = async (toolCallId: string, result: any) => {
    try {
      await addToolResult({
        toolCallId,
        result: {
          ...result,
          completed: true
        }
      });
    } catch (error) {
      console.error('Failed to process tool result:', error);
      // Show error UI
    }
  };

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
            onChange={async (templateId) => {
              try {
                await handleToolResult(toolCallId, {
                  selectedTemplateId: templateId
                });
                await append({
                  role: 'user',
                  content: `I've selected template ${templateId}. Please continue.`
                });
              } catch (error) {
                console.error('Failed to handle template selection:', error);
                // Show error UI
              }
            }}
          />
        );

      case 'previewTemplate':
        return <TemplatePreview {...result} />;

      case 'collectRecipients':
        return (
          <RecipientForm 
            roles={result.roles}
            toolCallId={toolCallId}
            onSubmit={async (recipients) => {
              try {
                console.log('Form submitted with recipients:', recipients);
                await handleToolResult(toolCallId, {
                  ...result,
                  recipients
                });
                await append({
                  role: 'user',
                  content: `I've added the recipients: ${recipients.map(r => 
                    `${r.roleName}: ${r.name} (${r.email})`).join(', ')}. Please continue.`
                });
              } catch (error) {
                console.error('Failed to handle recipient submission:', error);
                // Show error UI
              }
            }}
            onBack={async () => {
              try {
                await handleToolResult(toolCallId, {
                  ...result,
                  goBack: true
                });
                await append({
                  role: 'user',
                  content: 'go back'
                });
              } catch (error) {
                console.error('Failed to handle back action:', error);
                // Show error UI
              }
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
  }, [addToolResult, append]);

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