# Memoization for Markdown Chat

## Basic Implementation
- Basic markdown rendering using `react-markdown`
- Simple implementation without memoization
- Suitable for short conversations and simple markdown

## When to Optimize
Consider implementing the memoization solution when:
1. Conversations become longer (many messages)
2. Messages contain complex markdown
3. Visible performance issues occur during streaming
4. Users report UI lag during long conversations

## Implementation Steps for Optimization

### 1. Add Dependencies
```bash
npm install marked
```

### 2. Create Memoized Markdown Component
Create `components/memoized-markdown.tsx`:
```typescript
import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';
```

### 3. Split Form Component
Create `components/message-input.tsx`:
```typescript
export const MessageInput = () => {
  const { input, handleSubmit, handleInputChange } = useChat({ id: 'chat' });
  return (
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
  );
};
```

### 4. Update Chat Page
Update `app/chat/page.tsx`:
```typescript
export default function ChatPage() {
  const { messages } = useChat({
    maxSteps: 5,
    experimental_toolCallStreaming: true,
    // Add throttling to manage updates
    experimental_throttle: 50,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map(message => (
          <div key={message.id} className="space-y-4">
            {message.content && (
              <div className={`p-4 rounded-lg prose ${
                message.role === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-gray-100'
              }`}>
                <MemoizedMarkdown id={message.id} content={message.content} />
              </div>
            )}
            {/* Tool invocations remain the same */}
          </div>
        ))}
        <MessageInput />
      </div>
    </div>
  );
}
```

## Benefits of Optimization
1. Improved performance for long conversations
2. Reduced re-renders during streaming
3. Better memory usage
4. Smoother UI experience

## References
- Original implementation: `docs/vercel/cookbook/01-next/25-markdown-chatbot-with-memoization.mdx`