"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpRight } from 'lucide-react'

const capabilities = [
  {
    category: "Templates & Documents",
    items: [
      "Send a document for signature",
      "Create a new agreement from scratch",
      "Use an existing template",
      "Track document status"
    ]
  },
  {
    category: "Bulk Operations",
    items: [
      "Send documents in bulk",
      "Monitor bulk sending progress",
      "View bulk operation history"
    ]
  },
  {
    category: "Document Management",
    items: [
      "View document details",
      "Download signed documents",
      "Void documents",
      "Send reminders"
    ]
  }
]

export function CapabilitiesSection() {
  const [isExpanded, setIsExpanded] = useState(false)

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
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-[#26065D] transition-colors group"
                  >
                    <span className="text-sm">{item}</span>
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

