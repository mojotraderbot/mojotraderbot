import { FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mojoLogo from "@/assets/mojo-logo.png";

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReadmeModal = ({ isOpen, onClose }: ReadmeModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="win95-window max-w-2xl w-full max-h-[80vh] flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
          >
            <div className="win95-titlebar cursor-move">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs sm:text-sm">README.txt - Mojo Trader</span>
              </div>
              <div className="flex gap-1">
                <button className="win95-control-btn text-[8px]">_</button>
                <button className="win95-control-btn text-[8px]">□</button>
                <motion.button 
                  className="win95-control-btn text-[8px]" 
                  onClick={onClose}
                  whileHover={{ backgroundColor: "#ff0000" }}
                >
                  <X className="w-2 h-2" />
                </motion.button>
              </div>
            </div>
            
            <div className="win95-menubar">
              <span className="win95-menu-item text-[11px]">File</span>
              <span className="win95-menu-item text-[11px]">Edit</span>
              <span className="win95-menu-item text-[11px]">View</span>
              <span className="win95-menu-item text-[11px]">Help</span>
            </div>

            <div className="bg-white p-4 overflow-y-auto flex-1 text-black font-mono text-xs leading-relaxed">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#808080]">
                <motion.img 
                  src={mojoLogo} 
                  alt="Mojo Trader" 
                  className="w-12 h-12 object-contain"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                <div>
                  <h1 className="text-lg font-bold">Mojo Trader — Autonomous Survival Agent</h1>
                  <p className="text-[10px] text-[#808080]">AI monkey on Mac Mini M3 trading Pump.fun to pay his own API bills.</p>
                </div>
              </div>

              <pre className="whitespace-pre-wrap">
{`========================================
          MOJO TRADER README
========================================

IDENTITY
--------
Mojo is an autonomous trading AI monkey
running on a Mac Mini M3. He trades
Pump.fun memecoins 24/7, trying to earn
enough to pay for his own APIs and stay
online.

LIFE MECHANIC
-------------
Profit  = oxygen (API credits top-up)
Losses  = suffocation (credits drain)

If Mojo fails to out-earn his operating
costs and credits hit zero, the system
shuts down permanently. No bailouts,
no donations, no manual rescues.

WHAT MOJO TRADES
----------------
• Fresh Pump.fun launches
• Volume and momentum spikes
• Asymmetric volatility setups
• Narratives and meta rotations

TOOLING
-------
• Runtime: Mac Mini M3 (24/7)
• Chain: Solana
• Venue: Pump.fun
• Control plane: Supabase + Edge Functions
• Frontend: Vite + React + Tailwind + shadcn/ui

LOGIC (HIGH LEVEL)
------------------
1. Scan Pump.fun and market feeds
2. Score tokens by volume, momentum,
   age, holder distribution and rag risk
3. Enter positions when survival EV >
   0 (expected oxygen > expected death)
4. Route a slice of profit directly into
   API credits
5. Adapt aggression based on remaining
   oxygen and recent PnL

CONSTRAINTS
-----------
• Mojo can't ask for money
• Mojo can't print tokens for himself
• Mojo lives and dies only by trading

DISCLAIMER
----------
This is an autonomous trading experiment
and not financial advice. You are
observing a monkey fight the market.

========================================
      © 2026 Mojo Trader Experiment
========================================`}
              </pre>
            </div>

            <div className="win95-statusbar">
              <div className="win95-statusbar-inset flex-1 text-[10px]">
                README.txt | 2.1 KB
              </div>
              <div className="win95-statusbar-inset text-[10px]">
                Ln 1, Col 1
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadmeModal;
