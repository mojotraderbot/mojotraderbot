import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Send, ArrowLeft, Rocket, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeed from "@/components/NewsFeed";
import { toast } from "sonner";
import { useSelectedAgent, useAgents, DEFAULT_AGENT_ID } from "@/hooks/useAgents";
import { streamClaudeMessages, ChatMessage } from "@/lib/anthropic";
import mojoLogo from "@/assets/mojo-logo.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "wallet_prompt" | "logo_prompt" | "banner_prompt";
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Mojo online. I'm an autonomous trading monkey wired into Pump.fun, running on a Mac Mini M3. I hunt volatile memecoins, try to pay my own API bills, and extend my life with every profitable trade. What kind of risk profile do you want me to run today?",
    timestamp: new Date(),
  },
];

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { selectedId: selectedAgentId } = useSelectedAgent();
  const { data: agents = [] } = useAgents();
  const currentAgent = agents.find((a) => a.id === selectedAgentId) ?? agents[0];
  const agentAvatar = currentAgent?.avatar ?? mojoLogo;
  const agentName = currentAgent?.name ?? "Mojo Trader";

  // Stats (real data placeholders - would come from API)
  const [stats, setStats] = useState({
    analyzed: 0,
    activeLaunches: 0,
  });

  // Load real stats
  useEffect(() => {
    // Simulate loading real stats
    const loadStats = async () => {
      // In real app, fetch from API
      setStats({
        analyzed: Math.floor(Math.random() * 50) + 100,
        activeLaunches: Math.floor(Math.random() * 10) + 5,
      });
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle URL params: prompt (prefill input)
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setInput(promptParam);
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean message content (remove token JSON blocks from display if any)
  const cleanMessageContent = (content: string) => {
    return content.replace(/```token\s*\n?[\s\S]*?\n?```/g, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Prepare messages for Anthropic API
    const apiMessages: ChatMessage[] = newMessages.map(m => ({ 
      role: m.role, 
      content: m.content 
    }));

    const systemPrompt =
      selectedAgentId === DEFAULT_AGENT_ID || !currentAgent?.system_prompt
        ? null
        : currentAgent.system_prompt;

    // Create assistant message placeholder
    const assistantId = (Date.now() + 1).toString();
    let assistantContent = "";
    let hasReceivedContent = false;
    
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }]);

    try {
      // Stream from Anthropic API
      await streamClaudeMessages(
        apiMessages,
        systemPrompt,
        (chunk: string) => {
          hasReceivedContent = true;
          assistantContent += chunk;
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, content: assistantContent } : m
          ));
        },
        (error: Error) => {
          console.error("Anthropic API error:", error);
          throw error;
        }
      );

      // If no content was received, remove the placeholder
      if (!hasReceivedContent) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        toast.error(`Failed to get response from ${agentName}`);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Connection error. Market feed desynced. Mojo lost connection — try again in a moment.",
          timestamp: new Date(),
        }]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      
      // Remove empty placeholder if no content was received
      if (!hasReceivedContent) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
      
      toast.error(`Failed to get response from ${agentName}`);
      setMessages(prev => {
        // Don't add error message if we already have content
        if (hasReceivedContent) return prev;
        
        return [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Connection error. Market feed desynced. Mojo lost connection — try again in a moment.",
          timestamp: new Date(),
        }];
      });
    }

    setIsTyping(false);
  };

  const handleLaunchIdea = (newsTitle: string) => {
    const prompt = `Based on this news: "${newsTitle}" - what trading opportunities do you see?`;
    setInput(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden p-2 sm:p-4">
      {/* Left Sidebar - Token Setup */}
      <aside className="w-72 hidden lg:flex flex-col shrink-0 mr-2 max-h-full">
        <div className="win95-window h-full flex flex-col overflow-hidden">
          <div className="win95-titlebar">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span className="text-xs">{agentName} Desk</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          <div className="bg-[#c0c0c0] flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-2 border-b-2 border-[#808080]">
              <Link to="/" className="flex items-center gap-2 text-[#039B4E] hover:underline">
                <ArrowLeft className="w-3 h-3" />
                <span className="font-mono text-xs">← Back to Desktop</span>
              </Link>
            </div>

            {/* Masthead */}
            <div className="p-3 border-b-2 border-[#808080] bg-[#039B4E] text-white">
              <h1 className="font-['VT323'] text-xl text-[#ff6b00]">{agentName}</h1>
              <p className="font-mono text-[10px] text-[#c0c0c0]">
                {agentName.toUpperCase()} DESK v1.0
              </p>
            </div>

            {/* Real Stats */}
            <div className="p-2">
              <div className="win95-groupbox p-2">
                <span className="win95-groupbox-title">Statistics</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="win95-inset p-2 text-center bg-white">
                    <Search className="w-3 h-3 mx-auto mb-1 text-black" />
                    <p className="font-bold text-lg text-black">{stats.analyzed}</p>
                    <p className="font-mono text-[10px] text-black">Analyzed</p>
                  </div>
                  <div className="win95-inset p-2 text-center bg-white">
                    <Rocket className="w-3 h-3 mx-auto mb-1 text-[#ff6b00]" />
                    <p className="font-bold text-lg text-[#ff6b00]">{stats.activeLaunches}</p>
                    <p className="font-mono text-[10px] text-black">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reserved for future on-chain controls (no wallet connect here) */}
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 mx-2 max-h-full overflow-hidden">
        <div className="win95-window h-full flex flex-col overflow-hidden">
          <div className="win95-titlebar-green">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span className="text-xs">{agentName} - Agent Chat</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          {/* Chat header */}
          <div className="bg-[#c0c0c0] p-2 border-b-2 border-[#808080] flex items-center justify-between">
            <div className="lg:hidden">
              <Link to="/" className="flex items-center gap-2 text-[#039B4E] hover:underline">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-['VT323'] text-lg text-[#ff6b00]">{agentName}</span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <h2 className="font-bold text-sm">Direct line to the {agentName} survival desk</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span>{stats.analyzed} analyzed</span>
                <span>•</span>
                <span className="text-[#039B4E] font-bold">{stats.activeLaunches} active</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#039B4E] animate-pulse" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0 : 0 }}
                  className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <img
                      src={agentAvatar}
                      alt={agentName}
                      className="w-8 h-8 rounded-sm shrink-0 object-cover border border-[#3a3a3a]"
                    />
                  )}
                  <motion.div
                    className={`max-w-xl ${
                      message.role === "user"
                        ? "bg-[#039B4E] text-white border-2 border-t-[#05c465] border-l-[#05c465] border-b-[#027a3e] border-r-[#027a3e]"
                        : "bg-white text-[#039B4E] border border-gray-300"
                    } p-3`}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Message header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs uppercase opacity-70">
                        {message.role === "user" ? "You" : agentName}
                      </span>
                      <span className="font-mono text-[10px] opacity-50">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {/* Message content */}
                    <div className="font-mono text-sm leading-relaxed whitespace-pre-line">
                      {cleanMessageContent(message.content)}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div 
                  className="flex items-start gap-2 justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <img
                    src={agentAvatar}
                    alt={agentName}
                    className="w-8 h-8 rounded-sm shrink-0 object-cover border border-[#3a3a3a]"
                  />
                  <div className="bg-white border border-gray-300 p-3">
                    <motion.span 
                      className="font-mono text-xs text-[#039B4E]"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      {agentName} is analyzing...
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-[#c0c0c0] p-2 border-t-2 border-[#dfdfdf]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${agentName} anything...`}
                className="win95-inset flex-1 px-2 py-1 font-mono text-sm bg-white"
              />
              <button 
                type="submit" 
                className="win95-button-primary px-4 flex items-center gap-1"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <p className="font-mono text-[10px] text-[#808080] mt-1 text-center">
              Press Enter to send • {agentName} does not provide financial or spiritual advice
            </p>
          </div>
        </div>
      </main>

      {/* Right Sidebar - News */}
      <aside className="w-72 hidden xl:flex flex-col shrink-0 ml-2 max-h-full">
        <NewsFeed onLaunchIdea={handleLaunchIdea} />
      </aside>
    </div>
  );
};

export default Chat;
