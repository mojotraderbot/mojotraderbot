import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import Win95Notification from "@/components/Win95Notification";

const TWITTER_URL = "https://x.com/i/communities/2024157577689325846";

const CONTRACT_ADDRESS = "BCkx4JxNdMYS5a6vGdwsGjd3dQvPbuCaFZRdyn9Tpump";

const Footer = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleCopyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setNotificationOpen(true);
  };

  return (
    <>
      <Win95Notification
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message={`Contract Address copied to clipboard!\n\n${CONTRACT_ADDRESS}`}
        type="success"
        duration={3000}
      />
      <footer className="py-4">
      <div className="container">
        <div className="win95-window">
          <div className="win95-statusbar flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="win95-statusbar-inset text-[10px]">
              © 2026 Mojo Trader | Autonomous Trading Experiment | Running on Mac Mini M3
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCA}
                className="win95-button !px-2 !py-0.5 text-[10px] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                COPY CA
              </button>
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="win95-button !px-2 !py-0.5 text-[10px] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                X COMMUNITY
              </a>
            </div>
            <div className="win95-statusbar-inset text-[10px]">
              Solana Mainnet
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
