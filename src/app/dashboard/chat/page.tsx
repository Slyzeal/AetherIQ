"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, Zap } from "lucide-react"
import { ChatMessage } from "@/types"

const suggestions = [
  "What is LayerBank on Mantle?",
  "How do I read a wallet's DeFi activity?",
  "What makes a smart contract dangerous?",
  "Explain Mantle's ecosystem",
  "What is a rug pull and how to detect one?",
  "What does high whale concentration mean?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm AetherIQ, your on-chain intelligence assistant for the Mantle blockchain. Ask me anything about wallets, transactions, tokens, DeFi protocols, or how to interpret blockchain data.",
    timestamp: new Date(),
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const send = async (content: string) => {
    if (!content.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: content.trim(), timestamp: new Date() }
    setMessages((p) => [...p, userMsg])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok) throw new Error("Chat failed")
      const data = await res.json()
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "assistant", content: data.response, timestamp: new Date() }])
    } catch {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting. Please check your API configuration and try again.", timestamp: new Date() }])
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-[700px] mx-auto flex flex-col h-[calc(100vh-9rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e1e2e]">
        <div className="w-9 h-9 rounded-[8px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] flex items-center justify-center">
          <Zap className="w-4 h-4 text-[#00d4a8]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-[15px]">AI Chat</h1>
          <p className="text-white/30 text-[11px]">Powered by Gemini 1.5 Flash · Mantle blockchain context</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[12px] text-[#00d4a8]">
          <div className="w-[6px] h-[6px] rounded-full bg-[#00d4a8] animate-blink" />
          Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                msg.role === "assistant" ? "bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] text-[#00d4a8]" : "bg-[#262626] text-white/50"}`}>
                {msg.role === "assistant" ? <Zap className="w-3.5 h-3.5" /> : "U"}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-[8px] text-[13px] leading-[1.65] ${
                msg.role === "user"
                  ? "bg-[rgba(14,14,24,0.85)] text-white/75 border border-[#1e1e2e]"
                  : "bg-[#00d4a8]/06 text-white/70 border border-[#00d4a8]/12"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-[6px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#00d4a8]" />
            </div>
            <div className="px-4 py-3 rounded-[8px] bg-[#00d4a8]/06 border border-[#00d4a8]/12">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00d4a8]/50"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-white/20 text-[11px] mb-2">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="text-[11px] text-white/40 hover:text-white border border-[#1e1e2e] hover:border-[#2a2a3a] px-3 py-1.5 rounded-full transition-all cursor-pointer bg-transparent">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask about any wallet, transaction, token, or DeFi concept…"
          disabled={loading}
          className="flex-1 h-11 bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e] rounded-[7px] px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00d4a8]/40 transition-colors disabled:opacity-40"
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          className="h-11 w-11 flex-shrink-0 bg-[#00d4a8] text-black rounded-[7px] flex items-center justify-center hover:bg-[#00bfa0] disabled:opacity-40 transition-colors cursor-pointer">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
