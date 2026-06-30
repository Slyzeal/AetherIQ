"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, Menu, Loader2 } from "lucide-react"
import { detectInputType } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const [query, setQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalyze = useCallback(() => {
    if (!query.trim()) return
    setIsAnalyzing(true)
    const type = detectInputType(query.trim())
    if (type === "transaction") {
      router.push(`/dashboard/transaction?hash=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(`/dashboard/wallet?address=${encodeURIComponent(query.trim())}`)
    }
    setTimeout(() => setIsAnalyzing(false), 2000)
  }, [query, router])

  return (
    <header
      className="h-14 border-b border-[#1e1e2e] flex items-center gap-3 px-4 lg:px-5 flex-shrink-0"
      style={{ background: 'rgba(4,4,10,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <button onClick={onMobileMenuToggle} className="lg:hidden p-2 text-white/40 hover:text-white transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-3 max-w-[560px]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-white/20 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Search or paste wallet / txn hash / token / contract…"
            className="w-full h-9 border border-[#1e1e2e] rounded-[6px] pl-8 pr-9 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00d4a8]/40 transition-colors"
            style={{ background: 'rgba(14,14,24,0.70)', backdropFilter: 'blur(8px)' }}
          />
          <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 border border-[#2a2a3a] rounded px-1 py-0.5">
            ⌘K
          </kbd>
        </div>
        <Button onClick={handleAnalyze} disabled={!query.trim() || isAnalyzing} className="flex-shrink-0 h-9 px-4 text-[13px]">
          {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Analyze"}
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div
          className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-[6px] border border-[#1e1e2e] text-[12px] text-white/50 cursor-pointer hover:border-[#2a2a3a] transition-colors"
          style={{ background: 'rgba(14,14,24,0.70)' }}
        >
          <div className="w-[6px] h-[6px] rounded-full bg-[#00d4a8] animate-blink" />
          <span className="hidden md:block">Mantle Mainnet</span>
          <ChevronDown className="w-3 h-3 text-white/25" />
        </div>
        <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
