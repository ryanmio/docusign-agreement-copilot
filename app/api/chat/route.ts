import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { cookies } from 'next/headers';
import { create, all } from 'mathjs';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

// Create a math instance with all functions
const math = create(all);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Configure marked to preserve anchor tags
marked.use({
  extensions: [{
    name: 'docusign-anchors',
    level: 'inline',
    start(src: string) { return src.match(/<</)?.index; },
    tokenizer(src: string) {
      const rule = /^<<([^>]+)>>/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'html',
          raw: match[0],
          text: `<pre class="docusign-anchor">&lt;&lt;${match[1]}&gt;&gt;</pre>`
        };
      }
    }
  }]
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    console.log('Chat route called');
    const { messages } = await req.json();
    console.log('Received messages:', JSON.stringify(messages, null, 2));
    
    // Log environment check
    console.log('Environment check:', {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get session before starting stream
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error('Auth error:', { error: sessionError, session: !!session });
      throw new Error(`Authentication failed: ${sessionError?.message || 'No session'}`);
    }
    console.log('User authenticated:', session.user.id);

    // Test OpenAI connection
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const result = streamText({
      model: openai('gpt-4o'),
      maxSteps: 10,
      experimental_toolCallStreaming: true,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'  // Simplified system prompt for testing
        },
        ...messages
      ],
      tools: {}  // Temporarily disable tools for testing
    });

    console.log('Stream created, preparing response');
    const response = result.toDataStreamResponse();
    
    // Add required headers for streaming
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('Connection', 'keep-alive');
    headers.set('Transfer-Encoding', 'chunked');
    
    console.log('Sending response with headers:', Object.fromEntries(headers.entries()));
    return new Response(response.body, {
      headers,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in chat route:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      name: error.name,
      details: error.details,
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        details: error.stack || error.details || 'No additional details',
        name: error.name,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 