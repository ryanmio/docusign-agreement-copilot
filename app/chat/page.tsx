'use client';

import React, { useCallback, Suspense } from 'react';
import { useChat, Message, UseChatHelpers, CreateMessage } from 'ai/react';
import { useSearchParams } from 'next/navigation';
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
import { NavigatorAnalysis } from '@/components/navigator-analysis';
import { AgreementChart } from '@/components/chart-pie-interactive';
import { useSession } from '@/lib/hooks/use-session';

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

  // Memoize callbacks to prevent re-renders
  const handleEdit = React.useCallback(async (toolCallId: string) => {
    console.log('Edit clicked, switching to edit mode');
    setCurrentMode('edit');
  }, []);

  const handleConfirm = React.useCallback(async (toolCallId: string, markdown: string) => {
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
  }, [onToolResult, onAppend]);

  const handleBack = React.useCallback(async (toolCallId: string) => {
    console.log('Back clicked, returning to preview mode');
    setCurrentMode('preview');
  }, []);

  // Memoize the entire component to prevent re-renders during streaming
  return React.useMemo(() => (
    <MarkdownEditor
      markdown={currentMarkdown}
      mode={currentMode}
      toolCallId={toolCallId}
      onEdit={handleEdit}
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  ), [currentMarkdown, currentMode, toolCallId, handleEdit, handleConfirm, handleBack]);
}

