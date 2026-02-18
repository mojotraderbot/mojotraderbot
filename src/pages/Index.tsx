import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MojoProfile from "@/components/MojoProfile";
import WhatIsMojoTrader from "@/components/WhatIsPumpch";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import ChatCTA from "@/components/ChatCTA";
import Footer from "@/components/Footer";
import ReadmeModal from "@/components/ReadmeModal";
import HowMojoSurvivesModal from "@/components/HowMojoSurvivesModal";
import LoadingScreen from "@/components/LoadingScreen";
import WalletTradeHistory from "@/components/WalletTradeHistory";
import MojoStats from "@/components/MojoStats";
import MojoWalletPanel from "@/components/MojoWalletPanel";
import DraggableWindow from "@/components/DraggableWindow";
import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import mojoLogo from "@/assets/mojo-logo.png";
import pumpFunLogo from "@/assets/pump-fun-logo.png";
import xLogoSvg from "@/assets/x-logo.svg";

const Index = () => {
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [howMojoSurvivesOpen, setHowMojoSurvivesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Sync heights
  useEffect(() => {
    if (!rightColumnRef.current || !leftColumnRef.current) return;
    
    const updateHeight = () => {
      if (rightColumnRef.current && leftColumnRef.current) {
        const rightHeight = rightColumnRef.current.offsetHeight;
        leftColumnRef.current.style.height = `${rightHeight}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Use MutationObserver to watch for content changes
    const observer = new MutationObserver(updateHeight);
    if (rightColumnRef.current) {
      observer.observe(rightColumnRef.current, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background text-foreground scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      
      <ReadmeModal isOpen={readmeOpen} onClose={() => setReadmeOpen(false)} />
      <HowMojoSurvivesModal isOpen={howMojoSurvivesOpen} onClose={() => setHowMojoSurvivesOpen(false)} />

      {/* Desktop Icons */}
      <div className="win95-desktop">
        <div className="max-w-7xl mx-auto relative">
          {/* Desktop shortcuts */}
          <div className="hidden sm:flex gap-2 mb-4 flex-wrap items-center">
            <Link to="/chat">
              <motion.div 
                className="win95-icon flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-[#039B4E] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            </Link>
            <motion.button 
              onClick={() => setReadmeOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="win95-icon flex flex-col items-center">
                <div className="w-10 h-10 bg-[#039B4E] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.button>
            <Link to="/chat">
              <motion.div 
                className="win95-icon flex flex-col items-center"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={mojoLogo} alt="Mojo Trader" className="w-10 h-10 object-contain" />
              </motion.div>
            </Link>
            <a 
              href="https://pump.fun/coin/BCkx4JxNdMYS5a6vGdwsGjd3dQvPbuCaFZRdyn9Tpump"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.div 
                className="win95-icon flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-[#ff8c42] flex items-center justify-center">
                  <img src={pumpFunLogo} alt="Pump.fun" className="w-8 h-8 object-contain" />
                </div>
              </motion.div>
            </a>
            <a 
              href="https://x.com/tradermojobot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.div 
                className="win95-icon flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <img src={xLogoSvg} alt="X (Twitter)" className="w-6 h-6 object-contain" />
                </div>
              </motion.div>
            </a>
          </div>

          {/* Main Layout: Left Profile, Right Hero + Stats + Wallet */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4 items-stretch">
            {/* Left: Mojo Profile */}
            <div ref={leftColumnRef} className="lg:w-1/3 min-w-0 flex">
              <DraggableWindow className="w-full flex flex-col">
                <MojoProfile />
              </DraggableWindow>
            </div>

            {/* Right Column: HeroSection, MojoStats, MojoWalletPanel */}
            <div ref={rightColumnRef} className="lg:w-2/3 min-w-0 flex flex-col gap-4">
              {/* HeroSection */}
              <DraggableWindow className="w-full">
                <HeroSection onHowMojoSurvivesClick={() => setHowMojoSurvivesOpen(true)} />
              </DraggableWindow>

              {/* Mojo Survival Stats */}
              <DraggableWindow className="w-full">
                <MojoStats />
              </DraggableWindow>

              {/* Mojo Trading Wallet */}
              <DraggableWindow className="w-full">
                <MojoWalletPanel />
              </DraggableWindow>
            </div>
          </div>
          
          {/* Wallet Trade History */}
          <WalletTradeHistory />
          
          {/* Info Sections */}
          <WhatIsMojoTrader />
          <HowItWorks onOpenModal={() => setHowMojoSurvivesOpen(true)} />
          <Features />
          <ChatCTA />
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
};

export default Index;
