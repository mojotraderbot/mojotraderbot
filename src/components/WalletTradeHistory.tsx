import { useState, useEffect, useRef } from "react";
import { Folder, Loader2, ExternalLink, AlertCircle, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { 
  fetchParsedWalletTransactions, 
  parseTokenTrades, 
  getUniqueTokens,
  getTokenTradeSummary,
  ParsedTokenTrade,
  fetchTokenMetadata
} from "@/lib/helius";
import { PumpPortalWebSocket, PumpPortalTradeEvent } from "@/lib/pumpportal";

const MOJO_WALLET = "EG2uV3zkfyZMpYeZSRSQpEZRGoK6AXCZqyHBhTMbsJ1w";

interface TokenSummary {
  mint: string;
  tokenName?: string;
  tokenSymbol?: string;
  totalTrades: number;
  buys: number;
  sells: number;
  totalBought: number;
  totalSold: number;
  netPosition: number;
  solSpent: number;
  solReceived: number;
  netPnL: number;
  firstTrade: number | null;
  lastTrade: number | null;
}

const WalletTradeHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<ParsedTokenTrade[]>([]);
  const [tokenSummaries, setTokenSummaries] = useState<TokenSummary[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<PumpPortalWebSocket | null>(null);

  // Update summaries when trades change
  const updateSummaries = (currentTrades: ParsedTokenTrade[]) => {
    const uniqueTokens = getUniqueTokens(currentTrades);
    const summaries: TokenSummary[] = Array.from(uniqueTokens).map(mint => 
      getTokenTradeSummary(currentTrades, mint)
    );
    summaries.sort((a, b) => b.totalTrades - a.totalTrades);
    setTokenSummaries(summaries);
  };

  // Convert PumpPortal trade event to ParsedTokenTrade format
  const convertPumpPortalTrade = async (event: PumpPortalTradeEvent): Promise<ParsedTokenTrade | null> => {
    try {
      // Fetch token metadata
      const metadata = await fetchTokenMetadata(event.mint);
      
      return {
        signature: event.signature,
        timestamp: event.timestamp,
        mint: event.mint,
        type: event.type,
        tokenAmount: event.tokenAmount,
        solAmount: event.solAmount,
        dex: event.dex || "pump.fun",
        tokenName: metadata?.name,
        tokenSymbol: metadata?.symbol,
        tokenDecimals: metadata?.decimals,
      };
    } catch (error) {
      console.error("[WalletTradeHistory] Failed to convert PumpPortal trade:", error);
      return null;
    }
  };

  // Load historical trades from Helius
  useEffect(() => {
    const loadTradeHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Loading trade history for wallet:", MOJO_WALLET);
        
        // Fetch parsed transactions from Helius
        const transactions = await fetchParsedWalletTransactions(MOJO_WALLET, 1000);
        console.log("Fetched transactions:", transactions.length);
        
        // Parse trades from transactions (now async to fetch token metadata)
        const parsedTrades = await parseTokenTrades(transactions, MOJO_WALLET);
        console.log("Parsed trades:", parsedTrades.length, parsedTrades);
        setTrades(parsedTrades);
        updateSummaries(parsedTrades);
        
      } catch (err) {
        console.error("[WalletTradeHistory] Failed to load trade history:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[WalletTradeHistory] Error details:", {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTradeHistory();
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    const ws = new PumpPortalWebSocket();
    wsRef.current = ws;

    ws.onConnect(() => {
      console.log("[WalletTradeHistory] PumpPortal WebSocket connected");
      setWsConnected(true);
      ws.subscribeAccountTrade([MOJO_WALLET]);
    });

    ws.onError((error) => {
      console.error("[WalletTradeHistory] PumpPortal WebSocket error:", error);
      setWsConnected(false);
    });

    ws.onTrade(async (event: PumpPortalTradeEvent) => {
      // Only process trades for Mojo's wallet
      if (event.account !== MOJO_WALLET) {
        return;
      }

      console.log("[WalletTradeHistory] New real-time trade:", event);
      
      // Convert to ParsedTokenTrade format
      const convertedTrade = await convertPumpPortalTrade(event);
      if (convertedTrade) {
        // Check if trade already exists (avoid duplicates)
        setTrades(prevTrades => {
          const exists = prevTrades.some(t => t.signature === convertedTrade.signature);
          if (exists) {
            console.log("[WalletTradeHistory] Trade already exists, skipping:", convertedTrade.signature);
            return prevTrades;
          }
          
          // Add new trade at the beginning (most recent first)
          const updated = [convertedTrade, ...prevTrades];
          updateSummaries(updated);
          return updated;
        });
      }
    });

    ws.connect();

    return () => {
      console.log("[WalletTradeHistory] Cleaning up WebSocket connection");
      ws.disconnect();
      wsRef.current = null;
    };
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSol = (lamports: number) => {
    if (!lamports || lamports === 0) return "0.0000";
    return (lamports / 1e9).toFixed(4);
  };

  const totalProfit = tokenSummaries.reduce((sum, t) => sum + t.netPnL, 0);
  const totalTrades = trades.length;
  const uniqueTokenCount = tokenSummaries.length;

  return (
    <section id="wallet-trade-history" className="py-8">
      <div className="container">
        <motion.div 
          className="win95-window"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="win95-titlebar">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Mojo Wallet Trade History</span>
              {wsConnected && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  title="Real-time updates active"
                >
                  <Radio className="w-3 h-3 text-[#039B4E]" />
                  <span className="text-[8px] text-[#039B4E] font-bold">LIVE</span>
                </motion.div>
              )}
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-white p-3 flex flex-wrap justify-center gap-2 sm:gap-4 border-b border-gray-300">
            {[
              { label: "Tokens Traded", value: uniqueTokenCount, color: "text-[#039B4E]" },
              { label: "Total Trades", value: totalTrades, color: "text-[#039B4E]" },
              { label: "Net PnL", value: `${formatSol(totalProfit)} SOL`, color: totalProfit >= 0 ? "text-[#039B4E]" : "text-red-600" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="win95-groupbox px-3 sm:px-4 py-2 min-w-[80px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="win95-groupbox-title text-[8px] sm:text-[9px] whitespace-nowrap">{stat.label}</span>
                <div className={`text-lg font-bold ${stat.color} text-center`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white p-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#039B4E] mb-4" />
                <p className="font-mono text-sm text-gray-600">Loading trade history...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <p className="font-mono text-sm text-red-600 mb-2">Error loading trade history</p>
                <p className="font-mono text-xs text-gray-600 mb-2">{error}</p>
                <p className="font-mono text-[10px] text-gray-500 mt-2">Check browser console (F12) for details</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {tokenSummaries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="font-mono text-sm text-gray-600">No token trades found</p>
                    <p className="font-mono text-xs text-gray-500 mt-2">Wallet: {MOJO_WALLET.slice(0, 8)}...{MOJO_WALLET.slice(-8)}</p>
                    <p className="font-mono text-xs text-gray-400 mt-2">
                      Transactions processed: {trades.length > 0 ? `${trades.length} trades found` : "0 trades"}
                    </p>
                    <p className="font-mono text-xs text-gray-400 mt-1">Check browser console (F12) for debug info</p>
                    {trades.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-100 rounded text-left max-w-md">
                        <p className="font-mono text-xs text-gray-700 mb-2">Debug: Found {trades.length} trades but no summaries</p>
                        <pre className="text-[10px] overflow-auto max-h-40">
                          {JSON.stringify(trades.slice(0, 3), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="win95-listview overflow-hidden">
                    {/* Desktop view */}
                    <table className="hidden sm:table w-full text-xs">
                      <thead className="win95-listview-header">
                        <tr>
                          <th className="text-left p-2 text-black">Token</th>
                          <th className="text-center p-2 text-black">Trades</th>
                          <th className="text-center p-2 text-black">Buys/Sells</th>
                          <th className="text-right p-2 text-black">SOL Spent</th>
                          <th className="text-right p-2 text-black">SOL Received</th>
                          <th className="text-right p-2 text-black">Net PnL</th>
                          <th className="text-center p-2 text-black">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenSummaries.map((summary, index) => (
                          <motion.tr 
                            key={summary.mint}
                            className="win95-listview-row-orange border-b border-[#c0c0c0]"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(255, 107, 74, 0.1)" }}
                          >
                            <td className="p-2">
                              <div className="flex flex-col">
                                {summary.tokenSymbol || summary.tokenName ? (
                                  <>
                                    <span className="font-bold text-black text-xs">
                                      {summary.tokenSymbol || summary.tokenName}
                                    </span>
                                    <span className="font-mono text-[9px] text-[#808080]">
                                      {summary.mint.slice(0, 6)}...{summary.mint.slice(-6)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-mono text-[10px] text-[#808080]">
                                    {summary.mint.slice(0, 8)}...{summary.mint.slice(-8)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <span className="font-bold text-black">{summary.totalTrades}</span>
                            </td>
                            <td className="p-2 text-center">
                              <span className="text-[#039B4E]">{summary.buys}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-red-600">{summary.sells}</span>
                            </td>
                            <td className="p-2 text-right">
                              <span className="font-mono text-[10px] text-black">{formatSol(summary.solSpent)}</span>
                            </td>
                            <td className="p-2 text-right">
                              <span className="font-mono text-[10px] text-black">{formatSol(summary.solReceived)}</span>
                            </td>
                            <td className="p-2 text-right">
                              <span className={`font-mono text-[10px] font-bold ${summary.netPnL >= 0 ? "text-[#039B4E]" : "text-red-600"}`}>
                                {summary.netPnL >= 0 ? "+" : ""}{formatSol(summary.netPnL)}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <motion.a 
                                href={`https://solscan.io/token/${summary.mint}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="win95-button-primary text-[10px] px-2 py-1 inline-flex items-center gap-1"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                VIEW
                              </motion.a>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile view */}
                    <div className="sm:hidden space-y-2 p-2">
                      {tokenSummaries.map((summary, index) => (
                        <motion.div
                          key={summary.mint}
                          className="win95-outset p-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="mb-2">
                            {summary.tokenSymbol || summary.tokenName ? (
                              <>
                                <div className="font-bold text-sm text-black mb-1">
                                  {summary.tokenSymbol || summary.tokenName}
                                </div>
                                <span className="font-mono text-[10px] text-[#808080] break-all">
                                  {summary.mint}
                                </span>
                              </>
                            ) : (
                              <span className="font-mono text-[10px] text-[#808080] break-all">
                                {summary.mint}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Trades: </span>
                              <span className="font-bold">{summary.totalTrades}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Buys/Sells: </span>
                              <span className="text-[#039B4E]">{summary.buys}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-red-600">{summary.sells}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">SOL Spent: </span>
                              <span className="font-mono">{formatSol(summary.solSpent)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">SOL Received: </span>
                              <span className="font-mono">{formatSol(summary.solReceived)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Net PnL: </span>
                              <span className={`font-mono font-bold ${summary.netPnL >= 0 ? "text-[#039B4E]" : "text-red-600"}`}>
                                {summary.netPnL >= 0 ? "+" : ""}{formatSol(summary.netPnL)} SOL
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <motion.a 
                              href={`https://solscan.io/token/${summary.mint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="win95-button-primary text-[10px] px-2 py-1 inline-flex items-center gap-1"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              VIEW ON SOLSCAN
                            </motion.a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="win95-statusbar flex justify-between items-center">
            <div className="win95-statusbar-inset flex-1 text-[10px]">
              {tokenSummaries.length} token(s) traded | Wallet: {MOJO_WALLET.slice(0, 8)}...{MOJO_WALLET.slice(-8)}
            </div>
            <div className="win95-statusbar-inset text-[10px]">
              Solana Mainnet
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WalletTradeHistory;
