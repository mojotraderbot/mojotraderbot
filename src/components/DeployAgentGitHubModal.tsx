import { Github, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeployAgentGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeployAgentGitHubModal = ({ isOpen, onClose }: DeployAgentGitHubModalProps) => {
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
            className="win95-window max-w-2xl w-full max-h-[85vh] flex flex-col"
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
                <Github className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Deploy your agent via GitHub</span>
              </div>
              <div className="flex gap-1">
                <button className="win95-control-btn text-[8px]">_</button>
                <button className="win95-control-btn text-[8px]">□</button>
                <motion.button
                  className="win95-control-btn text-[8px]"
                  onClick={onClose}
                  whileHover={{ backgroundColor: "#ff0000" }}
                >
                  <X className="w-2 h-2" />
                </motion.button>
              </div>
            </div>

            <div className="win95-menubar">
              <span className="win95-menu-item text-[11px]">File</span>
              <span className="win95-menu-item text-[11px]">Edit</span>
              <span className="win95-menu-item text-[11px]">View</span>
              <span className="win95-menu-item text-[11px]">Help</span>
            </div>

            <div className="bg-[#c0c0c0] p-4 overflow-y-auto flex-1 text-black">
              <div className="win95-outset p-4 space-y-4">
                <h2 className="font-bold text-sm text-[#039B4E] flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Deploy your agent via GitHub
                </h2>
                <p className="font-mono text-xs text-black">
                  Deploy your own Mojo Trader-style app with your agent. Follow the steps below.
                </p>

                <div className="space-y-3">
                  <div className="win95-groupbox p-3 text-left">
                    <span className="win95-groupbox-title">Step 1 — Fork the repo</span>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Fork the project repository on GitHub. Click &quot;Fork&quot; on the repo page, then clone your fork locally:
                    </p>
                    <pre className="win95-inset p-2 mt-2 font-mono text-[10px] overflow-x-auto bg-white text-black">
{`git clone https://github.com/YOUR_USERNAME/the-pumpch-post.git
cd the-pumpch-post
npm install`}
                    </pre>
                  </div>

                  <div className="win95-groupbox p-3 text-left">
                    <span className="win95-groupbox-title">Step 2 — Add your agent</span>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Option A: Use &quot;Create your agent&quot; in the app and your agents are stored in the browser. For a deployed app, add a default agent in code (e.g. in <code className="bg-white px-1">src/lib/agents.ts</code> or env).
                    </p>
                    <p className="font-mono text-[11px] mt-1 text-black">
                      Option B: Add an agents config file to the repo and load it at runtime so your fork ships with your agent.
                    </p>
                  </div>

                  <div className="win95-groupbox p-3 text-left">
                    <span className="win95-groupbox-title">Step 3 — Configure env</span>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Copy <code className="bg-white px-1">.env.example</code> to <code className="bg-white px-1">.env</code> and set:
                    </p>
                    <ul className="font-mono text-[11px] mt-1 list-disc list-inside space-y-0.5 text-black">
                      <li><code className="bg-white px-1">VITE_SUPABASE_URL</code> — your Supabase project URL</li>
                      <li><code className="bg-white px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code> — anon key</li>
                    </ul>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      For chat/AI the app uses Anthropic Claude API from the frontend; no Edge Function required for chat.
                    </p>
                  </div>

                  <div className="win95-groupbox p-3 text-left">
                    <span className="win95-groupbox-title">Step 4 — Deploy</span>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Build and deploy the frontend (e.g. Vercel or Netlify):
                    </p>
                    <pre className="win95-inset p-2 mt-2 font-mono text-[10px] overflow-x-auto bg-white text-black">
{`npm run build`}
                    </pre>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Upload the <code className="bg-white px-1">dist</code> folder to your host, or connect your GitHub repo to Vercel/Netlify for automatic deploys on push.
                    </p>
                  </div>

                  <div className="win95-groupbox p-3 text-left">
                    <span className="win95-groupbox-title">Step 5 — Share</span>
                    <p className="font-mono text-[11px] mt-2 text-black">
                      Share your deployed app URL. Users can chat with your agent and deploy tokens from your instance.
                    </p>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-[#808080] mt-4">
                  Need help? Open an issue on the repo or check the project README.
                </p>
              </div>
            </div>

            <div className="win95-statusbar flex justify-between items-center">
              <div className="win95-statusbar-inset flex-1 text-[10px]">
                Deploy agent via GitHub | Instructions
              </div>
              <div className="win95-statusbar-inset text-[10px]">
                Mojo Trader
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeployAgentGitHubModal;
