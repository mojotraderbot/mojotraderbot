import { useQuery } from "@tanstack/react-query";
import { fetchDexScreenerTokenData, type TokenMarketData } from "@/lib/dexscreener";

/**
 * Fetches DexScreener market data (price, marketCap, pairCreatedAt) for given Solana mint addresses.
 * Batches up to 30 addresses per request. Stale after 60s.
 */
export function useDexScreenerTokens(mintAddresses: string[]) {
  const unique = [...new Set(mintAddresses.filter(Boolean))];
  const query = useQuery({
    queryKey: ["dexscreener-tokens", unique.sort().join(",")],
    queryFn: () => fetchDexScreenerTokenData(unique),
    enabled: unique.length > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return {
    data: query.data ?? new Map<string, TokenMarketData>(),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
