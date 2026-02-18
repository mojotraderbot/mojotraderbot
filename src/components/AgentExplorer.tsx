import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, ArrowRight, Check, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import mojoLogo from "@/assets/mojo-logo.png";
import { useAgents, useSelectedAgent } from "@/hooks/useAgents";
import CreateAgentModal from "./CreateAgentModal";

interface AgentExplorerProps {
  onAgentChange?: (agentId: string) => void;
}

const AgentExplorer = ({ onAgentChange }: AgentExplorerProps) => {
  const { data: agents = [], isLoading } = useAgents();
  const { selectedId, setSelectedId } = useSelectedAgent();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onAgentChange?.(id);
  };

  const handleAgentCreated = (agentId: string) => {
    setSelectedId(agentId);
    onAgentChange?.(agentId);
  };

  return (
    <section id="agent-explorer" className="py-4 lg:py-0">
      <CreateAgentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleAgentCreated}
      />

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
            <span className="text-xs sm:text-sm">Agent Explorer</span>
          </div>
          <div className="flex gap-1">
            <button className="win95-control-btn text-[8px]">_</button>
            <button className="win95-control-btn text-[8px]">□</button>
            <button className="win95-control-btn text-[8px]">×</button>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 border-b border-[#3a3a3a] flex items-center justify-between">
          <p className="font-mono text-[11px] text-[#c0c0c0]">
            Choose which agent to use. Tokens filter by agent.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="win95-button-primary flex items-center gap-1 px-2 py-1 text-[10px]"
          >
            <Plus className="w-3 h-3" />
            Create
          </button>
        </div>

        <div className="bg-[#1a1a1a] p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#039B4E]" />
              <span className="ml-2 text-[#808080] text-sm">Loading agents...</span>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1">
              {agents.map((agent, index) => {
                const isSelected = selectedId === agent.id;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={`win95-outset p-3 flex items-center gap-3 ${
                      isSelected ? "ring-2 ring-[#039B4E] ring-inset" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border border-[#3a3a3a] bg-[#2a2a2a] flex items-center justify-center">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mojoLogo}
                          alt={agent.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {agent.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#039B4E] flex-shrink-0" />
                        )}
                      </div>
                      {agent.description && (
                        <p className="font-mono text-[10px] text-[#808080] truncate">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isSelected && (
                        <button
                          onClick={() => handleSelect(agent.id)}
                          className="win95-button-primary flex items-center gap-1 px-2 py-1 text-[10px]"
                        >
                          Use
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {isSelected && (
                        <span className="font-mono text-[10px] text-[#039B4E]">Selected</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          {!isLoading && agents.length === 0 && (
            <div className="p-6 text-center font-mono text-sm text-[#808080]">
              No agents yet. Create your agent above.
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] p-2 border-t border-[#3a3a3a]">
          <Link to="/chat">
            <motion.button
              className="win95-button-primary w-full sm:w-auto flex items-center justify-center gap-2 text-xs px-3 py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowRight className="w-4 h-4" />
              Open chat with {agents.find((a) => a.id === selectedId)?.name ?? "agent"}
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default AgentExplorer;
