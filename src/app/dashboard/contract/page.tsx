"use client"
import { Construction } from "lucide-react"
export default function Page() {
  const names: Record<string,string> = { contract: "Contract Explainer", watchlist: "Watchlist", reports: "Reports" }
  const name = names["contract"] || "contract"
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
      <div className="w-12 h-12 rounded-[8px] bg-[#161616] border border-[#262626] flex items-center justify-center">
        <Construction className="w-5 h-5 text-[#00d4a8]" />
      </div>
      <div>
        <p className="text-white font-bold text-[16px] capitalize mb-1">{name}</p>
        <p className="text-white/30 text-[13px]">This module is being built. Check back soon.</p>
      </div>
    </div>
  )
}
