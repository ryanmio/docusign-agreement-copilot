"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const capabilities = [
  {
    category: "Templates & Documents",
    items: [
      {
        title: "Send a document for signature",
        message: "I want to send a document for signature"
      },
      {
        title: "Create a new agreement from scratch",
        message: "Help me create a new agreement from scratch"
      },
      {
        title: "Use an existing template",
        message: "I want to use one of my existing templates"
      },
      {
        title: "Track document status",
        message: "Show me the status of my documents"
      }
    ]
  },
  {
    category: "Bulk Operations",
    items: [
      {
        title: "Send documents in bulk",
        message: "I need to send multiple documents for signature"
      },
      {
        title: "Monitor bulk sending progress",
        message: "Show me the progress of my bulk sending operations"
      },
      {
        title: "View bulk operation history",
        message: "Show me my past bulk operations"
      }
    ]
  },
  {
    category: "Document Management",
    items: [
      {
        title: "View document details",
        message: "Show me details about my documents"
      },
      {
        title: "Download signed documents",
        message: "I want to download my signed documents"
      },
      {
        title: "Void documents",
        message: "I need to void a document"
      },
      {
        title: "Send reminders",
        message: "Send reminders for pending signatures"
      }
    ]
  }
]

export function CapabilitiesSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleCapabilityClick = (message: string) => {
    router.push(`/chat?message=${encodeURIComponent(message)}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 text-[#4C00FF] mb-4"
      >
        <span>Explore More Capabilities</span>
        <ChevronDown className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      
      {isExpanded && (
        <div className="w-full bg-white rounded-lg border shadow-lg p-4 space-y-6">
          {capabilities.map((category, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-medium text-[#130032]">{category.category}</h3>
              <ul className="space-y-2">
                {category.items.map((item, j) => (
                  <li 
                    key={j} 
                    onClick={() => handleCapabilityClick(item.message)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-[#26065D] transition-colors group"
                  >
                    <span className="text-sm">{item.title}</span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-[#4C00FF] transition-colors" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

