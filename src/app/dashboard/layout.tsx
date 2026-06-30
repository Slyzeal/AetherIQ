"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { label: "Wallet", href: "/dashboard/wallet" },
  { label: "Token", href: "/dashboard/token" },
  { label: "Transaction", href: "/dashboard/transaction" },
  { label: "Contract", href: "/dashboard/contract" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "transparent" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "transparent" }}>
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <div
          className="flex border-b border-[#1e1e2e] flex-shrink-0 px-5 overflow-x-auto"
          style={{ background: "rgba(4,4,10,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-5" style={{ background: "transparent" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
