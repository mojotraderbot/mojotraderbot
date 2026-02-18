import { Button } from "@/components/ui/button";
import { Rocket, Boxes, Target, Lock } from "lucide-react";

export type LaunchMode = "dev" | "dev_bundle" | "dev_bundle_snipe";

interface LaunchModeSelectorProps {
  mode: LaunchMode;
  onModeChange: (mode: LaunchMode) => void;
}

const LaunchModeSelector = ({ mode, onModeChange }: LaunchModeSelectorProps) => {
  const modes = [
    {
      id: "dev" as LaunchMode,
      label: "Dev Buy",
      icon: Rocket,
      description: "Simple dev wallet buy",
      available: true,
    },
    {
      id: "dev_bundle" as LaunchMode,
      label: "Dev + Bundle",
      icon: Boxes,
      description: "Dev + multiple wallets",
      available: false,
    },
    {
      id: "dev_bundle_snipe" as LaunchMode,
      label: "Dev + Bundle + Snipe",
      icon: Target,
      description: "Full launch suite",
      available: false,
    },
  ];

  return (
    <div className="win95-groupbox p-2">
      <span className="win95-groupbox-title">Launch Mode</span>

      <div className="space-y-1 mt-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => m.available && onModeChange(m.id)}
            disabled={!m.available}
            className={`w-full flex items-center gap-2 p-2 transition-all duration-200 text-left ${
              mode === m.id
                ? "win95-inset bg-[#039B4E]"
                : m.available
                ? "win95-button hover:bg-[#d4d4d4]"
                : "win95-button opacity-60 cursor-not-allowed"
            }`}
          >
            <m.icon className={`w-4 h-4 ${mode === m.id ? "text-[#ff6b00]" : "text-black"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs uppercase ${mode === m.id ? "text-[#ff6b00]" : "text-black"}`}>
                  {m.label}
                </span>
                {!m.available && (
                  <Lock className="w-3 h-3 text-[#808080]" />
                )}
              </div>
              <p className={`font-mono text-[10px] truncate ${mode === m.id ? "text-[#c0c0c0]" : "text-[#808080]"}`}>
                {m.description}
              </p>
            </div>
            {mode === m.id && (
              <div className="w-2 h-2 bg-[#00ff00] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LaunchModeSelector;
