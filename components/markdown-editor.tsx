import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

export interface MarkdownEditorProps {
  markdown: string;
  mode: 'preview' | 'edit';
  toolCallId?: string;
  onEdit?: (toolCallId: string) => void;
  onConfirm?: (toolCallId: string, markdown: string) => void;
  onBack?: (toolCallId: string) => void;
}

export function MarkdownEditor({ 
  markdown, 
  mode = 'preview',
  toolCallId = 'preview',
  onEdit,
  onConfirm,
  onBack 
}: MarkdownEditorProps) {
  const [editableMarkdown, setEditableMarkdown] = useState(markdown);
  
  return (
    <div className="space-y-4 border rounded-lg p-4">
      {mode === 'edit' ? (
        <div className="space-y-4">
          <textarea
            value={editableMarkdown}
            onChange={(e) => setEditableMarkdown(e.target.value)}
            className="w-full h-96 font-mono p-4 border rounded-lg"
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
                onClick={() => onConfirm(toolCallId, editableMarkdown)}
              >
                Confirm
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                code: ({ children }) => {
                  if (typeof children === 'string' && children.includes('<<')) {
                    return <span className="bg-blue-100 px-1 rounded">{children}</span>;
                  }
                  return <code>{children}</code>;
                }
              }}
            >
              {editableMarkdown}
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
                onClick={() => onConfirm(toolCallId, editableMarkdown)}
              >
                Looks Good
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 