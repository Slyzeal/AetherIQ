"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Wallet, Coins, ArrowLeftRight, FileCode,
  MessageSquare, Star, FileText, ChevronRight, ChevronLeft, X
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    section: "ANALYZE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Wallet Analyzer", icon: Wallet, href: "/dashboard/wallet" },
      { label: "Token Intelligence", icon: Coins, href: "/dashboard/token" },
      { label: "Transaction Decoder", icon: ArrowLeftRight, href: "/dashboard/transaction" },
      { label: "Contract Explainer", icon: FileCode, href: "/dashboard/contract" },
    ],
  },
  {
    section: "TOOLS",
    items: [
      { label: "AI Chat", icon: MessageSquare, href: "/dashboard/chat" },
      { label: "Watchlist", icon: Star, href: "/dashboard/watchlist" },
      { label: "Reports", icon: FileText, href: "/dashboard/reports" },
    ],
  },
]

function LogoIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className="flex-shrink-0">
      <circle cx="19" cy="19" r="17.5" stroke="#00d4a8" strokeWidth="2" opacity="0.35" />
      <circle cx="19" cy="19" r="12" stroke="#00d4a8" strokeWidth="2.2" opacity="0.6" />
      <circle cx="19" cy="19" r="6.5" stroke="#00d4a8" strokeWidth="2.5" />
      <circle cx="19" cy="19" r="2.5" fill="#00d4a8" />
    </svg>
  )
}

const sidebarStyle = {
  background: "rgba(4,4,10,0.92)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
}

function NavContent({ onClose, collapsed }: { onClose: () => void; collapsed: boolean }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      <div className={cn("h-14 flex items-center gap-3 border-b border-[#1e1e2e] flex-shrink-0", collapsed ? "justify-center px-2" : "px-4")}>
        <LogoIcon size={26} />
        {!collapsed && (
          <span className="font-bold text-[16px] tracking-tight whitespace-nowrap">
            Aether<span className="text-[#00d4a8]">IQ</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-bold tracking-[1.5px] text-white/20 px-3 mb-1 mt-3 first:mt-0 uppercase">
                {section.section}
              </p>
            )}
            <ul className="space-y-px">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-[10px] px-3 py-[9px] rounded-[6px] text-[13px] font-medium transition-all duration-150 border-l-2",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "text-[#00d4a8] bg-[#00d4a8]/10 border-l-[#00d4a8]"
                          : "text-white/35 hover:text-white/65 hover:bg-white/5 border-l-transparent"
                      )}
                    >
                      <item.icon className={cn("w-[15px] h-[15px] flex-shrink-0", isActive ? "opacity-100" : "opacity-50")} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="mx-2 mb-2 p-3 rounded-[6px]" style={{ background: "rgba(0,212,168,0.07)", border: "1px solid rgba(0,212,168,0.15)" }}>
          <p className="text-[12px] font-semibold mb-1">Try AI Chat</p>
          <p className="text-white/35 text-[11px] leading-[1.5] mb-2">Ask anything about blockchain data in natural language.</p>
          <Link href="/dashboard/chat" onClick={onClose} className="text-[#00d4a8] text-[11px] font-semibold flex items-center gap-1 hover:underline">
            Start Chat <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className={cn("py-3 border-t border-[#1e1e2e] flex items-center gap-[10px] flex-shrink-0", collapsed ? "justify-center px-2" : "px-4")}>
        <div className="w-[7px] h-[7px] rounded-full bg-[#00d4a8] animate-blink flex-shrink-0" />
        {!collapsed && (
          <div>
            <p className="text-[12px] font-semibold font-mono">0x8cF…3a9e</p>
            <p className="text-[11px] text-white/35">Connected</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <>
      {/*
        Desktop collapsible sidebar.
        Fully hidden below lg breakpoint (1024px) — on mobile/tablet the sidebar
        takes zero layout space. It is only ever summoned via the hamburger drawer below.
      */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 220 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 border-r border-[#1e1e2e] h-screen overflow-hidden relative"
        style={sidebarStyle}
      >
        <NavContent onClose={() => {}} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-[#161616] border border-[#2a2a3a] flex items-center justify-center text-white/40 hover:text-white hover:border-[#00d4a8]/40 transition-all z-10"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>

      {/* Mobile/tablet drawer — fully off-canvas, summoned only by the hamburger button */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/70 z-[90]"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden fixed left-0 top-0 h-full w-[240px] max-w-[80vw] border-r border-[#1e1e2e] z-[100] flex flex-col"
              style={{ background: "rgba(4,4,10,0.98)" }}
            >
              <button onClick={onMobileClose} className="absolute top-4 right-3 p-1.5 text-white/40 hover:text-white z-10">
                <X className="w-5 h-5" />
              </button>
              <NavContent onClose={onMobileClose} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
