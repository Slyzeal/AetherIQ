// FILE PATH: src/app/api/analyze/contract/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getContractData } from "@/lib/mantle"
import { analyzeContract } from "@/lib/gemini"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/supabase"
import { isValidAddress } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || !isValidAddress(address)) {
      return NextResponse.json({ error: "Invalid contract address" }, { status: 400 })
    }

    const cacheKey = `contract:${address.toLowerCase()}`
    const cached = await getCachedAnalysis(cacheKey)
    if (cached) return NextResponse.json({ ...cached, cached: true })

    const contractData = await getContractData(address as `0x${string}`)

    const aiAnalysis = await analyzeContract({
      address: contractData.address,
      bytecodeSizeBytes: contractData.bytecodeSizeBytes,
      capabilities: contractData.capabilities,
      isToken: contractData.isToken,
      tokenName: contractData.tokenInfo?.name,
      tokenSymbol: contractData.tokenInfo?.symbol,
      txCount: contractData.txCount,
    })

    const result = {
      address: contractData.address,
      bytecodeSizeBytes: contractData.bytecodeSizeBytes,
      capabilities: contractData.capabilities,
      isToken: contractData.isToken,
      tokenInfo: contractData.tokenInfo,
      txCount: contractData.txCount,
      blockNumber: contractData.blockNumber,
      ...aiAnalysis,
      cached: false,
      analyzedAt: new Date().toISOString(),
    }

    await setCachedAnalysis(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    // "no contract code" means the user pasted a regular wallet address here by mistake —
    // surface a clear, specific message rather than a generic failure.
    const message = error instanceof Error ? error.message : undefined
    const isNotAContract = message?.includes("no contract code")
    return NextResponse.json(
      { error: isNotAContract ? "This address is not a smart contract. Try the Wallet Analyzer instead." : (message || "Analysis failed") },
      { status: isNotAContract ? 400 : 500 }
    )
  }
}
