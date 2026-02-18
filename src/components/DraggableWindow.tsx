import { ReactNode, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface DraggableWindowProps {
  children: ReactNode;
  className?: string;
  dragConstraints?: { top?: number; left?: number; right?: number; bottom?: number };
  initialPosition?: { x: number; y: number };
}

const DraggableWindow = ({ 
  children, 
  className = "",
  dragConstraints,
  initialPosition = { x: 0, y: 0 }
}: DraggableWindowProps) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hasFullHeight = className.includes('h-full') || className.includes('flex flex-col');
  
  return (
    <div ref={constraintsRef} className={`relative w-full ${hasFullHeight ? 'h-full flex flex-col' : ''}`}>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        initial={initialPosition}
        whileDrag={{ 
          scale: 1.02, 
          boxShadow: "8px 8px 0 rgba(0,0,0,0.3)",
          zIndex: 100
        }}
        className={`${className} ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default DraggableWindow;
