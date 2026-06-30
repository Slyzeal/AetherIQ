// FILE PATH: src/app/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MessageSquare, Shield, Zap, Lock, Activity, Menu, X, Wallet, Coins, Star } from "lucide-react"

const featurePills = [
  { icon: Shield, label: "Real-time data", sub: "Live from chain" },
  { icon: Zap, label: "AI Powered", sub: "Gemini 2.5 Flash" },
  { icon: Lock, label: "Privacy First", sub: "We don't store your keys" },
  { icon: Activity, label: "50,000+", sub: "Analyses completed" },
]

// Concentric circles logo SVG
function LogoIcon({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="17.5" stroke="#00d4a8" strokeWidth="2" opacity="0.35"/>
      <circle cx="19" cy="19" r="12" stroke="#00d4a8" strokeWidth="2.2" opacity="0.6"/>
      <circle cx="19" cy="19" r="6.5" stroke="#00d4a8" strokeWidth="2.5"/>
      <circle cx="19" cy="19" r="2.5" fill="#00d4a8"/>
    </svg>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleAnalyze = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "transparent" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-[18px] border-b border-white/[0.06]"
        style={{ background: "rgba(8,8,15,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
          <LogoIcon size={38} />
          <span className="font-extrabold text-[20px] tracking-[-0.4px]">
            Aether<span className="text-[#00d4a8]">IQ</span>
          </span>
        </div>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center cursor-pointer border border-white/10 hover:bg-white/10 transition-colors"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <Menu className="w-5 h-5 text-white" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: "rgba(8,8,15,0.97)", backdropFilter: "blur(20px)" }}>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-[18px] right-5 w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer border border-white/15"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col gap-1 pt-20 px-7">
              {[
                { label: "Dashboard", icon: ArrowRight, href: "/dashboard" },
                { label: "Wallet Analyzer", icon: Wallet, href: "/dashboard/wallet" },
                { label: "Token Intelligence", icon: Coins, href: "/dashboard/token" },
                { label: "AI Chat", icon: MessageSquare, href: "/dashboard/chat" },
                { label: "Watchlist", icon: Star, href: "/dashboard/watchlist" },
              ].map((item) => (
                <button
                  key={item.href}
                  onClick={() => { setMenuOpen(false); router.push(item.href) }}
                  className="flex items-center gap-3 py-[14px] text-[17px] font-semibold text-white/80 hover:text-[#00d4a8] transition-colors border-b border-white/[0.06] text-left"
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="px-7 pb-7 mt-auto">
              <button
                onClick={() => { setMenuOpen(false); router.push("/dashboard/wallet") }}
                className="flex items-center justify-center gap-2.5 h-14 rounded-[14px] bg-[#00d4a8] text-black font-bold w-full"
              >
                Analyze a Wallet
                <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="px-6 pt-10 pb-8 text-center" style={{ background: "transparent" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full border border-white/10 mb-7"
            style={{ background: "rgba(255,255,255,0.07)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.7)" }}>
            <span className="w-[7px] h-[7px] rounded-full bg-[#00d4a8] animate-blink flex-shrink-0" />
            Live on Mantle Mainnet
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-[-2px] leading-[1.05] mb-5"
            style={{ fontSize: "clamp(40px,11vw,56px)" }}>
            Understand any<br />wallet in{" "}
            <span className="text-[#00d4a8]">seconds.</span>
          </h1>

          {/* Sub */}
          <p className="text-white/50 leading-[1.7] mx-auto mb-9"
            style={{ fontSize: 15, maxWidth: 340, fontWeight: 400 }}>
            AI-powered on-chain intelligence that turns blockchain data into clear, actionable insights.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mx-auto" style={{ maxWidth: 400 }}>
            <button
              onClick={handleAnalyze}
              className="flex items-center justify-center gap-2.5 h-14 rounded-[14px] bg-[#00d4a8] text-black font-bold hover:bg-[#00bfa0] transition-colors cursor-pointer"
              style={{ fontSize: 16 }}>
              Analyze Now
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => router.push("/dashboard/chat")}
              className="flex items-center justify-center gap-2.5 h-14 rounded-[14px] font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/15"
              style={{ fontSize: 16, background: "rgba(255,255,255,0.06)" }}>
              Try AI Chat
              <MessageSquare className="w-[18px] h-[18px]" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Feature pills */}
      <div className="relative">
        <div className="flex gap-2.5 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {featurePills.map((pill, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0 px-3.5 py-2.5 rounded-[12px] border border-white/[0.09]"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <pill.icon className="w-3.5 h-3.5 text-[#00d4a8]" />
              </div>
              <div>
                <p className="text-white font-bold leading-none" style={{ fontSize: 12 }}>{pill.label}</p>
                <p className="text-white/40 leading-none mt-1" style={{ fontSize: 11 }}>{pill.sub}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Fade hint indicating more content scrolls horizontally */}
        <div className="absolute right-0 top-0 bottom-1 w-8 pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent, #08080f)" }} />
      </div>

      {/* Dashboard preview card */}
      <div className="px-4 py-7">
        <div className="rounded-[24px] border border-white/10 p-5"
          style={{ background: "rgba(12,12,20,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>

          {/* Dashboard header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="font-extrabold text-[18px] tracking-[-0.3px] flex-shrink-0">Dashboard</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[10px] border border-white/12 font-semibold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap flex-shrink-0"
              style={{ fontSize: 12, color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.07)" }}>
              View full report
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Wallet + Score row */}
          <div className="grid gap-2.5 mb-2.5" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
            {/* Wallet Overview */}
            <div className="rounded-[16px] border border-white/[0.08] p-3.5 min-w-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-2.5 tracking-[.2px]">Wallet Overview</p>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-[10px] flex-shrink-0 border border-white/10 flex items-center justify-center" style={{ background: "#0f2a1f" }}>
                  <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: "pixelated" }}>
                    <rect width="8" height="8" fill="#0f2a1f"/>
                    <rect x="2" y="1" width="4" height="1" fill="#00d4a8"/>
                    <rect x="1" y="2" width="6" height="1" fill="#00d4a8"/>
                    <rect x="1" y="3" width="2" height="1" fill="#fff"/>
                    <rect x="5" y="3" width="2" height="1" fill="#fff"/>
                    <rect x="2" y="4" width="4" height="1" fill="#7c3aed"/>
                    <rect x="1" y="5" width="6" height="2" fill="#00d4a8"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[14px] font-mono tracking-tight truncate">0x8cF…3a9e</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-[#00d4a8]/15 text-[#00d4a8] whitespace-nowrap">Active</span>
                    <span className="text-[10px] font-semibold px-2 py-[2px] rounded-full text-white/60 whitespace-nowrap" style={{ background: "rgba(255,255,255,0.08)" }}>DeFi User</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-white/35">First seen 343d ago • Active 2m ago</p>
            </div>

            {/* Wallet Score */}
            <div className="rounded-[16px] border border-white/[0.08] p-3.5 flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-2 tracking-[.2px] self-start">Wallet Score</p>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#7c3aed" strokeWidth="7"
                  strokeDasharray="100 101" strokeDashoffset="0" transform="rotate(-90 40 40)"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#00d4a8" strokeWidth="7"
                  strokeDasharray="55 146" strokeDashoffset="-100" transform="rotate(-90 40 40)"/>
                <text x="40" y="36" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Manrope,sans-serif">78</text>
                <text x="40" y="48" textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="9" fontFamily="Manrope,sans-serif">/100</text>
              </svg>
              <p className="text-[13px] font-bold text-[#00d4a8] mt-1">Good</p>
            </div>
          </div>

          {/* Portfolio + Risk row */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5 mb-2.5">
            <div className="rounded-[16px] border border-white/[0.08] p-3.5 min-w-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-2 tracking-[.2px]">Portfolio Value</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-extrabold tracking-[-0.8px]" style={{ fontSize: 22 }}>$32,426.48</p>
                  <p className="text-[#00d4a8] text-[12px] font-semibold mt-1 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                    12.58% (24h)
                  </p>
                </div>
                <svg width="56" height="32" viewBox="0 0 60 36">
                  <polyline points="0,28 10,24 18,26 26,20 34,18 42,14 50,10 60,6" fill="none" stroke="#00d4a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="rounded-[16px] border border-white/[0.08] p-3.5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-1 tracking-[.2px]">Risk Overview</p>
              <p className="text-[14px] font-bold text-[#f59e0b] mb-2">Moderate Risk</p>
              <svg width="100%" height="48" viewBox="0 0 110 55">
                <path d="M 10 52 A 45 45 0 0 1 100 52" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" strokeLinecap="round"/>
                <path d="M 10 52 A 45 45 0 0 1 100 52" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" strokeDasharray="95 141"/>
                <line x1="55" y1="52" x2="55" y2="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="55" cy="52" r="3.5" fill="#f59e0b"/>
              </svg>
            </div>
          </div>

          {/* Ecosystem + Protocols row */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5">
            <div className="rounded-[16px] border border-white/[0.08] p-3.5 flex flex-col items-center min-w-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-2 tracking-[.2px] self-start w-full">Mantle Ecosystem Score</p>
              <svg width="84" height="84" viewBox="0 0 120 120">
                <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" fill="rgba(0,212,168,0.05)" stroke="rgba(0,212,168,0.3)" strokeWidth="1.5"/>
                <polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill="none" stroke="rgba(0,212,168,0.15)" strokeWidth="1" strokeDasharray="4 3"/>
                <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" fill="none" stroke="#00d4a8" strokeWidth="2.5" strokeDasharray="185 55"/>
                <circle cx="60" cy="6" r="3" fill="#00d4a8"/>
                <text x="60" y="57" textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="Manrope,sans-serif">82</text>
                <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="10" fontFamily="Manrope,sans-serif">/100</text>
              </svg>
              <p className="text-[12px] font-bold text-[#00d4a8] mt-1">Excellent</p>
            </div>

            <div className="rounded-[16px] border border-white/[0.08] p-3.5 min-w-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[11px] font-semibold text-white/45 mb-3 tracking-[.2px]">Top Protocol</p>
              {[
                { name: "LayerBank", pct: "26.7%", w: "78%", color: "#00d4a8" },
                { name: "Merchant Moe", pct: "18.1%", w: "53%", color: "#00d4a8" },
                { name: "iZiSwap", pct: "15.3%", w: "45%", color: "#00d4a8" },
                { name: "FusionX", pct: "11.6%", w: "34%", color: "#00d4a8" },
                { name: "Others", pct: "28.3%", w: "83%", color: "#6366f1" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-2 last:mb-0 min-w-0">
                  <div className="w-[16px] h-[16px] rounded-full flex-shrink-0 border border-white/10 flex items-center justify-center"
                    style={{ background: i === 0 ? "#0a2a3a" : i === 1 ? "#2a1a0a" : i === 2 ? "#0a1a3a" : i === 3 ? "#0a0a2a" : "#1a1a1a" }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                  </div>
                  <span className="text-[10px] text-white/70 truncate" style={{ minWidth: 0, flexBasis: "38%" }}>{p.name}</span>
                  <div className="h-[3px] rounded-full overflow-hidden flex-1 min-w-[12px]" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: p.w, background: p.color }} />
                  </div>
                  <span className="text-[10px] text-white/45 text-right flex-shrink-0" style={{ minWidth: 28 }}>{p.pct}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      {/* No "Trusted by" section */}
    </div>
  )
}
