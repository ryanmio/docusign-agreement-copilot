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
import { PriorityDashboard } from '@/components/priority-dashboard';

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
      // Basic error handling
      await addToolResult({
        toolCallId,
        result: {
          error: error instanceof Error ? error.message : 'Failed to process result'
        }
      });
    }
  };

  const handleToolInvocation = useCallback((toolInvocation: any) => {
    const { toolName, toolCallId, state, result, error } = toolInvocation;

    // Handle error state
    if (state === 'error' || error) {
      return (
        <div className="p-4 text-red-500">
          {error || 'An error occurred while processing your request'}
        </div>
      );
    }

    // Minimal loading state
    if (state === 'partial-call') {
      return <div className="p-4 text-gray-500">Loading...</div>;
    }

    // Handle completed tools
    if (result?.completed) {
      return null;
    }

    // Handle result state
    if (state === 'result') {
      switch (toolName) {
        case 'collectRecipients':
          return (
            <RecipientForm 
              roles={result.roles}
              toolCallId={toolCallId}
              onSubmit={async (recipients) => {
                try {
                  await handleToolResult(toolCallId, {
                    ...result,
                    recipients,
                    completed: true
                  });
                  await append({
                    role: 'user',
                    content: `I've added the recipients: ${recipients.map(r => 
                      `${r.roleName}: ${r.name} (${r.email})`).join(', ')}. Please continue.`
                  });
                } catch (error) {
                  console.error('Failed to handle recipient submission:', error);
                  // Basic error handling
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to submit recipients'
                  });
                }
              }}
              onBack={async () => {
                try {
                  await handleToolResult(toolCallId, {
                    ...result,
                    goBack: true,
                    completed: true
                  });
                  await append({
                    role: 'user',
                    content: 'go back'
                  });
                } catch (error) {
                  console.error('Failed to handle back action:', error);
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to go back'
                  });
                }
              }}
            />
          );

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
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to select template'
                  });
                }
              }}
            />
          );

        case 'previewTemplate':
          // Ensure we have all required props before rendering
          if (!result?.templateId || !result?.templateName || !result?.roles) {
            console.error('Missing required props for template preview:', result);
            return <div className="p-4 text-red-500">Error: Invalid template data</div>;
          }
          return <TemplatePreview {...result} />;

        case 'displayDocumentDetails':
          return <DocumentView {...result} />;

        case 'sendTemplate':
          return result?.success ? (
            <EnvelopeSuccess envelopeId={result.envelopeId} />
          ) : null;

        case 'displayPriorityDashboard':
          return (
            <PriorityDashboard
              sections={result.sections}
              toolCallId={toolCallId}
              onAction={async (envelopeId, action) => {
                try {
                  if (action === 'view') {
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true
                    });
                    await append({
                      role: 'user',
                      content: `Show me details for envelope ${envelopeId}`
                    });
                  } else if (action === 'sign') {
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true
                    });
                    await append({
                      role: 'user',
                      content: `I need to sign envelope ${envelopeId}`
                    });
                  } else if (action === 'remind') {
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true
                    });
                    await append({
                      role: 'user',
                      content: `Send reminder for envelope ${envelopeId}`
                    });
                  }
                } catch (error) {
                  console.error('Failed to handle priority dashboard action:', error);
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to process action'
                  });
                }
              }}
            />
          );

        default:
          return null;
      }
    }

    return null;
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