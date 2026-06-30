import { NextRequest, NextResponse } from "next/server"
import { getTransactionData } from "@/lib/mantle"
import { analyzeTransaction } from "@/lib/gemini"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/supabase"
import { isValidTxHash } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { hash } = await req.json()

    if (!hash || !isValidTxHash(hash)) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 })
    }

    const cacheKey = `tx:${hash.toLowerCase()}`
    const cached = await getCachedAnalysis(cacheKey)
    if (cached) return NextResponse.json({ ...cached, cached: true })

    const txData = await getTransactionData(hash as `0x${string}`)
    const aiAnalysis = await analyzeTransaction(txData)

    const result = {
      ...txData,
      ...aiAnalysis,
      cached: false,
      analyzedAt: new Date().toISOString(),
    }

    await setCachedAnalysis(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : undefined) || "Analysis failed" }, { status: 500 })
  }
}
