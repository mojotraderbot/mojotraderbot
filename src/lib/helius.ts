const HELIUS_API_KEY = "27b24668-8830-44fc-be8b-ed1046c1631c";
const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=" + HELIUS_API_KEY;
const HELIUS_BASE_URL = "https://api-mainnet.helius-rpc.com";
const DEXSCREENER_BASE = "https://api.dexscreener.com";

export interface HeliusParsedTransaction {
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers?: Array<{
    fromTokenAccount?: string;
    toTokenAccount?: string;
    fromUserAccount?: string;
    toUserAccount?: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
  }>;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  events?: {
    swap?: Array<{
      nativeInput?: {
        account: string;
        amount: number;
      };
      nativeOutput?: {
        account: string;
        amount: number;
      };
      tokenInputs?: Array<{
        account: string;
        mint: string;
        amount: number;
      }>;
      tokenOutputs?: Array<{
        account: string;
        mint: string;
        amount: number;
      }>;
    }>;
  };
  instructions?: Array<{
    programId: string;
    programName?: string;
    type?: string;
    data?: unknown;
  }>;
}

export interface ParsedTokenTrade {
  signature: string;
  timestamp: number;
  mint: string;
  type: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  dex?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

/**
 * Fetch parsed transactions for a Solana address using Helius Enhanced Transactions API
 * This endpoint already returns parsed transactions, so it's simpler and faster
 */
export async function fetchParsedWalletTransactions(
  address: string,
  limit: number = 1000
): Promise<HeliusParsedTransaction[]> {
  try {
    console.log(`Fetching transactions for address: ${address}`);
    
    // Use Enhanced Transactions API endpoint which returns parsed transactions
    const url = `${HELIUS_BASE_URL}/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Helius API error:", response.status, errorText);
      throw new Error(`Helius API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error("Unexpected API response format:", typeof data, data);
      return [];
    }
    
    console.log("Helius API response:", {
      totalTransactions: data.length,
      sampleTransaction: data.length > 0 ? {
        type: data[0].type,
        source: data[0].source,
        signature: data[0].signature,
        tokenTransfers: data[0].tokenTransfers?.length || 0,
        nativeTransfers: data[0].nativeTransfers?.length || 0,
      } : null,
    });
    
    return data;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}

/**
 * Convert Solana RPC parsed transaction to Helius format
 */
function convertRpcTransactionToHeliusFormat(
  rpcTx: any,
  signatureInfo: any
): HeliusParsedTransaction | null {
  if (!rpcTx || !rpcTx.transaction) return null;
  
  const signature = rpcTx.transaction.signatures[0];
  const meta = rpcTx.meta;
  const message = rpcTx.transaction.message;
  
  // Extract token transfers
  const tokenTransfers: any[] = [];
  const nativeTransfers: any[] = [];
  
  // Process pre/post token balances to find transfers
  if (meta?.preTokenBalances && meta?.postTokenBalances) {
    const preBalances = new Map<string, number>();
    const postBalances = new Map<string, number>();
    
    meta.preTokenBalances.forEach((balance: any) => {
      const key = `${balance.accountIndex}-${balance.mint}`;
      preBalances.set(key, parseFloat(balance.uiTokenAmount.uiAmountString || "0"));
    });
    
    meta.postTokenBalances.forEach((balance: any) => {
      const key = `${balance.accountIndex}-${balance.mint}`;
      postBalances.set(key, parseFloat(balance.uiTokenAmount.uiAmountString || "0"));
      
      const preBalance = preBalances.get(key) || 0;
      const postBalance = parseFloat(balance.uiTokenAmount.uiAmountString || "0");
      const change = postBalance - preBalance;
      
      if (change !== 0 && balance.mint !== "So11111111111111111111111111111111111111112") {
        const accountKey = message.accountKeys[balance.accountIndex];
        const owner = accountKey?.pubkey || "";
        
        tokenTransfers.push({
          mint: balance.mint,
          tokenAmount: Math.abs(change),
          fromUserAccount: change < 0 ? owner : undefined,
          toUserAccount: change > 0 ? owner : undefined,
          fromTokenAccount: change < 0 ? owner : undefined,
          toTokenAccount: change > 0 ? owner : undefined,
          tokenStandard: "Fungible",
        });
      }
    });
  }
  
  // Process native SOL transfers
  if (meta?.preBalances && meta?.postBalances) {
    for (let i = 0; i < meta.preBalances.length; i++) {
      const preBalance = meta.preBalances[i];
      const postBalance = meta.postBalances[i];
      const change = postBalance - preBalance;
      
      if (change !== 0 && i < message.accountKeys.length) {
        const account = message.accountKeys[i];
        nativeTransfers.push({
          fromUserAccount: change < 0 ? account.pubkey : undefined,
          toUserAccount: change > 0 ? account.pubkey : undefined,
          amount: Math.abs(change),
        });
      }
    }
  }
  
  // Determine transaction type
  let txType = "TRANSFER";
  let source = "UNKNOWN";
  
  // Check instructions to determine type
  if (message.instructions) {
    for (const instruction of message.instructions) {
      if (instruction.program === "spl-token") {
        txType = "TRANSFER";
      } else if (instruction.programId === "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA") {
        txType = "SWAP";
        source = "PUMP_AMM";
      } else if (instruction.programId === "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") {
        txType = "SWAP";
        source = "RAYDIUM";
      }
    }
  }
  
  return {
    type: txType,
    source: source,
    fee: meta?.fee || 0,
    feePayer: message.accountKeys[0]?.pubkey || "",
    signature: signature,
    slot: rpcTx.slot || 0,
    timestamp: signatureInfo?.blockTime || Math.floor(Date.now() / 1000),
    tokenTransfers: tokenTransfers.length > 0 ? tokenTransfers : undefined,
    nativeTransfers: nativeTransfers.length > 0 ? nativeTransfers : undefined,
  };
}

/**
 * Fetch token metadata (name, symbol) from DexScreener API
 */
export async function fetchTokenMetadata(mint: string): Promise<{ name?: string; symbol?: string; decimals?: number }> {
  try {
    const response = await fetch(`${DEXSCREENER_BASE}/latest/dex/tokens/${mint}`);
    if (!response.ok) return {};
    
    const data = await response.json();
    if (data.pairs && Array.isArray(data.pairs) && data.pairs.length > 0) {
      // Find the pair where our token is the base token
      for (const pair of data.pairs) {
        if (pair.baseToken?.address?.toLowerCase() === mint.toLowerCase()) {
          return {
            name: pair.baseToken?.name,
            symbol: pair.baseToken?.symbol,
            decimals: pair.baseToken?.decimals,
          };
        }
        if (pair.quoteToken?.address?.toLowerCase() === mint.toLowerCase()) {
          return {
            name: pair.quoteToken?.name,
            symbol: pair.quoteToken?.symbol,
            decimals: pair.quoteToken?.decimals,
          };
        }
      }
      
      // Fallback to first pair
      const pair = data.pairs[0];
      const token = pair.baseToken?.address?.toLowerCase() === mint.toLowerCase() 
        ? pair.baseToken 
        : pair.quoteToken;
      
      return {
        name: token?.name,
        symbol: token?.symbol,
        decimals: token?.decimals,
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch metadata for token ${mint}:`, error);
  }
  return {};
}

/**
 * Parse transactions to extract token trades with detailed information
 */
export async function parseTokenTrades(
  transactions: HeliusParsedTransaction[],
  walletAddress: string
): Promise<ParsedTokenTrade[]> {
  const trades: ParsedTokenTrade[] = [];
  
  console.log(`[Parser] Parsing ${transactions.length} transactions for wallet ${walletAddress}`);
  
  if (transactions.length === 0) {
    console.log("[Parser] No transactions to parse");
    return [];
  }
  
  for (const tx of transactions) {
    if (!tx) {
      console.warn("[Parser] Skipping null transaction");
      continue;
    }
    
    // Check transaction type - SWAP transactions are trades
    const txType = (tx.type || "").toUpperCase();
    const isSwap = txType === "SWAP";
    const source = (tx.source || "").toUpperCase();
    const isPumpFun = source.includes("PUMP") || source === "PUMP_AMM";
    
    console.log(`[Parser] Processing tx ${tx.signature?.slice(0, 16)}... type: ${txType}, source: ${source}, isSwap: ${isSwap}`);
    
    // Skip non-trade transactions (but keep TRANSFER if it has token transfers)
    if (!isSwap && txType !== "TRANSFER") {
      console.log(`[Parser] Skipping non-trade transaction type: ${txType}`);
      continue;
    }
    
    // Process token transfers
    if (!tx.tokenTransfers || !Array.isArray(tx.tokenTransfers) || tx.tokenTransfers.length === 0) {
      console.log(`[Parser] No token transfers in transaction ${tx.signature?.slice(0, 16)}...`);
      continue;
    }
    
    console.log(`[Parser] Found ${tx.tokenTransfers.length} token transfers in transaction`);
    
    // Group transfers by mint to handle multi-transfer swaps
    const tokenTransfersByMint = new Map<string, typeof tx.tokenTransfers>();
    
    for (const transfer of tx.tokenTransfers) {
      if (!transfer.mint) {
        console.warn("[Parser] Transfer without mint:", transfer);
        continue;
      }
      
      // Skip SOL transfers (mint is So11111111111111111111111111111111111111112)
      if (transfer.mint === "So11111111111111111111111111111111111111112") {
        continue;
      }
      
      const isReceiving = transfer.toUserAccount === walletAddress;
      const isSending = transfer.fromUserAccount === walletAddress;
      
      if (!isReceiving && !isSending) {
        console.log(`[Parser] Transfer not involving wallet: ${transfer.mint}`);
        continue;
      }
      
      console.log(`[Parser] Found relevant transfer: mint=${transfer.mint.slice(0, 8)}..., receiving=${isReceiving}, sending=${isSending}, amount=${transfer.tokenAmount}`);
      
      // Group by mint
      if (!tokenTransfersByMint.has(transfer.mint)) {
        tokenTransfersByMint.set(transfer.mint, []);
      }
      tokenTransfersByMint.get(transfer.mint)!.push(transfer);
    }
    
    // Process each unique token mint
    for (const [mint, transfers] of tokenTransfersByMint.entries()) {
      // Calculate net token amount (received - sent)
      let netTokenAmount = 0;
      let totalReceived = 0;
      let totalSent = 0;
      
      for (const transfer of transfers) {
        const isReceiving = transfer.toUserAccount === walletAddress;
        const isSending = transfer.fromUserAccount === walletAddress;
        const amount = transfer.tokenAmount || 0;
        
        if (isReceiving) {
          netTokenAmount += amount;
          totalReceived += amount;
        }
        if (isSending) {
          netTokenAmount -= amount;
          totalSent += amount;
        }
      }
      
      // Determine trade type based on net flow
      const tradeType = netTokenAmount > 0 ? "buy" : "sell";
      const tokenAmount = Math.abs(netTokenAmount);
      
      // Find corresponding SOL amount from native transfers
      // For buys: wallet sends SOL, receives tokens
      // For sells: wallet sends tokens, receives SOL
      let solAmount = 0;
      if (tx.nativeTransfers && Array.isArray(tx.nativeTransfers)) {
        if (tradeType === "buy") {
          // Calculate SOL sent (outgoing)
          for (const nativeTransfer of tx.nativeTransfers) {
            if (nativeTransfer.fromUserAccount === walletAddress) {
              solAmount += nativeTransfer.amount || 0;
            }
          }
        } else {
          // Calculate SOL received (incoming)
          for (const nativeTransfer of tx.nativeTransfers) {
            if (nativeTransfer.toUserAccount === walletAddress) {
              solAmount += nativeTransfer.amount || 0;
            }
          }
        }
      }
      
      // Only count as trade if:
      // 1. It's a SWAP transaction (always a trade)
      // 2. There's SOL involved AND token amount > 0
      // 3. Token amount > 0 (we have actual tokens changing hands)
      if (tokenAmount > 0 && (isSwap || solAmount > 0)) {
        const dex = isPumpFun ? "Pump.fun" : (isSwap ? "DEX" : "Unknown");
        
        // Fetch token metadata
        const metadata = await fetchTokenMetadata(mint);
        
        trades.push({
          signature: tx.signature,
          timestamp: tx.timestamp,
          mint: mint,
          type: tradeType,
          tokenAmount: tokenAmount,
          solAmount: solAmount,
          dex: dex,
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          tokenDecimals: metadata.decimals,
        });
      }
    }
  }
  
  console.log(`[Parser] Found ${trades.length} token trades`);
  if (trades.length > 0) {
    console.log("[Parser] Sample trades:", trades.slice(0, 5).map(t => ({
      mint: t.mint.slice(0, 8) + "...",
      type: t.type,
      tokenAmount: t.tokenAmount,
      solAmount: t.solAmount,
      symbol: t.tokenSymbol,
    })));
    console.log("[Parser] Unique mints:", Array.from(new Set(trades.map(t => t.mint))).map(m => m.slice(0, 8) + "..."));
  } else {
    console.log("[Parser] No trades found. Sample transaction:", transactions[0] ? {
      type: transactions[0].type,
      source: transactions[0].source,
      hasTokenTransfers: !!transactions[0].tokenTransfers?.length,
      tokenTransferCount: transactions[0].tokenTransfers?.length || 0,
      hasNativeTransfers: !!transactions[0].nativeTransfers?.length,
      nativeTransferCount: transactions[0].nativeTransfers?.length || 0,
      tokenTransfers: transactions[0].tokenTransfers?.slice(0, 2),
    } : "No transactions");
  }
  
  return trades;
}

/**
 * Get unique tokens traded by a wallet
 */
export function getUniqueTokens(trades: ParsedTokenTrade[]): Set<string> {
  return new Set(trades.map(t => t.mint));
}

/**
 * Get token trade summary
 */
export function getTokenTradeSummary(trades: ParsedTokenTrade[], mint: string) {
  const tokenTrades = trades.filter(t => t.mint === mint);
  const buys = tokenTrades.filter(t => t.type === "buy");
  const sells = tokenTrades.filter(t => t.type === "sell");
  
  const totalBought = buys.reduce((sum, t) => sum + t.tokenAmount, 0);
  const totalSold = sells.reduce((sum, t) => sum + t.tokenAmount, 0);
  const solSpent = buys.reduce((sum, t) => sum + t.solAmount, 0);
  const solReceived = sells.reduce((sum, t) => sum + t.solAmount, 0);
  
  // Get token metadata from first trade
  const firstTrade = tokenTrades[0];
  
  return {
    mint,
    tokenName: firstTrade?.tokenName,
    tokenSymbol: firstTrade?.tokenSymbol,
    totalTrades: tokenTrades.length,
    buys: buys.length,
    sells: sells.length,
    totalBought,
    totalSold,
    netPosition: totalBought - totalSold,
    solSpent,
    solReceived,
    netPnL: solReceived - solSpent,
    firstTrade: tokenTrades.length > 0 ? Math.min(...tokenTrades.map(t => t.timestamp)) : null,
    lastTrade: tokenTrades.length > 0 ? Math.max(...tokenTrades.map(t => t.timestamp)) : null,
  };
}
