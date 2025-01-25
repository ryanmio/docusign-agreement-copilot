import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "sent" | "delivered" | "completed" | "declined" | "voided"

interface LiveStatusBadgeProps {
  status?: StatusType
  className?: string
}

export function LiveStatusBadge({ status = "sent", className }: LiveStatusBadgeProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "sent":
        return "bg-[#4C00FF]/10 text-[#4C00FF]"
      case "delivered":
        return "bg-[#CBC2FF]/40 text-[#26065D]"
      case "completed":
        return "bg-[#00FF00]/10 text-[#008000]"
      case "declined":
      case "voided":
        return "bg-[#FF5252]/10 text-[#FF5252]"
      default:
        return "bg-[#130032]/10 text-[#130032]"
    }
  }

  const getDotColor = (status: StatusType) => {
    switch (status) {
      case "sent":
        return "bg-[#4C00FF]"
      case "delivered":
        return "bg-[#26065D]"
      case "completed":
        return "bg-[#008000]"
      case "declined":
      case "voided":
        return "bg-[#FF5252]"
      default:
        return "bg-[#130032]"
    }
  }

  const shouldPulse = (status: StatusType) => {
    return status === "sent" || status === "delivered"
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-4 py-1 rounded-full text-xs font-medium flex items-center gap-2",
        getStatusColor(status),
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {shouldPulse(status) ? (
          <>
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                getDotColor(status),
              )}
            />
            <span className={cn("relative inline-flex rounded-full h-2 w-2", getDotColor(status))} />
          </>
        ) : (
          <span className={cn("inline-flex rounded-full h-2 w-2", getDotColor(status))} />
        )}
      </span>
      {status}
    </Badge>
  )
}

