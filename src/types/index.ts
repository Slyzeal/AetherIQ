// FILE PATH: src/types/index.ts

export interface WalletAnalysis {
  address: string
  balance: string
  txCount: number
  isContract?: boolean
  summary: string
  personality: string
  walletScore: number
  ecosystemScore: number
  riskScore: number
  riskLevel: "Low" | "Moderate" | "High" | "Critical"
  timeline: TimelineEvent[]
  warnings: Warning[]
  recommendations: Recommendation[]
  insights: Insight[]
  protocols: Protocol[]
  portfolio: PortfolioItem[]
}

export interface TimelineEvent {
  date: string
  event: string
}

export interface Warning {
  type: string
  severity: "low" | "medium" | "high"
  description: string
}

export interface Recommendation {
  title: string
  description: string
  priority: "low" | "medium" | "high"
}

export interface Insight {
  label: string
  value: string
}

export interface Protocol {
  name: string
  percentage: number
  value: string
}

export interface PortfolioItem {
  symbol: string
  percentage: number
  value: string
  color: string
}

export interface TransactionAnalysis {
  hash: string
  from: string
  to: string | null
  value: string
  gasUsed: string
  status: string
  timestamp: number
  summary: string
  type: string
  explanation: string
  assetsTransferred: AssetTransfer[]
  protocolInvolved: string
  gasEfficiency: string
  riskFlags: string[]
  significance: string
}

export interface AssetTransfer {
  asset: string
  amount: string
  direction: "in" | "out"
}

export interface TokenAnalysis {
  address: string
  name: string
  symbol: string
  totalSupply: string
  summary: string
  safetyScore: number
  riskLevel: string
  warnings: Warning[]
  contractSafety: string
  liquidityHealth: string
  ownershipStatus: string
  decimals?: number
  keyMetrics: Insight[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
} 

export type AnalysisType = "wallet" | "transaction" | "token" | "contract" | "unknown"
