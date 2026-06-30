// FILE PATH: src/lib/mantle.ts

import { createPublicClient, http, formatEther, formatUnits, parseAbiItem, type Chain } from "viem"

export const mantleChain = {
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || "https://rpc.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Explorer", url: "https://explorer.mantle.xyz" },
  },
}

export const publicClient = createPublicClient({
  chain: mantleChain as Chain,
  transport: http(process.env.NEXT_PUBLIC_MANTLE_RPC_URL || "https://rpc.mantle.xyz"),
})

export const ERC20_ABI = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const

// Detects whether an address is a smart contract or a regular wallet (EOA).
// Uses eth_getCode under the hood: a contract has deployed bytecode at its address,
// a regular wallet returns empty/undefined. This is the standard, universal way to
// tell the two apart — works for any address on any EVM chain, no protocol-specific
// knowledge required.
export async function isContractAddress(address: `0x${string}`): Promise<boolean> {
  try {
    const bytecode = await publicClient.getBytecode({ address })
    return !!bytecode && bytecode !== "0x"
  } catch (error) {
    console.error("Error checking address type:", error)
    // Fail safe: if the check itself fails, assume EOA rather than block the rest
    // of the analysis — this is a classification aid, not a hard requirement.
    return false
  }
}

export async function getWalletData(address: `0x${string}`) {
  try {
    const [balance, txCount, blockNumber, isContract] = await Promise.all([
      publicClient.getBalance({ address }),
      publicClient.getTransactionCount({ address }),
      publicClient.getBlockNumber(),
      isContractAddress(address),
    ])

    return {
      address,
      balance: formatEther(balance),
      balanceRaw: balance.toString(),
      txCount: Number(txCount),
      blockNumber: Number(blockNumber),
      isContract,
    }
  } catch (error) {
    console.error("Error fetching wallet data:", error)
    throw new Error("Failed to fetch wallet data from Mantle network")
  }
}

export async function getTransactionData(hash: `0x${string}`) {
  try {
    const [tx, receipt] = await Promise.all([
      publicClient.getTransaction({ hash }),
      publicClient.getTransactionReceipt({ hash }),
    ])

    const block = await publicClient.getBlock({ blockNumber: tx.blockNumber! })

    return {
      hash,
      from: tx.from,
      to: tx.to,
      value: formatEther(tx.value),
      gasPrice: tx.gasPrice ? formatUnits(tx.gasPrice, 9) : "0",
      gasUsed: receipt.gasUsed.toString(),
      gasLimit: tx.gas.toString(),
      status: receipt.status,
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(block.timestamp),
      input: tx.input,
      nonce: tx.nonce,
    }
  } catch (error) {
    console.error("Error fetching transaction:", error)
    throw new Error("Failed to fetch transaction data")
  }
}

