// FILE PATH: src/app/api/analyze/wallet/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getWalletData, getRecentTransactions } from "@/lib/mantle"
import { analyzeWallet } from "@/lib/gemini"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/supabase"
import { isValidAddress } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || !isValidAddress(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    const cacheKey = `wallet:${address.toLowerCase()}`

    // Check cache first
    const cached = await getCachedAnalysis(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    // Check whether this is a contract before doing any further work — no point
    // fetching transaction logs or burning a Gemini call on data that will just
    // be discarded when the frontend redirects to the Contract Explainer.
    const walletData = await getWalletData(address as `0x${string}`)

    if (walletData.isContract) {
      const contractResult = {
        address,
        isContract: true,
        balance: walletData.balance,
        txCount: walletData.txCount,
        blockNumber: walletData.blockNumber,
        cached: false,
        analyzedAt: new Date().toISOString(),
      }
      // Cache this short-circuit result too, so re-checking the same address
      // within the cache window doesn't repeat the RPC round-trip either.
      await setCachedAnalysis(cacheKey, contractResult)
      return NextResponse.json(contractResult)
    }

    const txData = await getRecentTransactions(address as `0x${string}`)

    // Run AI analysis
    const aiAnalysis = await analyzeWallet({
      address,
      balance: walletData.balance,
      txCount: walletData.txCount,
      sentLogs: txData.sentLogs,
      receivedLogs: txData.receivedLogs,
    })

    // Build portfolio from balance (simplified - real impl would query token balances)
    const portfolio = [
      { symbol: "MNT", percentage: 100, value: `${parseFloat(walletData.balance).toFixed(4)} MNT`, color: "#00d4a8" },
    ]

    const result = {
      address,
      balance: walletData.balance,
      txCount: walletData.txCount,
      blockNumber: walletData.blockNumber,
      isContract: walletData.isContract,
      ...aiAnalysis,
      portfolio,
      cached: false,
      analyzedAt: new Date().toISOString(),
    }

    // Cache the result
    await setCachedAnalysis(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Wallet analysis error:", error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : undefined) || "Analysis failed" },
      { status: 500 }
    )
  } 
}
