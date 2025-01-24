"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const capabilities = [
  {
    category: "Send & Sign",
    items: [
      {
        title: "Send template to recipients",
        message: "I need to send our standard NDA template to Acme Corp. Please help me send it to their team."
      },
      {
        title: "Send documents in bulk",
        message: "I need to send our Q1 vendor renewals to multiple recipients. Help me set up a bulk send."
      },
      {
        title: "Monitor bulk send progress",
        message: "Show me the status of my recent bulk send operation for Q1 contract renewals"
      },
      {
        title: "Sign a document",
        message: "Show me the agreements waiting for my signature, prioritizing the most urgent ones first"
      }
    ]
  },
  {
    category: "Track & Manage",
    items: [
      {
        title: "Check urgent agreements",
        message: "Which agreements need my attention today?"
      },
      {
        title: "View renewal deadlines",
        message: "Show me agreements that need renewal soon"
      },
      {
        title: "Send signing reminders",
        message: "I want to view documents waiting for signature and send reminders"
      },
      {
        title: "View document details",
        message: "Show me the details and status of my recent agreements"
      }
    ]
  },
  {
    category: "AI Analysis",
    items: [
      {
        title: "Calculate contract values",
        message: "Calculate the total of a 15 percent commission on 847632 plus an annual fee of 25000"
      },
      {
        title: "Analyze agreements",
        message: "Analyze the payment terms in our recent agreements with Acme Corp with a pie chart"
      },
      {
        title: "Find related documents",
        message: "Find all agreements related to Acme Corp"
      },
      {
        title: "Detect patterns",
        message: "What are the common patterns in our agreement workflows?"
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