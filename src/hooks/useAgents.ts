import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const DEFAULT_AGENT_ID = "00000000-0000-0000-0000-000000000001";

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  system_prompt: string;
  created_at: string;
}

export const useAgents = () => {
  const query = useQuery({
    queryKey: ["agents"],
    queryFn: async (): Promise<Agent[]> => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }

      // Rebrand any legacy agent names to "Mojo Trader"
      return (data || []).map((agent) => ({
        ...agent,
        name: agent.name.toLowerCase().includes("declaw") || agent.name.toLowerCase().includes("popenize") ? "Mojo Trader" : agent.name,
        description: agent.description?.replace(/declaw|popenize/gi, "Mojo Trader") ?? agent.description,
      }));
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("agents_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query.refetch]);

  return query;
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: {
      name: string;
      description?: string;
      avatar?: string | null;
      systemPrompt: string;
    }): Promise<Agent> => {
      const { data, error } = await supabase
        .from("agents")
        .insert({
          name: agent.name,
          description: agent.description || null,
          avatar: agent.avatar || null,
          system_prompt: agent.systemPrompt,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string): Promise<void> => {
      // Don't allow deleting the default agent
      if (agentId === DEFAULT_AGENT_ID) {
        throw new Error("Cannot delete the default agent");
      }

      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId);

      if (error) {
        console.error("Error deleting agent:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

// Selected agent state management
const SELECTED_AGENT_KEY = "mojo_trader_selected_agent";

export const useSelectedAgent = () => {
  const [selectedId, setSelectedIdState] = useState<string>(() => {
    return localStorage.getItem(SELECTED_AGENT_KEY) || DEFAULT_AGENT_ID;
  });

  const setSelectedId = (id: string) => {
    localStorage.setItem(SELECTED_AGENT_KEY, id);
    setSelectedIdState(id);
  };

  return { selectedId, setSelectedId };
};

export const getSelectedAgentId = (): string => {
  return localStorage.getItem(SELECTED_AGENT_KEY) || DEFAULT_AGENT_ID;
};

export const setSelectedAgentId = (id: string) => {
  localStorage.setItem(SELECTED_AGENT_KEY, id);
};
