import { FileText, Search, Rocket, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

interface HowItWorksProps {
  onOpenModal?: () => void;
}

const HowItWorks = ({ onOpenModal }: HowItWorksProps) => {
  const steps = [
    {
      icon: FileText,
      title: "Feed Mojo the Market",
      description: "Mojo ingests Pump.fun listings, volume, price action and basic meta — nothing spiritual, only data.",
      color: "bg-[#039B4E]",
    },
    {
      icon: Search,
      title: "Score Survival EV",
      description: "Each token is scored by volatility, age, holder distribution and rag risk to estimate survival expected value.",
      color: "bg-[#027a3e]",
    },
    {
      icon: Rocket,
      title: "Enter & Route Profit",
      description: "Mojo enters positions where expected oxygen > expected death and routes a slice of profit into API credits.",
      color: "bg-[#039B4E]",
    },
    {
      icon: TrendingUp,
      title: "Adapt or Die",
      description: "PnL and oxygen level feed back into aggression: in comfort he explores, near zero he becomes ultra‑selective.",
      color: "bg-[#ff8c42]",
    },
  ];

  return (
    <section id="how-it-works" className="py-8">
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
              <Rocket className="w-4 h-4" />
              <span className="text-xs sm:text-sm">How It Works - SURVIVAL_MANUAL.txt</span>
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
                The Survival Loop
              </span>
              <motion.h2 
                className="font-mono text-xl md:text-2xl text-gray-800 mt-1 cursor-pointer"
                onClick={onOpenModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                HOW <span className="text-[#039B4E]">MOJO TRADER</span> STAYS ALIVE
              </motion.h2>
              {onOpenModal && (
                <p className="font-mono text-[10px] text-[#808080] mt-2 cursor-pointer hover:text-[#039B4E]" onClick={onOpenModal}>
                  Click to read full survival manual →
                </p>
              )}
            </div>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.15}>
              {steps.map((step, index) => (
                <StaggerItem key={step.title}>
                  <div className="win95-outset p-4 bg-[#c0c0c0] h-full">
                    <div className="flex flex-col items-center text-center">
                      <motion.div 
                        className="font-mono text-2xl font-bold text-[#808080] mb-2"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                      >
                        0{index + 1}
                      </motion.div>
                      <motion.div 
                        className={`w-10 h-10 ${step.color} flex items-center justify-center mb-3`}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <step.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="font-mono text-xs font-bold text-black mb-2">
                        {step.title}
                      </h3>
                      <p className="font-mono text-[10px] text-[#404040]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
          
          <div className="win95-statusbar">
            <div className="win95-statusbar-inset flex-1 text-[10px]">
              4 steps in Mojo&apos;s survival loop
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
