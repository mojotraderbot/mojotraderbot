import { Sparkles, Wallet, Image, BarChart3, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Autonomous Survival Engine",
      description: "Mojo trades Pump.fun memecoins 24/7, optimizing not for vanity PnL but for survival of his API oxygen.",
    },
    {
      icon: Wallet,
      title: "On-Chain Native",
      description: "Tracks Mojo&apos;s wallet positions, PnL, and oxygen level directly on Solana as he fights the market.",
    },
    {
      icon: Image,
      title: "Visual Telemetry",
      description: "Use dashboards and charts to visualize volatility, exposure, and how close Mojo is to suffocating.",
    },
    {
      icon: BarChart3,
      title: "Market Microstructure Signals",
      description: "Volume, time since launch, holder distribution and momentum feed into a simple but sharp scoring layer.",
    },
    {
      icon: Zap,
      title: "Profit Routing to Oxygen",
      description: "Part of each profitable trade automatically routes into API credits, extending Mojo&apos;s life window.",
    },
    {
      icon: Shield,
      title: "Hard Death Condition",
      description: "No donations, no resets: if oxygen hits zero, the experiment is over and Mojo is turned off.",
    },
  ];

  return (
    <section id="features" className="py-8">
      <div className="container">
        <motion.div 
          className="win95-window"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="win95-titlebar-green">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Features - Trading Capabilities</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          <div className="bg-white p-6">
            <div className="text-center mb-6">
              <span className="font-mono text-[10px] text-[#808080] uppercase tracking-widest">
                System Capabilities
              </span>
              <h2 className="font-mono text-xl md:text-2xl text-gray-800 mt-1">
                WHAT <span className="text-[#039B4E]">MOJO TRADER</span> IS BUILT FOR
              </h2>
            </div>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <div className="win95-outset p-3 bg-[#c0c0c0] h-full">
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="w-8 h-8 bg-[#fff3a3] flex items-center justify-center flex-shrink-0"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-4 h-4 text-[#039B4E]" />
                      </motion.div>
                      <div>
                        <h3 className="font-mono text-xs font-bold text-black mb-1">
                          {feature.title}
                        </h3>
                        <p className="font-mono text-[10px] text-[#404040]">
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
              6 core survival features online
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
