import React, { useState, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

const PreviewMode = memo(({ 
  content, 
  toolCallId, 
  onEdit, 
  onConfirm 
}: { 
  content: string;
  toolCallId: string;
  onEdit?: (toolCallId: string) => void;
  onConfirm?: (toolCallId: string, content: string) => void;
}) => (
  <div className="space-y-4">
    <div className="prose max-w-none">
      <ReactMarkdown
        components={{
          code: ({ children }) => {
            if (typeof children === 'string' && children.includes('<<')) {
              return <span className="font-mono">{children}</span>;
            }
            return <code>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="font-mono whitespace-pre overflow-x-auto text-black">{children}</pre>
          ),
          p: ({ children }) => {
            // Check if this paragraph contains signature-related content
            const text = children?.toString() || '';
            if (text.includes('<<') || text.includes('CLIENT:') || text.includes('PROVIDER:')) {
              return <pre className="font-mono whitespace-pre overflow-x-auto text-black">{children}</pre>;
            }
            return <p>{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    <div className="flex justify-end space-x-2">
      {onEdit && (
        <Button 
          variant="outline" 
          onClick={() => onEdit(toolCallId)}
        >
          Edit
        </Button>
      )}
      {onConfirm && (
        <Button 
          onClick={() => onConfirm(toolCallId, content)}
        >
          Looks Good
        </Button>
      )}
    </div>
  </div>
));

PreviewMode.displayName = 'PreviewMode';

const EditMode = memo(({ 
  content, 
  toolCallId, 
  onBack, 
  onConfirm,
  onChange
}: { 
  content: string;
  toolCallId: string;
  onBack?: (toolCallId: string) => void;
  onConfirm?: (toolCallId: string, content: string) => void;
  onChange: (content: string) => void;
}) => (
  <div className="space-y-4">
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-96 font-mono p-4 bg-white border border-[#130032]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C00FF]/20 focus:border-[#4C00FF]"
    />
    <div className="flex justify-end space-x-2">
      {onBack && (
        <Button 
          variant="outline" 
          onClick={() => onBack(toolCallId)}
        >
          Back
        </Button>
      )}
      {onConfirm && (
        <Button 
          onClick={() => onConfirm(toolCallId, content)}
        >
          Confirm
        </Button>
      )}
    </div>
  </div>
));

EditMode.displayName = 'EditMode';

export interface MarkdownEditorProps {
  markdown: string;
  mode: 'preview' | 'edit';
  toolCallId?: string;
  onEdit?: (toolCallId: string) => void;
  onConfirm?: (toolCallId: string, markdown: string) => void;
  onBack?: (toolCallId: string) => void;
}

export const MarkdownEditor = memo(({ 
  markdown, 
  mode = 'preview',
  toolCallId = 'preview',
  onEdit,
  onConfirm,
  onBack 
}: MarkdownEditorProps) => {
  const [editableMarkdown, setEditableMarkdown] = useState(markdown);
  
  // Memoize the content to prevent re-renders during streaming
  const content = useMemo(() => {
    return mode === 'edit' ? editableMarkdown : markdown;
  }, [mode, editableMarkdown, markdown]);
  
  return (
    <div className="space-y-4 bg-white border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)] rounded-lg p-4">
      {mode === 'edit' ? (
        <EditMode
          content={editableMarkdown}
          toolCallId={toolCallId}
          onBack={onBack}
          onConfirm={onConfirm}
          onChange={setEditableMarkdown}
        />
      ) : (
        <PreviewMode
          content={content}
          toolCallId={toolCallId}
          onEdit={onEdit}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if mode changes or if we're in edit mode
  if (prevProps.mode !== nextProps.mode) return false;
  if (prevProps.mode === 'edit') return false;
  // In preview mode, only re-render when markdown has fully changed
  return prevProps.markdown === nextProps.markdown;
});

MarkdownEditor.displayName = 'MarkdownEditor'; 