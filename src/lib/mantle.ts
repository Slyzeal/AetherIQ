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

export async function getWalletData(address: `0x${string}`) {
  try {
    const [balance, txCount, blockNumber] = await Promise.all([
      publicClient.getBalance({ address }),
      publicClient.getTransactionCount({ address }),
      publicClient.getBlockNumber(),
    ])

    return {
      address,
      balance: formatEther(balance),
      balanceRaw: balance.toString(),
      txCount: Number(txCount),
      blockNumber: Number(blockNumber),
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
