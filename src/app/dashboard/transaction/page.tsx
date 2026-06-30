"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, CheckCircle, XCircle, ExternalLink, ArrowLeft, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionAnalysis } from "@/types"
import { truncateAddress, timeAgo } from "@/lib/utils"
import Link from "next/link"

function TxContent() {
  const searchParams = useSearchParams()
  const hash = searchParams.get("hash")
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = async (h: string) => {
    setLoading(true); setError(null)
    try {
      const res = await window.fetch("/api/analyze/transaction", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: h }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setAnalysis(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed") }
    finally { setLoading(false) }
  }

  useEffect(() => { if (hash) fetch(hash) }, [hash])

  if (!hash) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <p className="text-white/30 text-[13px]">No transaction hash provided.</p>
      <Link href="/dashboard"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Go back</Button></Link>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-7 h-7 text-[#00d4a8] animate-spin" />
      <p className="text-white font-semibold">Decoding transaction…</p>
      <p className="text-white/30 text-[13px]">Fetching on-chain data and running AI analysis</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-12 h-12 rounded-[8px] bg-red-500/08 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div><p className="text-white font-semibold">Analysis Failed</p><p className="text-white/35 text-[13px] mt-1 max-w-sm">{error}</p></div>
      <div className="flex gap-2">
        <Button onClick={() => fetch(hash!)} size="sm">Try Again</Button>
        <Link href="/dashboard"><Button variant="outline" size="sm">Go Back</Button></Link>
      </div>
    </div>
  )

  if (!analysis) return null

  const isSuccess = analysis.status === "success"

  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-3">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] rounded-[8px]">
        <div className="flex items-center gap-3">
          {isSuccess
            ? <CheckCircle className="w-5 h-5 text-[#00d4a8]" />
            : <XCircle className="w-5 h-5 text-red-400" />}
          <div>
            <h1 className="text-[17px] font-bold">{analysis.type}</h1>
            <p className="text-white/30 text-[12px] font-mono mt-0.5">{truncateAddress(hash!, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isSuccess ? "green" : "red"}>{isSuccess ? "Success" : "Failed"}</Badge>
          <a href={`https://explorer.mantle.xyz/tx/${hash}`} target="_blank" rel="noopener noreferrer"
            className="text-white/25 hover:text-white/60 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#00d4a8]" />AI Explanation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-white/75 text-[14px] leading-[1.6] mb-3 font-medium">{analysis.summary}</p>
            <p className="text-white/40 text-[13px] leading-[1.65]">{analysis.explanation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transaction Details</CardTitle></CardHeader>
          <CardContent className="space-y-[10px]">
            {[
              { label: "From", value: truncateAddress(analysis.from, 8), mono: true },
              { label: "To", value: analysis.to ? truncateAddress(analysis.to, 8) : "Contract Deployment", mono: true },
              { label: "Value", value: `${parseFloat(analysis.value).toFixed(6)} MNT` },
              { label: "Gas Used", value: parseInt(analysis.gasUsed).toLocaleString() },
              { label: "Efficiency", value: analysis.gasEfficiency },
              { label: "Protocol", value: analysis.protocolInvolved },
              { label: "Time", value: analysis.timestamp ? timeAgo(analysis.timestamp) : "Unknown" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center pb-[9px] border-b border-[#1c1c1c] last:border-0 last:pb-0">
                <span className="text-white/30 text-[12px]">{item.label}</span>
                <span className={`text-white/65 text-[12px] ${item.mono ? "font-mono" : ""}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {analysis.assetsTransferred?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Assets Transferred</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {analysis.assetsTransferred.map((asset, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-[6px] border ${
                  asset.direction === "in" ? "bg-[#00d4a8]/05 border-[#00d4a8]/15" : "bg-red-500/05 border-red-500/15"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] font-mono ${asset.direction === "in" ? "text-[#00d4a8]" : "text-red-400"}`}>
                      {asset.direction === "in" ? "↓" : "↑"}
                    </span>
                    <span className="text-white/55 text-[13px]">{asset.asset}</span>
                  </div>
                  <span className={`text-[13px] font-semibold ${asset.direction === "in" ? "text-[#00d4a8]" : "text-red-400"}`}>
                    {asset.direction === "in" ? "+" : "−"}{asset.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Shield className="w-3 h-3" />Risk Analysis</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={analysis.significance === "High" ? "orange" : analysis.significance === "Low" ? "green" : "default"}>
                {analysis.significance} Significance
              </Badge>
            </div>
            {analysis.riskFlags?.length > 0 ? (
              <div className="space-y-2">
                {analysis.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-orange-400">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{flag}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#00d4a8] text-[13px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />No risk flags detected
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" /></div>}>
      <TxContent />
    </Suspense>
  )
}
