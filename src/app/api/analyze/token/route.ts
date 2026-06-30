import { NextRequest, NextResponse } from "next/server"
import { getTokenInfo } from "@/lib/mantle"
import { analyzeToken } from "@/lib/gemini"
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/supabase"
import { isValidAddress } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || !isValidAddress(address)) {
      return NextResponse.json({ error: "Invalid token address" }, { status: 400 })
    }

    const cacheKey = `token:${address.toLowerCase()}`
    const cached = await getCachedAnalysis(cacheKey)
    if (cached) return NextResponse.json({ ...cached, cached: true })

    const tokenData = await getTokenInfo(address as `0x${string}`)
    const aiAnalysis = await analyzeToken(tokenData)

    const result = { ...tokenData, ...aiAnalysis, cached: false, analyzedAt: new Date().toISOString() }

    await setCachedAnalysis(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : undefined) || "Analysis failed" }, { status: 500 })
  }
}
