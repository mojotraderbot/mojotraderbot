import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface DeployedToken {
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  logo_url: string | null;
  mint_address: string;
  pump_url: string;
  creator_wallet: string;
  dev_buy_amount_sol: number | null;
  transaction_signature: string | null;
  created_at: string;
  agent_id: string | null;
}

export const useDeployedTokens = (agentId?: string | null) => {
  const query = useQuery({
    queryKey: ["deployed-tokens", agentId],
    queryFn: async (): Promise<DeployedToken[]> => {
      let queryBuilder = supabase
        .from("deployed_tokens")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by agent_id if provided
      if (agentId) {
        queryBuilder = queryBuilder.eq("agent_id", agentId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error("Error fetching deployed tokens:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("deployed_tokens_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deployed_tokens",
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

export const saveDeployedToken = async (token: {
  name: string;
  ticker: string;
  description?: string;
  logoUrl?: string;
  mintAddress: string;
  pumpUrl: string;
  creatorWallet: string;
  devBuyAmountSol?: number;
  transactionSignature?: string;
  agentId?: string;
}) => {
  const { error } = await supabase.from("deployed_tokens").insert({
    name: token.name,
    ticker: token.ticker,
    description: token.description || null,
    logo_url: token.logoUrl || null,
    mint_address: token.mintAddress,
    pump_url: token.pumpUrl,
    creator_wallet: token.creatorWallet,
    dev_buy_amount_sol: token.devBuyAmountSol || null,
    transaction_signature: token.transactionSignature || null,
    agent_id: token.agentId || null,
  });

  if (error) {
    console.error("Error saving deployed token:", error);
    throw error;
  }
};
