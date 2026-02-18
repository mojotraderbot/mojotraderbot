import { useState, useRef } from "react";
import { Bot, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateAgent } from "@/hooks/useAgents";
import { toastSuccess, toastError } from "@/components/ui/sonner";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  onCreated?: (agentId: string) => void;
}

const CreateAgentModal = ({ isOpen, onClose, onSaved, onCreated }: CreateAgentModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createAgent = useCreateAgent();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toastError("Name is required");
      return;
    }
    if (!systemPrompt.trim()) {
      toastError("System prompt is required");
      return;
    }
    try {
      const agent = await createAgent.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
        avatar: avatar ?? undefined,
        systemPrompt: systemPrompt.trim(),
      });
      toastSuccess("Agent created");
      setName("");
      setDescription("");
      setAvatar(null);
      setSystemPrompt("");
      onClose();
      onSaved?.();
      onCreated?.(agent.id);
    } catch (e) {
      console.error("Failed to save agent:", e);
      toastError("Failed to save agent");
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setAvatar(null);
    setSystemPrompt("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="win95-window max-w-xl w-full max-h-[90vh] flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
          >
            <div className="win95-titlebar cursor-move">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Create your agent</span>
              </div>
              <div className="flex gap-1">
                <button className="win95-control-btn text-[8px]">_</button>
                <button className="win95-control-btn text-[8px]">□</button>
                <motion.button
                  className="win95-control-btn text-[8px]"
                  onClick={handleClose}
                  whileHover={{ backgroundColor: "#ff0000" }}
                >
                  <X className="w-2 h-2" />
                </motion.button>
              </div>
            </div>

            <div className="bg-[#c0c0c0] p-4 overflow-y-auto flex-1">
              <div className="space-y-3 text-black">
                <div>
                  <label className="block font-mono text-[11px] mb-1">Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Meme Advisor"
                    className="win95-inset w-full px-2 py-1 font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] mb-1">Description (optional)</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description"
                    className="win95-inset w-full px-2 py-1 font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] mb-1">Avatar (optional)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="win95-button flex items-center gap-1 px-2 py-1 text-[11px]"
                    >
                      {avatar ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {avatar ? "Change" : "Upload"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    {avatar && (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded object-cover border-2 border-[#808080]"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[11px] mb-1">System prompt *</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are an AI agent that..."
                    rows={6}
                    className="win95-inset w-full px-2 py-1 font-mono text-xs bg-white resize-y"
                  />
                  <p className="font-mono text-[10px] text-[#808080] mt-1">
                    Defines how the agent behaves. Include token JSON format if you want token extraction.
                  </p>
                </div>
              </div>
            </div>

            <div className="win95-statusbar flex gap-2 p-2 border-t-2 border-[#808080] bg-[#c0c0c0]">
              <button 
                onClick={handleSave} 
                disabled={createAgent.isPending}
                className="win95-button-primary px-3 py-1 text-xs flex items-center gap-1"
              >
                {createAgent.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save agent"
                )}
              </button>
              <button onClick={handleClose} className="win95-button px-3 py-1 text-xs">
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAgentModal;
