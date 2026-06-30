// FILE PATH: src/app/dashboard/wallet/page.tsx

"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import WalletDashboard from "@/components/dashboard/WalletDashboard"
import { WalletAnalysis } from "@/types"
import Link from "next/link"

function WalletContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get("address")
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = async (addr: string) => {
    setLoading(true); setError(null); setAnalysis(null)
    try {
      const res = await fetch("/api/analyze/wallet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Analysis failed") }
      setAnalysis(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to analyze wallet") }
    finally { setLoading(false) }
  }

  useEffect(() => { if (address) fetchAnalysis(address) }, [address])

  if (!address) return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
      <p className="text-white/30 text-[13px]">No wallet address provided.</p>
      <Link href="/dashboard"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Go back</Button></Link>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-5">
      <div className="w-14 h-14 rounded-[10px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-[15px]">Analyzing wallet…</p>
        <p className="text-white/30 text-[13px] mt-1">Fetching on-chain data and running AI analysis</p>
      </div>
      <div className="flex flex-col gap-1 text-center">
        {["Connecting to Mantle RPC…", "Fetching transaction history…", "Running AI analysis…"].map((step, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.2 }}
            className="text-[12px] text-white/20">{step}</motion.p>
        ))}
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
        <Button onClick={() => fetchAnalysis(address!)} size="sm">Try Again</Button>
        <Link href="/dashboard"><Button variant="outline" size="sm">Go Back</Button></Link>
      </div>
    </div>
  )

  if (!analysis) return null
  return (
    <>
      {analysis.isContract && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[8px] border border-[#7c3aed]/25 bg-[#7c3aed]/06 px-4 py-3 flex-wrap">
          <p className="text-[13px] text-purple-300">
            This address is a smart contract, not a regular wallet. For contract-specific analysis (capabilities, deployment info, safety signals), try the dedicated view.
          </p>
          <Link href={`/dashboard/contract?address=${encodeURIComponent(address!)}`}>
            <Button variant="outline" size="sm" className="border-[#7c3aed]/40 text-purple-300 hover:bg-[#7c3aed]/10 flex-shrink-0">
              Open Contract Explainer
            </Button>
          </Link>
        </div>
      )}
      <WalletDashboard analysis={analysis} onRefresh={() => fetchAnalysis(address!)} />
    </>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#00d4a8] animate-spin" /></div>}>
      <WalletContent />
    </Suspense>
  )
}
