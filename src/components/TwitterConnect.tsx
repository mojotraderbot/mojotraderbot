import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Check, X, Link } from "lucide-react";
import { toast } from "sonner";

interface TwitterConnectProps {
  connected: boolean;
  username: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const TwitterConnect = ({ connected, username, onConnect, onDisconnect }: TwitterConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConnect();
    setIsConnecting(false);
    toast.success("X account connected!");
  };

  return (
    <div className="win95-groupbox p-2">
      <span className="win95-groupbox-title">X Integration</span>

      {connected ? (
        <div className="win95-inset p-2 bg-white mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-[#039B4E]" />
              <span className="font-mono text-xs text-black">
                @{username}
              </span>
            </div>
            <button
              className="win95-button text-[10px] px-2 py-0.5 text-red-600"
              onClick={onDisconnect}
            >
              Disconnect
            </button>
          </div>
          <p className="font-mono text-[10px] text-[#808080] mt-1">
            Bot can post on your behalf
          </p>
        </div>
      ) : (
        <button
          className="win95-button w-full flex items-center gap-2 justify-center mt-2 py-2"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          <Link className="w-4 h-4 text-black" />
          <span className="font-mono text-xs text-black">
            {isConnecting ? "Connecting..." : "Connect X Account"}
          </span>
        </button>
      )}
    </div>
  );
};

export default TwitterConnect;