export async function getRecentTransactions(address: `0x${string}`) {
  try {
    const blockNumber = await publicClient.getBlockNumber()
    const fromBlock = blockNumber - BigInt(5000) > BigInt(0) ? blockNumber - BigInt(5000) : BigInt(0)

    const [sentLogs, receivedLogs] = await Promise.allSettled([
      publicClient.getLogs({
        event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
        args: { from: address },
        fromBlock,
        toBlock: blockNumber,
      }),
      publicClient.getLogs({
        event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
        args: { to: address },
        fromBlock,
        toBlock: blockNumber,
      }),
    ])

    return {
      sentLogs: sentLogs.status === "fulfilled" ? sentLogs.value.slice(0, 20) : [],
      receivedLogs: receivedLogs.status === "fulfilled" ? receivedLogs.value.slice(0, 20) : [],
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { sentLogs: [], receivedLogs: [] }
  }
}

// Known 4-byte function selectors (keccak256-derived, verified against viem's own
// toFunctionSelector) for capabilities that matter most for contract risk assessment.
// Detecting these in raw bytecode doesn't require verified source code or an ABI —
// the selector is embedded directly in the deployed bytecode's dispatch logic.
const KNOWN_SELECTORS: Record<string, { label: string; risk: "high" | "medium" | "low" }> = {
  "40c10f19": { label: "mint(address,uint256)", risk: "high" },
  "a0712d68": { label: "mint(uint256)", risk: "high" },
  "8456cb59": { label: "pause()", risk: "high" },
  "3f4ba83a": { label: "unpause()", risk: "medium" },
  "5c975abb": { label: "paused()", risk: "low" },
  "715018a6": { label: "renounceOwnership()", risk: "low" },
  "f2fde38b": { label: "transferOwnership(address)", risk: "medium" },
  "8da5cb5b": { label: "owner()", risk: "low" },
  "f9f92be4": { label: "blacklist(address)", risk: "high" },
  "9cfe42da": { label: "addBlacklist(address)", risk: "high" },
  "153b0d1e": { label: "setBlacklist(address,bool)", risk: "high" },
  "fe575a87": { label: "isBlacklisted(address)", risk: "low" },
  "3ccfd60b": { label: "withdraw()", risk: "medium" },
  "2e1a7d4d": { label: "withdraw(uint256)", risk: "medium" },
  "db2e21bc": { label: "emergencyWithdraw()", risk: "medium" },
  "69fe0e2d": { label: "setFee(uint256)", risk: "medium" },
  "437823ec": { label: "excludeFromFee(address)", risk: "low" },
}

export interface ContractCapability {
  label: string
  risk: "high" | "medium" | "low"
}

// Scans raw bytecode for known function selectors. The EVM dispatch pattern places
// each function's 4-byte selector as a literal PUSH4 operand near the top of the
// bytecode, so a simple substring search reliably detects which of these known
// capabilities a contract exposes — without needing verified source or an ABI.
function detectCapabilities(bytecode: string): ContractCapability[] {
  const hex = bytecode.toLowerCase().replace(/^0x/, "")
  const found: ContractCapability[] = []
  for (const [selector, info] of Object.entries(KNOWN_SELECTORS)) {
    if (hex.includes(selector)) found.push(info)
  }
  return found
}

export async function getContractData(address: `0x${string}`) {
  try {
    const [bytecode, txCount, blockNumber] = await Promise.all([
      publicClient.getBytecode({ address }),
      publicClient.getTransactionCount({ address }),
      publicClient.getBlockNumber(),
    ])

    if (!bytecode || bytecode === "0x") {
      throw new Error("Address has no contract code deployed")
    }

    const capabilities = detectCapabilities(bytecode)
    const bytecodeSizeBytes = (bytecode.length - 2) / 2 // strip "0x", 2 hex chars per byte

    // Try treating it as an ERC-20 token; if all reads fail, it's some other kind of contract.
    let tokenInfo: Awaited<ReturnType<typeof getTokenInfo>> | null = null
    try {
      const candidate = await getTokenInfo(address)
      // getTokenInfo never throws on individual field failures (each has its own .catch),
      // so check whether it actually resolved real data rather than its fallback values.
      if (candidate.name !== "Unknown" || candidate.symbol !== "???") {
        tokenInfo = candidate
      }
    } catch {
      tokenInfo = null
    }

    return {
      address,
      bytecodeSizeBytes,
      capabilities,
      isToken: !!tokenInfo,
      tokenInfo,
      txCount: Number(txCount),
      blockNumber: Number(blockNumber),
    }
  } catch (error) {
    console.error("Error fetching contract data:", error)
    throw new Error("Failed to fetch contract data from Mantle network")
  }
}

export async function getTokenInfo(contractAddress: `0x${string}`) {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      publicClient.readContract({ address: contractAddress, abi: ERC20_ABI, functionName: "name" }).catch(() => "Unknown"),
      publicClient.readContract({ address: contractAddress, abi: ERC20_ABI, functionName: "symbol" }).catch(() => "???"),
      publicClient.readContract({ address: contractAddress, abi: ERC20_ABI, functionName: "decimals" }).catch(() => 18),
      publicClient.readContract({ address: contractAddress, abi: ERC20_ABI, functionName: "totalSupply" }).catch(() => BigInt(0)),
    ])

    return {
      address: contractAddress,
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: formatUnits(totalSupply as bigint, decimals as number),
    }
  } catch {
    throw new Error("Failed to fetch token info")
  }
}
