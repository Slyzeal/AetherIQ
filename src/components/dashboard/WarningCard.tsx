"use client"

import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { Warning } from "@/types"
import { cn } from "@/lib/utils"

export default function WarningCard({ warning }: { warning: Warning }) {
  const config = {
    high: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/05 border-red-500/20" },
    medium: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/05 border-orange-500/20" },
    low: { icon: Info, color: "text-yellow-400", bg: "bg-yellow-500/05 border-yellow-500/15" },
  }
  const { icon: Icon, color, bg } = config[warning.severity] || config.low

  return (
    <div className={cn("flex gap-[9px] p-[10px] rounded-[6px] border mb-[6px] last:mb-0", bg)}>
      <div className={cn("w-[26px] h-[26px] rounded-[5px] flex items-center justify-center flex-shrink-0",
        warning.severity === "high" ? "bg-red-500/10" : warning.severity === "medium" ? "bg-orange-500/10" : "bg-yellow-500/08"
      )}>
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div>
        <p className={cn("text-[11px] font-semibold", color)}>{warning.type}</p>
        <p className="text-[10px] text-white/35 mt-[1px]">{warning.description}</p>
      </div>
    </div>
  )
}
