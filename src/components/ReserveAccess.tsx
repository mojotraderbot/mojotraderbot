import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ReserveAccess = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("You're on the list! We'll be in touch.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="py-10 md:py-14 bg-muted border-y border-border">
      <div className="container">
        <div className="max-w-lg mx-auto text-center">
          {/* Decorative header */}
          <div className="inline-block mb-4">
            <span className="inline-block border border-accent text-accent px-2 py-1 text-xs uppercase tracking-widest font-mono">
              Early Access
            </span>
          </div>

          <h2 className="masthead text-2xl md:text-3xl text-ink mb-3">
            RESERVE YOUR<br />PUMPCH ACCESS
          </h2>

          <p className="font-body text-sm text-ink-light mb-6">
            Be one of the first to chat with Pumpch, track Pump.fun launches, 
            and turn ideas into tokens.
          </p>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-paper border border-border text-ink placeholder:text-ink-faded font-mono text-xs h-10"
            />
            <Button 
              type="submit" 
              variant="editorial"
              size="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join"}
            </Button>
          </form>

          <p className="font-mono text-xs text-ink-faded mt-3">
            We only email with launch milestones.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReserveAccess;
