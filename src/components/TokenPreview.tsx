import { useRef } from "react";
import { Image, Type, FileText, Rocket, Wallet, Twitter } from "lucide-react";
import { WalletInfo } from "./WalletManager";

export interface TokenData {
  name: string;
  ticker: string;
  description: string;
  logo: string | null;
  banner: string | null;
  launchMode: "dev" | "dev_bundle" | "dev_bundle_snipe";
  twitter?: string | null;
}

interface TokenPreviewProps {
  tokenData: TokenData;
  wallets: WalletInfo[];
  onLogoChange?: (logo: string | null) => void;
}

const TokenPreview = ({ tokenData, wallets, onLogoChange }: TokenPreviewProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (onLogoChange) logoInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange?.(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const launchModeLabels = {
    dev: "Dev Buy",
    dev_bundle: "Dev + Bundle",
    dev_bundle_snipe: "Dev + Bundle + Snipe",
  };

  const devWallets = wallets.filter((w) => w.type === "dev");
  const bundleWallets = wallets.filter((w) => w.type === "bundle");
  const sniperWallets = wallets.filter((w) => w.type === "sniper");

  return (
    <div className="win95-groupbox p-2">
      <span className="win95-groupbox-title">Token Preview</span>

      {/* Logo & Name */}
      <div className="flex items-start gap-3 mt-2">
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="hidden"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleLogoClick}
          className={`w-12 h-12 win95-inset flex items-center justify-center shrink-0 bg-white overflow-hidden border-2 border-transparent hover:border-[#ff6b00] focus:outline-none focus:border-[#ff6b00] transition-colors ${onLogoChange ? "cursor-pointer" : "cursor-default"}`}
          title={onLogoChange ? "Click to upload your logo" : undefined}
          disabled={!onLogoChange}
        >
          {tokenData.logo ? (
            <img src={tokenData.logo} alt="Token logo" className="w-full h-full object-cover" />
          ) : (
            <Image className="w-5 h-5 text-[#808080]" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Type className="w-3 h-3 text-[#ff6b00] shrink-0" />
            <span className="font-bold text-sm text-black truncate">
              {tokenData.name || "Token Name"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-3 h-3 shrink-0 block" aria-hidden />
            <span className="font-mono text-xs text-[#ff6b00] truncate">
              ${tokenData.ticker || "TICKER"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-3 h-3 text-[#808080]" />
          <span className="font-mono text-[10px] text-black uppercase">Description</span>
        </div>
        <div className="win95-inset p-2 bg-white">
          <p className="font-mono text-xs text-black leading-relaxed line-clamp-3">
            {tokenData.description || "No description yet..."}
          </p>
        </div>
      </div>

      {/* X (Twitter) — shown when connected */}
      {tokenData.twitter && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <Twitter className="w-3 h-3 text-[#1da1f2]" />
            <span className="font-mono text-[10px] text-black uppercase">X</span>
          </div>
          <a
            href={tokenData.twitter.startsWith("http") ? tokenData.twitter : `https://x.com/${tokenData.twitter.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="win95-inset p-2 bg-white block font-mono text-xs text-[#1da1f2] hover:underline truncate"
          >
            {tokenData.twitter.replace(/^https?:\/\/x\.com\//i, "").replace(/^@/, "") || tokenData.twitter}
          </a>
        </div>
      )}

      {/* Banner */}
      {tokenData.banner && (
        <div className="mt-3">
          <span className="font-mono text-[10px] text-black uppercase">Banner</span>
          <div className="mt-1 h-16 win95-inset overflow-hidden">
            <img src={tokenData.banner} alt="Token banner" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Launch Mode */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="w-3 h-3 text-[#ff6b00]" />
          <span className="font-mono text-[10px] text-black uppercase">Launch Mode</span>
        </div>
        <span className="inline-block bg-[#039B4E] text-white px-2 py-0.5 font-mono text-xs">
          {launchModeLabels[tokenData.launchMode]}
        </span>
      </div>

      {/* Wallets Summary */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-3 h-3 text-[#808080]" />
          <span className="font-mono text-[10px] text-black uppercase">Wallets</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="win95-inset p-1 bg-white">
            <p className="font-bold text-lg text-black">{devWallets.length}</p>
            <p className="font-mono text-[10px] text-black">Dev</p>
          </div>
          <div className="win95-inset p-1 bg-white">
            <p className="font-bold text-lg text-black">{bundleWallets.length}</p>
            <p className="font-mono text-[10px] text-black">Bundle</p>
          </div>
          <div className="win95-inset p-1 bg-white">
            <p className="font-bold text-lg text-black">{sniperWallets.length}</p>
            <p className="font-mono text-[10px] text-black">Snipe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPreview;
