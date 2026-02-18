import { useState } from "react";
import { Wallet, Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { shortenAddress } from "@/lib/solana";
import Win95Notification from "@/components/Win95Notification";

const MOJO_WALLET_ADDRESS = "EG2uV3zkfyZMpYeZSRSQpEZRGoK6AXCZqyHBhTMbsJ1w";
const SOLSCAN_URL = `https://solscan.io/account/${MOJO_WALLET_ADDRESS}`;

const MojoWalletPanel = () => {
  const [copied, setCopied] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOJO_WALLET_ADDRESS);
      setCopied(true);
      setNotificationType("success");
      setNotificationOpen(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setNotificationType("error");
      setNotificationOpen(true);
    }
  };

  return (
    <>
      <Win95Notification
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message={
          notificationType === "success"
            ? `Wallet address copied to clipboard!\n\n${MOJO_WALLET_ADDRESS}`
            : "Failed to copy wallet address. Please try again."
        }
        type={notificationType}
        duration={3000}
      />
      <motion.div
        className="win95-window"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
      <div className="win95-titlebar">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Mojo Trading Wallet</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-control-btn text-[8px]">_</button>
          <button className="win95-control-btn text-[8px]">□</button>
          <button className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>

      <div className="bg-white p-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Wallet Address Display */}
          <div className="flex-1 min-w-0">
            <div className="win95-inset p-2 bg-white">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 bg-[#039B4E] rounded-full animate-pulse" />
                <span className="font-mono text-[9px] text-[#808080] uppercase">
                  Active Trading Wallet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm text-black font-bold break-all">
                  {MOJO_WALLET_ADDRESS}
                </span>
              </div>
              <div className="mt-1">
                <span className="font-mono text-[9px] text-[#808080]">
                  Short: {shortenAddress(MOJO_WALLET_ADDRESS, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
            {/* Copy Button */}
            <motion.button
              onClick={handleCopy}
              className="win95-button-primary flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Address</span>
                </>
              )}
            </motion.button>

            {/* Solscan Button */}
            <motion.a
              href={SOLSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="win95-button flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-3 h-3" />
              <span>View on Solscan</span>
            </motion.a>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-2 pt-2 border-t border-gray-300">
          <p className="font-mono text-[9px] text-[#808080] text-center">
            This is Mojo&apos;s active trading wallet. All trades are executed from this address.
          </p>
        </div>
      </div>

      <div className="win95-statusbar">
        <div className="win95-statusbar-inset flex-1 text-[10px]">
          Solana Mainnet • {shortenAddress(MOJO_WALLET_ADDRESS, 8)}
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default MojoWalletPanel;
