import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface Win95NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

const Win95Notification = ({
  isOpen,
  onClose,
  message,
  type = "success",
  duration = 2000,
}: Win95NotificationProps) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-[#039B4E]" />;
      case "error":
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Check className="w-5 h-5 text-[#039B4E]" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case "success":
        return "bg-[#039B4E]";
      case "error":
        return "bg-red-600";
      default:
        return "bg-[#039B4E]";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Window */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] min-w-[300px] max-w-[400px]"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="win95-window">
              {/* Title Bar */}
              <div className={`win95-titlebar ${getTitleColor()}`}>
                <div className="flex items-center gap-2">
                  {getIcon()}
                  <span className="text-xs sm:text-sm font-bold">
                    {type === "success" ? "Success" : type === "error" ? "Error" : "Information"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    className="win95-control-btn text-[8px]"
                    onClick={onClose}
                    title="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm text-black leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <div className="flex justify-end mt-4">
                  <motion.button
                    onClick={onClose}
                    className="win95-button-primary px-6 py-1.5 font-mono text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    OK
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Win95Notification;
