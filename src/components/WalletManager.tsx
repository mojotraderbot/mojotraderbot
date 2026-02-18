import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Import, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface WalletInfo {
  id: string;
  name: string;
  address: string;
  type: "dev" | "bundle" | "sniper";
}

interface WalletManagerProps {
  wallets: WalletInfo[];
  onAddWallet: (wallet: WalletInfo) => void;
  onRemoveWallet: (id: string) => void;
}

const WalletManager = ({ wallets, onAddWallet, onRemoveWallet }: WalletManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "create" | "import">("choose");
  const [walletName, setWalletName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [walletType, setWalletType] = useState<"dev" | "bundle" | "sniper">("dev");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateMockWallet = () => {
    // Generate a mock Solana address (base58)
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let address = "";
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  };

  const handleCreate = () => {
    if (!walletName.trim()) {
      toast.error("Please enter wallet name");
      return;
    }

    const newWallet: WalletInfo = {
      id: Date.now().toString(),
      name: walletName,
      address: generateMockWallet(),
      type: walletType,
    };

    onAddWallet(newWallet);
    toast.success(`Wallet "${walletName}" created!`);
    resetForm();
  };

  const handleImport = () => {
    if (!walletName.trim() || !privateKey.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    // Basic validation for Solana private key (base58, 64-88 chars)
    if (privateKey.length < 64 || privateKey.length > 88) {
      toast.error("Invalid private key format");
      return;
    }

    const newWallet: WalletInfo = {
      id: Date.now().toString(),
      name: walletName,
      address: generateMockWallet(), // In real app, derive from private key
      type: walletType,
    };

    onAddWallet(newWallet);
    toast.success(`Wallet "${walletName}" imported!`);
    resetForm();
  };

  const resetForm = () => {
    setWalletName("");
    setPrivateKey("");
    setWalletType("dev");
    setMode("choose");
    setIsOpen(false);
  };

  const copyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success("Address copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="win95-groupbox p-2">
      <div className="flex items-center justify-between">
        <span className="win95-groupbox-title">Wallets</span>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="win95-button text-[10px] px-2 py-0.5">
              <Plus className="w-3 h-3" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]">
            <DialogHeader>
              <DialogTitle className="font-bold text-black">
                {mode === "choose" && "Add Wallet"}
                {mode === "create" && "Create New Wallet"}
                {mode === "import" && "Import Wallet"}
              </DialogTitle>
            </DialogHeader>

            {mode === "choose" && (
              <div className="space-y-3">
                <button
                  className="win95-button w-full flex items-start gap-3 p-3"
                  onClick={() => setMode("create")}
                >
                  <Plus className="w-5 h-5 text-[#ff6b00]" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-black">Create New</p>
                    <p className="font-mono text-xs text-[#808080]">Generate a new Solana wallet</p>
                  </div>
                </button>
                <button
                  className="win95-button w-full flex items-start gap-3 p-3"
                  onClick={() => setMode("import")}
                >
                  <Import className="w-5 h-5 text-[#ff6b00]" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-black">Import Existing</p>
                    <p className="font-mono text-xs text-[#808080]">Use your private key</p>
                  </div>
                </button>
              </div>
            )}

            {(mode === "create" || mode === "import") && (
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs text-black uppercase">
                    Wallet Name
                  </label>
                  <input
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="My Dev Wallet"
                    className="win95-inset w-full mt-1 px-2 py-1 bg-white text-black font-mono text-sm"
                  />
                </div>

                {mode === "import" && (
                  <div>
                    <label className="font-mono text-xs text-black uppercase">
                      Private Key
                    </label>
                    <input
                      type="password"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="Enter your private key"
                      className="win95-inset w-full mt-1 px-2 py-1 bg-white text-black font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="font-mono text-xs text-black uppercase">
                    Wallet Type
                  </label>
                  <div className="flex gap-2 mt-1">
                    {(["dev", "bundle", "sniper"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setWalletType(type)}
                        className={`flex-1 py-1 font-mono text-xs ${
                          walletType === type
                            ? "win95-inset bg-[#039B4E] text-white"
                            : "win95-button text-black"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="win95-button flex-1 py-1" onClick={() => setMode("choose")}>
                    Back
                  </button>
                  <button
                    className="win95-button-primary flex-1 py-1"
                    onClick={mode === "create" ? handleCreate : handleImport}
                  >
                    {mode === "create" ? "Create" : "Import"}
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet list */}
      <div className="space-y-1 mt-2">
        {wallets.length === 0 ? (
          <p className="font-mono text-[10px] text-[#808080] italic">No wallets added</p>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="win95-inset p-2 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-black font-medium truncate">
                      {wallet.name}
                    </span>
                    <span className="font-mono text-[10px] text-white bg-[#039B4E] px-1">
                      {wallet.type}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[#808080]">
                    {truncateAddress(wallet.address)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="win95-button p-1"
                    onClick={() => copyAddress(wallet.address, wallet.id)}
                  >
                    {copiedId === wallet.id ? (
                      <Check className="w-3 h-3 text-[#039B4E]" />
                    ) : (
                      <Copy className="w-3 h-3 text-black" />
                    )}
                  </button>
                  <button
                    className="win95-button p-1"
                    onClick={() => onRemoveWallet(wallet.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WalletManager;
