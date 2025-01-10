'use client';

import React, { useCallback } from 'react';
import { useChat, Message, UseChatHelpers, CreateMessage } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { DocumentView } from '@/components/document-view';
import { BulkOperationView } from '@/components/bulk-operation-view';
import PDFViewer from '@/components/pdf-viewer';
import { TemplateSelector } from '@/components/template-selector';
import { EnvelopeList } from '@/components/envelope-list';
import { TemplatePreview } from '@/components/template-preview';
import { RecipientForm } from '@/components/recipient-form';
import { EnvelopeSuccess } from '@/components/envelope-success';
import { PriorityDashboard } from '@/components/priority-dashboard';
import { SigningView } from '@/components/signing-view';
import { useToast } from '@/hooks/use-toast';
import { ReminderConfirmation } from '@/components/reminder-confirmation';
import { MathResult } from '@/components/math-result';
import { ConversationStarters } from '@/components/conversation-starters';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MarkdownEditor } from '@/components/markdown-editor';

// Define the extended options type to include experimental features
interface ExtendedChatOptions {
  maxSteps?: number;
  experimental_toolCallStreaming?: boolean;
  onFinish?: (message: Message) => void;
  onResponse?: (response: Response) => void;
  onToolCall?: (params: { toolCall: any }) => React.ReactNode;
}

function ContractPreviewTool({ 
  result, 
  toolCallId, 
  onToolResult, 
  onAppend 
}: { 
  result: any; 
  toolCallId: string; 
  onToolResult: (toolCallId: string, result: any) => Promise<void>;
  onAppend: (message: Message | CreateMessage) => Promise<string | null | undefined>;
}) {
  const [currentMode, setCurrentMode] = React.useState(result.mode || 'preview');
  const [currentMarkdown, setCurrentMarkdown] = React.useState(result.markdown);

  if (!result?.markdown) {
    return <div className="p-4 text-red-500">Error: No contract content generated</div>;
  }

  console.log('Rendering MarkdownEditor with mode:', currentMode);

  return (
    <MarkdownEditor
      markdown={currentMarkdown}
      mode={currentMode}
      toolCallId={toolCallId}
      onEdit={async (toolCallId) => {
        console.log('Edit clicked, switching to edit mode');
        setCurrentMode('edit');
      }}
      onConfirm={async (toolCallId, markdown) => {
        console.log('Confirm clicked with markdown:', markdown);
        try {
          setCurrentMode('preview');
          setCurrentMarkdown(markdown);
          await onToolResult(toolCallId, {
            markdown,
            mode: 'preview',
            completed: true
          });
          await onAppend({
            role: 'user',
            content: 'The contract looks good. Please proceed with sending it.'
          } as Message);
        } catch (error) {
          console.error('Failed to confirm contract:', error);
        }
      }}
      onBack={async (toolCallId) => {
        console.log('Back clicked, returning to preview mode');
        setCurrentMode('preview');
      }}
    />
  );
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const { messages, input, handleInputChange, handleSubmit, append, addToolResult, isLoading } = useChat({
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

    // Loading state
    if (state === 'partial-call') {
      return (
        <div className="p-4 flex justify-center">
          <LoadingSpinner label="Processing..." />
        </div>
      );
    }

    // Handle completed tools
    if (result?.completed) {
      return null;
    }

    // Handle result state
    if (state === 'result') {
      switch (toolName) {
        case 'collectRecipients':
          if (!result?.roles) {
            return <div className="p-4 text-red-500">Error: Invalid form configuration</div>;
          }
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

        case 'signDocument':
          if (!result?.signingUrl) {
            return <div className="p-4 text-red-500">Error: Invalid signing configuration</div>;
          }
          
          if (result?.status === 'ready') {
            return (
              <SigningView
                signingUrl={result.signingUrl}
                onComplete={async () => {
                  try {
                    // Update tool result
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true,
                      status: 'signed'
                    });
                  } catch (error) {
                    console.error('Error handling signing completion:', error);
                    toast({
                      title: 'Error updating signing status',
                      description: 'The document was signed but there was an error updating the status',
                      variant: 'destructive'
                    });
                  }
                }}
                onCancel={async () => {
                  try {
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true,
                      status: 'cancelled'
                    });

                    await append({
                      role: 'user',
                      content: 'I cancelled the signing process.'
                    });
                  } catch (error) {
                    console.error('Error handling signing cancellation:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to process signing cancellation',
                      variant: 'destructive'
                    });
                  }
                }}
              />
            );
          }
          return null;

        case 'sendReminder':
          return <ReminderConfirmation {...result} />;

        case 'calculateMath':
          console.log('Math tool response:', JSON.stringify({ toolInvocation, state, result }, null, 2));
          // Access the nested result structure
          const mathResult = result?.result;
          if (!mathResult) {
            console.error('Invalid math result:', JSON.stringify(result, null, 2));
            return <div className="p-4 text-red-500">Error: Invalid calculation result</div>;
          }
          // Check multiple sources for currency indicators
          const isCurrency = 
            // Check original expression in args
            toolInvocation.args.expression.includes('$') ||
            // Check context for currency mentions
            toolInvocation.args?.context?.toLowerCase().includes('$') ||
            toolInvocation.args?.context?.toLowerCase().includes('currency') ||
            toolInvocation.args?.context?.toLowerCase().includes('cost') ||
            toolInvocation.args?.context?.toLowerCase().includes('price') ||
            toolInvocation.args?.context?.toLowerCase().includes('tax') ||
            // Check if context mentions dollar amounts
            /\$\s*\d+/.test(toolInvocation.args?.context || '') ||
            // Check steps for currency mentions
            mathResult.steps?.some((step: string) => step.includes('$'));
          return (
            <MathResult
              expression={mathResult.expression}
              result={mathResult.result}
              steps={mathResult.steps}
              error={mathResult.error}
              isCurrency={isCurrency}
              className="mt-2"
            />
          );

        case 'displayContractPreview':
          return (
            <ContractPreviewTool
              result={result}
              toolCallId={toolCallId}
              onToolResult={handleToolResult}
              onAppend={append}
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
        {messages.length === 0 && (
          <ConversationStarters
            onSelect={async (prompt) => {
              await append({
                role: 'user',
                content: prompt
              });
            }}
          />
        )}
        
        <div ref={messagesContainerRef} className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className="space-y-4">
              {message.content && (
                <div className={`p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {message.toolInvocations?.map(toolInvocation => (
                <div key={toolInvocation.toolCallId}>
                  {handleToolInvocation(toolInvocation)}
                </div>
              ))}
            </div>
          ))}

          {isLoading && (
            <div className="p-4 flex justify-center">
              <LoadingSpinner label="Thinking..." />
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="What would you like to get done today?"
            className="ds-input flex-1 border-gray-300"
          />
          <button 
            type="submit" 
            className="ds-button bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 