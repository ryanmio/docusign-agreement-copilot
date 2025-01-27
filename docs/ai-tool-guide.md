# Quick Guide: Creating DocuSign Agent Tools

## The Basics

Tools are the building blocks that let our AI agent interact with Docusign. They come in three flavors:
- 🤖 **Server-side chat tools** - Run during AI chat completion
- 🎨 **Client-side UI tools** - Called directly by components
- 🤝 **User interaction tools** - Handle user input (forms, etc.)

## Quick Start Template

Here's a minimal tool template to get you started:

```typescript
// ai/tools.ts
export const tools = {
  yourNewTool: {
    name: 'yourNewTool',
    description: 'What your tool does (be specific for the AI)',
    parameters: z.object({
      // What your tool needs to run
      documentId: z.string().describe('The document ID to process'),
      action: z.enum(['sign', 'void', 'send'])
    }),
    execute: async (params) => {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      // Your tool logic here
      return {
        success: true,
        data: result
      };
    }
  }
}
```

## Creating a Tool in 5 Minutes

1. **Pick Your Tool Type**
   ```typescript
   // Server-side in route.ts (AI chat)
   const tools = {
     myTool: tool({...})
   }
   
   // Client-side in tools.ts (Direct UI)
   const tools = {
     myTool: {...}
   }
   ```

2. **Add Your Component**
   ```typescript
   // components/your-tool.tsx
   export function YourTool({ toolCallId, data, onSubmit }) {
     return (
       <Card className="p-6">
         {/* Your UI here */}
       </Card>
     );
   }
   ```

3. **Wire It Up**
   ```typescript
   // app/chat/page.tsx
   const handleToolInvocation = (toolInvocation) => {
     if (toolInvocation.toolName === 'yourTool') {
       return <YourTool {...toolInvocation} />;
     }
   }
   ```

## Common Components You Can Use

We have several pre-built components for DocuSign operations:

- `BulkOperationView` - Show progress of bulk sends
- `PDFViewer` - Display PDF documents
- `DocumentDetails` - Show envelope details
- `EnvelopeList` - List documents with filters
- `TemplateSelector` - Browse/select templates
- `EnvelopeSuccess` - Show real-time status

## Pro Tips 🚀

1. **State Management**
   ```typescript
   // Use this for forms that need to persist
   const { instance, updateState } = useFormInstance(toolCallId, {
     status: 'initial',
     data: {}
   });
   ```

2. **Error Handling**
   ```typescript
   try {
     // Your logic
   } catch (error) {
     return {
       success: false,
       error: error instanceof Error ? error.message : 'Failed'
     };
   }
   ```

3. **Authentication**
   ```typescript
   // Server-side
   const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
   
   // Client-side
   const supabase = createClientComponentClient();
   ```

## Example: Document Status Tool

Here's a complete example of a tool that checks document status:

```typescript
// 1. Define the tool
const checkStatus = {
  name: 'checkStatus',
  description: 'Check the status of a DocuSign document',
  parameters: z.object({
    envelopeId: z.string().describe('DocuSign envelope ID')
  }),
  execute: async ({ envelopeId }) => {
    const supabase = createClientComponentClient();
    const { data: envelope } = await supabase
      .from('envelopes')
      .select('*, recipients(*)')
      .eq('docusign_envelope_id', envelopeId)
      .single();
      
    return {
      success: true,
      status: envelope.status,
      recipients: envelope.recipients
    };
  }
};

// 2. Create the component
function StatusView({ data }) {
  return (
    <Card>
      <CardHeader>
        <h3>Document Status: {data.status}</h3>
      </CardHeader>
      <CardContent>
        {data.recipients.map(recipient => (
          <div key={recipient.email}>
            {recipient.name}: {recipient.status}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Need Help?

- Check `ai-components.md` for full component docs
- See `#7-ai-component-cheat-sheet.md` for detailed patterns
