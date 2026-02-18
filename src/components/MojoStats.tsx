import { useEffect, useState } from "react";
import { TrendingUp, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Connection, PublicKey } from "@solana/web3.js";
import { getWalletBalance } from "@/lib/solana";
import { fetchDexScreenerTokenData } from "@/lib/dexscreener";

interface MojoStatsProps {
  profit?: number;
  apiSpent?: number;
  goal?: number;
}

// Mojo's trading wallet (used for on-chain PnL / bankroll)
const MOJO_WALLET_ADDRESS = "EG2uV3zkfyZMpYeZSRSQpEZRGoK6AXCZqyHBhTMbsJ1w";

// Helius RPC endpoint used for read-only balance checks
const HELIUS_RPC_URL =
  "https://mainnet.helius-rpc.com/?api-key=27b24668-8830-44fc-be8b-ed1046c1631c";

// Wrapped SOL mint used for price lookup
const SOL_MINT = "So11111111111111111111111111111111111111112";

const MojoStats = ({
  profit = 332.96,
  apiSpent = 45.66,
  goal = 50000,
}: MojoStatsProps) => {
  const progress = Math.min((profit / goal) * 100, 100);
  const apiCreditsLeft = 1000 - apiSpent; // Assuming starting with 1000 credits

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);

  useEffect(() => {
    const fetchOnChainStats = async () => {
      try {
        const connection = new Connection(HELIUS_RPC_URL, "confirmed");
        const wallet = new PublicKey(MOJO_WALLET_ADDRESS);

        // Fetch SOL balance
        const balanceSol = await getWalletBalance(connection, wallet);
        setSolBalance(balanceSol);

        // Fetch SOL price via DexScreener
        const dataMap = await fetchDexScreenerTokenData([SOL_MINT]);
        const solData = dataMap.get(SOL_MINT);
        if (solData?.priceUsd) {
          const price = parseFloat(solData.priceUsd);
          if (!Number.isNaN(price)) {
            setSolPriceUsd(price);
          }
        }
      } catch (error) {
        console.error("Failed to load Mojo bankroll stats:", error);
      }
    };

    fetchOnChainStats();
  }, []);

  const bankrollUsd =
    solBalance != null && solPriceUsd != null
      ? solBalance * solPriceUsd
      : null;

  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Mojo Survival Stats</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-control-btn text-[8px]">_</button>
          <button className="win95-control-btn text-[8px]">□</button>
          <button className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>
      
      <div className="bg-white p-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Profit */}
          <motion.div
            className="win95-groupbox p-2 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
              <TrendingUp className="w-3 h-3 text-[#039B4E]" />
              <span className="win95-groupbox-title text-[10px]">Trade Profit</span>
            </div>
            <div className="text-xl font-bold text-[#039B4E] text-center w-full">
              +${profit.toFixed(2)}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5 text-center">From active trades</div>
          </motion.div>

          {/* API Credits */}
          <motion.div
            className="win95-groupbox p-2 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
              <Zap className="w-3 h-3 text-[#ff8c42]" />
              <span className="win95-groupbox-title text-[10px]">API Spent</span>
            </div>
            <div className="text-xl font-bold text-[#ff8c42] text-center w-full">
              ${apiSpent.toFixed(2)}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5 text-center">
              Credits remaining: ${apiCreditsLeft.toFixed(2)}
            </div>
          </motion.div>

          {/* Goal Progress */}
          <motion.div
            className="win95-groupbox p-2 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
              <Target className="w-3 h-3 text-[#039B4E]" />
              <span className="win95-groupbox-title text-[10px]">Goal Progress</span>
            </div>
            <div className="text-xl font-bold text-[#039B4E] text-center w-full">
              {progress.toFixed(1)}%
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5 mb-1.5 text-center">
              to ${goal.toLocaleString()} goal
            </div>
            {bankrollUsd != null && solBalance != null && (
              <div className="text-[9px] text-gray-700 mb-1.5 text-center">
                Bankroll: ${bankrollUsd.toFixed(2)} ({solBalance.toFixed(3)} SOL)
              </div>
            )}
            {/* Progress bar */}
            <div className="win95-inset h-3 bg-white relative overflow-hidden w-full">
              <motion.div
                className="h-full bg-[#039B4E]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, #039B4E 0px, #039B4E 4px, #027a3e 4px, #027a3e 8px)"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MojoStats;
