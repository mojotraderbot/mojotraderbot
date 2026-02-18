import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const AreaSelector = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isActive) return;
      
      // Don't start selection if clicking on the control panel
      const target = e.target as HTMLElement;
      if (target.closest('.area-selector-controls')) return;

      setIsSelecting(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPos({ x, y });
        setCurrentPos({ x, y });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive || !isSelecting) return;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPos({ x, y });
      }
    };

    const handleMouseUp = () => {
      if (!isActive || !isSelecting) return;
      
      setIsSelecting(false);
      
      const area: SelectionArea = {
        x: Math.min(startPos.x, currentPos.x),
        y: Math.min(startPos.y, currentPos.y),
        width: Math.abs(currentPos.x - startPos.x),
        height: Math.abs(currentPos.y - startPos.y),
      };

      // Only set selection if area is meaningful (at least 10px)
      if (area.width > 10 && area.height > 10) {
        setSelection(area);
      } else {
        setSelection(null);
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isActive, isSelecting, startPos, currentPos]);

  const getSelectionArea = (): SelectionArea | null => {
    if (!isSelecting) return selection;
    
    return {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y),
    };
  };

  const area = getSelectionArea();

  const handleCopy = () => {
    if (!area) return;
    
    const data = {
      x: Math.round(area.x),
      y: Math.round(area.y),
      width: Math.round(area.width),
      height: Math.round(area.height),
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("Area data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSelection(null);
    setIsSelecting(false);
  };

  return (
    <>
      {/* Control Button - Fixed Position */}
      <motion.button
        onClick={() => setIsActive(!isActive)}
        className={`fixed bottom-4 right-4 z-[9999] win95-button-primary flex items-center gap-2 px-4 py-2 font-mono text-xs shadow-lg ${
          isActive ? "bg-[#039B4E] text-white" : ""
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Ruler className="w-4 h-4" />
        <span>{isActive ? "Area Selector ON" : "Area Selector"}</span>
      </motion.button>

      {/* Overlay and Selection */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Overlay */}
            <motion.div
              ref={containerRef}
              className="fixed inset-0 z-[9998] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Selection Rectangle */}
              {area && area.width > 0 && area.height > 0 && (
                <motion.div
                  className="absolute border-2 border-[#039B4E] bg-[#039B4E]/10 pointer-events-none"
                  style={{
                    left: `${area.x}px`,
                    top: `${area.y}px`,
                    width: `${area.width}px`,
                    height: `${area.height}px`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              {/* Info Panel */}
              {area && (
                <motion.div
                  className="area-selector-controls fixed top-4 left-4 z-[9999] win95-window pointer-events-auto"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="win95-titlebar">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      <span className="text-xs">Area Selection</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="win95-control-btn text-[8px]"
                        onClick={() => setIsActive(false)}
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4">
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#808080]">X:</span>
                        <span className="text-black font-bold">{Math.round(area.x)}px</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#808080]">Y:</span>
                        <span className="text-black font-bold">{Math.round(area.y)}px</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#808080]">Width:</span>
                        <span className="text-black font-bold">{Math.round(area.width)}px</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#808080]">Height:</span>
                        <span className="text-black font-bold">{Math.round(area.height)}px</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                        <span className="text-[#808080]">Area:</span>
                        <span className="text-black font-bold">
                          {Math.round(area.width * area.height)}px²
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <motion.button
                        onClick={handleCopy}
                        className="win95-button-primary flex-1 flex items-center justify-center gap-2 py-2 text-xs"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Data</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={handleClear}
                        className="win95-button flex-1 py-2 text-xs"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear
                      </motion.button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="font-mono text-[10px] text-[#808080] text-center">
                        Click and drag to select an area
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AreaSelector;
