import { NextRequest, NextResponse } from "next/server"
import { chatWithAI } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 })
    }

    const response = await chatWithAI(messages, context)
    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : undefined) || "Chat failed" }, { status: 500 })
  }
}
