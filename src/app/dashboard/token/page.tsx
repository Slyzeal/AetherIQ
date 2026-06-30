"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, ExternalLink, ArrowLeft, Shield, Coins } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TokenAnalysis } from "@/types"
import { truncateAddress } from "@/lib/utils"
import WarningCard from "@/components/dashboard/WarningCard"
import Link from "next/link"

function TokenContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get("address")
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (addr: string) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/analyze/token", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setAnalysis(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed") }
    finally { setLoading(false) }
  }

  useEffect(() => { if (address) fetchData(address) }, [address])

  if (!address) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <p className="text-white/30 text-[13px]">No token address provided.</p>
      <Link href="/dashboard"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Go back</Button></Link>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-7 h-7 text-[#00d4a8] animate-spin" />
      <p className="text-white font-semibold">Analyzing token…</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <div><p className="text-white font-semibold">Analysis Failed</p><p className="text-white/35 text-[13px] mt-1">{error}</p></div>
      <Button onClick={() => fetchData(address!)} size="sm">Try Again</Button>
    </div>
  )

  if (!analysis) return null

  const safetyColor = analysis.safetyScore >= 70 ? "#00d4a8" : analysis.safetyScore >= 40 ? "#f59e0b" : "#ef4444"

  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-3">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] rounded-[8px]">
        <div className="w-12 h-12 rounded-[8px] bg-[#1a0a3a] border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
          <Coins className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold">{analysis.name} <span className="text-white/40 font-normal">({analysis.symbol})</span></h1>
          <p className="text-white/30 text-[12px] font-mono mt-0.5">{truncateAddress(analysis.address, 8)}</p>
          <div className="flex gap-1.5 mt-2">
            <Badge variant={analysis.safetyScore >= 70 ? "green" : "orange"}>{analysis.contractSafety}</Badge>
            <Badge variant={analysis.ownershipStatus === "Renounced" ? "green" : "orange"}>{analysis.ownershipStatus}</Badge>
            <Badge variant="default">ERC-20</Badge>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[28px] font-extrabold tracking-[-1px]" style={{ color: safetyColor }}>
            {analysis.safetyScore}<span className="text-[14px] text-white/30 font-normal">/100</span>
          </p>
          <p className="text-white/30 text-[11px]">Safety Score</p>
        </div>
        <a href={`https://explorer.mantle.xyz/address/${address}`} target="_blank" rel="noopener noreferrer"
          className="text-white/25 hover:text-white/60 transition-colors ml-1">
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
          <CardContent>
            <p className="text-white/55 text-[13px] leading-[1.7] mb-4">{analysis.summary}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Contract Safety", value: analysis.contractSafety, good: analysis.contractSafety === "Safe" },
                { label: "Liquidity", value: analysis.liquidityHealth, good: analysis.liquidityHealth === "Healthy" },
                { label: "Ownership", value: analysis.ownershipStatus, good: analysis.ownershipStatus === "Renounced" },
                { label: "Risk Level", value: analysis.riskLevel, good: analysis.riskLevel === "Low" },
              ].map((item, i) => (
                <div key={i} className={`p-2.5 rounded-[6px] border ${item.good ? "bg-[#00d4a8]/05 border-[#00d4a8]/15" : "bg-orange-500/05 border-orange-500/15"}`}>
                  <p className="text-white/30 text-[10px] mb-0.5">{item.label}</p>
                  <p className={`text-[12px] font-semibold ${item.good ? "text-[#00d4a8]" : "text-orange-400"}`}>
                    {item.good ? "✓ " : "⚠ "}{item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader><CardTitle>Token Info</CardTitle></CardHeader>
            <CardContent className="space-y-[10px]">
              {[
                { label: "Name", value: analysis.name },
                { label: "Symbol", value: analysis.symbol, green: true },
                { label: "Decimals", value: String(analysis.decimals ?? 18) },
                { label: "Total Supply", value: parseFloat(analysis.totalSupply).toExponential(3) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-[9px] border-b border-[#1c1c1c] last:border-0 last:pb-0">
                  <span className="text-white/30 text-[12px]">{item.label}</span>
                  <span className={`text-[12px] ${item.green ? "text-[#00d4a8] font-semibold" : "text-white/55"}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {analysis.warnings?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3 text-orange-400" />Warnings</CardTitle></CardHeader>
              <CardContent className="pt-[10px]">
                {analysis.warnings.map((w, i) => <WarningCard key={i} warning={w} />)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TokenPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" /></div>}>
      <TokenContent />
    </Suspense>
  )
}
