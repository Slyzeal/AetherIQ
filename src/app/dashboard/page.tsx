// FILE PATH: src/app/dashboard/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, Coins, ArrowLeftRight, FileCode, ArrowRight, Activity, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const quickActions = [
  { label: "Wallet", icon: Wallet, placeholder: "0x wallet address…", color: "#00d4a8", href: "/dashboard/wallet?address=" },
  { label: "Token", icon: Coins, placeholder: "Token contract 0x…", color: "#7c3aed", href: "/dashboard/token?address=" },
  { label: "Transaction", icon: ArrowLeftRight, placeholder: "0x tx hash (66 chars)…", color: "#f59e0b", href: "/dashboard/transaction?hash=" },
  { label: "Contract", icon: FileCode, placeholder: "Contract 0x…", color: "#3b82f6", href: "/dashboard/contract?address=" },
]

export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState(0)
  const [input, setInput] = useState("")
  const router = useRouter()

  const handleAnalyze = () => {
    if (!input.trim()) return
    router.push(`${quickActions[activeTab].href}${encodeURIComponent(input.trim())}`)
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-8 pb-8">
        <h1 className="text-[28px] font-extrabold tracking-[-1px] mb-2">What would you like to analyze?</h1>
        <p className="text-white/35 text-[14px]">Paste any wallet, token, transaction hash, or smart contract address.</p>
      </motion.div>

      {/* Type selector */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {quickActions.map((a, i) => (
          <button key={i} onClick={() => { setActiveTab(i); setInput("") }}
            className={`flex items-center gap-2 px-3.5 h-9 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer border ${
              activeTab === i
                ? "bg-[rgba(14,14,24,0.85)] text-white border-[#2a2a3a]"
                : "text-white/35 border-transparent hover:text-white/60 hover:bg-[rgba(14,14,24,0.85)] bg-transparent"
            }`}
          >
            <a.icon className="w-4 h-4" style={{ color: activeTab === i ? a.color : undefined }} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2.5 mb-8">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder={quickActions[activeTab].placeholder}
          className="flex-1 h-11 bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] rounded-[7px] px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00d4a8]/40 transition-colors"
        />
        <button onClick={handleAnalyze} disabled={!input.trim()}
          className="h-11 px-5 bg-[#00d4a8] text-black font-bold text-[13px] rounded-[7px] hover:bg-[#00bfa0] disabled:opacity-40 transition-colors flex items-center gap-2 flex-shrink-0 cursor-pointer">
          Analyze <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: Activity, label: "Live on Mantle", desc: "Real-time blockchain data", color: "#00d4a8" },
          { icon: Shield, label: "AI-Powered", desc: "Gemini 2.5 Flash analysis", color: "#7c3aed" },
          { icon: TrendingUp, label: "Zero Config", desc: "No wallet required", color: "#f59e0b" },
        ].map((item, i) => (
          <Card key={i} className="hover:border-[#2a2a3a] transition-colors">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="w-9 h-9 rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}10` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-white/70 text-[13px] font-semibold">{item.label}</p>
                <p className="text-white/30 text-[11px]">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickActions.map((a, i) => (
          <button key={i} onClick={() => { setActiveTab(i); setInput("") }}
            className="flex flex-col items-center gap-2 p-4 rounded-[8px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] hover:border-[#2a2a3a] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center" style={{ background: `${a.color}10` }}>
              <a.icon className="w-5 h-5" style={{ color: a.color }} />
            </div>
            <span className="text-white/40 text-[12px] group-hover:text-white/65 transition-colors">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
