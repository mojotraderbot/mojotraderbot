import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Connection, PublicKey } from "@solana/web3.js";
import { getWalletBalance } from "@/lib/solana";
import { fetchDexScreenerTokenData } from "@/lib/dexscreener";
import { Bot } from "lucide-react";
import mojoLogo from "@/assets/mojo-logo.png";
import mojoAngry from "@/assets/mojo-angry.png";

const MOJO_WALLET_ADDRESS = "EG2uV3zkfyZMpYeZSRSQpEZRGoK6AXCZqyHBhTMbsJ1w";
const MOJO_TOKEN_ADDRESS = "BCkx4JxNdMYS5a6vGdwsGjd3dQvPbuCaFZRdyn9Tpump";
const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=27b24668-8830-44fc-be8b-ed1046c1631c";
const SOL_MINT = "So11111111111111111111111111111111111111112";

const MojoProfile = () => {
  const [bankrollUsd, setBankrollUsd] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBankroll = async () => {
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
            setBankrollUsd(balanceSol * price);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Mojo bankroll:", error);
      }
    };

    fetchBankroll();
  }, []);

  const formatBankroll = () => {
    if (bankrollUsd !== null) {
      return `$${bankrollUsd.toFixed(0)}`;
    }
    return "...";
  };

  return (
    <motion.div
      className="win95-window h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title Bar */}
      <div className="win95-titlebar">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Mojo Trader Survival Fund</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-control-btn text-[8px]">_</button>
          <button className="win95-control-btn text-[8px]">□</button>
          <button className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-4 flex-1 flex flex-col">
        {/* Header with Logo and Bankroll */}
        <div className="flex flex-row items-center gap-4 mb-4 pb-4 border-b-2 border-[#c0c0c0]">
          {/* Two Mojo Images */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.img
              src={mojoLogo}
              alt="Mojo Trader"
              className="w-20 h-20 md:w-28 md:h-28 object-contain"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src={mojoAngry}
              alt="Mojo Trading"
              className="w-20 h-20 md:w-28 md:h-28 object-contain rounded"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="win95-outset px-4 md:px-8 py-3 bg-[#c0c0c0] max-w-full">
              <span className="font-mono text-xl md:text-2xl font-bold text-black whitespace-nowrap overflow-hidden text-ellipsis block">
                {formatBankroll()}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Profile Section */}
        <div className="mb-4">
          <div className="win95-groupbox p-3">
            <span className="win95-groupbox-title text-[#ff8c42]">Agent Profile</span>
            
            <div className="space-y-2 mt-3 font-mono text-[10px] md:text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Name:</span>
                <span className="text-black font-bold">Mojo Trader</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Type:</span>
                <span className="text-black font-bold">Autonomous Trading Monkey</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Location:</span>
                <span className="text-black font-mono text-[9px] break-all text-right max-w-[60%]">
                  {MOJO_WALLET_ADDRESS.slice(0, 8)}...{MOJO_WALLET_ADDRESS.slice(-8)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Engine:</span>
                <span className="text-black font-bold">mojo-trader v1.0.0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Token:</span>
                <span className="text-[#ff8c42] font-bold">$MOJO</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Parameters:</span>
                <span className="text-black">4,200,000</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Architecture:</span>
                <span className="text-black">Volume + Momentum + RAG Risk</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Oxygen Tax:</span>
                <span className="text-[#ff8c42] font-bold">20% of profit</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Goal:</span>
                <span className="text-[#039B4E] font-bold">$50,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Section */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="win95-groupbox p-3">
            <span className="win95-groupbox-title text-[#039B4E]">Hardware (Local)</span>
            
            <div className="space-y-2 mt-3 font-mono text-[10px] md:text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Device:</span>
                <span className="text-black font-bold">Mac Mini M3</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Compute:</span>
                <span className="text-black">Apple Neural Engine</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Memory:</span>
                <span className="text-black">16GB Unified</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Storage:</span>
                <span className="text-black">512GB SSD</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Location:</span>
                <span className="text-black italic">Under the kitchen table</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-inset flex-1 text-[10px]">
          Active • Pump.fun Native • Solana Mainnet
        </div>
      </div>
    </motion.div>
  );
};

export default MojoProfile;
