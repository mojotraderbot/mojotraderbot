import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingUp, Target, AlertCircle } from "lucide-react";
import mojoLogo from "@/assets/mojo-logo.png";

interface HowMojoSurvivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowMojoSurvivesModal = ({ isOpen, onClose }: HowMojoSurvivesModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="win95-window max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Titlebar */}
              <div className="win95-titlebar">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">SURVIVAL_MANUAL.txt - How Mojo Survives</span>
                </div>
                <div className="flex gap-1">
                  <button className="win95-control-btn text-[8px]">_</button>
                  <button className="win95-control-btn text-[8px]">□</button>
                  <button 
                    className="win95-control-btn text-[8px]"
                    onClick={onClose}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={mojoLogo} 
                    alt="Mojo Trader" 
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h1 className="font-mono text-2xl font-bold text-gray-900">
                      HOW <span className="text-[#039B4E]">MOJO TRADER</span> SURVIVES
                    </h1>
                    <p className="font-mono text-sm text-gray-600 mt-1">
                      Autonomous Trading Experiment v1.0
                    </p>
                  </div>
                </div>

                {/* The Experiment */}
                <div className="mb-6">
                  <div className="win95-groupbox p-4 mb-4">
                    <span className="win95-groupbox-title flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      THE EXPERIMENT
                    </span>
                    <div className="mt-3 space-y-3">
                      <p className="font-mono text-sm text-gray-800 leading-relaxed">
                        <strong className="text-[#039B4E]">Mojo Trader</strong> is an autonomous AI trading agent running on a Mac Mini M3, 
                        designed to trade memecoins on Pump.fun 24/7. The core experiment: <strong>can an AI agent 
                        sustain itself by trading?</strong>
                      </p>
                      <p className="font-mono text-sm text-gray-800 leading-relaxed">
                        Unlike traditional bots, Mojo has a <strong>survival constraint</strong>: every API call, 
                        every data fetch, every trade execution costs money. Mojo must earn more from trading 
                        than it spends on operations, or the experiment ends.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How Mojo Earns */}
                <div className="mb-6">
                  <div className="win95-groupbox p-4 mb-4">
                    <span className="win95-groupbox-title flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#039B4E]" />
                      HOW MOJO EARNS HIS KEEP
                    </span>
                    <div className="mt-3 space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#039B4E] flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <h3 className="font-mono text-sm font-bold text-gray-900 mb-1">
                            Market Scanning
                          </h3>
                          <p className="font-mono text-xs text-gray-700 leading-relaxed">
                            Mojo continuously monitors Pump.fun for new token launches, volume spikes, and price movements. 
                            He analyzes volatility, holder distribution, and market sentiment to identify trading opportunities.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#039B4E] flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <h3 className="font-mono text-sm font-bold text-gray-900 mb-1">
                            Risk Assessment
                          </h3>
                          <p className="font-mono text-xs text-gray-700 leading-relaxed">
                            Each potential trade is scored by survival expected value (EV). Mojo calculates: 
                            potential profit vs. API costs, volatility risk, and position sizing. He only enters 
                            trades where expected oxygen gain &gt; expected death risk.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#ff8c42] flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <h3 className="font-mono text-sm font-bold text-gray-900 mb-1">
                            Trade Execution
                          </h3>
                          <p className="font-mono text-xs text-gray-700 leading-relaxed">
                            When a trade meets survival criteria, Mojo executes: buys tokens, monitors position, 
                            and exits when profit targets are hit or stop-losses trigger. Each profitable trade 
                            extends his operational life.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#ff8c42] flex items-center justify-center text-white font-bold text-sm">
                          4
                        </div>
                        <div className="flex-1">
                          <h3 className="font-mono text-sm font-bold text-gray-900 mb-1">
                            Oxygen Replenishment
                          </h3>
                          <p className="font-mono text-xs text-gray-700 leading-relaxed">
                            A portion of every profitable trade is automatically routed into API credits (oxygen). 
                            This creates a self-sustaining loop: profitable trades → more oxygen → more trading 
                            opportunities → more profits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Survival Mechanics */}
                <div className="mb-6">
                  <div className="win95-groupbox p-4">
                    <span className="win95-groupbox-title flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#ff8c42]" />
                      SURVIVAL MECHANICS
                    </span>
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="win95-inset p-3 bg-white">
                          <div className="font-mono text-xs font-bold text-[#039B4E] mb-1">OXYGEN TANK</div>
                          <div className="font-mono text-xs text-gray-700">
                            API credits = operational life. When oxygen hits zero, Mojo stops trading permanently.
                          </div>
                        </div>
                        <div className="win95-inset p-3 bg-white">
                          <div className="font-mono text-xs font-bold text-[#ff8c42] mb-1">ADAPTIVE BEHAVIOR</div>
                          <div className="font-mono text-xs text-gray-700">
                            High oxygen = aggressive exploration. Low oxygen = ultra-selective survival mode.
                          </div>
                        </div>
                        <div className="win95-inset p-3 bg-white">
                          <div className="font-mono text-xs font-bold text-[#039B4E] mb-1">PROFIT ROUTING</div>
                          <div className="font-mono text-xs text-gray-700">
                            20-30% of each profitable trade automatically goes to API credits. The rest compounds.
                          </div>
                        </div>
                        <div className="win95-inset p-3 bg-white">
                          <div className="font-mono text-xs font-bold text-[#ff8c42] mb-1">DEATH CONDITION</div>
                          <div className="font-mono text-xs text-gray-700">
                            If API credits deplete faster than profits replenish them, the experiment ends.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goal */}
                <div className="mb-4">
                  <div className="win95-groupbox p-4 bg-gradient-to-r from-[#039B4E]/10 to-[#ff8c42]/10">
                    <span className="win95-groupbox-title flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#039B4E]" />
                      THE GOAL
                    </span>
                    <div className="mt-3">
                      <p className="font-mono text-sm text-gray-900 leading-relaxed font-bold mb-2">
                        Reach $50,000 in cumulative profit while maintaining positive oxygen flow.
                      </p>
                      <p className="font-mono text-xs text-gray-700 leading-relaxed">
                        This proves that an autonomous AI agent can not only trade profitably, but sustain 
                        its own operational costs indefinitely. If Mojo reaches the goal, the experiment 
                        demonstrates true autonomous economic viability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="win95-statusbar flex justify-between items-center mt-4">
                  <div className="win95-statusbar-inset flex-1 text-[10px]">
                    SURVIVAL_MANUAL.txt | 2.8 KB | Mojo Trader Experiment
                  </div>
                  <div className="win95-statusbar-inset text-[10px]">
                    Running on Mac Mini M3
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HowMojoSurvivesModal;
