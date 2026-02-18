import { Folder, Plus, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const sacredTokens: Array<{
  id: string;
  name: string;
  ticker: string;
  mint_address: string;
  logo: string;
  pump_url: string;
}> = [];

const LaunchedTokens = () => {
  return (
    <section id="launched-tokens" className="py-8">
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
              <Folder className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Mojo&apos;s Trade History - Pump.fun Positions</span>
            </div>
            <div className="flex gap-1">
              <button className="win95-control-btn text-[8px]">_</button>
              <button className="win95-control-btn text-[8px]">□</button>
              <button className="win95-control-btn text-[8px]">×</button>
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="bg-white p-2 border-b border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-end">
              <Link to="/chat">
                <motion.button 
                  className="win95-button-primary text-xs flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3 h-3" />
                  New Trade
                </motion.button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-white p-3 flex flex-wrap justify-center gap-2 sm:gap-4 border-b border-gray-300">
            {[
              { label: "Trades", value: sacredTokens.length, color: "text-[#039B4E]" },
              { label: "Profit", value: 0, color: "text-[#039B4E]" },
              { label: "Oxygen", value: 0, color: "text-[#ff8c42]" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="win95-groupbox px-3 sm:px-4 py-2 min-w-[80px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="win95-groupbox-title text-[8px] sm:text-[9px] whitespace-nowrap">{stat.label}</span>
                <div className={`text-lg font-bold ${stat.color} text-center`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Token List */}
          <div className="bg-white p-2">
            <div className="win95-listview overflow-hidden">
              {/* Mobile view */}
              <div className="sm:hidden space-y-2 p-2">
                {sacredTokens.map((token, index) => (
                  <motion.a 
                    key={token.id} 
                    href={token.pump_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="win95-outset p-3 cursor-pointer block"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <motion.img 
                        src={token.logo} 
                        alt={token.name} 
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                        whileHover={{ rotate: 10 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-black">{token.ticker}</span>
                            <span className="text-[10px] px-1 bg-[#039B4E] text-white">MOJO</span>
                          </div>
                        </div>
                        <span className="text-[#808080] text-xs block truncate">{token.name}</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-[#808080] mt-1 truncate">
                      CA: {token.mint_address}
                    </div>
                  </motion.a>
                ))}
              </div>
          
              {/* Desktop view */}
              <table className="hidden sm:table w-full text-xs">
                <thead className="win95-listview-header">
                  <tr>
                    <th className="text-left p-2 text-black">Token</th>
                    <th className="text-left p-2 text-black">Name</th>
                    <th className="text-left p-2 text-black">Type</th>
                    <th className="text-left p-2 text-black">CA</th>
                    <th className="text-center p-2 text-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sacredTokens.map((token, index) => (
                    <motion.tr 
                      key={token.id} 
                      className="win95-listview-row-orange cursor-pointer border-b border-[#c0c0c0]"
                      onClick={() => window.open(token.pump_url, '_blank')}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "rgba(255, 107, 74, 0.1)" }}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <motion.img 
                            src={token.logo} 
                            alt={token.name} 
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                          />
                          <span className="font-bold text-black">{token.ticker}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-[#808080] text-[11px]">{token.name}</span>
                      </td>
                      <td className="p-2">
                        <span className="text-[10px] px-1 bg-[#039B4E] text-white">MOJO</span>
                      </td>
                      <td className="p-2">
                        <span className="font-mono text-[10px] text-[#808080] truncate max-w-[180px] block">{token.mint_address}</span>
                      </td>
                      <td className="p-2 text-center">
                        <motion.a 
                          href={token.pump_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="win95-button-primary text-[10px] px-2 py-1 inline-flex items-center gap-1"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          VIEW
                        </motion.a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="win95-statusbar flex justify-between items-center">
            <div className="win95-statusbar-inset flex-1 text-[10px]">
              {sacredTokens.length} trade(s) tracked | Mojo Trader
            </div>
            <div className="win95-statusbar-inset text-[10px]">
              Solana Mainnet
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LaunchedTokens;
