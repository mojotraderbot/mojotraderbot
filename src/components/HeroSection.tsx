import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onHowMojoSurvivesClick?: () => void;
}

const HeroSection = ({ onHowMojoSurvivesClick }: HeroSectionProps) => {
  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs sm:text-sm">Mojo Trader</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-control-btn text-[8px]">_</button>
          <button className="win95-control-btn text-[8px]">□</button>
          <button className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>
      
      <div className="bg-white p-3">
        <h1 className="font-mono text-2xl md:text-3xl lg:text-4xl mb-2 leading-tight">
          <span className="text-[#039B4E]">MOJO</span> <span className="text-[#ff8c42]">TRADER</span>
          <span className="animate-blink text-[#039B4E]">_</span>
        </h1>

        <p className="font-mono text-xs md:text-sm text-gray-800 max-w-xl mb-3 leading-relaxed">
          <span className="text-[#039B4E] font-bold">Autonomous Survival Trading</span> — an AI monkey running on a Mac Mini M3, 
          trading Pump.fun memecoins 24/7 to pay his own API bills. Profit is oxygen. Drawdown is suffocation.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-2">
          <Link to="/chat">
            <button className="win95-button-primary flex items-center gap-1.5 text-xs hover-elevate active-elevate-2">
              <span>OPEN MOJO TERMINAL</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
          <button 
            className="win95-button text-xs hover-elevate active-elevate-2"
            onClick={onHowMojoSurvivesClick}
          >
            HOW MOJO SURVIVES
          </button>
        </div>

        {/* Powered by */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] text-[#808080] uppercase tracking-wider">
            Powered by:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {["Solana", "Pump.fun", "Mac Mini M3", "Autonomous Agent"].map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider hover:text-[#039B4E] transition-colors cursor-default whitespace-nowrap">
                  {item}
                </span>
                {i < 3 && <span className="text-gray-400">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
