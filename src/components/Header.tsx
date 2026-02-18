import { Link } from "react-router-dom";
import { Minus, Square, X, Menu, MessageSquare, Copy, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import mojoLogo from "@/assets/mojo-logo.png";
import Win95Notification from "@/components/Win95Notification";

const CONTRACT_ADDRESS = "BCkx4JxNdMYS5a6vGdwsGjd3dQvPbuCaFZRdyn9Tpump";

type ActiveSection = "trades" | "how-it-works" | "features" | null;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleCopyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setNotificationOpen(true);
  };

  const handleSectionClick = (section: ActiveSection, elementId: string) => {
    setActiveSection(section);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'wallet-trade-history', key: 'trades' as ActiveSection },
        { id: 'how-it-works', key: 'how-it-works' as ActiveSection },
        { id: 'features', key: 'features' as ActiveSection },
      ];

      const scrollPosition = window.scrollY + 100; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].key);
          return;
        }
      }
      setActiveSection(null);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Win95Notification
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message={`Contract Address copied to clipboard!\n\n${CONTRACT_ADDRESS}`}
        type="success"
        duration={3000}
      />
      <header className="win95-window">
      {/* Title Bar */}
      <div className="win95-titlebar">
        <div className="flex items-center gap-2">
          <motion.img 
            src={mojoLogo} 
            alt="Mojo Trader" 
            className="w-5 h-5" 
            whileHover={{ rotate: 20, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <Link to="/">
            <span className="cursor-pointer text-white font-bold text-xs sm:text-sm">
              <span className="hidden sm:inline">Mojo Trader</span>
              <span className="sm:hidden">Mojo Trader</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button className="win95-control-btn hidden sm:flex" title="Minimize">
            <Minus className="w-2 h-2" />
          </button>
          <button className="win95-control-btn hidden sm:flex" title="Maximize">
            <Square className="w-2 h-2" />
          </button>
          <button className="win95-control-btn hidden sm:flex" title="Close">
            <X className="w-2 h-2" />
          </button>
          <button 
            className="win95-control-btn sm:hidden flex"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="win95-menubar flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-start sm:items-center`}>
          <nav className="flex flex-col sm:flex-row items-start sm:items-center">
            <a 
              href="#wallet-trade-history" 
              onClick={(e) => { 
                e.preventDefault(); 
                handleSectionClick('trades', 'wallet-trade-history'); 
              }}
            >
              <motion.span 
                className={`px-2 py-0.5 cursor-pointer text-[11px] transition-colors ${
                  activeSection === 'trades' 
                    ? 'bg-[#039B4E] text-white' 
                    : 'text-black hover:bg-[#039B4E] hover:text-white'
                }`}
                whileHover={activeSection !== 'trades' ? { backgroundColor: "#039B4E", color: "#fff" } : {}}
                whileTap={{ scale: 0.95 }}
              >
                Mojo&apos;s Trades
              </motion.span>
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => { 
                e.preventDefault(); 
                handleSectionClick('how-it-works', 'how-it-works'); 
              }}
            >
              <motion.span 
                className={`px-2 py-0.5 cursor-pointer text-[11px] transition-colors ${
                  activeSection === 'how-it-works' 
                    ? 'bg-[#039B4E] text-white' 
                    : 'text-black hover:bg-[#039B4E] hover:text-white'
                }`}
                whileHover={activeSection !== 'how-it-works' ? { backgroundColor: "#039B4E", color: "#fff" } : {}}
                whileTap={{ scale: 0.95 }}
              >
                How It Works
              </motion.span>
            </a>
            <a 
              href="#features" 
              onClick={(e) => { 
                e.preventDefault(); 
                handleSectionClick('features', 'features'); 
              }}
            >
              <motion.span 
                className={`px-2 py-0.5 cursor-pointer text-[11px] transition-colors ${
                  activeSection === 'features' 
                    ? 'bg-[#039B4E] text-white' 
                    : 'text-black hover:bg-[#039B4E] hover:text-white'
                }`}
                whileHover={activeSection !== 'features' ? { backgroundColor: "#039B4E", color: "#fff" } : {}}
                whileTap={{ scale: 0.95 }}
              >
                Features
              </motion.span>
            </a>
            <Link to="/chat">
              <motion.span 
                className="px-2 py-0.5 bg-[#039B4E] text-white flex items-center gap-1 text-[11px] cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-3 h-3" />
                Mojo Terminal
              </motion.span>
            </Link>
            <motion.button 
              onClick={handleCopyCA}
              className="px-2 py-0.5 text-black hover:bg-[#039B4E] hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
              whileHover={{ backgroundColor: "#039B4E", color: "#fff" }}
              whileTap={{ scale: 0.95 }}
            >
              <Copy className="w-3 h-3" />
              CA
            </motion.button>
            <a href="https://x.com/tradermojobot" target="_blank" rel="noopener noreferrer">
              <motion.span 
                className="px-2 py-0.5 text-black hover:bg-[#039B4E] hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
                whileHover={{ backgroundColor: "#039B4E", color: "#fff" }}
              >
                <ExternalLink className="w-3 h-3" />
                X
              </motion.span>
            </a>
          </nav>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
