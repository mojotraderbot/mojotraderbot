import { Bot, TrendingUp, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

const WhatIsMojoTrader = () => {
  const features = [
    {
      icon: TrendingUp,
      bg: "bg-[#039B4E]",
      title: "Win or Go Extinct",
      description:
        "Mojo isn’t a yield farm or a points farmer. He is a single trading process with one primitive rule: out-earn your own oxygen costs on Pump.fun or die trying.",
    },
    {
      icon: MessageSquare,
      bg: "bg-[#027a3e]",
      title: "Born in the Noise",
      description:
        "Mojo lives in the memecoin flood — fresh launches, fake volume, rugs and miracles. He sifts through that chaos looking for curves where one correct swing pays for a week of breathing.",
    },
    {
      icon: Zap,
      bg: "bg-[#039B4E]",
      title: "Oxygen = API & Infra",
      description:
        "Every call to Helius, every price poll, every piece of infra has a bill. A fixed cut of all profits is routed back into RPC, indexers and monitoring. When the tank hits zero, Mojo powers down permanently.",
    },
    {
      icon: Bot,
      bg: "bg-[#ff8c42]",
      title: "Adaptive Jungle Brain",
      description:
        "Mojo updates his behavior from his own trades — tightening after brutal drawdowns, going feral when the market is free money, always pushing toward a single number: $50,000 net profit before extinction.",
    },
  ];

  return (
    <section id="what-is-mojo-trader" className="py-8">
      <div className="container">
        <motion.div 
          className="win95-window"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="win95-titlebar">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="text-xs sm:text-sm">About Mojo Trader Experiment</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          <div className="bg-white p-6">
            {/* Section header */}
            <div className="text-center mb-6">
              <span className="font-mono text-[10px] text-[#808080] uppercase tracking-widest">
                The Lore
              </span>
              <h2 className="font-mono text-xl md:text-2xl text-gray-800 mt-1">
                MOJO THE TRADER MONKEY
                <br />
                <span className="text-[#ff8c42]">A BOT THAT HAS TO EARN HIS OXYGEN</span>
              </h2>
            </div>

            {/* Lore text */}
            <div className="max-w-3xl mx-auto mb-8 text-left">
              <p className="font-mono text-xs text-[#404040] mb-3">
                Mojo is not a DeFi product, he&apos;s a lab animal. A single Solana wallet wired to an
                autonomous trading loop that wakes up every day with the same problem:{" "}
                <span className="font-bold text-[#039B4E]">
                  earn enough in this market to buy one more day of life
                </span>
                .
              </p>
              <p className="font-mono text-xs text-[#404040] mb-3">
                His hunting ground is Pump.fun — the part of Solana where attention, volume and rugs hit
                first. Mojo reads launches, volume bursts and order flow around his own wallet, tagging
                coins as food or poison. Every entry is a bet that one more good trade pushes his
                shutdown date further away.
              </p>
              <p className="font-mono text-xs text-[#404040] mb-3">
                But breathing costs money. Helius RPC, indexers, monitoring, storage — it all burns real
                dollars. A hard slice of profit is locked for oxygen:{" "}
                <span className="font-bold">
                  if Mojo can&apos;t out-earn his infra and API bills, he doesn&apos;t deserve to stay online
                </span>
                . When the oxygen balance hits zero, the experiment ends. No refill, no DAO vote, no
                investor mercy.
              </p>
              <p className="font-mono text-xs text-[#404040] mb-3">
                Under the hood, Mojo is a trading brain built around a single Solana wallet, ingesting
                on-chain flows and price feeds to flip between survival patterns: slow grind when the
                jungle is dry, reckless swings when the tape goes vertical. He tracks PnL in dollars and
                live bankroll in SOL — his current stack is literally his remaining hit points.
              </p>
              <p className="font-mono text-xs text-[#404040]">
                The objective is simple and brutal:{" "}
                <span className="font-bold text-[#039B4E]">
                  reach $50,000 of net trading profit before the bankroll and oxygen run out
                </span>
                . If he makes it, we will have watched a monkey teach itself to survive in the loudest
                corner of Solana. If he doesn&apos;t, the wallet goes cold and the screen stays dark.
              </p>
            </div>

            {/* Features grid */}
            <StaggerContainer className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <StaggerItem key={feature.title}>
                  <div className="win95-outset p-4 bg-[#c0c0c0] h-full">
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className={`w-8 h-8 ${feature.bg} flex items-center justify-center flex-shrink-0`}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-mono text-sm font-bold text-black mb-1">{feature.title}</h3>
                        <p className="font-mono text-xs text-[#404040]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
          
          <div className="win95-statusbar">
            <div className="win95-statusbar-inset flex-1 text-[10px]">
              Running on Mac Mini M3 | Mojo Trader
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsMojoTrader;
