"use client"

import { useState, Suspense } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

const tabs = [
  { label: "Wallet", href: "/dashboard/wallet", param: "address" },
  { label: "Token", href: "/dashboard/token", param: "address" },
  { label: "Transaction", href: "/dashboard/transaction", param: "hash" },
  { label: "Contract", href: "/dashboard/contract", param: "address" },
]

// Carry the currently-viewed address/hash across tabs so switching doesn't lose context.
// Isolated in its own component + Suspense boundary since useSearchParams requires one
// in the App Router, and we don't want every other dashboard page (chat, watchlist, etc.)
// to be forced into client-only rendering just because this layout needs it.
function TabBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentValue = searchParams.get("address") || searchParams.get("hash") || ""

  return (
    <div
      className="flex border-b border-[#1e1e2e] flex-shrink-0 px-5 overflow-x-auto"
      style={{ background: "rgba(4,4,10,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        const href = currentValue ? `${tab.href}?${tab.param}=${encodeURIComponent(currentValue)}` : tab.href
        return (
          <Link
            key={tab.href}
            href={href}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
              isActive
                ? "text-[#00d4a8] border-[#00d4a8]"
                : "text-white/35 border-transparent hover:text-white/65 hover:border-white/20"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "transparent" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "transparent" }}>
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <Suspense fallback={<div className="h-[45px] border-b border-[#1e1e2e] flex-shrink-0" />}>
          <TabBar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-4 lg:p-5" style={{ background: "transparent" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
