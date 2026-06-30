// FILE PATH: src/lib/gemini.ts

// gemini-1.5-flash was fully decommissioned by Google (all requests return 404).
// Using gemini-2.5-flash — current stable GA model as of mid-2026.
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> }
    finishReason: string
  }>
}

async function callGemini(prompt: string, systemPrompt?: string, responseSchema?: object): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Gemini API key not configured")

  const contents = systemPrompt
    ? [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will analyze blockchain data and respond as an expert blockchain intelligence analyst." }] },
        { role: "user", parts: [{ text: prompt }] },
      ]
    : [{ role: "user", parts: [{ text: prompt }] }]

  const generationConfig: Record<string, unknown> = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 3072,
  }

  // When a schema is provided, force Gemini to emit syntactically guaranteed valid JSON
  // matching that exact shape — this eliminates malformed-JSON parse failures at the source
  // instead of only cleaning up markdown fences after the fact.
  if (responseSchema) {
    generationConfig.responseMimeType = "application/json"
    generationConfig.responseSchema = responseSchema
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data: GeminiResponse = await response.json()
  const candidate = data.candidates[0]

  // A response cut off by the token limit will be incomplete JSON even with a schema
  // enforced — catch this explicitly so it degrades to the fallback cleanly instead of
  // throwing a confusing "Unterminated string" parse error deeper in the call stack.
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("Gemini response was truncated (MAX_TOKENS) before completing")
  }

  return candidate?.content?.parts[0]?.text || ""
}

const SYSTEM_PROMPT = `You are AetherIQ, an elite blockchain intelligence analyst specializing in the Mantle network. 
You transform raw on-chain data into clear, actionable intelligence written in plain English.
You write like a senior analyst at a top crypto research firm — confident, precise, insightful.
Always respond with valid JSON when asked for structured data.
Never say "I cannot" — always provide your best analysis based on available data.
Be specific, not generic. Reference actual numbers and patterns from the data provided.`

// Gemini structured-output schemas (https://ai.google.dev/gemini-api/docs/structured-output).
// Passing these via responseSchema forces the API itself to guarantee syntactically valid JSON
// matching this exact shape, rather than relying on the prompt instructions alone — this is
// what prevents "Unterminated string in JSON" / malformed-output parse failures.
const WALLET_ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    personality: { type: "STRING", enum: ["Whale", "Yield Farmer", "Diamond Hands", "Trader", "NFT Collector", "Liquidity Provider", "Protocol Explorer", "Memecoin Gambler", "New Wallet"] },
    walletScore: { type: "INTEGER" },
    ecosystemScore: { type: "INTEGER" },
    riskScore: { type: "INTEGER" },
    riskLevel: { type: "STRING", enum: ["Low", "Moderate", "High", "Critical"] },
    timeline: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { date: { type: "STRING" }, event: { type: "STRING" } }, required: ["date", "event"] },
    },
    warnings: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { type: { type: "STRING" }, severity: { type: "STRING", enum: ["low", "medium", "high"] }, description: { type: "STRING" } }, required: ["type", "severity", "description"] },
    },
    recommendations: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, priority: { type: "STRING", enum: ["low", "medium", "high"] } }, required: ["title", "description", "priority"] },
    },
    insights: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { label: { type: "STRING" }, value: { type: "STRING" } }, required: ["label", "value"] },
    },
    protocols: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { name: { type: "STRING" }, percentage: { type: "NUMBER" }, value: { type: "STRING" } }, required: ["name", "percentage", "value"] },
    },
  },
  required: ["summary", "personality", "walletScore", "ecosystemScore", "riskScore", "riskLevel", "timeline", "warnings", "recommendations", "insights", "protocols"],
}

const TRANSACTION_ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    type: { type: "STRING", enum: ["Transfer", "Swap", "Contract Interaction", "Contract Deployment", "Bridge", "Stake", "Unstake", "Claim Rewards", "Approve", "Mint", "Burn"] },
    explanation: { type: "STRING" },
    assetsTransferred: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { asset: { type: "STRING" }, amount: { type: "STRING" }, direction: { type: "STRING", enum: ["in", "out"] } }, required: ["asset", "amount", "direction"] },
    },
    protocolInvolved: { type: "STRING" },
    gasEfficiency: { type: "STRING", enum: ["Efficient", "Average", "Expensive"] },
    riskFlags: { type: "ARRAY", items: { type: "STRING" } },
    significance: { type: "STRING", enum: ["Low", "Medium", "High"] },
  },
  required: ["summary", "type", "explanation", "assetsTransferred", "protocolInvolved", "gasEfficiency", "riskFlags", "significance"],
}

