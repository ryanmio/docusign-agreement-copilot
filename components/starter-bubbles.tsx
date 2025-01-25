"use client"

import { useRouter } from 'next/navigation';

type StarterBubble = {
  title: string
  subtitle: string
  message: string
}

export function StarterBubbles() {
  const router = useRouter();

  const bubbles: StarterBubble[] = [
    {
      title: "Check renewals",
      subtitle: "due soon",
      message: "Show me agreements that need to be renewed soon"
    },
    {
      title: "Send an NDA",
      subtitle: "to a new client",
      message: "I need to send the non-disclosure agreement template to a new client"
    },
    {
      title: "Send reminders",
      subtitle: "for unsigned documents",
      message: "Send reminders for documents that haven't been signed yet"
    }
  ];

  const handleBubbleClick = (message: string) => {
    router.push(`/chat?message=${encodeURIComponent(message)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 flex flex-wrap gap-3 justify-center">
      {bubbles.map((bubble, index) => (
        <button
          key={index}
          onClick={() => handleBubbleClick(bubble.message)}
          className="bg-white hover:bg-gray-50 border shadow-sm rounded-full px-4 py-2 text-left transition-all hover:shadow-md"
        >
          <div className="text-sm text-[#26065D]">{bubble.title}</div>
          <div className="text-xs text-gray-500 -mt-0.5">{bubble.subtitle}</div>
        </button>
      ))}
    </div>
  )
}

