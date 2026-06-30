"use client"

import { motion } from "framer-motion"
import { Copy, ExternalLink, RefreshCw, Zap, Shield, AlertTriangle, TrendingUp, Activity, BarChart3, Clock, Gem, Target } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { WalletAnalysis } from "@/types"
import { truncateAddress } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ScoreRing from "./ScoreRing"
import RiskMeter from "./RiskMeter"
import WarningCard from "./WarningCard"

interface WalletDashboardProps {
  analysis: WalletAnalysis
  onRefresh: () => void
}

const COLORS = ["#00d4a8", "#7c3aed", "#f59e0b", "#3b82f6", "#6366f1", "#ec4899"]

const personalityVariant: Record<string, "green" | "purple" | "orange" | "blue" | "default"> = {
  "Whale": "blue", "Yield Farmer": "green", "Diamond Hands": "purple",
  "Trader": "orange", "Protocol Explorer": "green", "Liquidity Provider": "green",
  "NFT Collector": "purple", "Memecoin Gambler": "orange", "New Wallet": "default",
}

export default function WalletDashboard({ analysis, onRefresh }: WalletDashboardProps) {
  const portfolio = analysis.portfolio?.length
    ? analysis.portfolio
    : [{ symbol: "MNT", percentage: 100, value: `${parseFloat(analysis.balance).toFixed(4)} MNT`, color: "#00d4a8" }]

  const pieData = portfolio.map((item, i) => ({
    name: item.symbol,
    value: item.percentage,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="flex flex-col gap-3">
      {/* Wallet header bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 px-[18px] py-4 rounded-[8px] bg-[rgba(14,14,24,0.85)] border border-[#1e1e2e]"
      >
        {/* Pixel avatar */}
        <div className="w-12 h-12 rounded-[8px] bg-[#0f2a1f] border border-[#333] flex items-center justify-center flex-shrink-0">
          <svg width="36" height="36" viewBox="0 0 8 8" style={{ imageRendering: "pixelated" }}>
            <rect width="8" height="8" fill="#0f2a1f"/>
            <rect x="2" y="1" width="4" height="1" fill="#00d4a8"/>
            <rect x="1" y="2" width="6" height="1" fill="#00d4a8"/>
            <rect x="1" y="3" width="2" height="1" fill="#fff"/>
            <rect x="5" y="3" width="2" height="1" fill="#fff"/>
            <rect x="2" y="4" width="4" height="1" fill="#7c3aed"/>
            <rect x="1" y="5" width="6" height="2" fill="#00d4a8"/>
            <rect x="2" y="7" width="1" height="1" fill="#00d4a8"/>
            <rect x="5" y="7" width="1" height="1" fill="#00d4a8"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-mono font-bold text-[17px] tracking-tight">
              {truncateAddress(analysis.address, 6)}
            </h2>
            <button onClick={() => navigator.clipboard.writeText(analysis.address)}
              className="text-white/25 hover:text-white/60 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <a href={`https://explorer.mantle.xyz/address/${analysis.address}`}
              target="_blank" rel="noopener noreferrer"
              className="text-white/25 hover:text-[#00d4a8] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-white/30 text-[11px] mt-0.5">Wallet Address · Mantle Mainnet</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <Badge variant={personalityVariant[analysis.personality] ?? "default"}>{analysis.personality}</Badge>
            <Badge variant="green">Active</Badge>
            <Badge variant="default">EOA</Badge>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:text-right">
          <div>
            <p className="text-white/30 text-[11px]">Transactions</p>
            <p className="text-white font-semibold text-[13px] mt-0.5">{analysis.txCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/30 text-[11px]">MNT Balance</p>
            <p className="text-white font-semibold text-[13px] mt-0.5">{parseFloat(analysis.balance).toFixed(4)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left col */}
        <div className="lg:col-span-2 flex flex-col gap-3">

          {/* Row 1: AI Summary + scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#00d4a8]" /> AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/55 text-[13px] leading-[1.72]">{analysis.summary}</p>
                <p className="text-white/20 text-[11px] mt-3">Just analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Wallet Score</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-2 pb-4">
                <ScoreRing
                  score={analysis.walletScore}
                  size={100}
                  color="#00d4a8"
                  secondaryColor="#7c3aed"
                  label={analysis.walletScore >= 75 ? "Good" : analysis.walletScore >= 50 ? "Average" : "Low"}
                  sublabel="Healthy activity and risk profile."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Mantle Ecosystem Score</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-2 pb-4">
                {/* Hexagon score */}
                <div className="flex flex-col items-center gap-2">
                  <svg width="100" height="100" viewBox="0 0 110 110">
                    <polygon points="55,6 99,30.5 99,79.5 55,104 11,79.5 11,30.5"
                      fill="#0f2a1f" stroke="rgba(0,212,168,0.15)" strokeWidth="1.5" />
                    <polygon points="55,6 99,30.5 99,79.5 55,104 11,79.5 11,30.5"
                      fill="none" stroke="#00d4a8" strokeWidth="5"
                      strokeDasharray={`${(analysis.ecosystemScore / 100) * 225} 225`} />
                    <text x="55" y="50" textAnchor="middle" fill="white"
                      fontSize="24" fontWeight="800" fontFamily="-apple-system,sans-serif">
                      {analysis.ecosystemScore}
                    </text>
                    <text x="55" y="64" textAnchor="middle" fill="rgba(255,255,255,0.3)"
                      fontSize="11" fontFamily="-apple-system,sans-serif">/100</text>
                  </svg>
                  <p className="text-[13px] font-bold text-[#00d4a8]">
                    {analysis.ecosystemScore >= 75 ? "Excellent" : analysis.ecosystemScore >= 50 ? "Good" : "Developing"}
                  </p>
                  <p className="text-[11px] text-white/30 text-center leading-[1.4] max-w-[120px]">
                    {analysis.ecosystemScore >= 75 ? "Highly active across Mantle ecosystem." : "Growing Mantle participation."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Portfolio + Protocols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <a href="#" className="text-[12px] text-[#00d4a8] hover:underline">View Portfolio →</a>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-[104px] h-[104px] flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#161616", border: "1px solid #262626", borderRadius: 6, fontSize: 11 }}
                          formatter={(v) => [`${v}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-bold leading-none">{parseFloat(analysis.balance).toFixed(2)} MNT</p>
                      <p className="text-[9px] text-white/30 mt-0.5">Balance</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[7px] flex-1 min-w-0">
                    {portfolio.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center text-[11px]">
                        <div className="w-[7px] h-[7px] rounded-full flex-shrink-0 mr-[7px]"
                          style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-white/55 flex-1 truncate">{item.symbol}</span>
                        <span className="text-white/30">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protocol Distribution</CardTitle>
                <a href="#" className="text-[12px] text-[#00d4a8] hover:underline">View all →</a>
              </CardHeader>
              <CardContent>
                {analysis.protocols?.length > 0 ? (
                  <div className="space-y-[10px]">
                    {analysis.protocols.slice(0, 5).map((proto, i) => (
                      <div key={i}>
                        <div className="flex items-center mb-1">
                          <span className="text-[12px] text-white/55 flex-1">{proto.name}</span>
                          <span className="text-[11px] text-white/30">{proto.percentage}%</span>
                        </div>
                        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${proto.percentage}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/25 text-[13px] text-center py-6">No protocol data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline — horizontal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#00d4a8]" /> Activity Timeline
              </CardTitle>
              <a href="#" className="text-[12px] text-[#00d4a8] hover:underline">View all →</a>
            </CardHeader>
            <CardContent className="pt-[10px]">
              {analysis.timeline?.length > 0 ? (
                <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
                  <div className="flex relative min-w-max" style={{ paddingTop: "10px" }}>
                    {/* Timeline line */}
                    <div className="absolute left-6 right-6 top-[18px] h-px bg-[#262626]" />
                    {analysis.timeline.map((event, i) => (
                      <div key={i} className="flex flex-col items-center w-[130px] relative">
                        <div className="w-[9px] h-[9px] rounded-full border-2 border-[#00d4a8] bg-[rgba(4,4,10,0.9)] mb-[10px] z-10" />
                        <p className="text-[10px] font-bold text-[#00d4a8] mb-[3px] tracking-[0.3px]">{event.date}</p>
                        <p className="text-[11px] text-white/35 text-center leading-[1.5] px-[6px]">{event.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/25 text-[13px] text-center py-6">No timeline data</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-[#00d4a8]" /> AI Recommendations
                </CardTitle>
                <span className="text-white/20 text-[11px]">Based on wallet activity</span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i}
                      className="p-3 rounded-[6px] bg-[rgba(4,4,10,0.9)] border border-[#1e1e2e] hover:border-[#333] cursor-pointer transition-colors group">
                      <div className="w-[5px] h-[5px] rounded-full mb-2"
                        style={{ background: rec.priority === "high" ? "#f59e0b" : rec.priority === "medium" ? "#f59e0b" : "#00d4a8" }} />
                      <p className="text-[12px] font-semibold text-[#00d4a8] mb-1">{rec.title}</p>
                      <p className="text-[11px] text-white/35 leading-[1.5]">{rec.description}</p>
                      <p className="text-[11px] text-white/20 mt-1.5">→</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3">
          {/* Risk Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Risk Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <RiskMeter score={analysis.riskScore} level={analysis.riskLevel} />
              <p className="text-[11px] text-white/30">{analysis.warnings?.length || 0} issues detected</p>
              <div className="w-full space-y-[7px]">
                <div className="flex justify-between">
                  <span className="text-[12px] text-white/35">Smart contract exposure</span>
                  <span className="text-[12px] font-semibold text-[#f59e0b]">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-white/35">Whale interaction</span>
                  <span className="text-[12px] font-semibold text-[#00d4a8]">Low</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-white/35">Liquidity risk</span>
                  <span className="text-[12px] font-semibold text-[#f59e0b]">Medium</span>
                </div>
              </div>
              <button className="w-full py-2 text-[12px] text-white/35 border border-[#1e1e2e] rounded-[6px] hover:text-white hover:border-[#333] transition-all">
                View Full Risk Report
              </button>
            </CardContent>
          </Card>

          {/* Top Warnings */}
          {analysis.warnings?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-orange-400" /> Top Warnings
                </CardTitle>
                <a href="#" className="text-[12px] text-[#00d4a8] hover:underline">View all</a>
              </CardHeader>
              <CardContent className="pt-[10px]">
                {analysis.warnings.slice(0, 3).map((w, i) => <WarningCard key={i} warning={w} />)}
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {analysis.insights?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#00d4a8]" /> AI Insights
                </CardTitle>
                <a href="#" className="text-[12px] text-[#00d4a8] hover:underline">View all</a>
              </CardHeader>
              <CardContent className="pt-[10px] space-y-3">
                {analysis.insights.map((ins, i) => {
                  const InsightIcon = [BarChart3, Clock, Gem, Target][i % 4]
                  return (
                  <div key={i} className="flex items-start gap-[10px]">
                    <div className="w-[26px] h-[26px] rounded-[5px] bg-[rgba(4,4,10,0.9)] border border-[#1e1e2e] flex items-center justify-center flex-shrink-0">
                      <InsightIcon className="w-3 h-3 text-white/50" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-white/55">{ins.label}</p>
                      <p className="text-[11px] text-white/30 mt-[1px]">{ins.value}</p>
                    </div>
                  </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