const TOKEN_ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    safetyScore: { type: "INTEGER" },
    riskLevel: { type: "STRING", enum: ["Low", "Moderate", "High", "Critical"] },
    warnings: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { type: { type: "STRING" }, severity: { type: "STRING", enum: ["low", "medium", "high"] }, description: { type: "STRING" } }, required: ["type", "severity", "description"] },
    },
    contractSafety: { type: "STRING", enum: ["Safe", "Moderate Risk", "High Risk"] },
    liquidityHealth: { type: "STRING", enum: ["Healthy", "Moderate", "Low", "Unknown"] },
    ownershipStatus: { type: "STRING", enum: ["Renounced", "Centralized", "Decentralized", "Unknown"] },
    keyMetrics: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { label: { type: "STRING" }, value: { type: "STRING" } }, required: ["label", "value"] },
    },
  },
  required: ["summary", "safetyScore", "riskLevel", "warnings", "contractSafety", "liquidityHealth", "ownershipStatus", "keyMetrics"],
}

export async function analyzeWallet(walletData: {
  address: string
  balance: string
  txCount: number
  sentLogs: unknown[]
  receivedLogs: unknown[]
}) {
  const prompt = `Analyze this Mantle blockchain wallet and return a JSON object with exactly this structure:
{
  "summary": "2-3 sentence plain English summary of wallet behavior and strategy",
  "personality": "one of: Whale, Yield Farmer, Diamond Hands, Trader, NFT Collector, Liquidity Provider, Protocol Explorer, Memecoin Gambler, New Wallet",
  "walletScore": number between 0-100,
  "ecosystemScore": number between 0-100,
  "riskScore": number between 0-100,
  "riskLevel": "one of: Low, Moderate, High, Critical",
  "timeline": [
    {"date": "relative date like '3 weeks ago'", "event": "plain English description of what happened"}
  ],
  "warnings": [
    {"type": "warning type", "severity": "low|medium|high", "description": "plain English warning"}
  ],
  "recommendations": [
    {"title": "short title", "description": "actionable recommendation", "priority": "low|medium|high"}
  ],
  "insights": [
    {"label": "insight label", "value": "insight value"}
  ],
  "protocols": [
    {"name": "protocol name", "percentage": number, "value": "estimated USD value"}
  ]
}

Wallet Data:
- Address: ${walletData.address}
- MNT Balance: ${walletData.balance} MNT
- Total Transactions: ${walletData.txCount}
- Recent token transfers sent: ${walletData.sentLogs.length}
- Recent token transfers received: ${walletData.receivedLogs.length}

Return ONLY the JSON object, no markdown, no explanation.`

  try {
    const response = await callGemini(prompt, SYSTEM_PROMPT, WALLET_ANALYSIS_SCHEMA)
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch (error) {
    // Missing API key is a configuration error the operator must fix — surface it.
    if (error instanceof Error && error.message === "Gemini API key not configured") throw error
    // Any other failure (rate limit, network blip, malformed response) degrades gracefully.
    console.error("Gemini wallet analysis failed, using fallback:", error)
    return getDefaultWalletAnalysis(walletData)
  }
}

export async function analyzeTransaction(txData: {
  hash: string
  from: string
  to: string | null
  value: string
  gasUsed: string
  status: string
  timestamp: number
  input: string
}) {
  const isContractInteraction = txData.input && txData.input !== "0x"
  const prompt = `Analyze this Mantle blockchain transaction and return a JSON object:
{
  "summary": "1-2 sentence plain English explanation of what happened",
  "type": "one of: Transfer, Swap, Contract Interaction, Contract Deployment, Bridge, Stake, Unstake, Claim Rewards, Approve, Mint, Burn",
  "explanation": "detailed paragraph explaining what likely happened and why",
  "assetsTransferred": [{"asset": "asset name/symbol", "amount": "amount", "direction": "in|out"}],
  "protocolInvolved": "protocol name or 'Unknown'",
  "gasEfficiency": "Efficient|Average|Expensive",
  "riskFlags": ["any risk flags as strings"],
  "significance": "Low|Medium|High"
}

Transaction Data:
- Hash: ${txData.hash}
- From: ${txData.from}
- To: ${txData.to || "Contract Deployment"}
- Value: ${txData.value} MNT
- Gas Used: ${txData.gasUsed}
- Status: ${txData.status === "success" ? "Success" : "Failed"}
- Timestamp: ${new Date(txData.timestamp * 1000).toISOString()}
- Is Contract Interaction: ${isContractInteraction}
- Input Data: ${txData.input?.slice(0, 10) || "0x"}

Return ONLY the JSON object.`

  try {
    const response = await callGemini(prompt, SYSTEM_PROMPT, TRANSACTION_ANALYSIS_SCHEMA)
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch (error) {
    if (error instanceof Error && error.message === "Gemini API key not configured") throw error
    console.error("Gemini transaction analysis failed, using fallback:", error)
    return {
      summary: `${txData.status === "success" ? "Successful" : "Failed"} transaction ${isContractInteraction ? "interacting with a smart contract" : "transferring MNT"}.`,
      type: isContractInteraction ? "Contract Interaction" : "Transfer",
      explanation: `This transaction was sent from ${txData.from} and used ${txData.gasUsed} gas units.`,
      assetsTransferred: [{ asset: "MNT", amount: txData.value, direction: "out" }],
      protocolInvolved: "Unknown",
      gasEfficiency: "Average",
      riskFlags: [],
      significance: "Medium",
    }
  }
}

export async function analyzeToken(tokenData: {
  address: string
  name: string
  symbol: string
  totalSupply: string
  decimals: number
}) {
  const prompt = `Analyze this Mantle token and return a JSON object:
{
  "summary": "2-3 sentence analysis of this token",
  "safetyScore": number 0-100,
  "riskLevel": "Low|Moderate|High|Critical",
  "warnings": [{"type": "warning", "severity": "low|medium|high", "description": "description"}],
  "contractSafety": "Safe|Moderate Risk|High Risk",
  "liquidityHealth": "Healthy|Moderate|Low|Unknown",
  "ownershipStatus": "Renounced|Centralized|Decentralized|Unknown",
  "keyMetrics": [{"label": "metric", "value": "value"}]
}

Token Data:
- Address: ${tokenData.address}
- Name: ${tokenData.name}
- Symbol: ${tokenData.symbol}
- Total Supply: ${tokenData.totalSupply}
- Decimals: ${tokenData.decimals}

Return ONLY the JSON object.`

  try {
    const response = await callGemini(prompt, SYSTEM_PROMPT, TOKEN_ANALYSIS_SCHEMA)
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch (error) {
    if (error instanceof Error && error.message === "Gemini API key not configured") throw error
    console.error("Gemini token analysis failed, using fallback:", error)
    return {
      summary: `${tokenData.name} (${tokenData.symbol}) is a token on the Mantle network with a total supply of ${tokenData.totalSupply}.`,
      safetyScore: 50,
      riskLevel: "Moderate",
      warnings: [],
      contractSafety: "Moderate Risk",
      liquidityHealth: "Unknown",
      ownershipStatus: "Unknown",
      keyMetrics: [{ label: "Total Supply", value: tokenData.totalSupply }],
    }
  }
}

export async function chatWithAI(messages: Array<{ role: "user" | "assistant"; content: string }>, context?: string) {
  const contextPrefix = context ? `Context: ${context}\n\n` : ""
  const lastMessage = messages[messages.length - 1]
  
  const prompt = `${contextPrefix}User question: ${lastMessage.content}

Respond as AetherIQ blockchain intelligence assistant. Be helpful, specific, and concise.
Focus on Mantle blockchain data and DeFi concepts.
If you don't have specific data, explain what the data would reveal and how to interpret it.`

  return await callGemini(prompt, SYSTEM_PROMPT)
}

function getDefaultWalletAnalysis(walletData: { txCount: number; balance: string }) {
  const isActive = walletData.txCount > 50
  const hasBalance = parseFloat(walletData.balance) > 0
  
  return {
    summary: `This wallet has completed ${walletData.txCount} transactions on Mantle with a current balance of ${parseFloat(walletData.balance).toFixed(4)} MNT. ${isActive ? "The transaction history suggests an active participant in the Mantle ecosystem." : "Activity levels suggest an occasional user of the network."}`,
    personality: walletData.txCount > 100 ? "Protocol Explorer" : walletData.txCount > 20 ? "Trader" : "New Wallet",
    walletScore: Math.min(100, Math.max(10, walletData.txCount * 2 + (hasBalance ? 20 : 0))),
    ecosystemScore: Math.min(100, walletData.txCount),
    riskScore: 35,
    riskLevel: "Low",
    timeline: [{ date: "Recently", event: `Wallet has ${walletData.txCount} total transactions on Mantle` }],
    warnings: [],
    recommendations: [
      { title: "Explore DeFi", description: "Consider exploring Mantle's DeFi ecosystem including LayerBank and iZiSwap", priority: "low" }
    ],
    insights: [
      { label: "Transaction Count", value: walletData.txCount.toString() },
      { label: "MNT Balance", value: `${parseFloat(walletData.balance).toFixed(4)} MNT` },
    ],
    protocols: [],
  }
}
