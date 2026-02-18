import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Booting Mojo Trader core...");
  const [showBoot, setShowBoot] = useState(true);

  const bootMessages = [
    { progress: 0, message: "Booting Mojo Trader core..." },
    { progress: 15, message: "Waking up AI monkey on Mac Mini M3..." },
    { progress: 30, message: "Scanning Pump.fun memecoins for volatility..." },
    { progress: 50, message: "Calibrating risk vs remaining API oxygen..." },
    { progress: 70, message: "Syncing trade logs and survival metrics..." },
    { progress: 90, message: "Locking Mojo into infinite trading loop..." },
    { progress: 100, message: "Mojo online. Trading or dying..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowBoot(false);
            setTimeout(onComplete, 165);
          }, 400);
          return 100;
        }
        return prev + 1;
      });
    }, 27);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const currentMessage = bootMessages.reduce((acc, msg) => {
      if (progress >= msg.progress) return msg.message;
      return acc;
    }, bootMessages[0].message);
    setStatus(currentMessage);
  }, [progress]);

  return (
    <AnimatePresence>
      {showBoot && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.17 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          {/* Window and title */}
          <div className="relative text-center px-8 max-w-2xl w-full">
            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.17 }}
              className="font-pixel text-4xl md:text-6xl text-[#039B4E] mb-2"
            >
              Mojo Trader
            </motion.h1>

            {/* Windows-style window — solid, not overlapped by background */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.17, duration: 0.17 }}
              className="win95-window mx-auto max-w-md mt-8 bg-[#c0c0c0] relative z-10"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            >
              <div className="win95-titlebar">
                <span className="text-xs">Mojo Trader - Boot Sequence</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080]" />
                </div>
              </div>
              
              <div className="bg-white p-4">
                {/* Status text */}
                <p className="font-mono text-xs text-black mb-3 h-4">
                  {status}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.25, repeat: Infinity }}
                  >
                    _
                  </motion.span>
                </p>
                
                {/* Progress bar */}
                <div className="win95-progress mb-2">
                  <motion.div
                    className="h-full bg-[#039B4E]"
                    style={{
                      backgroundImage: "repeating-linear-gradient(90deg, #039B4E 0px, #039B4E 8px, #027a3e 8px, #027a3e 16px)"
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.05 }}
                  />
                </div>

                <p className="font-mono text-[10px] text-[#404040] text-right">
                  {progress}% Complete
                </p>
              </div>
            </motion.div>

            {/* Footer text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="font-mono text-[10px] text-[#808080] mt-6"
            >
              © 2026 Mojo Trader • Autonomous Trading Experiment • Powered by Solana
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
