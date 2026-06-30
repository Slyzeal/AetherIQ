import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

// Self-hosted Manrope (OFL licensed) — zero network dependency at build time,
// works identically in restricted CI environments and on Vercel.
const manrope = localFont({
  src: [
    { path: "../fonts/Manrope-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Manrope-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Manrope-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Manrope-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Manrope-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "AetherIQ — AI-Powered On-Chain Intelligence",
  description: "See Beyond the Blockchain. Paste any wallet, token, transaction, or smart contract and instantly understand what is happening on-chain through AI.",
  keywords: ["Mantle", "blockchain", "AI", "DeFi", "wallet analysis"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className={`${manrope.className} text-white antialiased`}>{children}</body>
    </html>
  )
}