// Separate the URL parameter handling into a suspense-wrapped component
function MessageInitializer({ onMessage }: { onMessage: (message: string) => void }) {
  const searchParams = useSearchParams();
  const initialMessageSent = React.useRef(false);
  
  React.useEffect(() => {
    if (initialMessageSent.current) return;
    
    const message = searchParams?.get('message');
    if (!message) return;
    
    initialMessageSent.current = true;
    window.history.replaceState({}, '', '/chat');
    onMessage(decodeURIComponent(message));
  }, [searchParams, onMessage]);
  
  return null;
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messagesContainerRef, messagesEndRef, scrollToBottom] = useScrollToBottom<HTMLDivElement>();
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const { session } = useSession();
  const userEmail = session?.user?.email;

  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit, append, addToolResult, isLoading } = useChat({
    maxSteps: 5,
    experimental_toolCallStreaming: true,
    onFinish: (message: Message) => {
      console.log('Chat finished with message:', message);
    },
    onResponse: (response: Response) => {
      console.log('Received response:', response);
    },
    onToolCall: ({ toolCall }: { toolCall: any }) => {
      if (toolCall.state === 'partial-call') {
        return <div className="p-4 text-gray-500">Loading...</div>;
      }
    }
  } as ExtendedChatOptions);

  const handleInitialMessage = useCallback((message: string) => {
    append({
      role: 'user',
      content: message
    });
  }, [append]);

  // Controls visibility of scroll-to-bottom button based on user's scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setShowScrollButton(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnvelopeClick = useCallback((envelope: any) => {
    const message = `Tell me about envelope ${envelope.docusign_envelope_id}`;
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
    const event = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    handleChatSubmit(event);
  }, [handleChatSubmit, handleInputChange]);

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

    // Handle result state
    if (state === 'result') {
      switch (toolName) {
        case 'collectTemplateRecipients':
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

        case 'collectContractSigners':
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
                    content: `I've added the signers: ${recipients.map(r => 
                      `${r.roleName}: ${r.name} (${r.email})`).join(', ')}. Please proceed with sending the contract.`
                  });
                } catch (error) {
                  console.error('Failed to handle signer submission:', error);
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to submit signers'
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
          // Handle both explicit errors and missing data
          if (state === 'error' || error || !result?.envelope) {
            return (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error || 'This envelope is not available or you don\'t have permission to view it'}
              </div>
            );
          }
          return <DocumentView {...result} />;

        case 'displayPdfViewer':
          return (
            <div className="h-[750px] border border-gray-300 rounded-lg">
              <PDFViewer {...toolInvocation.result} />
            </div>
          );

        case 'displayBulkOperation':
          return (
            <div key={toolInvocation.toolCallId}>
              <BulkOperationView {...toolInvocation.result} />
            </div>
          );

        case 'displayEnvelopeList':
          return (
            <div key={toolInvocation.toolCallId}>
              <EnvelopeList {...toolInvocation.result} onEnvelopeClick={handleEnvelopeClick} />
            </div>
          );

        case 'sendTemplate':
        case 'sendCustomEnvelope':
          if (!result?.success || !result?.envelopeId) {
            return (
              <div className="p-4 text-red-500">
                Failed to send envelope: {result?.error || 'Unknown error'}
              </div>
            );
          }
          // Keep component mounted until explicitly completed
          return (
            <div key={`envelope-${result.envelopeId}-${toolCallId}`}>
              <EnvelopeSuccess 
                envelopeId={result.envelopeId} 
                onComplete={async () => {
                  try {
                    await handleToolResult(toolCallId, {
                      ...result,
                      completed: true
                    });
                  } catch (error) {
                    console.error('Failed to complete envelope success:', error);
                  }
                }}
              />
            </div>
          );

        case 'displayPriorityDashboard':
          return (
            <PriorityDashboard
              sections={result.sections}
              toolCallId={toolCallId}
              currentUserEmail={userEmail}
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

        case 'chartAnalysis':
          return (
            <AgreementChart 
              dimension={result.dimension} 
              metric={result.metric}
              chartType={result.chartType || 'pie'}
            />
          );

        case 'navigatorAnalysis':
          return (
            <NavigatorAnalysis
              toolCallId={toolCallId}
              query={result.query}
              apiCall={result.apiCall}
              result={result.result}
              onComplete={async (analysisResult) => {
                try {
                  await handleToolResult(toolCallId, {
                    ...result,
                    completed: true
                  });
                } catch (error) {
                  console.error('Failed to handle analysis completion:', error);
                  await handleToolResult(toolCallId, {
                    error: error instanceof Error ? error.message : 'Failed to complete analysis'
                  });
                }
              }}
              onAction={async (envelopeId, action) => {
                try {
                  await handleToolResult(toolCallId, {
                    ...result,
                    completed: true
                  });
                  let message = '';
                  switch (action) {
                    case 'view':
                      message = `I want to view envelope ${envelopeId}`;
                      break;
                    case 'remind':
                      message = `I want to send a reminder for envelope ${envelopeId}`;
                      break;
                    case 'void':
                      message = `I want to void envelope ${envelopeId}`;
                      break;
                  }
                  await append({
                    role: 'user',
                    content: message
                  });
                } catch (error) {
                  console.error('Failed to handle envelope action:', error);
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

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleChatSubmit(e);
  }, [handleChatSubmit]);

  return (
    <div className="h-[calc(100vh-70px)] bg-[#F7F7F7] w-full relative overflow-auto">
      <Suspense fallback={null}>
        <MessageInitializer onMessage={handleInitialMessage} />
      </Suspense>
      <div className="w-full h-full flex flex-col items-center">
        <div ref={messagesContainerRef} className="w-full flex justify-center">
          <div className="w-full max-w-[900px] space-y-6 pb-32 pt-8 px-6">
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
            
            {messages.map(message => (
              <div key={message.id} className="space-y-4">
                {message.content && (
                  <div className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-[#CBC2FF]' 
                      : 'bg-white border border-gray-100 shadow-sm'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user' 
                        ? 'text-[#130032]' 
                        : 'text-[#130032]'
                    }`}>
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
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-white/80 backdrop-blur-sm shadow-sm rounded-full p-2 hover:bg-gray-100 transition-all duration-200 border border-gray-100"
            aria-label="Scroll to bottom"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-[#130032]/60"
            >
              <path d="M12 19V5M5 12l7 7 7-7"/>
            </svg>
          </button>
        )}

        <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-[#F7F7F7] via-[#F7F7F7] to-transparent pb-6" style={{ bottom: 0 }}>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[900px] px-6">
              <form onSubmit={handleFormSubmit} className="flex items-center gap-2 bg-white rounded-full border shadow-sm px-6 py-3">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="What do you want to get done today?"
                  className="flex-1 text-lg outline-none text-[#130032] placeholder:text-gray-400 bg-transparent"
                />
                <button 
                  type="submit" 
                  className="rounded-full bg-[#4C00FF] text-white hover:bg-[#26065D] transition-colors w-10 h-10 flex items-center justify-center shrink-0"
                  disabled={isLoading}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 14-7-7 14v-7L5 12Z"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 