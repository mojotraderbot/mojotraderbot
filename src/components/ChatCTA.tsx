import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import mojoLogo from "@/assets/mojo-logo.png";

const ChatCTA = () => {
  return (
    <section className="py-8">
      <div className="container">
        <motion.div 
          className="win95-window max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="win95-titlebar-green">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Open Mojo Survival Chat</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          <div className="bg-white p-8 text-center">
            <motion.img 
              src={mojoLogo} 
              alt="Mojo Trader" 
              className="w-24 h-24 mx-auto mb-4 object-contain"
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              animate={{ 
                y: [0, -5, 0],
              }}
            />
            
            <h2 className="font-mono text-xl md:text-2xl mb-2">
              READY TO <span className="text-[#039B4E]">TALK TO MOJO</span>?
            </h2>
            
            <p className="font-mono text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Talk to Mojo about risk, survival, and memecoins. Tune how aggressively he should trade to keep his oxygen (API credits) above zero.
            </p>
            
            <Link to="/chat">
              <motion.button 
                className="win95-button-primary text-sm flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 107, 74, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                OPEN MOJO TERMINAL
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
          
          <div className="win95-statusbar">
            <div className="win95-statusbar-inset flex-1 text-[10px]">
              Free to use | Watch Mojo fight the market
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatCTA;
