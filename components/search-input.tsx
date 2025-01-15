'use client';

import { Sparkles, ChevronRight } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function SearchInput() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      // Check auth status
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/connect?redirect=chat');
        return;
      }

      // Check DocuSign connection
      const response = await fetch('/api/auth/docusign/status');
      const { connected } = await response.json();
      
      if (!connected) {
        router.push('/auth/connect?redirect=chat');
        return;
      }

      // Process message
      // TODO: Add message processing logic
      console.log('Processing message:', message);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message, router, isLoading]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Sparkles className="h-5 w-5 text-[#4C00FF]" />
      </div>
      <Input
        type="text"
        placeholder="What would you like to get done today?"
        className="pl-10 pr-12 h-12 text-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow focus-visible:ring-[#4C00FF] placeholder:text-gray-400"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        disabled={isLoading}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <button 
          className="bg-[#4C00FF] text-white p-2 rounded-full hover:bg-[#4C00FF]/90 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

