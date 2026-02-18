import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import mojoLogo from "@/assets/mojo-logo.png";
import { useSelectedAgent, useAgents } from "@/hooks/useAgents";

const AgentCard = () => {
  const { selectedId } = useSelectedAgent();
  const { data: agents = [], isLoading } = useAgents();
  const currentAgent = agents.find((a) => a.id === selectedId) ?? agents[0];
  const displayName = currentAgent?.name ?? "Mojo Trader";
  const displayAvatar = currentAgent?.avatar ?? mojoLogo;

  return (
    <div className="win95-window h-full">
      <div className="win95-titlebar-green">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{displayName} Agent</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-control-btn text-[8px]">_</button>
          <button className="win95-control-btn text-[8px]">□</button>
          <button className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>
      
      <div className="bg-white p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
        {isLoading ? (
          <Loader2 className="w-12 h-12 animate-spin text-[#039B4E] mb-6" />
        ) : (
          <motion.img 
            src={displayAvatar} 
            alt={`${displayName} AI Agent`} 
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 rounded overflow-hidden bg-[#2a2a2a]"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        <Link to="/chat" className="w-full">
          <motion.button 
            className="win95-button-primary w-full flex items-center justify-center gap-2 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Talk to {displayName}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default AgentCard;
