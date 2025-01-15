"use client"

type StarterBubble = {
  title: string
  subtitle: string
  onClick: () => void
}

export function StarterBubbles() {
  const bubbles: StarterBubble[] = [
    {
      title: "Check renewals",
      subtitle: "expiring soon",
      onClick: () => console.log("Check renewals clicked")
    },
    {
      title: "Send an NDA",
      subtitle: "to a new client",
      onClick: () => console.log("Send NDA clicked")
    },
    {
      title: "Send reminders",
      subtitle: "for unsigned documents",
      onClick: () => console.log("Send reminders clicked")
    }
  ]

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 flex flex-wrap gap-3 justify-center">
      {bubbles.map((bubble, index) => (
        <button
          key={index}
          onClick={bubble.onClick}
          className="bg-white hover:bg-gray-50 border shadow-sm rounded-full px-4 py-2 text-left transition-all hover:shadow-md"
        >
          <div className="text-sm text-[#26065D]">{bubble.title}</div>
          <div className="text-xs text-gray-500 -mt-0.5">{bubble.subtitle}</div>
        </button>
      ))}
    </div>
  )
}

