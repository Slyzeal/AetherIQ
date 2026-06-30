// FILE PATH: src/app/dashboard/contract/page.tsx

"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, ExternalLink, Copy, FileCode, Coins, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { truncateAddress } from "@/lib/utils"
import WarningCard from "@/components/dashboard/WarningCard"
import Link from "next/link"

interface ContractCapability {
  label: string
  risk: "high" | "medium" | "low"
} 

interface ContractAnalysis {
  address: string
  bytecodeSizeBytes: number
  capabilities: ContractCapability[]
  isToken: boolean
  tokenInfo: { name: string; symbol: string; decimals: number; totalSupply: string } | null
  txCount: number
  summary: string
  contractType: string
  safetyScore: number
  riskLevel: "Low" | "Moderate" | "High" | "Critical"
  warnings: { type: string; severity: "low" | "medium" | "high"; description: string }[]
}

const riskColor: Record<string, string> = {
  Low: "#00d4a8", Moderate: "#f59e0b", High: "#ef4444", Critical: "#ef4444",
}
const capabilityRiskColor: Record<string, string> = {
  low: "#00d4a8", medium: "#f59e0b", high: "#ef4444",
}

function ContractContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get("address")
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (addr: string) => {
    setLoading(true); setError(null); setAnalysis(null)
    try {
      const res = await fetch("/api/analyze/contract", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Analysis failed") }
      setAnalysis(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to analyze contract") }
    finally { setLoading(false) }
  }

  useEffect(() => { if (address) fetchData(address) }, [address])

  if (!address) return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
      <div className="w-12 h-12 rounded-[8px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] flex items-center justify-center">
        <FileCode className="w-5 h-5 text-[#00d4a8]" />
      </div>
      <div>
        <p className="text-white font-bold text-[16px] mb-1">Contract Explainer</p>
        <p className="text-white/30 text-[13px]">Paste a contract address to analyze.</p>
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-5">
      <div className="w-14 h-14 rounded-[10px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-[15px]">Analyzing contract…</p>
        <p className="text-white/30 text-[13px] mt-1">Reading bytecode and running AI analysis</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-12 h-12 rounded-[8px] bg-red-500/08 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="text-white font-semibold">Analysis Failed</p>
        <p className="text-white/35 text-[13px] mt-1 max-w-sm">{error}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => fetchData(address!)} size="sm">Try Again</Button>
        <Link href="/dashboard"><Button variant="outline" size="sm">Go Back</Button></Link>
      </div>
    </div>
  )

  if (!analysis) return null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[16px] font-bold font-mono tracking-tight truncate">{truncateAddress(analysis.address, 6)}</h1>
                <button onClick={() => navigator.clipboard.writeText(analysis.address)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a href={`https://explorer.mantle.xyz/address/${analysis.address}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-white/30 text-[11px] mt-0.5">Contract Address · Mantle Mainnet</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge variant="purple">{analysis.contractType}</Badge>
                {analysis.isToken && <Badge variant="blue">ERC-20</Badge>}
                <Badge variant="default">Smart Contract</Badge>
              </div>
            </div>
            <div className="flex gap-5 text-right flex-wrap">
              <div>
                <p className="text-white/30 text-[11px]">Bytecode Size</p>
                <p className="text-[13px] font-semibold mt-0.5">{analysis.bytecodeSizeBytes.toLocaleString()} bytes</p>
              </div>
              <div>
                <p className="text-white/30 text-[11px]">Transactions</p>
                <p className="text-[13px] font-semibold mt-0.5">{analysis.txCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>AI Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-[13px] text-white/55 leading-[1.7]">{analysis.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Safety Score</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="relative w-24 h-24">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke={riskColor[analysis.riskLevel] ?? "#00d4a8"} strokeWidth="7"
                    strokeDasharray={`${(analysis.safetyScore / 100) * 251} 251`} strokeLinecap="round"
                    transform="rotate(-90 48 48)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold">{analysis.safetyScore}</span>
                  <span className="text-[9px] text-white/30">/100</span>
                </div>
              </div>
              <p className="text-[13px] font-bold" style={{ color: riskColor[analysis.riskLevel] ?? "#00d4a8" }}>{analysis.riskLevel} Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-[#00d4a8]" />Detected Capabilities</CardTitle></CardHeader>
          <CardContent>
            {analysis.capabilities.length > 0 ? (
              <div className="space-y-2">
                {analysis.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-[6px] border border-[#1e1e2e]" style={{ background: "rgba(14,14,24,0.6)" }}>
                    <span className="text-[12px] text-white/70 font-mono truncate">{cap.label}</span>
                    <span className="text-[11px] font-semibold capitalize flex-shrink-0 ml-2" style={{ color: capabilityRiskColor[cap.risk] }}>{cap.risk}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-[13px] text-center py-6">
                None of the commonly-flagged functions were detected. This doesn&apos;t guarantee safety — only verified source code can confirm full contract behavior.
              </p>
            )}
          </CardContent>
        </Card>

        {analysis.isToken && analysis.tokenInfo ? (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-1.5"><Coins className="w-3 h-3 text-[#00d4a8]" />Token Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                ["Name", analysis.tokenInfo.name],
                ["Symbol", analysis.tokenInfo.symbol],
                ["Decimals", analysis.tokenInfo.decimals.toString()],
                ["Total Supply", analysis.tokenInfo.totalSupply],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-[12px]">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white/70 font-medium truncate ml-3">{value}</span>
                </div>
              ))}
              <Link href={`/dashboard/token?address=${encodeURIComponent(analysis.address)}`} className="block pt-1">
                <Button variant="outline" size="sm" className="w-full">Open Token Intelligence →</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>About This Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-white/30 text-[12px] leading-[1.6]">
                Capability detection scans the contract&apos;s raw bytecode for known function signatures — this works without verified source code, but can&apos;t see custom or obfuscated logic. Treat this as a starting signal, not a full audit.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {analysis.warnings?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Warnings</CardTitle></CardHeader>
          <CardContent className="pt-[10px]">
            {analysis.warnings.map((w, i) => <WarningCard key={i} warning={w} />)}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default function ContractPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" /></div>}>
      <ContractContent />
    </Suspense>
  )
}
